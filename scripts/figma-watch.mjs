#!/usr/bin/env node

import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const CONFIG_PATH = process.env.FIGMA_ASSETS_CONFIG || "figma-assets.json";
const ENV_FILES = [".env.local", ".env"];
const WATCH_INTERVAL_SECONDS = Math.max(
  3,
  Number(process.env.FIGMA_WATCH_INTERVAL_SECONDS || 8)
);
const WATCH_SLOTS_FILTER = new Set(
  String(process.env.FIGMA_WATCH_SLOTS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
);
const WATCH_NODE_IDS_FILTER = new Set(
  String(process.env.FIGMA_WATCH_NODE_IDS || "")
    .split(",")
    .map((value) => normalizeNodeId(value))
    .filter(Boolean)
);
const WATCH_OUTPUTS_FILTER = new Set(
  String(process.env.FIGMA_WATCH_OUTPUTS || "")
    .split(",")
    .map((value) => value.trim().replace(/\\/g, "/"))
    .filter(Boolean)
);

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
 *   watch?: boolean;
 *   output: string;
 * }} AssetConfig
 */

function log(message) {
  console.log(`[figma:watch] ${message}`);
}

function warn(message) {
  console.warn(`[figma:watch] ${message}`);
}

function fail(message) {
  console.error(`[figma:watch] ${message}`);
  process.exit(1);
}

function hashValue(value) {
  return createHash("sha1").update(value).digest("hex");
}

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

async function loadEnvFiles(root, options = {}) {
  for (const envFile of ENV_FILES) {
    await loadDotEnvFile(path.resolve(root, envFile), options);
  }
}

async function resolveFigmaToken(root, options = {}) {
  await loadEnvFiles(root, options);
  return String(process.env.FIGMA_TOKEN || "").trim();
}

