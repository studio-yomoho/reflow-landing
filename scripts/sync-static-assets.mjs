#!/usr/bin/env node

import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const cwd = process.cwd();

const assetMappings = [
  {
    id: "ogImage",
    source: "content/og.jpg",
    target: "public/figma/og.jpg",
    publicPath: "/figma/og.jpg"
  }
];

const manifestPath = path.join(cwd, "src/app/generated/static-assets-manifest.json");

function log(message) {
  console.log(`[assets:sync] ${message}`);
}

function sha1(buffer) {
  return createHash("sha1").update(buffer).digest("hex");
}

async function ensureDir(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

async function readFileOrNull(filePath) {
  try {
    return await fs.readFile(filePath);
  } catch {
    return null;
  }
}

async function syncAsset(mapping) {
  const sourcePath = path.join(cwd, mapping.source);
  const targetPath = path.join(cwd, mapping.target);
  const sourceBuffer = await fs.readFile(sourcePath);
  const sourceHash = sha1(sourceBuffer);
  const existingTarget = await readFileOrNull(targetPath);
  const targetHash = existingTarget ? sha1(existingTarget) : "";
  let written = false;

  if (sourceHash !== targetHash) {
    await ensureDir(targetPath);
    await fs.writeFile(targetPath, sourceBuffer);
    written = true;
  }

  return {
    id: mapping.id,
    source: mapping.source,
    target: mapping.target,
    publicPath: mapping.publicPath,
    hash: sourceHash,
    version: sourceHash.slice(0, 12),
    written
  };
}

async function writeManifest(entries) {
  const manifest = {
    generatedAt: new Date().toISOString(),
    assets: Object.fromEntries(
      entries.map((entry) => [
        entry.id,
        {
          source: entry.source,
          target: entry.target,
          publicPath: entry.publicPath,
          version: entry.version,
          urlWithVersion: `${entry.publicPath}?v=${entry.version}`
        }
      ])
    )
  };

  await ensureDir(manifestPath);
  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

async function main() {
  const entries = [];

  for (const mapping of assetMappings) {
    const entry = await syncAsset(mapping);
    entries.push(entry);
    log(`${entry.written ? "written" : "skipped"} ${mapping.source} -> ${mapping.target} (${entry.version})`);
  }

  await writeManifest(entries);
}

main().catch((error) => {
  console.error("[assets:sync] Failed:", error instanceof Error ? error.message : String(error));
  process.exit(1);
});
