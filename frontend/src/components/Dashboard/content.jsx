import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { DashboardMenu } from "./DashboardMenu";
import { HistoryView, ProfileView } from "./DashboardViews";
import { ResultModal } from "./ResultModal";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const MIN_SECONDS = 1;
const MAX_SECONDS = 10;
const READING_TEXT = "Take a comfortable breath and sustain the vowel aaa at a steady, natural pitch and volume. Do not sing, whisper, or force your voice.";
const REPORT_HISTORY_KEY = "svaraReportHistory";

function loadReportHistory() {
  try {
    const reports = JSON.parse(localStorage.getItem(REPORT_HISTORY_KEY));
    return Array.isArray(reports) ? reports : [];
  } catch {
    return [];
  }
}

function createReportRecord(payload) {
  const createdAt = new Date();
  const reportId = `SV-${createdAt.getFullYear()}${String(createdAt.getMonth() + 1).padStart(2, "0")}${String(createdAt.getDate()).padStart(2, "0")}-${String(createdAt.getHours()).padStart(2, "0")}${String(createdAt.getMinutes()).padStart(2, "0")}${String(createdAt.getSeconds()).padStart(2, "0")}`;
  return { ...payload, created_at: createdAt.toISOString(), report_id: reportId };
}

function mergeBuffers(chunks) {
  const samples = new Float32Array(chunks.reduce((total, chunk) => total + chunk.length, 0));
  let offset = 0;
  chunks.forEach((chunk) => {
    samples.set(chunk, offset);
    offset += chunk.length;
  });
  return samples;
}

function encodeWav(samples, sampleRate) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const write = (offset, value) => [...value].forEach((char, index) => view.setUint8(offset + index, char.charCodeAt(0)));
  write(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  write(8, "WAVE");
  write(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  write(36, "data");
  view.setUint32(40, samples.length * 2, true);
  for (let index = 0; index < samples.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, samples[index]));
    view.setInt16(44 + index * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
  }
  return new Blob([buffer], { type: "audio/wav" });
}

