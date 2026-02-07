import fs from "node:fs/promises";
import path from "node:path";
import { placeholderValues, type PlaceholderMap } from "./placeholders";

export async function loadPlaceholders(): Promise<PlaceholderMap> {
  const filePath = path.join(process.cwd(), "content/placeholders.json");

  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return placeholderValues;
    }

    const entries = Object.entries(parsed).filter(
      ([key, value]) => typeof key === "string" && typeof value === "string"
    );

    return {
      ...placeholderValues,
      ...Object.fromEntries(entries)
    };
  } catch {
    return placeholderValues;
  }
}

