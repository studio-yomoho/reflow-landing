export type HeroVariant = "legacy" | "alternative";
export type SecondBlockVariant = "layout611" | "stats55";

const envHeroVariant = process.env.NEXT_PUBLIC_HERO_VARIANT;
const envSecondBlockVariant = process.env.NEXT_PUBLIC_SECOND_BLOCK_VARIANT;

export const ACTIVE_HERO_VARIANT: HeroVariant =
  envHeroVariant === "legacy" ? "legacy" : "alternative";

export const ACTIVE_SECOND_BLOCK_VARIANT: SecondBlockVariant =
  envSecondBlockVariant === "layout611" ? "layout611" : "stats55";
