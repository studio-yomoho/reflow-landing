#!/usr/bin/env node

import fs from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";

const cwd = process.cwd();
const filesToWatch = [path.join(cwd, "content/og.jpg")];

function log(message) {
  console.log(`[assets:watch] ${message}`);
}

let syncProcess = null;
let queued = false;

function runSync(reason = "manual") {
  if (syncProcess) {
    queued = true;
    return;
  }

  log(`Sync start (${reason})`);
  syncProcess = spawn(process.execPath, ["./scripts/sync-static-assets.mjs"], {
    cwd,
    stdio: "inherit"
  });

  syncProcess.on("exit", (code) => {
    syncProcess = null;
    log(code === 0 ? "Sync done" : `Sync failed with code ${code ?? "unknown"}`);

    if (queued) {
      queued = false;
      runSync("queued");
    }
  });
}

for (const filePath of filesToWatch) {
  fs.watchFile(
    filePath,
    { interval: 800 },
    (current, previous) => {
      if (current.mtimeMs === previous.mtimeMs) {
        return;
      }

      log(`Change detected: ${path.relative(cwd, filePath)}`);
      runSync("file-change");
    }
  );
}

log(`Watching ${filesToWatch.map((filePath) => path.relative(cwd, filePath)).join(", ")}`);
runSync("startup");

process.on("SIGINT", () => process.exit(0));
process.on("SIGTERM", () => process.exit(0));
