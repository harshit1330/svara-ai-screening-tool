$ErrorActionPreference = "Stop"
$packageRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $packageRoot

if (-not (Test-Path -LiteralPath ".\.venv\Scripts\python.exe")) {
    throw "Python environment not found. Follow the first-time setup in README.md."
}

& ".\.venv\Scripts\python.exe" -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
