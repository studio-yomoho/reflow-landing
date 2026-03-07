import { applyRussianNbspToNode } from "../../lib/typography";
import { UI_MOTION } from "../../config/motion";
import type { SiteSocialLinks } from "../../lib/placeholders";
import BrandLogo from "./BrandLogo";
import { PressableLink } from "./PressableCta";
import TelegramIcon from "./TelegramIcon";

type SiteFooterProps = {
  brandName?: string;
  supportEmail?: string;
  supportPhone?: string;
  socialLinks?: SiteSocialLinks;
  companyShortName?: string;
  companyInn?: string;
  companyKpp?: string;
  privacyLink?: string;
  agreementLink?: string;
  topPaddingClass?: string;
};

export default function SiteFooter({
  brandName = "Reflow",
  supportEmail = "support@reflowapp.pro",
  supportPhone = "+7 (495) 123-45-67",
  socialLinks,
  companyShortName = "ООО «МЕДИА РЕСУРС»",
  companyInn = "7714457395",
  companyKpp = "771401001",
  privacyLink = "/legal/privacy",
  agreementLink = "/legal",
  topPaddingClass = "pt-20 lg:pt-[80px]"
}: SiteFooterProps) {
  const hasBrandName = typeof brandName === "string" && brandName.trim().length > 0;
  const hasSupportPhone = typeof supportPhone === "string" && supportPhone.trim().length > 0;
  const hasSupportEmail = typeof supportEmail === "string" && supportEmail.trim().length > 0;
  const telegramLink = socialLinks?.telegram ?? "";
  const hasTelegramLink = typeof telegramLink === "string" && telegramLink.trim().length > 0;
  const hasContactBlock = hasSupportPhone || hasSupportEmail;
  const hasCompanyShortName =
    typeof companyShortName === "string" && companyShortName.trim().length > 0;
  const hasCompanyInn = typeof companyInn === "string" && companyInn.trim().length > 0;
  const hasCompanyKpp = typeof companyKpp === "string" && companyKpp.trim().length > 0;
  const hasRequisitesBlock = hasCompanyShortName || hasCompanyInn || hasCompanyKpp;

  const container = "mx-auto w-full max-w-[1360px] px-4 sm:px-8 lg:px-[48px]";
  const easeClass = UI_MOTION.easingClass;
  const durationMediumClass = UI_MOTION.durationClass.medium;
  const footerBlockGap = "var(--fluid-space-lg)";
  const footerCardRadius = "var(--fluid-radius-lg)";
  const footerCardPadding = "clamp(1.5rem, 1.0122rem + 2.0031vw, 3.5rem)";
  const footerInnerGap = "var(--fluid-space-lg)";
  const footerMetaGap = "var(--fluid-space-md)";
  const footerLabelFontSize = "var(--fluid-text-base)";
  const footerBodyFontSize = "var(--fluid-text-base)";
  const footerBottomGap = "var(--fluid-space-sm)";
  const footerLinkClass =
    `leading-[1.5] underline ${UI_MOTION.link.footerUnderlineColorClass} ${UI_MOTION.link.footerUnderlineThicknessClass} underline-offset-4 ${UI_MOTION.link.transitionClass} ${durationMediumClass} ${easeClass} hover:text-[#0b74ff] ${UI_MOTION.link.footerHoverUnderlineColorClass}`;

  const content = (
    <footer className={`overflow-hidden bg-[var(--bg-alt)] pb-20 lg:pb-[80px] ${topPaddingClass}`}>
      <div className={container}>
        <div className="flex flex-col" style={{ gap: footerBlockGap }}>
          <div
            className="bg-[var(--bg-primary)]"
            style={{ borderRadius: footerCardRadius, padding: footerCardPadding }}
          >
            <div className="flex max-w-[680px] flex-col" style={{ gap: footerInnerGap }}>
              {hasBrandName && (
                <BrandLogo brandName={brandName} href="/" />
              )}

              <div className="flex flex-col" style={{ gap: footerMetaGap }}>
                <div className="flex flex-col gap-1">
                  <p className="font-semibold leading-[1.5]" style={{ fontSize: footerLabelFontSize }}>Адрес</p>
                  <p className="leading-[1.5] break-words" style={{ fontSize: footerBodyFontSize }}>
                    125284, г. Москва, пр-кт Ленинградский, д. 31, стр. 3, помещ. 4
                  </p>
                </div>

                {hasContactBlock && (
                  <div className="flex flex-col gap-1">
                    <p className="font-semibold leading-[1.5]" style={{ fontSize: footerLabelFontSize }}>Контакт</p>
                    <div className="flex flex-col">
                      {hasSupportPhone && <p className="leading-[1.5]" style={{ fontSize: footerBodyFontSize }}>{supportPhone}</p>}
                      {hasSupportEmail && (
                        <p className="leading-[1.5] break-all" style={{ fontSize: footerBodyFontSize }}>{supportEmail}</p>
                      )}
                    </div>
                  </div>
                )}

                {hasRequisitesBlock && (
                  <div className="flex flex-col gap-1">
                    <p className="font-semibold leading-[1.5]" style={{ fontSize: footerLabelFontSize }}>Реквизиты</p>
                    <div className="flex flex-col">
                      {hasCompanyShortName && (
                        <p className="leading-[1.5]" style={{ fontSize: footerBodyFontSize }}>{companyShortName}</p>
                      )}
                      {hasCompanyInn && <p className="leading-[1.5]" style={{ fontSize: footerBodyFontSize }}>ИНН: {companyInn}</p>}
                      {hasCompanyKpp && <p className="leading-[1.5]" style={{ fontSize: footerBodyFontSize }}>КПП: {companyKpp}</p>}
                    </div>
                  </div>
                )}

                {hasTelegramLink && (
                  <div className="pt-1">
                    <PressableLink
                      href={telegramLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 rounded-[50px] border border-[#0b74ff] bg-[#0b74ff] px-5 py-2 text-[16px] font-medium leading-[1.5] text-white transition-transform ${durationMediumClass} ${easeClass} hover:scale-[0.98]`}
                    >
                      <TelegramIcon />
                      <span>Официальный канал</span>
                    </PressableLink>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col" style={{ gap: footerBottomGap }}>
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center sm:gap-16">
              <p className="leading-[1.5]" style={{ fontSize: footerBodyFontSize }}>© 2026 Reflow. Все права защищены.</p>
              <div className="flex flex-wrap gap-4 sm:gap-6">
                <a href={privacyLink} className={`${footerLinkClass} break-words`} style={{ fontSize: footerBodyFontSize }}>
                  Политика конфиденциальности и cookies
                </a>
                <a href={agreementLink} className={footerLinkClass} style={{ fontSize: footerBodyFontSize }}>
                  Договор-оферта
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );

  return <>{applyRussianNbspToNode(content)}</>;
}
