import placeholderValuesRaw from "../../content/placeholders.json";

export type PlaceholderMap = Record<string, string>;
export type SiteTextValues = {
  brandName: string;
  supportEmail: string;
  supportPhone: string;
  companyShortName: string;
  companyInn: string;
  companyKpp: string;
  privacyLink: string;
  agreementLink: string;
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

export function deriveSiteTextValues(values: PlaceholderMap = placeholderValues): SiteTextValues {
  return {
    brandName: getPlaceholderValue("[НАЗВАНИЕ СЕРВИСА]", "Reflow", values),
    supportEmail: getPlaceholderValue("[EMAIL ПОДДЕРЖКИ]", "support@reflowapp.pro", values),
    supportPhone: getPlaceholderValue("[ТЕЛЕФОН ПОДДЕРЖКИ]", "+7 (495) 123-45-67", values),
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
    agreementLink: getPlaceholderValue("[ССЫЛКА НА СТРАНИЦУ С СОГЛАШЕНИЕМ]", "/legal", values)
  };
}
