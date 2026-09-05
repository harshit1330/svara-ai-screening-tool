import { useEffect, useMemo } from "react";

export function ResultModal({ result, userData, onClose }) {
  const isFlagged = result.flagged_for_follow_up;
  const createdAt = useMemo(() => result.created_at ? new Date(result.created_at) : new Date(), [result.created_at]);
  const reportId = useMemo(() => {
    const date = createdAt;
    return result.report_id || `SV-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}-${String(date.getHours()).padStart(2, "0")}${String(date.getMinutes()).padStart(2, "0")}`;
  }, [createdAt, result.report_id]);
  const resultLabel = isFlagged ? "Positive screening result" : "Negative screening result";
  const resultTitle = isFlagged
    ? "Parkinson's-associated voice pattern detected"
    : "No Parkinson's-associated voice pattern detected";
  const resultSummary = isFlagged
    ? "The analysed voice sample showed the pattern this research model is designed to identify."
    : "The analysed voice sample did not show the pattern this research model is designed to identify.";

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const downloadReport = () => {
    const reportText = [
      "SVARA VOICE SCREENING REPORT",
      `Report ID: ${reportId}`,
      `Date: ${createdAt.toLocaleString()}`,
      "",
      `Name: ${userData?.name || "Not provided"}`,
      `Age: ${userData?.age || "Not provided"}`,
      `Sex: ${userData?.sex || userData?.gender || "Not provided"}`,
      "",
      `Result: ${resultLabel}`,
      resultTitle,
      `Model confidence: ${(result.model_score * 100).toFixed(1)}%`,
      `Recording duration: ${result.duration_seconds} seconds`,
      "",
      resultSummary,
      "",
      result.disclaimer || "Svara is a research screening tool and cannot confirm or rule out Parkinson's disease.",
    ].join("\n");
    const url = URL.createObjectURL(new Blob([reportText], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `svara-report-${reportId}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-5 py-6 backdrop-blur-[3px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="screening-report-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <article className="w-full max-w-[510px] overflow-hidden rounded-[21px] bg-white shadow-2xl animate-[resultPop_.28s_ease-out]">
        <div className="h-1.5 bg-gradient-to-r from-blue-600 to-blue-300" />
        <header className="flex items-start justify-between px-6 pb-4 pt-5">
          <div>
            <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.11em] text-blue-600">Analysis complete</p>
            <h2 id="screening-report-title" className="text-xl font-bold">Your screening report</h2>
          </div>
          <button onClick={onClose} aria-label="Close report" className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-lg text-slate-500 transition hover:bg-slate-200">×</button>
        </header>

        <section className="mx-6 grid grid-cols-3 gap-3 rounded-xl bg-slate-50 px-4 py-3">
          <div><p className="mb-1 text-[8px] font-extrabold uppercase tracking-wider text-slate-400">Name</p><p className="text-xs font-bold">{userData?.name || "Not provided"}</p></div>
          <div><p className="mb-1 text-[8px] font-extrabold uppercase tracking-wider text-slate-400">Age</p><p className="text-xs font-bold">{userData?.age || "--"}</p></div>
          <div><p className="mb-1 text-[8px] font-extrabold uppercase tracking-wider text-slate-400">Sex</p><p className="text-xs font-bold">{userData?.sex || userData?.gender || "--"}</p></div>
        </section>

        <section className={`mx-6 mt-4 rounded-2xl border p-5 ${isFlagged ? "border-amber-200 bg-amber-50" : "border-orange-200 bg-orange-50"}`}>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] font-extrabold ${isFlagged ? "bg-amber-200 text-amber-900" : "bg-emerald-100 text-emerald-800"}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" />{resultLabel}
          </span>
          <h3 className="mb-2 mt-3 text-xl font-bold leading-tight">{resultTitle}</h3>
          <p className="text-[11px] leading-relaxed text-slate-600">{resultSummary}</p>
          <div className="mt-4 rounded-xl bg-white/85 px-3.5 py-3">
            <div className="mb-2 flex items-center justify-between text-[10px] text-slate-500">
              <span>Model confidence · {result.duration_seconds} sec recording</span>
              <strong className="text-sm text-slate-900">{(result.model_score * 100).toFixed(1)}%</strong>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
              <div className={`h-full rounded-full ${isFlagged ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${Math.min(result.model_score * 100, 100)}%` }} />
            </div>
          </div>
        </section>

        <div className="mx-6 mt-4 flex gap-2.5 rounded-xl border border-slate-200 px-3.5 py-3 text-[10px] leading-relaxed text-slate-600">
          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-blue-50 font-bold text-blue-600">i</span>
          <p>{isFlagged ? "This pattern warrants discussion with a qualified healthcare professional." : "This is a screening result, not a medical diagnosis. If you have symptoms or concerns, speak with a qualified healthcare professional."}</p>
        </div>
        <p className="mx-6 mt-3 text-[9px] leading-relaxed text-slate-400">{result.disclaimer || "Svara is a research screening tool and cannot confirm or rule out Parkinson's disease."}</p>

        <footer className="flex items-center gap-2 px-6 pb-5 pt-4">
          <span className="mr-auto text-[9px] text-slate-400">{createdAt.toLocaleDateString()} · #{reportId}</span>
          <button onClick={onClose} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-600 hover:bg-slate-50">Close</button>
          <button onClick={downloadReport} className="rounded-lg bg-blue-600 px-3 py-2 text-[11px] font-bold text-white shadow-sm hover:bg-blue-700">Download report</button>
        </footer>
      </article>
    </div>
  );
}
