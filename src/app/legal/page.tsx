import fs from "node:fs/promises";
import path from "node:path";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import SiteFooter from "../components/SiteFooter";
import SiteHeader, { type SiteHeaderNavItem } from "../components/SiteHeader";
import { applyPlaceholders, deriveSiteTextValues } from "../../lib/placeholders";
import { loadPlaceholders } from "../../lib/server-placeholders";
import { applyRussianNbsp, applyRussianNbspToNode } from "../../lib/typography";
import { UI_MOTION } from "../../config/motion";

export const metadata = {
  title: "Юридические документы | Reflow",
  description: "Юридические условия использования и оплаты сервиса Reflow"
};
export const dynamic = "force-dynamic";

const headerNavItems: SiteHeaderNavItem[] = [
  { label: "Главная", href: "/" },
  { label: "Подписка", href: "#subscription" },
  { label: "Возвраты", href: "#refunds" }
];

const legalSections = [
  { label: "Пользовательское соглашение", id: "user-agreement" },
  { label: "Описание услуги", id: "service-description" },
  { label: "Подписка и автопродление", id: "subscription" },
  { label: "Возвраты и отмена", id: "refunds" },
  { label: "Безопасность платежей", id: "payment-security" },
  { label: "Реквизиты и контакты", id: "requisites" }
];

async function readLegalMarkdown() {
  const markdownPath = path.join(process.cwd(), "content/legal.md");
  return fs.readFile(markdownPath, "utf8");
}

export default async function LegalPage() {
  const [markdownRaw, placeholders] = await Promise.all([readLegalMarkdown(), loadPlaceholders()]);
  const markdown = applyRussianNbsp(applyPlaceholders(markdownRaw, placeholders));
  const siteTextValues = deriveSiteTextValues(placeholders);
  const container = "mx-auto w-full max-w-[1360px] px-4 sm:px-8 lg:px-[48px]";
  const easeClass = UI_MOTION.easingClass;
  const durationMediumClass = UI_MOTION.durationClass.medium;

  const content = (
    <div id="top" className="overflow-x-hidden bg-[var(--bg-primary)] pt-[72px] text-[var(--text-primary)]">
      <SiteHeader navItems={headerNavItems} brandName={siteTextValues.brandName} />

      <section className="overflow-hidden py-14 lg:py-[112px]">
        <div className={container}>
          <div className="flex flex-col gap-8 lg:gap-12">
            <div className="rounded-[24px] border border-[var(--line)] bg-[var(--bg-alt)] p-4 sm:p-6">
              <p className="mb-4 font-display text-[24px] font-bold leading-[1.25] tracking-[-0.01em] sm:text-[28px]">
                Навигация по разделам
              </p>
              <nav className="flex flex-wrap gap-2 sm:gap-3">
                {legalSections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className={`rounded-[50px] border border-[#98c4ff] bg-white/70 px-3 py-2 text-[14px] font-medium leading-[1.5] text-[#0b74ff] transition-colors ${durationMediumClass} ${easeClass} hover:bg-[#dbeaff] sm:text-[15px]`}
                  >
                    {section.label}
                  </a>
                ))}
              </nav>
            </div>

            <article className="rounded-[24px] border border-[var(--line)] bg-[var(--bg-primary)] p-5 sm:p-8 lg:p-10">
              <div className="flex flex-col gap-4 text-[16px] leading-[1.6] sm:text-[18px]">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    h1: ({ children }) => (
                      <h1 className="font-display text-[34px] font-bold leading-[1.1] tracking-[-0.01em] break-words sm:text-[48px] lg:text-[60px]">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="scroll-mt-[96px] pt-3 font-display text-[28px] font-bold leading-[1.2] tracking-[-0.01em] break-words sm:text-[36px] lg:text-[42px]">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="scroll-mt-[96px] pt-1 text-[22px] font-bold leading-[1.3] break-words sm:text-[26px]">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => <p className="break-words">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc space-y-2 pl-6">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal space-y-2 pl-6">{children}</ol>,
                    li: ({ children }) => <li className="break-words">{children}</li>,
                    hr: () => <hr className="my-2 border-[var(--line)]" />,
                    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                    blockquote: ({ children }) => (
                      <blockquote className="rounded-[12px] border border-[var(--line)] bg-[#01060d08] px-4 py-3">
                        {children}
                      </blockquote>
                    ),
                    a: ({ href, id, children }) => {
                      if (id && !href) {
                        return <a id={id} className="block scroll-mt-[96px]" />;
                      }

                      return (
                        <a
                          href={href}
                          className={`text-[#0b74ff] underline decoration-[#0b74ff66] decoration-2 underline-offset-4 transition-colors ${durationMediumClass} ${easeClass} hover:text-[#065ed6]`}
                        >
                          {children}
                        </a>
                      );
                    }
                  }}
                >
                  {markdown}
                </ReactMarkdown>
              </div>
            </article>
          </div>
        </div>
      </section>

      <SiteFooter
        brandName={siteTextValues.brandName}
        supportEmail={siteTextValues.supportEmail}
        supportPhone={siteTextValues.supportPhone}
        socialLinks={siteTextValues.socialLinks}
        companyShortName={siteTextValues.companyShortName}
        companyInn={siteTextValues.companyInn}
        companyKpp={siteTextValues.companyKpp}
        privacyLink={siteTextValues.privacyLink}
        agreementLink={siteTextValues.agreementLink}
      />
    </div>
  );

  return <>{applyRussianNbspToNode(content)}</>;
}
