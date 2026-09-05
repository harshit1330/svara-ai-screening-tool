# Svara

Svara is a voice-screening research prototype with a React website and a Python FastAPI backend. It analyses a short sustained `aaa` recording for Parkinson's-associated acoustic patterns and displays a screening report.

**Research screening only. Svara does not diagnose or rule out Parkinson's disease.**

## Features

- Landing page with a top-left hamburger menu and centered Svara branding.
- Profile, new screening, and saved results/history in the menu.
- Microphone recording with automatic analysis after 10 seconds.
- WAV upload, result popup, and report export.
- Up to 50 reports stored locally in the browser.

## Workflow

Record or upload WAV audio → FastAPI validates and prepares it → openSMILE extracts eGeMAPSv02 acoustic features → the backend selects 30 features → a saved preprocessing pipeline and linear SVM produce a score → React displays the screening result.

The backend uses SoundFile, NumPy, pandas, openSMILE, scikit-learn, and joblib. The frontend uses React, React Router, Vite, and Tailwind CSS.

## Project structure

```text
backend/       FastAPI API and audio inference
frontend/      React/Vite application
models/        Deployed model and matching metadata
```

Local environments, logs, recordings, training datasets, and older model backups are excluded from this public repository.

## Setup and run

Install Python and Node.js with npm. The current local environment uses Python 3.14; the frontend uses Vite 8 and needs a compatible Node.js release. Install the dependencies specified below.

### macOS / Linux

```bash
git clone https://github.com/harshit1330/svara-updated.git
cd svara-updated
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r backend/requirements.txt
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

### Windows PowerShell

```powershell
git clone https://github.com/harshit1330/svara-updated.git
cd svara-updated
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r backend/requirements.txt
.\.venv\Scripts\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

### Frontend (second terminal, from the project folder)

```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1
```

Open **http://127.0.0.1:5173/** for the landing page. Keep both servers running. The backend health endpoint is http://127.0.0.1:8000/health and API documentation is at http://127.0.0.1:8000/docs.

To check a production frontend build:

```bash
cd frontend
npm run build
```

## Screening instructions

1. Use a quiet room and allow microphone access, or choose a WAV file.
2. Sustain `aaa` at a comfortable pitch and volume for 5–10 seconds.
3. Recording stops and analysis begins automatically at 10 seconds.
4. View the report and revisit it through Results / History.

Only WAV audio is accepted. The backend rejects empty, invalid, silent, or extremely quiet recordings and audio shorter than one second. Uploads are limited to 50 MB, and audio beyond 10 seconds is trimmed.

Profile details and report history remain in the current browser's local storage. They do not sync between devices, and clearing browser storage can remove them. The audio is sent to the configured backend for analysis; the inference code does not save permanent recordings.

## Model and evaluation

- Deployed model: `sustained-vowel-stable-v1`, a linear SVM.
- Training set: 131 sustained-vowel recordings from 131 participants across two source datasets.
- Input: 30 selected eGeMAPSv02 functional features.
- Development five-fold validation: 68.5% balanced accuracy, 73.5% sensitivity, 63.5% specificity, and 0.740 ROC-AUC.
- Feature selection is repeated within each fold. These validation results also informed model selection and are not independent clinical validation.
- Indian clinical validation has not been performed.

The backend flags scores of 0.5 or higher. `model_score` is the score for the Parkinson's-associated class, not a clinically established disease probability. The interface currently labels this value “Model confidence”, including for negative results; interpret it as the positive-class model score.

## Troubleshooting

- **Cannot reach server:** start the backend and check `/health`.
- **Microphone unavailable:** allow browser microphone access or upload WAV instead.
- **No past reports on another computer:** history is stored in the browser that generated it.
- **Hosted frontend:** configure `VITE_API_URL` to your backend and explicitly allow the frontend origin in the backend CORS settings. Do not place private credentials in frontend environment variables.

## Deploy on Vercel

Import this GitHub repository into Vercel with the Root Directory set to the repository root (not `frontend`). The root `vercel.json` defines the React frontend and Python FastAPI backend as Vercel Services under one HTTPS domain. Keep the service-specific build settings from that file.

- The landing page is at `/`, with direct navigation to `/dashboard` supported.
- Production requests use `/api/predict` on the same domain; no API URL environment variable is needed.
- Verify `/api/health` returns `{"status":"healthy","model":"loaded"}`.
- Python is pinned to 3.14 to match the deployed model's local environment.
- The hosted app accepts WAV files up to 4 MB, leaving room for multipart upload overhead under Vercel's 4.5 MB request limit. Local development keeps its 50 MB limit.
- The first screening after a cold start can take longer while the Python environment and model initialize.

Alternatively, after `npx vercel login`, run `npx vercel --prod` from the repository root.
