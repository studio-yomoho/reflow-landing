#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const CONFIG_PATH = process.env.FIGMA_ASSETS_CONFIG || "figma-assets.json";
const ENV_FILES = [".env.local", ".env"];

async function loadDotEnvFile(filePath, options = {}) {
  const { overrideExisting = false } = options;
  try {
    const content = await fs.readFile(filePath, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }
      const eqIndex = trimmed.indexOf("=");
      if (eqIndex < 1) {
        continue;
      }
      const key = trimmed.slice(0, eqIndex).trim();
      let value = trimmed.slice(eqIndex + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (overrideExisting || !process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // Ignore missing env files.
  }
}

/**
 * @typedef {{
 *   slot?: string;
 *   name?: string;
 *   nodeId?: string;
 *   nodeUrl?: string;
 *   nodeIdMobile?: string;
 *   nodeUrlMobile?: string;
 *   format?: "png" | "jpg" | "svg" | "pdf";
 *   scale?: number;
 *   output: string;
 * }} AssetConfig
 */

function fail(message) {
  console.error(`[figma:sync] ${message}`);
  process.exit(1);
}

function normalizeNodeId(value) {
  if (!value) {
    return "";
  }
  return String(value).trim().replace(/-/g, ":");
}

function parseNodeUrl(urlValue) {
  try {
    const parsed = new URL(urlValue);
    const rawNodeId = parsed.searchParams.get("node-id");
    const nodeId = normalizeNodeId(rawNodeId || "");
    const segments = parsed.pathname.split("/").filter(Boolean);
    const rootSegmentIndex = segments.findIndex((segment) =>
      ["design", "file", "proto", "board"].includes(segment)
    );
    const fileKey = rootSegmentIndex >= 0 ? segments[rootSegmentIndex + 1] || "" : "";
    return { nodeId, fileKey };
  } catch {
    return { nodeId: "", fileKey: "" };
  }
}

function deriveMobileOutputPath(outputPath) {
  const normalized = String(outputPath || "").replace(/\\/g, "/");
  const ext = path.extname(normalized);
  if (!ext) {
    return `${normalized}.mobile`;
  }
  return `${normalized.slice(0, -ext.length)}.mobile${ext}`;
}

function getSlotName(slot, isMobileVariant) {
  const normalized = String(slot || "").trim();
  if (!normalized) {
    return "";
  }
  return isMobileVariant ? `${normalized}Mobile` : normalized;
}

function applyMobileSlotFallbacks(slots) {
  const nextSlots = { ...slots };
  for (const slotName of Object.keys(nextSlots)) {
    if (!slotName || slotName.endsWith("Mobile")) {
      continue;
    }

    const mobileSlotName = `${slotName}Mobile`;
    if (nextSlots[mobileSlotName]) {
      continue;
    }

    nextSlots[mobileSlotName] = { ...nextSlots[slotName] };
  }

  return nextSlots;
}

function toPublicSrc(outputPath) {
  const normalized = outputPath.replace(/\\/g, "/");
  if (!normalized.startsWith("public/")) {
    return "";
  }
  return normalized.slice("public".length);
}

function groupKey(format, scale) {
  return `${format}:${scale}`;
}

async function fetchJson(url, token) {
  const response = await fetch(url, {
    headers: {
      "X-Figma-Token": token
    }
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${response.status} ${response.statusText}: ${body}`);
  }
  return response.json();
}

async function downloadToFile(url, outputPath) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());

  try {
    const existing = await fs.readFile(outputPath);
    if (existing.equals(buffer)) {
      return false;
    }
  } catch {
    // Ignore missing file.
  }

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, buffer);
  return true;
}

async function readConfig(absConfigPath) {
  const raw = await fs.readFile(absConfigPath, "utf8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed.assets)) {
    fail("`assets` must be an array in figma-assets.json.");
  }
  return parsed;
}

function createManifest(fileKey, manifestSlots) {
  return {
    generatedAt: new Date().toISOString(),
    fileKey,
    slots: manifestSlots
  };
}

async function writeManifestIfChanged(manifestPath, fileKey, manifestSlots) {
  const normalizedManifestSlots = applyMobileSlotFallbacks(manifestSlots);
  let existingFileKey = "";
  let existingSlots = {};
  try {
    const existingRaw = await fs.readFile(manifestPath, "utf8");
    const existing = JSON.parse(existingRaw);
    existingFileKey = String(existing?.fileKey || "");
    existingSlots = existing?.slots && typeof existing.slots === "object" ? existing.slots : {};
  } catch {
    // Ignore missing file.
  }

  if (
    existingFileKey === fileKey &&
    JSON.stringify(existingSlots) === JSON.stringify(normalizedManifestSlots)
  ) {
    return false;
  }

  await fs.mkdir(path.dirname(manifestPath), { recursive: true });
  await fs.writeFile(
    manifestPath,
    JSON.stringify(createManifest(fileKey, normalizedManifestSlots), null, 2) + "\n",
    "utf8"
  );
  return true;
}

async function main() {
  const root = process.cwd();

  for (const envFile of ENV_FILES) {
    await loadDotEnvFile(path.resolve(root, envFile), { overrideExisting: true });
  }

  const token = process.env.FIGMA_TOKEN || "";
  const absConfigPath = path.resolve(root, CONFIG_PATH);
  const config = await readConfig(absConfigPath);

  if (!token) {
    fail("FIGMA_TOKEN is missing. Add it to your shell env or .env.local.");
  }

  let fileKey = String(config.fileKey || "").trim();

  /** @type {(AssetConfig & { nodeIdNormalized: string; formatNormalized: "png" | "jpg" | "svg" | "pdf"; scaleNormalized: number; absOutput: string; })[]} */
  const preparedAssets = [];

  for (const asset of config.assets) {
    const fromDesktopUrl = parseNodeUrl(String(asset.nodeUrl || ""));
    const fromMobileUrl = parseNodeUrl(String(asset.nodeUrlMobile || ""));

    const candidateFileKeys = [fromDesktopUrl.fileKey, fromMobileUrl.fileKey].filter(Boolean);
    if (!fileKey && candidateFileKeys[0]) {
      fileKey = candidateFileKeys[0];
    }
    for (const candidateKey of candidateFileKeys) {
      if (fileKey && candidateKey && candidateKey !== fileKey) {
        console.warn(
          `[figma:sync] Skip "${asset.name || asset.slot || asset.output}": nodeUrl fileKey "${candidateKey}" does not match resolved fileKey "${fileKey}".`
        );
      }
    }

    const format = (asset.format || "png").toLowerCase();
    if (!["png", "jpg", "svg", "pdf"].includes(format)) {
      console.warn(`[figma:sync] Skip "${asset.name || asset.slot || asset.output}": unsupported format "${format}".`);
      continue;
    }

    const scale = Number(asset.scale || 2);
    const normalizedScale = Number.isFinite(scale) && scale > 0 ? scale : 2;
    const pushVariant = ({ nodeId, outputPath, isMobileVariant }) => {
      const normalizedNodeId = normalizeNodeId(nodeId);
      if (!normalizedNodeId) {
        return;
      }

      preparedAssets.push({
        ...asset,
        slot: getSlotName(asset.slot, isMobileVariant),
        name: isMobileVariant
          ? `${asset.name || asset.slot || asset.output} (mobile)`
          : asset.name,
        output: outputPath,
        nodeIdNormalized: normalizedNodeId,
        formatNormalized: /** @type {"png" | "jpg" | "svg" | "pdf"} */ (format),
        scaleNormalized: normalizedScale,
        absOutput: path.resolve(root, outputPath)
      });
    };

    pushVariant({
      nodeId: asset.nodeId || fromDesktopUrl.nodeId,
      outputPath: asset.output,
      isMobileVariant: false
    });
    pushVariant({
      nodeId: asset.nodeIdMobile || fromMobileUrl.nodeId,
      outputPath: deriveMobileOutputPath(asset.output),
      isMobileVariant: true
    });
  }

  if (!fileKey) {
    fail("`fileKey` is empty in figma-assets.json and was not resolved from nodeUrl.");
  }

  if (preparedAssets.length === 0) {
    fail("No valid assets to sync. Fill `nodeId` / `nodeUrl` (and optionally `nodeIdMobile` / `nodeUrlMobile`) in figma-assets.json.");
  }

  const grouped = new Map();
  for (const asset of preparedAssets) {
    const key = groupKey(asset.formatNormalized, asset.scaleNormalized);
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key).push(asset);
  }

  const downloadable = new Map();

  for (const [key, assets] of grouped.entries()) {
    const [format, scale] = key.split(":");
    const ids = assets.map((asset) => asset.nodeIdNormalized).join(",");
    const params = new URLSearchParams({
      ids,
      format,
      scale,
      svg_include_id: "true"
    });
    const url = `https://api.figma.com/v1/images/${fileKey}?${params.toString()}`;
    const response = await fetchJson(url, token);
    if (response.err) {
      throw new Error(response.err);
    }
    const images = response.images || {};
    for (const asset of assets) {
      downloadable.set(asset.nodeIdNormalized, images[asset.nodeIdNormalized] || "");
    }
  }

  const nodeIds = [...new Set(preparedAssets.map((asset) => asset.nodeIdNormalized))];
  const nodeParams = new URLSearchParams({
    ids: nodeIds.join(",")
  });
  const nodesUrl = `https://api.figma.com/v1/files/${fileKey}/nodes?${nodeParams.toString()}`;
  const nodesResponse = await fetchJson(nodesUrl, token);
  const nodesMap = nodesResponse.nodes || {};

  const manifestSlots = {};
  let downloadedCount = 0;
  let skippedUnchangedCount = 0;

  for (const asset of preparedAssets) {
    const imageUrl = downloadable.get(asset.nodeIdNormalized);
    if (!imageUrl) {
      console.warn(
        `[figma:sync] No downloadable URL for node ${asset.nodeIdNormalized} (${asset.slot || asset.name || asset.output}).`
      );
      continue;
    }

    const hasChanged = await downloadToFile(imageUrl, asset.absOutput);
    if (hasChanged) {
      downloadedCount += 1;
    } else {
      skippedUnchangedCount += 1;
    }

    const node = nodesMap[asset.nodeIdNormalized]?.document || null;
    const bounds = node?.absoluteBoundingBox || null;
    const slotName = String(asset.slot || "").trim();
    const src = toPublicSrc(asset.output);
    const fileStat = await fs.stat(asset.absOutput).catch(() => null);
    const rev = fileStat ? Math.round(fileStat.mtimeMs) : Date.now();

    if (slotName && src) {
      manifestSlots[slotName] = {
        src,
        nodeId: asset.nodeIdNormalized,
        format: asset.formatNormalized,
        width: bounds ? Math.round(bounds.width) : null,
        height: bounds ? Math.round(bounds.height) : null,
        rev
      };
    }
  }

  const manifestPath = path.resolve(root, config.manifestOutput || "src/app/generated/figma-assets-manifest.json");
  const manifestUpdated = await writeManifestIfChanged(manifestPath, fileKey, manifestSlots);

  console.log(
    `[figma:sync] Synced ${downloadedCount}/${preparedAssets.length} assets (unchanged skipped: ${skippedUnchangedCount}).`
  );
  console.log(
    `[figma:sync] Manifest ${manifestUpdated ? "updated" : "unchanged"}: ${path.relative(root, manifestPath)}`
  );
}

main().catch((error) => {
  fail(error instanceof Error ? error.message : String(error));
});
