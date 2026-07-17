#!/usr/bin/env bash
# Build student + admin into one static site for Vercel (Option 1).
# Output:
#   deploy/           → student SPA (/)
#   deploy/admin/     → admin SPA (/admin) with Vite base /admin/
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${ROOT}/deploy"

echo "==> Cleaning ${OUT}"
rm -rf "${OUT}"
mkdir -p "${OUT}/admin"

echo "==> Building student (frontend/)"
cd "${ROOT}/frontend"
if [[ -f package-lock.json ]]; then
  npm ci
else
  npm install
fi
npm run build
cp -R dist/. "${OUT}/"

echo "==> Building admin (frontend-admin/) with base /admin/"
cd "${ROOT}/frontend-admin"
if [[ -f package-lock.json ]]; then
  npm ci
else
  npm install
fi
ADMIN_BASE_PATH=/admin/ npm run build
cp -R dist/. "${OUT}/admin/"

# Ensure SPA entry is reachable at /admin and /admin/
if [[ -f "${OUT}/admin/index.html" ]]; then
  echo "==> Admin index ready at deploy/admin/index.html"
fi

echo "==> Done. Unified web output: ${OUT}"
echo "    Student: ${OUT}/index.html"
echo "    Admin:   ${OUT}/admin/index.html"
