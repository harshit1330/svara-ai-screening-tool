$ErrorActionPreference = "Stop"
$packageRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Join-Path $packageRoot "frontend")

if (-not (Test-Path -LiteralPath ".\node_modules")) {
    throw "Frontend dependencies not found. Follow the first-time setup in README.md."
}

npm run dev -- --host 127.0.0.1
