#!/usr/bin/env bash

set -euo pipefail

APP_HOST="${APP_HOST:-127.0.0.1}"
APP_PORT="${APP_PORT:-3001}"
APP_URL="http://${APP_HOST}:${APP_PORT}"
TUNNEL_TIMEOUT_SECONDS="${TUNNEL_TIMEOUT_SECONDS:-120}"
ENABLE_FIGMA_WATCH="${ENABLE_FIGMA_WATCH:-0}"
APP_ENABLE_HTTP_HEALTHCHECK="${APP_ENABLE_HTTP_HEALTHCHECK:-0}"
APP_HTTP_HEALTHCHECK_INTERVAL_SECONDS="${APP_HTTP_HEALTHCHECK_INTERVAL_SECONDS:-5}"
APP_RECOVERY_5XX_THRESHOLD="${APP_RECOVERY_5XX_THRESHOLD:-3}"
APP_RECOVERY_COOLDOWN_SECONDS="${APP_RECOVERY_COOLDOWN_SECONDS:-20}"
DEV_DIST_DIR="${NEXT_DIST_DIR:-.next-dev}"

DEV_PID=""
TUNNEL_PID=""
FIGMA_PID=""
LAST_DEV_RECOVERY_TS=0
APP_5XX_STREAK=0
LAST_HTTP_HEALTHCHECK_TS=0

cleanup() {
  if [[ -n "${FIGMA_PID}" ]] && kill -0 "${FIGMA_PID}" 2>/dev/null; then
    kill "${FIGMA_PID}" 2>/dev/null || true
    wait "${FIGMA_PID}" 2>/dev/null || true
  fi

  if [[ -n "${TUNNEL_PID}" ]] && kill -0 "${TUNNEL_PID}" 2>/dev/null; then
    kill "${TUNNEL_PID}" 2>/dev/null || true
    wait "${TUNNEL_PID}" 2>/dev/null || true
  fi

  if [[ -n "${DEV_PID}" ]] && kill -0 "${DEV_PID}" 2>/dev/null; then
    kill "${DEV_PID}" 2>/dev/null || true
    wait "${DEV_PID}" 2>/dev/null || true
  fi
}

trap cleanup EXIT INT TERM

start_tunnel() {
  echo "[dev+tunnel] Starting tunnel..."
  npm run tunnel &
  TUNNEL_PID=$!
}

start_figma_watch() {
  echo "[dev+tunnel] Starting figma watcher (interval ${FIGMA_WATCH_INTERVAL_SECONDS:-8}s)..."
  npm run figma:watch &
  FIGMA_PID=$!
}

wait_for_app_ready() {
  for ((i = 1; i <= TUNNEL_TIMEOUT_SECONDS; i++)); do
    if curl -fsS "${APP_URL}" >/dev/null 2>&1; then
      return 0
    fi

    if ! kill -0 "${DEV_PID}" 2>/dev/null; then
      return 1
    fi

    sleep 1
  done

  return 1
}

restart_dev_server() {
  echo "[dev+tunnel] Restarting Next.js dev server (auto-recovery)..."
  if [[ -n "${DEV_PID}" ]] && kill -0 "${DEV_PID}" 2>/dev/null; then
    kill "${DEV_PID}" 2>/dev/null || true
    wait "${DEV_PID}" 2>/dev/null || true
  fi

  rm -rf "${DEV_DIST_DIR}"
  npm run dev:local &
  DEV_PID=$!

  if ! wait_for_app_ready; then
    echo "[dev+tunnel] Auto-recovery restart failed: app did not become ready."
    return 1
  fi

  APP_5XX_STREAK=0
  LAST_DEV_RECOVERY_TS=$(date +%s)
  echo "[dev+tunnel] Auto-recovery complete: app is healthy again."
  return 0
}

if [[ "${ENABLE_FIGMA_WATCH}" == "1" ]]; then
  echo "[dev+tunnel] Figma mode: ON (auto watch + incremental sync)."