export const Content = ({ userData }) => {
  const fileInputRef = useRef(null);
  const recordingRef = useRef(null);
  const timerRef = useRef(null);
  const autoStopRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedView = searchParams.get("view");
  const activeView = ["profile", "history"].includes(requestedView) ? requestedView : "screening";
  const setActiveView = (view) => setSearchParams(view === "screening" ? {} : { view });
  const [reports, setReports] = useState(loadReportHistory);

  useEffect(() => () => {
    clearInterval(timerRef.current);
    clearTimeout(autoStopRef.current);
    recordingRef.current?.stream.getTracks().forEach((track) => track.stop());
    recordingRef.current?.context.close();
  }, []);

  const analyseFile = async (file) => {
    if (!file?.name.toLowerCase().endsWith(".wav")) {
      setError("Please choose a WAV audio file.");
      return;
    }
    setError("");
    setResult(null);
    setStatus("Extracting voice biomarkers and running the screening model…");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch(`${API_URL}/predict`, { method: "POST", body: formData });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.detail || "The recording could not be analysed.");
      const report = createReportRecord(payload);
      setReports((currentReports) => {
        const updatedReports = [report, ...currentReports].slice(0, 50);
        try {
          localStorage.setItem(REPORT_HISTORY_KEY, JSON.stringify(updatedReports));
        } catch {
          // Keep the report available for this session if browser storage is unavailable.
        }
        return updatedReports;
      });
      setResult(report);
      setStatus("");
    } catch (requestError) {
      setStatus("");
      setError(requestError.message === "Failed to fetch" ? "Cannot reach the Svara analysis server. Please start the backend and try again." : requestError.message);
    }
  };

  const stopRecording = async () => {
    const recording = recordingRef.current;
    if (!recording) return;
    clearInterval(timerRef.current);
    clearTimeout(autoStopRef.current);
    recording.processor.disconnect();
    recording.source.disconnect();
    recording.stream.getTracks().forEach((track) => track.stop());
    await recording.context.close();
    recordingRef.current = null;
    setIsRecording(false);
    const recordedSeconds = recording.chunks.reduce((total, chunk) => total + chunk.length, 0) / recording.sampleRate;
    if (recordedSeconds < MIN_SECONDS) {
      setError(`Please record for at least ${MIN_SECONDS} seconds. Your recording was ${recordedSeconds.toFixed(1)} seconds.`);
      return;
    }
    const blob = encodeWav(mergeBuffers(recording.chunks), recording.sampleRate);
    await analyseFile(new File([blob], "svara-recording.wav", { type: "audio/wav" }));
  };

  const startRecording = async () => {
    setError("");
    setResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true } });
      const context = new AudioContext();
      const source = context.createMediaStreamSource(stream);
      const processor = context.createScriptProcessor(4096, 1, 1);
      const chunks = [];
      processor.onaudioprocess = (event) => chunks.push(new Float32Array(event.inputBuffer.getChannelData(0)));
      source.connect(processor);
      processor.connect(context.destination);
      recordingRef.current = { stream, context, source, processor, chunks, sampleRate: context.sampleRate };
      setSeconds(0);
      setIsRecording(true);
      timerRef.current = setInterval(() => setSeconds((value) => Math.min(value + 1, MAX_SECONDS)), 1000);
      autoStopRef.current = setTimeout(() => stopRecording(), MAX_SECONDS * 1000);
    } catch {
      setError("Microphone access was denied or is unavailable. You can upload a WAV file instead.");
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) analyseFile(file);
    event.target.value = "";
  };

  return (
    <div className="min-h-screen bg-[#F5F9FE] text-[#0B1E39]">
      <nav className="relative grid h-18 grid-cols-[1fr_auto_1fr] items-center bg-blue-600 px-7">
        <button onClick={() => setMenuOpen(true)} aria-label="Open dashboard menu" aria-expanded={menuOpen} className="grid h-11 w-11 place-items-center rounded-xl bg-white/15 transition hover:bg-white/25">
          <span className="grid gap-1.5" aria-hidden="true"><span className="h-0.5 w-6 rounded bg-white" /><span className="h-0.5 w-6 rounded bg-white" /><span className="h-0.5 w-6 rounded bg-white" /></span>
        </button>
        <Link to="/" className="text-3xl font-bold text-white" aria-label="Svara home">Svara</Link>
      </nav>
      {activeView === "screening" && <main className="mx-auto max-w-[980px] px-6 py-14">
        <header className="mb-10 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-600">Research voice screening</p>
          <h1 className="mb-3 text-4xl font-bold">Welcome{userData?.name ? `, ${userData.name}` : ""}</h1>
          <p className="mx-auto max-w-[700px] text-slate-600">In a quiet room, sustain the vowel aaa steadily for 5 to 10 seconds. Recording stops and analysis starts automatically at 10 seconds.</p>
        </header>
        <section className="mb-7 rounded-3xl border border-blue-100 bg-white p-7 shadow-sm">
          <p className="mb-3 text-sm font-semibold text-blue-700">Voice task</p>
          <p className="text-lg leading-8 text-slate-700">{READING_TEXT}</p>
        </section>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <button onClick={isRecording ? stopRecording : startRecording} className={`min-h-56 rounded-3xl border-2 p-8 shadow-sm transition-all ${isRecording ? "border-red-400 bg-red-50" : "border-transparent bg-white hover:border-blue-600"}`}>
            <div className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full text-2xl ${isRecording ? "bg-red-500 text-white" : "bg-blue-100 text-blue-700"}`}>{isRecording ? "■" : "●"}</div>
            <p className="mb-2 text-xl font-bold">{isRecording ? `Stop recording · ${seconds}s` : "Record sustained aaa"}</p>
            <p className="text-sm text-slate-500">{isRecording ? (seconds < MIN_SECONDS ? `${MIN_SECONDS - seconds} seconds minimum remaining` : `Analysing automatically in ${MAX_SECONDS - seconds} seconds`) : "Use your microphone to record directly in Svara."}</p>
          </button>
          <button disabled={isRecording} onClick={() => fileInputRef.current?.click()} className="min-h-56 rounded-3xl border-2 border-transparent bg-white p-8 shadow-sm transition-all hover:border-blue-600 disabled:opacity-50">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl text-blue-700">↑</div>
            <p className="mb-2 text-xl font-bold">Upload WAV</p>
            <p className="text-sm text-slate-500">Choose a WAV recording of a sustained aaa. Audio beyond 10 seconds is trimmed automatically.</p>
          </button>
          <input ref={fileInputRef} type="file" accept=".wav,audio/wav" onChange={handleFileChange} className="hidden" />
        </div>
        {status && <div role="status" className="mt-7 rounded-2xl border border-blue-200 bg-blue-50 p-5 text-center text-blue-800">{status}</div>}
        {error && <div role="alert" className="mt-7 rounded-2xl border border-red-200 bg-red-50 p-5 text-center text-red-800">{error}</div>}
        <p className="mt-9 text-center text-sm text-slate-500">Audio is sent only to the configured Svara analysis server for this screening. Svara does not provide a diagnosis.</p>
      </main>}
      {activeView === "profile" && <ProfileView userData={userData} />}
      {activeView === "history" && <HistoryView reports={reports} onNewScreening={() => setActiveView("screening")} onViewReport={setResult} />}
      {result && <ResultModal result={result} userData={userData} onClose={() => setResult(null)} />}
      <DashboardMenu
        activeView={activeView}
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        onSelect={(view) => {
          setActiveView(view);
          setMenuOpen(false);
        }}
        userData={userData}
      />
    </div>
  );
};
