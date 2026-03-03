import { access } from "node:fs/promises";
import path from "node:path";

const requiredFiles = [
  "public/figma/icons/site-icon.png",
  "public/figma/icons/site-apple-icon.png",
  "public/figma/og-image.png"
];
const forbiddenFiles = [
  "src/app/icon.png",
  "src/app/apple-icon.png",
  "public/icon.png",
  "public/apple-icon.png"
];
const cwd = process.cwd();
const missing = [];
const conflicting = [];

for (const relativePath of requiredFiles) {
  const absolutePath = path.join(cwd, relativePath);
  try {
    await access(absolutePath);
  } catch {
    missing.push(relativePath);
  }
}

for (const relativePath of forbiddenFiles) {
  const absolutePath = path.join(cwd, relativePath);
  try {
    await access(absolutePath);
    conflicting.push(relativePath);
  } catch {
    // Expected for conflict-prone files.
  }
}

if (missing.length > 0) {
  console.error("[assets] Missing required static files:");
  for (const file of missing) {
    console.error(`- ${file}`);
  }
  process.exit(1);
}

if (conflicting.length > 0) {
  console.error("[assets] Conflicting files found (public file conflicts with App Router file metadata routes):");
  for (const file of conflicting) {
    console.error(`- ${file}`);
  }
  process.exit(1);
}

console.log("[assets] Required static files are present.");
