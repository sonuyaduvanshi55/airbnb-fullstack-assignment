#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

cleanup() {
  jobs -p | xargs -r kill
}
trap cleanup EXIT INT TERM

if [ ! -d "$ROOT_DIR/backend/.venv" ]; then
  python3 -m venv "$ROOT_DIR/backend/.venv"
fi
source "$ROOT_DIR/backend/.venv/bin/activate"
pip install -q -r "$ROOT_DIR/backend/requirements.txt"

if [ ! -d "$ROOT_DIR/frontend/node_modules" ]; then
  (cd "$ROOT_DIR/frontend" && npm install)
fi

(cd "$ROOT_DIR/backend" && uvicorn app.main:app --reload --port 8000) &
(cd "$ROOT_DIR/frontend" && NEXT_PUBLIC_API_URL=http://localhost:8000/api npm run dev) &

printf '\nStaybnb is starting:\n  Frontend: http://localhost:3000\n  Backend:  http://localhost:8000\n  API docs: http://localhost:8000/docs\n\nPress Ctrl+C to stop both servers.\n'
wait