function isFigmaAuthError(message) {
  const normalized = String(message || "").toLowerCase();
  return (
    normalized.includes("401") ||
    normalized.includes("403") ||
    normalized.includes("forbidden") ||
    normalized.includes("unauthorized") ||
    normalized.includes("invalid") && normalized.includes("token")
  );
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

function createManifest(fileKey, slots) {
  return {
    generatedAt: new Date().toISOString(),
    fileKey,
    slots
  };
}

async function readManifest(absManifestPath) {
  try {
    const raw = await fs.readFile(absManifestPath, "utf8");
    const parsed = JSON.parse(raw);
    return parsed?.slots && typeof parsed.slots === "object" ? parsed.slots : {};
  } catch {
    return {};
  }
}

function shouldWatchAsset(asset) {
  if (asset.watch === false) {
    return false;
  }

  const hasFilter =
    WATCH_SLOTS_FILTER.size > 0 || WATCH_NODE_IDS_FILTER.size > 0 || WATCH_OUTPUTS_FILTER.size > 0;
  if (!hasFilter) {
    return true;
  }

  const normalizedOutput = String(asset.output || "").replace(/\\/g, "/");
  return (
    WATCH_SLOTS_FILTER.has(String(asset.slotName || "").trim()) ||
    WATCH_SLOTS_FILTER.has(String(asset.parentSlotName || "").trim()) ||
    WATCH_NODE_IDS_FILTER.has(String(asset.nodeIdNormalized || "").trim()) ||
    WATCH_OUTPUTS_FILTER.has(normalizedOutput) ||
    WATCH_OUTPUTS_FILTER.has(String(asset.baseOutputNormalized || "").trim())
  );
}

function prepareConfig(root, configRaw) {
  const config = JSON.parse(configRaw);
  if (!Array.isArray(config.assets)) {
    throw new Error("`assets` must be an array in figma-assets.json.");
  }

  let fileKey = String(config.fileKey || "").trim();
  const allAssets = [];

  for (const asset of config.assets) {
    const fromDesktopUrl = parseNodeUrl(String(asset.nodeUrl || ""));
    const fromMobileUrl = parseNodeUrl(String(asset.nodeUrlMobile || ""));

    const candidateFileKeys = [fromDesktopUrl.fileKey, fromMobileUrl.fileKey].filter(Boolean);
    if (!fileKey && candidateFileKeys[0]) {
      fileKey = candidateFileKeys[0];
    }

    const hasDesktopFileKeyConflict =
      !!fromDesktopUrl.fileKey && !!fileKey && fromDesktopUrl.fileKey !== fileKey;
    const hasMobileFileKeyConflict =
      !!fromMobileUrl.fileKey && !!fileKey && fromMobileUrl.fileKey !== fileKey;

    if (hasDesktopFileKeyConflict || hasMobileFileKeyConflict) {
      warn(
        `Skip mismatched fileKey for "${asset.name || asset.slot || asset.output}" (resolved "${fileKey}", desktop "${fromDesktopUrl.fileKey || "-"}", mobile "${fromMobileUrl.fileKey || "-"}").`
      );
    }

    const format = (asset.format || "png").toLowerCase();
    if (!["png", "jpg", "svg", "pdf"].includes(format)) {
      warn(`Skip "${asset.name || asset.slot || asset.output}": unsupported format "${format}".`);
      continue;
    }

    const scale = Number(asset.scale || 2);
    const normalizedScale = Number.isFinite(scale) && scale > 0 ? scale : 2;
    const parentSlotName = String(asset.slot || "").trim();
    const baseOutputNormalized = String(asset.output || "").replace(/\\/g, "/");
    const baseAssetLabel =
      parentSlotName || String(asset.name || "").trim() || path.basename(baseOutputNormalized);

    const pushVariant = ({ nodeId, outputPath, isMobileVariant, fileKeyConflict }) => {
      if (fileKeyConflict) {
        return;
      }

      const nodeIdRaw = normalizeNodeId(nodeId);
      if (!nodeIdRaw) {
        return;
      }

      const slotName = getSlotName(parentSlotName, isMobileVariant);
      const variantLabel = isMobileVariant ? `${baseAssetLabel} (mobile)` : baseAssetLabel;

      allAssets.push({
        ...asset,
        slotName,
        parentSlotName,
        label: variantLabel,
        output: outputPath,
        nodeIdNormalized: nodeIdRaw,
        formatNormalized: format,
        scaleNormalized: normalizedScale,
        absOutput: path.resolve(root, outputPath),
        baseOutputNormalized,
        assetKey: `${slotName || outputPath}|${format}|${normalizedScale}|${nodeIdRaw}`
      });
    };

    pushVariant({
      nodeId: asset.nodeId || fromDesktopUrl.nodeId,
      outputPath: asset.output,
      isMobileVariant: false,
      fileKeyConflict: hasDesktopFileKeyConflict
    });
    pushVariant({
      nodeId: asset.nodeIdMobile || fromMobileUrl.nodeId,
      outputPath: deriveMobileOutputPath(asset.output),
      isMobileVariant: true,
      fileKeyConflict: hasMobileFileKeyConflict
    });
  }

  if (!fileKey) {
    throw new Error("`fileKey` is empty in figma-assets.json and was not resolved from nodeUrl.");
  }

  const preparedAssets = allAssets.filter((asset) => shouldWatchAsset(asset));

  if (preparedAssets.length === 0) {
    throw new Error(
      "No assets matched current watch filters. Check FIGMA_WATCH_SLOTS / FIGMA_WATCH_NODE_IDS / FIGMA_WATCH_OUTPUTS and `watch` flags."
    );
  }

  const nodeIds = [...new Set(preparedAssets.map((asset) => asset.nodeIdNormalized))];
  const manifestPath = path.resolve(
    root,
    config.manifestOutput || "src/app/generated/figma-assets-manifest.json"
  );
  const configuredSlots = new Set(
    allAssets.map((asset) => String(asset.slotName || "").trim()).filter(Boolean)
  );

  return { fileKey, preparedAssets, nodeIds, manifestPath, configuredSlots, allAssets };
}

async function fetchNodes(fileKey, nodeIds, token) {
  if (nodeIds.length === 0) {
    return {};
  }
  const params = new URLSearchParams({
    ids: nodeIds.join(",")
  });
  const url = `https://api.figma.com/v1/files/${fileKey}/nodes?${params.toString()}`;
  const response = await fetchJson(url, token);
  return response.nodes || {};
}

async function fetchLatestVersionId(fileKey, token) {
  const params = new URLSearchParams({ page_size: "1" });
  const url = `https://api.figma.com/v1/files/${fileKey}/versions?${params.toString()}`;
  const response = await fetchJson(url, token);
  return String(response?.versions?.[0]?.id || "").trim();
}

async function fetchImageUrlsForAssets(fileKey, assets, token) {
  const grouped = new Map();
  for (const asset of assets) {
    const key = groupKey(asset.formatNormalized, asset.scaleNormalized);
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key).push(asset);
  }

  const urlsByAsset = new Map();

  await Promise.all(
    [...grouped.entries()].map(async ([key, groupAssets]) => {
      const [format, scale] = key.split(":");
      const ids = [...new Set(groupAssets.map((asset) => asset.nodeIdNormalized))].join(",");
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
      for (const asset of groupAssets) {
        const imageUrl = images[asset.nodeIdNormalized] || "";
        if (imageUrl) {
          urlsByAsset.set(asset.assetKey, imageUrl);
        }
      }
    })
  );

  return urlsByAsset;
}

