"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { UI_MOTION } from "../../config/motion";
import { applyRussianNbspToNode } from "../../lib/typography";

export type SiteHeaderNavItem = {
  label: string;
  href: string;
};

type SiteHeaderProps = {
  navItems: SiteHeaderNavItem[];
  brandName?: string;
  loginLabel?: string;
  loginHref?: string;
};

function BurgerIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden>
      <path d="M4 7H20M4 12H20M4 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden>
      <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function decodeHash(hash: string) {
  try {
    return decodeURIComponent(hash);
  } catch {
    return hash;
  }
}

function scrollToAnchor(hash: string) {
  const id = decodeHash(hash).replace(/^#/, "");
  if (!id) {
    return false;
  }
  const section = document.getElementById(id);
  if (!section) {
    return false;
  }
  section.scrollIntoView({ behavior: "smooth", block: "start" });
  return true;
}

export default function SiteHeader({
  navItems,
  brandName = "Reflow",
  loginLabel = "Вход",
  loginHref = "https://www.reflowapp.pro/auth/sign-in"
}: SiteHeaderProps) {
  const container = "mx-auto w-full max-w-[1360px] px-4 sm:px-8 lg:px-[48px]";
  const easeClass = UI_MOTION.easingClass;
  const durationFastClass = UI_MOTION.durationClass.fast;
  const durationMediumClass = UI_MOTION.durationClass.medium;
  const durationSlowClass = UI_MOTION.durationClass.slow;
  const buttonDurationClass = UI_MOTION.button.durationClass;
  const buttonHoverScaleDownClass = UI_MOTION.button.hoverScaleDownClass;
  const lastScrollYRef = useRef(0);
  const upwardDistanceRef = useRef(0);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    lastScrollYRef.current = window.scrollY;

    const handleScroll = () => {
      if (isMobileMenuOpen) {
        return;
      }

      const currentY = window.scrollY;
      const deltaY = currentY - lastScrollYRef.current;

      if (currentY <= UI_MOTION.header.alwaysShowAtTopY) {
        setIsHeaderVisible(true);
        upwardDistanceRef.current = 0;
        lastScrollYRef.current = currentY;
        return;
      }

      if (deltaY > 0) {
        upwardDistanceRef.current = 0;
        if (currentY > UI_MOTION.header.hideAfterY) {
          setIsHeaderVisible(false);
        }
      } else if (deltaY < 0) {
        upwardDistanceRef.current += Math.abs(deltaY);
        if (upwardDistanceRef.current >= UI_MOTION.header.revealOnUpwardOffset) {
          setIsHeaderVisible(true);
        }
      }

      lastScrollYRef.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
      setIsHeaderVisible(true);
      return;
    }
    document.body.style.overflow = "";
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, []);

  const handleNavClick = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      event.preventDefault();
      scrollToAnchor(href);
      setIsMobileMenuOpen(false);
      return;
    }

    if (href.includes("#")) {
      const url = new URL(href, window.location.origin);
      if (url.pathname === window.location.pathname && url.hash) {
        event.preventDefault();
        scrollToAnchor(url.hash);
      }
    }

    setIsMobileMenuOpen(false);
  };

  const content = (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b border-[var(--line)] bg-[var(--bg-primary)]/95 backdrop-blur transition-transform ${durationSlowClass} ${easeClass} ${
          isHeaderVisible || isMobileMenuOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className={container}>
          <div className="flex h-[72px] items-center justify-between gap-6 lg:gap-8">
            <div className="min-w-0 flex-1">
              <a href="/" className="font-display text-[19.81px] font-black leading-[1.3] tracking-[-0.04em]">
                {brandName}
              </a>
            </div>

            <nav className="hidden items-center gap-8 md:flex">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(event) => handleNavClick(event, item.href)}
                  className={`text-[18px] leading-[1.5] transition-colors ${durationMediumClass} ${easeClass} hover:text-[#0b74ff]`}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="flex min-w-0 flex-1 justify-end">
              <a
                href={loginHref}
                className={`hidden rounded-[6px] border border-[#0b74ff] bg-[#0b74ff] px-4 py-2 text-[16px] font-medium leading-[1.5] text-white transition-transform ${buttonDurationClass} ${easeClass} ${buttonHoverScaleDownClass} sm:px-5 sm:text-[18px] md:inline-flex`}
              >
                {loginLabel}
              </a>
              <button
                className={`inline-flex h-10 w-10 items-center justify-center rounded-[8px] border border-[#01060d26] bg-white/80 text-[#01060d] transition-colors ${durationMediumClass} ${easeClass} hover:bg-white md:hidden`}
                aria-label={isMobileMenuOpen ? "Закрыть меню" : "Открыть меню"}
                onClick={() => setIsMobileMenuOpen((value) => !value)}
              >
                {isMobileMenuOpen ? <CloseIcon /> : <BurgerIcon />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-40 bg-[#01060d66] transition-opacity ${durationMediumClass} ${easeClass} md:hidden ${
          isMobileMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      <div
        className={`fixed inset-x-4 top-[84px] z-50 rounded-[24px] border border-[var(--line)] bg-[var(--bg-primary)] p-5 shadow-[0_24px_40px_rgba(1,6,13,0.18)] transition-all ${durationMediumClass} ${easeClass} md:hidden ${
          isMobileMenuOpen
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-3 opacity-0"
        }`}
      >
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <a
              key={`mobile-${item.label}`}
              href={item.href}
              onClick={(event) => handleNavClick(event, item.href)}
              className={`rounded-[10px] px-3 py-3 text-[17px] font-medium leading-[1.5] transition-colors ${durationMediumClass} ${easeClass} hover:bg-[#01060d0d]`}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <a
          href={loginHref}
          className={`mt-4 inline-flex w-full items-center justify-center rounded-[8px] border border-[#0b74ff] bg-[#0b74ff] px-4 py-3 text-[16px] font-medium leading-[1.5] text-white transition-transform ${buttonDurationClass} ${easeClass} ${buttonHoverScaleDownClass}`}
        >
          {loginLabel}
        </a>
      </div>
    </>
  );

  return <>{applyRussianNbspToNode(content)}</>;
}
