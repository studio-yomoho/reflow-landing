import Step1Frame from "./components/Step1Frame";
import { deriveSiteTextValues } from "../lib/placeholders";
import { loadFaqItems } from "../lib/server-faq";
import { loadPlaceholders } from "../lib/server-placeholders";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [placeholders, faqItems] = await Promise.all([loadPlaceholders(), loadFaqItems()]);
  const siteTextValues = deriveSiteTextValues(placeholders);

  return <Step1Frame siteTextValues={siteTextValues} faqItems={faqItems} />;
}
