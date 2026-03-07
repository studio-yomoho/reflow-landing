import fs from "node:fs/promises";
import path from "node:path";
import {
  defaultHeroFeatureCarouselItems,
  type HeroFeatureCarouselItem
} from "./hero-feature-carousel";

export async function loadHeroFeatureCarouselItems(): Promise<HeroFeatureCarouselItem[]> {
  const filePath = path.join(process.cwd(), "content/hero-feature-carousel.json");

  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return defaultHeroFeatureCarouselItems;
    }

    const normalized = parsed
      .map((item) => {
        if (typeof item === "string") {
          const text = item.trim();
          return text ? { text } : null;
        }

        if (!item || typeof item !== "object" || Array.isArray(item)) {
          return null;
        }

        const text =
          typeof (item as { text?: unknown }).text === "string"
            ? (item as { text: string }).text.trim()
            : "";
        if (!text) {
          return null;
        }

        return { text };
      })
      .filter((item): item is HeroFeatureCarouselItem => item !== null);

    return normalized.length > 0 ? normalized : defaultHeroFeatureCarouselItems;
  } catch {
    return defaultHeroFeatureCarouselItems;
  }
}

