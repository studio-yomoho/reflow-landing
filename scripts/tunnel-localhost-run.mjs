#!/usr/bin/env node

import process from "node:process";
import readline from "node:readline";
import { spawn } from "node:child_process";
import qrcode from "qrcode-terminal";

const APP_PORT = Number(process.env.APP_PORT || 3001);
const SSH_REMOTE_PORT = Number(process.env.SSH_REMOTE_PORT || 80);
const LOCALHOST_RUN_DOMAIN = String(process.env.LOCALHOST_RUN_DOMAIN || "").trim();
const LOCALHOST_RUN_HOST = String(process.env.LOCALHOST_RUN_HOST || "localhost.run").trim();
const LOCALHOST_RUN_USER = String(
  process.env.LOCALHOST_RUN_USER || (LOCALHOST_RUN_DOMAIN ? "plan" : "nokey")
).trim();
const SSH_TARGET = `${LOCALHOST_RUN_USER}@${LOCALHOST_RUN_HOST}`;

function cleanAnsi(text) {
  return text.replace(/\x1b\[[0-9;]*[A-Za-z]/g, "");
}

function isNoiseLine(line) {
  if (!line) {
    return true;
  }
  if (/^[\s\u2580-\u259f]+$/.test(line)) {
    return true;
  }
  if (line.includes("Open your tunnel address on your mobile with this QR")) {
    return true;
  }
  if (line.includes("Welcome to localhost.run!")) {
    return true;
  }
  if (line.startsWith("===")) {
    return true;
  }
  return false;
}

function extractTunnelUrl(text) {
  const payload = parseJsonLine(text);
  if (payload?.status === "success" && payload?.type === "opened" && payload?.address) {
    return `https://${String(payload.address).replace(/^https?:\/\//, "")}`;
  }

  if (!text.includes("tunneled with tls termination")) {
    return "";
  }
  const match = text.match(/https:\/\/[a-zA-Z0-9.-]+/);
  return match ? match[0] : "";
}

function parseJsonLine(text) {
  const jsonLine = text.trim();
  if (!jsonLine.startsWith("{") || !jsonLine.endsWith("}")) {
    return null;
  }

  try {
    return JSON.parse(jsonLine);
  } catch {
    return null;
  }
}

const remoteForward = LOCALHOST_RUN_DOMAIN
  ? `${LOCALHOST_RUN_DOMAIN}:${SSH_REMOTE_PORT}:localhost:${APP_PORT}`
  : `${SSH_REMOTE_PORT}:localhost:${APP_PORT}`;

console.log(`[tunnel] Starting localhost.run tunnel to localhost:${APP_PORT} ...`);
if (LOCALHOST_RUN_DOMAIN) {
  console.log(`[tunnel] Requested domain: ${LOCALHOST_RUN_DOMAIN}`);
}

const sshArgs = [
  "-T",
  "-o",
  "StrictHostKeyChecking=no",
  "-o",
  "ServerAliveInterval=30",
  "-o",
  "ExitOnForwardFailure=yes",
  "-R",
  remoteForward,
  SSH_TARGET,
  "--",
  "--output",
  "json"
];

const child = spawn("ssh", sshArgs, {
  stdio: ["ignore", "pipe", "pipe"]
});

let lastUrl = "";

const onLine = (rawLine) => {
  const line = cleanAnsi(rawLine).trim();
  if (!line) {
    return;
  }

  const payload = parseJsonLine(line);
  const url = extractTunnelUrl(line);
  if (url && url !== lastUrl) {
    lastUrl = url;
    console.log(`[tunnel] Public URL: ${url}`);
    console.log("[tunnel] Compact QR:");
    qrcode.generate(url, { small: true });
    return;
  }

  if (payload?.event === "authn" && payload?.message) {
    console.log(`[tunnel] ${String(payload.message)}`);
    return;
  }

  if (payload?.status && payload.status !== "success") {
    const errorMessage = payload.message ? ` ${String(payload.message)}` : "";
    console.error(`[tunnel] ${String(payload.status)}.${errorMessage}`.trim());
    return;
  }

  if (line.includes("connection id is")) {
    console.log(`[tunnel] ${line}`);
    return;
  }

  if (line.includes("authenticated as")) {
    console.log(`[tunnel] ${line}`);
    return;
  }

  if (line.includes("permission denied") || line.includes("Error") || line.includes("failed")) {
    console.error(`[tunnel] ${line}`);
    return;
  }

  if (
    !isNoiseLine(line) &&
    (line.includes("tunneled with tls termination") ||
      line.includes("connection id is") ||
      line.includes("authenticated as"))
  ) {
    console.log(`[tunnel] ${line}`);
  }
};

const stdoutRl = readline.createInterface({ input: child.stdout });
const stderrRl = readline.createInterface({ input: child.stderr });
stdoutRl.on("line", onLine);
stderrRl.on("line", onLine);

const stopChild = () => {
  if (!child.killed) {
    child.kill("SIGINT");
  }
};

process.on("SIGINT", stopChild);
process.on("SIGTERM", stopChild);

child.on("close", (code) => {
  stdoutRl.close();
  stderrRl.close();
  if (code === 0) {
    process.exit(0);
  }
  process.exit(code || 1);
});
