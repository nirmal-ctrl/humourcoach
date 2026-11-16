#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$SCRIPT_DIR/mobile"
MODE="${1:-start}"

if [[ ! -f "$APP_DIR/package.json" ]]; then
  echo "Could not find the Sponto mobile app at: $APP_DIR" >&2
  exit 1
fi

if [[ -s "${NVM_DIR:-$HOME/.nvm}/nvm.sh" ]]; then
  # Load NVM only for this script and select the version in mobile/.nvmrc.
  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  # shellcheck source=/dev/null
  source "$NVM_DIR/nvm.sh"
  NVM_VERSION="$(tr -d '[:space:]' < "$APP_DIR/.nvmrc")"
  if ! nvm use --silent "$NVM_VERSION"; then
    echo "The required Node version is not installed." >&2
    echo "Run: nvm install 24" >&2
    exit 1
  fi
fi

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo "Node.js and npm are required. Install Node 24.3 or another version supported by package.json." >&2
  exit 1
fi

NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if (( NODE_MAJOR != 22 && NODE_MAJOR != 24 && NODE_MAJOR < 26 )); then
  echo "Unsupported Node version: $(node --version)" >&2
  echo "Use Node 24.3 (recommended), Node 22.13+, or Node 26+." >&2
  exit 1
fi

case "$MODE" in
  start|web|ios|android|native-ios|native-android)
    ;;
  *)
    echo "Usage: ./start-app.sh [start|web|ios|android|native-ios|native-android]" >&2
    exit 1
    ;;
esac

cd "$APP_DIR"

if [[ ! -d node_modules ]]; then
  echo "Installing dependencies..."
  npm install
fi

echo "Starting Sponto in '$MODE' mode..."
case "$MODE" in
  native-ios)
    exec npx expo run:ios
    ;;
  native-android)
    exec npx expo run:android
    ;;
  *)
    exec npm run "$MODE"
    ;;
esac
