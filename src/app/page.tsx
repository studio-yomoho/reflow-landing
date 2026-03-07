import Step1Frame from "./components/Step1Frame";
import { deriveSiteTextValues } from "../lib/placeholders";
import { loadFaqItems } from "../lib/server-faq";
import { loadHeroFeatureCarouselItems } from "../lib/server-hero-feature-carousel";
import { loadPlaceholders } from "../lib/server-placeholders";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [placeholders, faqItems, heroFeatureItems] = await Promise.all([
    loadPlaceholders(),
    loadFaqItems(),
    loadHeroFeatureCarouselItems()
  ]);
  const siteTextValues = deriveSiteTextValues(placeholders);

  return (
    <Step1Frame
      siteTextValues={siteTextValues}
      faqItems={faqItems}
      heroFeatureItems={heroFeatureItems}
    />
  );
}