async function writeManifest(fileKey, slots, manifestPath, configuredSlots) {
  const nextSlots = { ...slots };
  for (const slotName of Object.keys(nextSlots)) {
    if (!configuredSlots.has(slotName)) {
      delete nextSlots[slotName];
    }
  }
  const normalizedSlots = applyMobileSlotFallbacks(nextSlots);

  let existingFileKey = "";
  let existingSlots = {};
  try {
    const existingRaw = await fs.readFile(manifestPath, "utf8");
    const existing = JSON.parse(existingRaw);
    existingFileKey = String(existing?.fileKey || "");
    existingSlots = existing?.slots && typeof existing.slots === "object" ? existing.slots : {};
  } catch {
    // Ignore missing manifest.
  }

  if (
    existingFileKey === fileKey &&
    JSON.stringify(existingSlots) === JSON.stringify(normalizedSlots)
  ) {
    return false;
  }

  await fs.mkdir(path.dirname(manifestPath), { recursive: true });
  await fs.writeFile(
    manifestPath,
    JSON.stringify(createManifest(fileKey, normalizedSlots), null, 2) + "\n",
    "utf8"
  );
  return true;
}

async function syncChangedAssets({
  fileKey,
  changedAssets,
  imageUrlsByAsset,
  token,
  currentSlots,
  manifestPath,
  configuredSlots
}) {
  const changedNodeIds = [...new Set(changedAssets.map((asset) => asset.nodeIdNormalized))];
  const nodesMap = await fetchNodes(fileKey, changedNodeIds, token);

  let completed = 0;
  let synced = 0;
  let skipped = 0;
  const total = changedAssets.length;

  await Promise.all(
    changedAssets.map(async (asset) => {
      const url = imageUrlsByAsset.get(asset.assetKey);
      const label = asset.label;

      try {
        if (!url) {
          throw new Error("download URL missing");
        }

        log(`Start: ${label}`);
        const hasFileChanged = await downloadToFile(url, asset.absOutput);

        const src = toPublicSrc(asset.output);
        const node = nodesMap[asset.nodeIdNormalized]?.document || null;
        const bounds = node?.absoluteBoundingBox || null;
        const fileStat = await fs.stat(asset.absOutput).catch(() => null);
        const rev = fileStat ? Math.round(fileStat.mtimeMs) : Date.now();

        if (asset.slotName && src) {
          currentSlots[asset.slotName] = {
            src,
            nodeId: asset.nodeIdNormalized,
            format: asset.formatNormalized,
            width: bounds ? Math.round(bounds.width) : null,
            height: bounds ? Math.round(bounds.height) : null,
            rev
          };
        }

        if (hasFileChanged) {
          synced += 1;
        } else {
          skipped += 1;
          log(`Skip write (unchanged): ${label}`);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        warn(`Failed: ${label}: ${message}`);
      } finally {
        completed += 1;
        log(`Progress: ${completed}/${total}`);
      }
    })
  );

  const manifestUpdated = await writeManifest(fileKey, currentSlots, manifestPath, configuredSlots);
  return { synced, skipped, manifestUpdated };
}

async function sleep(seconds) {
  await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

async function main() {
  const root = process.cwd();
  let token = await resolveFigmaToken(root, { overrideExisting: true });
  if (!token) {
    fail("FIGMA_TOKEN is missing. Add it to your shell env or .env.local.");
  }

  const absConfigPath = path.resolve(root, CONFIG_PATH);
  let previousConfigHash = "";
  let previousVersionId = "";
  let previousImageUrlsByAsset = new Map();
  let isVersionCheckEnabled = true;
  let state = null;
  let slots = {};

  log(`Watching Figma assets every ${WATCH_INTERVAL_SECONDS}s (incremental mode).`);

  while (true) {
    try {
      const configRaw = await fs.readFile(absConfigPath, "utf8");
      const currentConfigHash = hashValue(configRaw);
      const configChanged = currentConfigHash !== previousConfigHash;

      if (!state || configChanged) {
        state = prepareConfig(root, configRaw);
        previousConfigHash = currentConfigHash;
        previousVersionId = "";
        previousImageUrlsByAsset = new Map();
        isVersionCheckEnabled = true;
        slots = await readManifest(state.manifestPath);
        log(configChanged ? "Config changed. Watch targets reloaded." : "Config loaded.");
        log(`Tracked assets: ${state.preparedAssets.length}/${state.allAssets.length} (file ${state.fileKey}).`);
        if (
          WATCH_SLOTS_FILTER.size > 0 ||
          WATCH_NODE_IDS_FILTER.size > 0 ||
          WATCH_OUTPUTS_FILTER.size > 0
        ) {
          log("Filters active via FIGMA_WATCH_SLOTS / FIGMA_WATCH_NODE_IDS / FIGMA_WATCH_OUTPUTS.");
        }
      }

      let latestVersionId = "";
      if (!configChanged && isVersionCheckEnabled) {
        try {
          latestVersionId = await fetchLatestVersionId(state.fileKey, token);
          if (latestVersionId && previousVersionId && latestVersionId === previousVersionId) {
            await sleep(WATCH_INTERVAL_SECONDS);
            continue;
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          if (message.includes("file_versions:read") || message.startsWith("403")) {
            isVersionCheckEnabled = false;
            warn(
              "Version check disabled (missing `file_versions:read`). Falling back to URL diff mode."
            );
          } else {
            throw error;
          }
        }
      }

      const currentImageUrlsByAsset = await fetchImageUrlsForAssets(
        state.fileKey,
        state.preparedAssets,
        token
      );

      const changedAssets = state.preparedAssets.filter((asset) => {
        const currentUrl = currentImageUrlsByAsset.get(asset.assetKey) || "";
        if (!currentUrl) {
          return false;
        }
        const previousUrl = previousImageUrlsByAsset.get(asset.assetKey) || "";
        return configChanged || !previousUrl || currentUrl !== previousUrl;
      });

      if (changedAssets.length > 0) {
        log(`Detected ${changedAssets.length} changed asset(s):`);
        for (const asset of changedAssets) {
          log(`- ${asset.label} [${asset.nodeIdNormalized}]`);
        }

        const syncResult = await syncChangedAssets({
          fileKey: state.fileKey,
          changedAssets,
          imageUrlsByAsset: currentImageUrlsByAsset,
          token,
          currentSlots: slots,
          manifestPath: state.manifestPath,
          configuredSlots: state.configuredSlots
        });

        const manifestStatus = syncResult.manifestUpdated ? "updated" : "unchanged";
        log(
          `Sync done: written ${syncResult.synced}, skipped ${syncResult.skipped}, manifest ${manifestStatus}.`
        );
      }

      previousImageUrlsByAsset = currentImageUrlsByAsset;
      if (latestVersionId && isVersionCheckEnabled) {
        previousVersionId = latestVersionId;
      } else if (!previousVersionId && isVersionCheckEnabled) {
        try {
          const fallbackVersionId = await fetchLatestVersionId(state.fileKey, token);
          if (fallbackVersionId) {
            previousVersionId = fallbackVersionId;
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          if (message.includes("file_versions:read") || message.startsWith("403")) {
            isVersionCheckEnabled = false;
            warn(
              "Version check disabled (missing `file_versions:read`). Falling back to URL diff mode."
            );
          } else {
            throw error;
          }
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (isFigmaAuthError(message)) {
        const refreshedToken = await resolveFigmaToken(root, { overrideExisting: true });
        if (refreshedToken && refreshedToken !== token) {
          token = refreshedToken;
          previousVersionId = "";
          previousImageUrlsByAsset = new Map();
          isVersionCheckEnabled = true;
          warn("Figma auth error detected. Reloaded FIGMA_TOKEN from env and will retry.");
        } else {
          warn("Figma auth error detected, but FIGMA_TOKEN was not changed in env files.");
        }
      }
      warn(message);
    }

    await sleep(WATCH_INTERVAL_SECONDS);
  }
}

main().catch((error) => {
  fail(error instanceof Error ? error.message : String(error));
});
