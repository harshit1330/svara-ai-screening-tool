"""FastAPI application for Svara voice-pattern inference."""
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
try:
    from .inference import InvalidAudioError, SvaraInferenceEngine
except ImportError:  # Supports `uvicorn main:app` when run inside backend/.
    from inference import InvalidAudioError, SvaraInferenceEngine

MAX_UPLOAD_MB = 4 if os.getenv("VERCEL") else 50
MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024
engine: SvaraInferenceEngine | None = None


@asynccontextmanager
async def lifespan(_app: FastAPI):
    global engine
    engine = SvaraInferenceEngine()
    try:
        yield
    finally:
        engine.close()
        engine = None


app = FastAPI(title="Svara Inference API", version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.get("/api/health")
@app.get("/health", include_in_schema=False)
def health() -> dict[str, str]:
    return {"status": "healthy", "model": "loaded" if engine is not None else "unavailable"}


@app.post("/api/predict")
@app.post("/predict", include_in_schema=False)
async def predict(file: UploadFile = File(...)) -> dict[str, str | float | bool]:
    if engine is None:
        raise HTTPException(503, "Model is not available")
    filename = file.filename or ""
    if not filename.lower().endswith(".wav"):
        raise HTTPException(415, "Only .wav files are accepted")
    allowed_types = {"audio/wav", "audio/x-wav", "audio/wave", "audio/vnd.wave", "application/octet-stream"}
    if file.content_type and file.content_type.lower() not in allowed_types:
        raise HTTPException(415, "Upload must use a WAV audio media type")
    audio_bytes = await file.read(MAX_UPLOAD_BYTES + 1)
    await file.close()
    if len(audio_bytes) > MAX_UPLOAD_BYTES:
        raise HTTPException(413, f"WAV file exceeds the {MAX_UPLOAD_MB} MB upload limit")
    try:
        return engine.predict_wav(audio_bytes)
    except InvalidAudioError as exc:
        raise HTTPException(422, str(exc)) from exc