fi
if [[ "${APP_ENABLE_HTTP_HEALTHCHECK}" == "1" ]]; then
  echo "[dev+tunnel] HTTP healthcheck: ON (interval ${APP_HTTP_HEALTHCHECK_INTERVAL_SECONDS}s)."
else
  echo "[dev+tunnel] HTTP healthcheck: OFF (no synthetic GET spam)."
fi

echo "[dev+tunnel] Starting Next.js dev server on ${APP_URL}..."
npm run dev:local &
DEV_PID=$!

echo "[dev+tunnel] Waiting for app to be ready..."
if ! wait_for_app_ready; then
  echo "[dev+tunnel] App did not become ready in ${TUNNEL_TIMEOUT_SECONDS}s."
  exit 1
fi

if [[ "${ENABLE_FIGMA_WATCH}" == "1" ]]; then
  start_figma_watch
  sleep 1

  if ! kill -0 "${FIGMA_PID}" 2>/dev/null; then
    echo "[dev+tunnel] Figma watcher failed to start. Check FIGMA_TOKEN and figma-assets.json."
    wait "${FIGMA_PID}" || true
    exit 1
  fi
fi

echo "[dev+tunnel] App is ready. Starting tunnel..."
echo "[dev+tunnel] If tunnel URL appears, share that HTTPS link."
start_tunnel

while true; do
  if ! kill -0 "${DEV_PID}" 2>/dev/null; then
    wait "${DEV_PID}" || true
    echo "[dev+tunnel] Dev server stopped unexpectedly. Attempting auto-restart in 1s..."
    sleep 1
    if ! restart_dev_server; then
      exit 1
    fi
    continue
  fi

  if [[ "${APP_ENABLE_HTTP_HEALTHCHECK}" == "1" ]]; then
    NOW_TS=$(date +%s)
    if (( NOW_TS - LAST_HTTP_HEALTHCHECK_TS >= APP_HTTP_HEALTHCHECK_INTERVAL_SECONDS )); then
      LAST_HTTP_HEALTHCHECK_TS=${NOW_TS}
      APP_STATUS_CODE="$(curl -sS -o /dev/null -w "%{http_code}" "${APP_URL}" || true)"
      if [[ "${APP_STATUS_CODE}" =~ ^5[0-9]{2}$ ]]; then
        APP_5XX_STREAK=$((APP_5XX_STREAK + 1))
        if (( APP_5XX_STREAK >= APP_RECOVERY_5XX_THRESHOLD )); then
          if (( NOW_TS - LAST_DEV_RECOVERY_TS >= APP_RECOVERY_COOLDOWN_SECONDS )); then
            echo "[dev+tunnel] Healthcheck detected ${APP_5XX_STREAK} consecutive 5xx responses (${APP_STATUS_CODE})."
            if ! restart_dev_server; then
              exit 1
            fi
          fi
        fi
      else
        APP_5XX_STREAK=0
      fi
    fi
  fi

  if ! kill -0 "${TUNNEL_PID}" 2>/dev/null; then
    wait "${TUNNEL_PID}" || true
    if ! kill -0 "${DEV_PID}" 2>/dev/null; then
      echo "[dev+tunnel] Tunnel stopped after dev server exited."
      exit 1
    fi
    echo "[dev+tunnel] Tunnel stopped. Restarting in 2s..."
    sleep 2
    start_tunnel
    continue
  fi

  if [[ -n "${FIGMA_PID}" ]] && ! kill -0 "${FIGMA_PID}" 2>/dev/null; then
    wait "${FIGMA_PID}" || true
    if ! kill -0 "${DEV_PID}" 2>/dev/null; then
      echo "[dev+tunnel] Figma watcher stopped after dev server exited."
      exit 1
    fi
    echo "[dev+tunnel] Figma watcher stopped. Restarting in 2s..."
    sleep 2
    start_figma_watch
    continue
  fi

  sleep 1
done
