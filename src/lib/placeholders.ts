import placeholderValuesRaw from "../../content/placeholders.json";

export type PlaceholderMap = Record<string, string>;
export type SiteSocialLinks = {
  telegram: string;
  vk: string;
  youtube: string;
  instagram: string;
  whatsapp: string;
};
export type SiteTextValues = {
  brandName: string;
  supportEmail: string;
  supportPhone: string;
  socialLinks: SiteSocialLinks;
  companyShortName: string;
  companyInn: string;
  companyKpp: string;
  privacyLink: string;
  agreementLink: string;
  pricingMonthlyRub: number;
  pricingAnnualDiscountPercent: number;
  pricingAnnualRub: number;
  pricingMonthlyRubDisplay: string;
  pricingAnnualRubDisplay: string;
};

export const placeholderValues: PlaceholderMap = placeholderValuesRaw as PlaceholderMap;

export function getPlaceholderValue(
  key: string,
  fallback = "",
  values: PlaceholderMap = placeholderValues
): string {
  return values[key] ?? fallback;
}

export function applyPlaceholders(
  content: string,
  values: PlaceholderMap = placeholderValues
): string {
  let result = content;
  const keys = Object.keys(values).sort((a, b) => b.length - a.length);

  for (const key of keys) {
    const value = values[key];
    if (!key || typeof value !== "string") {
      continue;
    }
    result = result.replaceAll(key, value);
  }

  return result;
}

function parseNumberFromPlaceholder(value: string, fallback: number): number {
  if (typeof value !== "string" || value.trim().length === 0) {
    return fallback;
  }

  const normalized = value.replace(",", ".").replace(/[^\d.]/g, "");
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return parsed;
}

function formatRub(value: number): string {
  return `${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(value)} ₽`;
}

export function deriveSiteTextValues(values: PlaceholderMap = placeholderValues): SiteTextValues {
  const monthlyRubRaw = parseNumberFromPlaceholder(
    getPlaceholderValue("[СТОИМОСТЬ ТАРИФА ЗА МЕСЯЦ]", "1999", values),
    1999
  );
  const monthlyRub = Math.max(0, Math.round(monthlyRubRaw));

  const discountPercentRaw = parseNumberFromPlaceholder(
    getPlaceholderValue("[СКИДКА ЗА ГОД ПРОЦЕНТОВ]", "10", values),
    10
  );
  const discountPercent = Math.max(0, Math.min(100, Math.round(discountPercentRaw)));

  const annualRub = Math.max(0, Math.round(monthlyRub * (1 - discountPercent / 100)));

  return {
    brandName: getPlaceholderValue("[НАЗВАНИЕ СЕРВИСА]", "Reflow", values),
    supportEmail: getPlaceholderValue("[EMAIL ПОДДЕРЖКИ]", "support@reflowapp.pro", values),
    supportPhone: getPlaceholderValue("[ТЕЛЕФОН ПОДДЕРЖКИ]", "+7 (495) 123-45-67", values),
    socialLinks: {
      telegram: getPlaceholderValue("[ССЫЛКА НА TELEGRAM]", "", values),
      vk: getPlaceholderValue("[ССЫЛКА НА VK]", "", values),
      youtube: getPlaceholderValue("[ССЫЛКА НА YOUTUBE]", "", values),
      instagram: getPlaceholderValue("[ССЫЛКА НА INSTAGRAM]", "", values),
      whatsapp: getPlaceholderValue("[ССЫЛКА НА WHATSAPP]", "", values)
    },
    companyShortName: getPlaceholderValue(
      "[КОРОТКОЕ НАЗВАНИЕ ОРГАНИЗАЦИИ]",
      "ООО «МЕДИА РЕСУРС»",
      values
    ),
    companyInn: getPlaceholderValue("[ИНН]", "7714457395", values),
    companyKpp: getPlaceholderValue("[КПП]", "771401001", values),
    privacyLink: getPlaceholderValue(
      "[ССЫЛКА НА СТРАНИЦУ С ПОЛИТИКОЙ КОНФИДЕНЦИАЛЬНОСТИ]",
      "/legal/privacy",
      values
    ),
    agreementLink: getPlaceholderValue("[ССЫЛКА НА СТРАНИЦУ С СОГЛАШЕНИЕМ]", "/legal", values),
    pricingMonthlyRub: monthlyRub,
    pricingAnnualDiscountPercent: discountPercent,
    pricingAnnualRub: annualRub,
    pricingMonthlyRubDisplay: formatRub(monthlyRub),
    pricingAnnualRubDisplay: formatRub(annualRub)
  };
}
