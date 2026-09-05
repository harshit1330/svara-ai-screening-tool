"""In-memory eGeMAPS inference for Svara's combined-dataset model."""
from __future__ import annotations

import io
import json
from pathlib import Path

import joblib
import numpy as np
import opensmile
import pandas as pd
import soundfile as sf

PROJECT_ROOT = Path(__file__).resolve().parents[1]
MODEL_PATH = PROJECT_ROOT / "models" / "combined_best_model.joblib"
METADATA_PATH = PROJECT_ROOT / "models" / "combined_best_model.json"
MIN_DURATION_SECONDS = 1.0
MAX_DURATION_SECONDS = 10.0


class InvalidAudioError(ValueError):
    """The uploaded bytes cannot be used by the screening model."""


def validate_wav_bytes(audio_bytes: bytes) -> None:
    if not audio_bytes:
        raise InvalidAudioError("The uploaded WAV file is empty")
    if len(audio_bytes) < 12 or audio_bytes[:4] != b"RIFF" or audio_bytes[8:12] != b"WAVE":
        raise InvalidAudioError("The uploaded file is not a valid RIFF/WAVE file")


class SvaraInferenceEngine:
    """Load the model and reproduce its eGeMAPSv02 preprocessing."""

    def __init__(self, model_path: Path = MODEL_PATH) -> None:
        self.model = joblib.load(model_path)
        if "classifier__n_jobs" in self.model.get_params():
            self.model.set_params(classifier__n_jobs=1)
        self.metadata = json.loads(METADATA_PATH.read_text(encoding="utf-8"))
        self.feature_names = list(self.metadata["feature_names"])
        if list(getattr(self.model, "feature_names_in_", [])) != self.feature_names:
            raise ValueError("Model feature names do not match its metadata")
        self.smile = opensmile.Smile(
            feature_set=opensmile.FeatureSet.eGeMAPSv02,
            feature_level=opensmile.FeatureLevel.Functionals,
        )

    def predict_wav(self, audio_bytes: bytes) -> dict[str, str | float | bool]:
        validate_wav_bytes(audio_bytes)
        try:
            audio, sample_rate = sf.read(io.BytesIO(audio_bytes), dtype="float32", always_2d=False)
        except Exception as exc:
            raise InvalidAudioError("The WAV file could not be decoded") from exc
        if audio.ndim > 1:
            audio = audio.mean(axis=1)
        if audio.size == 0 or not np.isfinite(audio).all():
            raise InvalidAudioError("The WAV file contains no valid audio samples")
        duration = float(audio.size / sample_rate)
        if duration < MIN_DURATION_SECONDS:
            unit = "second" if MIN_DURATION_SECONDS == 1 else "seconds"
            raise InvalidAudioError(f"Please provide at least {int(MIN_DURATION_SECONDS)} {unit} of speech; received {duration:.1f} seconds")
        if duration > MAX_DURATION_SECONDS:
            # Browser MediaRecorder stop events can include a small timing overrun.
            # Analyse only the allowed window instead of rejecting the recording.
            audio = audio[: round(MAX_DURATION_SECONDS * sample_rate)]
            duration = MAX_DURATION_SECONDS
        if float(np.sqrt(np.mean(np.square(audio)))) < 1e-4:
            raise InvalidAudioError("The recording is silent or too quiet to analyse")
        extracted = self.smile.process_signal(audio, sample_rate)
        if len(extracted) != 1:
            raise InvalidAudioError("Could not create one voice feature vector")
        features = pd.DataFrame(
            [[extracted.iloc[0][name] for name in self.feature_names]],
            columns=self.feature_names,
        )
        probability = float(self.model.predict_proba(features)[0, 1])
        associated = probability >= 0.5
        return {
            "predicted_class": "parkinsons" if associated else "healthy",
            "model_score": probability,
            "screening_category": "Parkinson's-associated voice pattern" if associated else "No Parkinson's-associated voice pattern detected",
            "flagged_for_follow_up": associated,
            "duration_seconds": round(duration, 1),
            "model_version": self.metadata.get("model_version", "unknown"),
            "disclaimer": "Research screening result only; this is not a medical diagnosis.",
        }

    def close(self) -> None:
        """Kept for the application lifecycle interface."""
