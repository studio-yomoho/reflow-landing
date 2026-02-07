import fs from "node:fs/promises";
import path from "node:path";
import { defaultFaqItems, type FaqItem } from "./faq";

export async function loadFaqItems(): Promise<FaqItem[]> {
  const filePath = path.join(process.cwd(), "content/faq.json");

  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return defaultFaqItems;
    }

    const normalized = parsed
      .map((item) => {
        if (!item || typeof item !== "object" || Array.isArray(item)) {
          return null;
        }

        const q = typeof (item as { q?: unknown }).q === "string" ? (item as { q: string }).q.trim() : "";
        const a = typeof (item as { a?: unknown }).a === "string" ? (item as { a: string }).a.trim() : "";
        if (!q || !a) {
          return null;
        }

        return { q, a };
      })
      .filter((item): item is FaqItem => item !== null);

    return normalized.length > 0 ? normalized : defaultFaqItems;
  } catch {
    return defaultFaqItems;
  }
}
