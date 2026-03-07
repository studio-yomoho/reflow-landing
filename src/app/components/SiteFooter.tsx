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
  const footerLinkClass =
    `text-[16px] leading-[1.5] underline ${UI_MOTION.link.footerUnderlineColorClass} ${UI_MOTION.link.footerUnderlineThicknessClass} underline-offset-4 ${UI_MOTION.link.transitionClass} ${durationMediumClass} ${easeClass} hover:text-[#0b74ff] ${UI_MOTION.link.footerHoverUnderlineColorClass}`;

  const content = (
    <footer className={`overflow-hidden bg-[var(--bg-alt)] pb-20 lg:pb-[80px] ${topPaddingClass}`}>
      <div className={container}>
        <div className="flex flex-col gap-8">
          <div className="rounded-[32px] bg-[var(--bg-primary)] p-8 sm:p-12">
            <div className="flex max-w-[680px] flex-col gap-8">
              {hasBrandName && (
                <BrandLogo brandName={brandName} href="/" />
              )}

              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-1">
                  <p className="text-[16px] font-semibold leading-[1.5]">Адрес</p>
                  <p className="text-[16px] leading-[1.5] break-words">
                    125284, г. Москва, пр-кт Ленинградский, д. 31, стр. 3, помещ. 4
                  </p>
                </div>

                {hasContactBlock && (
                  <div className="flex flex-col gap-1">
                    <p className="text-[16px] font-semibold leading-[1.5]">Контакт</p>
                    <div className="flex flex-col">
                      {hasSupportPhone && <p className="text-[16px] leading-[1.5]">{supportPhone}</p>}
                      {hasSupportEmail && (
                        <p className="text-[16px] leading-[1.5] break-all">{supportEmail}</p>
                      )}
                    </div>
                  </div>
                )}

                {hasRequisitesBlock && (
                  <div className="flex flex-col gap-1">
                    <p className="text-[16px] font-semibold leading-[1.5]">Реквизиты</p>
                    <div className="flex flex-col">
                      {hasCompanyShortName && (
                        <p className="text-[16px] leading-[1.5]">{companyShortName}</p>
                      )}
                      {hasCompanyInn && <p className="text-[16px] leading-[1.5]">ИНН: {companyInn}</p>}
                      {hasCompanyKpp && <p className="text-[16px] leading-[1.5]">КПП: {companyKpp}</p>}
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

          <div className="flex flex-col gap-4">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center sm:gap-16">
              <p className="text-[16px] leading-[1.5]">© 2026 Reflow. Все права защищены.</p>
              <div className="flex flex-wrap gap-4 sm:gap-6">
                <a href={privacyLink} className={`${footerLinkClass} break-words`}>
                  Политика конфиденциальности и cookies
                </a>
                <a href={agreementLink} className={footerLinkClass}>
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
