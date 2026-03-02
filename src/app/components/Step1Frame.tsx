"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode
} from "react";
import figmaManifest from "../generated/figma-assets-manifest.json";
import SiteFooter from "./SiteFooter";
import SiteHeader, { type SiteHeaderNavItem } from "./SiteHeader";
import type { FaqItem } from "../../lib/faq";
import type { SiteTextValues } from "../../lib/placeholders";
import { applyRussianNbspToNode } from "../../lib/typography";
import { scaleFromPercent, UI_MOTION } from "../../config/motion";

type BaseFigmaSlotName =
  | "imageHeroPreview"
  | "imagePlatformsPreview"
  | "imageProcessWebInterface"
  | "imageProcessPlugin"
  | "iconFeature1"
  | "iconFeature2"
  | "iconFeature3"
  | "iconFaqChevron"
  | "iconBurger"
  | "iconClose";
type FigmaSlotName = BaseFigmaSlotName | `${BaseFigmaSlotName}Mobile`;

const figmaSlots = (figmaManifest.slots ?? {}) as Record<
  string,
  {
    src?: string;
    width?: number | null;
    height?: number | null;
    rev?: number | null;
  }
>;

function getFigmaSrc(slot: FigmaSlotName): string {
  const src = figmaSlots[slot]?.src;
  if (typeof src !== "string" || !src) {
    return "";
  }

  const rev = figmaSlots[slot]?.rev;
  if (typeof rev !== "number" || Number.isNaN(rev)) {
    return src;
  }

  const separator = src.includes("?") ? "&" : "?";
  return `${src}${separator}v=${rev}`;
}

function getFigmaMobileSlot(slot: BaseFigmaSlotName): FigmaSlotName {
  return `${slot}Mobile`;
}

const homeNavItems: SiteHeaderNavItem[] = [
  { label: "Главная", href: "#top" },
  { label: "Как работает", href: "#process" },
  { label: "Тарифы", href: "#pricing" }
];

const featureItems = [
  {
    iconSlot: "iconFeature1" as const,
    title: "Соответствие законам РФ",
    text: "Reflow помогает выполнять рекомендацию РКН об отказе от Cloudflare CDN и защите ПДн"
  },
  {
    iconSlot: "iconFeature2" as const,
    title: "Доступность для\u00a0всех регионов",
    text: "Ваш сайт в российском контуре — никаких VPN и блокировок. Скорость загрузки даже выше, чем была"
  },
  {
    iconSlot: "iconFeature3" as const,
    title: "Привычная разработка",
    text: "В вашем процессе разработки не меняется ничего. Полный функционал. Публикация одной кнопкой"
  }
];

const processCards = [
  {
    imageSlot: "imageProcessWebInterface" as const,
    title: "Веб-интерфейс",
    text: "Регистрация, подключение домена, настройка DNS, оплата и публикация в несколько кликов"
  },
  {
    imageSlot: "imageProcessPlugin" as const,
    title: "Плагин",
    text: "Публикуйтесь прямо из редактора Webflow. Одной кнопкой"
  }
];
const SIGN_IN_URL = "https://www.reflowapp.pro/auth/sign-in";

const WEBFLOW_LOGO_SCALE = 0.08830311894416809;
const WEBFLOW_LOGO_PATHS = [
  {
    d: "M288.60599 0l-92.09099 180.02692-86.499 0 38.54-74.611-1.729 0c-31.795 41.27399-79.2339 68.445-146.827 74.611l0-73.578c0 0 43.24091-2.554 68.661-29.2799l-68.661 0 0-77.1676 77.1676 0 0 63.4692 1.732-0.0071 31.5334-63.4621 58.36 0 0 63.0668 1.73199-0.0028 32.71601-63.06542 85.36499 0z",
    fill: "#146ef5",
    fillRule: "evenodd" as const,
    x: 0,
    y: 0.060374923050403595
  },
  {
    d: "M0 142.6532l24.85199 0 0-142.6532-24.85199 0 0 142.6532z",
    fill: "#080808",
    x: 69.82835388183594,
    y: 1.6059321165084839
  },
  {
    d: "M40.784 141.10519c5.402 2.24601 10.89403 3.36802 16.47802 3.36802 9.225 0 17.47799-2.24501 24.76099-6.73601 7.283-4.491 12.92699-10.682 16.93298-18.571 4.006-7.95101 6.00806-16.96301 6.00806-27.038 0-10.075-2.063-19.0872-6.19-27.0377-4.127-7.9504-9.86199-14.1105-17.206-18.4802-7.343-4.4304-15.68803-6.6153-25.03503-6.5546-5.947 0-11.65202 1.1531-17.11401 3.4594-5.463 2.3062-10.01401 5.5835-13.65601 9.8318-0.281 0.3235-0.55397 0.6502-0.81897 0.9801l0-54.327-24.94403 0 0 142.56219 24.76202 0-0.04998-13.31799c0.641 0.78501 1.32498 1.552 2.05297 2.302 3.945 4.067 8.61798 7.25299 14.01899 9.55899z m25.49005-23.03199c-4.066 2.488-8.70904 3.733-13.92804 3.733-5.159 0-9.89297-1.275-14.20197-3.82401-4.309-2.61-7.73805-6.15999-10.28704-10.65099-2.488-4.491-3.732-9.589-3.732-15.294-0.061-5.705 1.15305-10.80301 3.64105-15.2941 2.549-4.5518 5.97799-8.0718 10.28699-10.5601 4.309-2.549 9.07297-3.7932 14.29297-3.7325 5.219-0.0607 9.86204 1.1531 13.92804 3.6414 4.127 2.4276 7.28296 5.9173 9.46795 10.4691 2.245 4.4911 3.36804 9.6502 3.36805 15.4762 0 5.826-1.12304 10.985-3.36805 15.476-2.185 4.491-5.34096 8.01099-9.46795 10.56z",
    fill: "#080808",
    fillRule: "evenodd" as const,
    x: 54.128692626953125,
    y: 1.6139655113220215
  },
  {
    d: "M0 0l28.40301 0 25.408 92.7898 27.02899-92.7898 23.669 0 29.314 90.9278 24.397-90.9278 26.03601 0-38.41699 134.00479-24.48901 0-29.80701-88.82929-27.36301 88.82929-24.76199 0-39.418-134.00479z",
    fill: "#080808",
    x: 28.66412925720215,
    y: 2.3695995807647705
  },
  {
    d: "M52.16397 104.7825c-9.893 0.06-18.81395-2.12501-26.76495-6.55501-7.889-4.491-14.11002-10.71199-18.66202-18.66198-4.491-7.951-6.737-17.02401-6.737-27.22001 0-9.892 2.30701-18.8443 6.91901-26.8555 4.612-8.0111 10.86396-14.2622 18.75296-18.7533 7.89-4.4911 16.69-6.7367 26.401-6.7367 10.924 0 20.48302 2.4277 28.67602 7.2829 8.254 4.8552 14.41398 11.7436 18.47998 20.6651 4.127 8.8608 5.614 19.02651 4.461 30.4965l-77.979 0c0.218 4.57 1.35802 8.728 3.42102 12.472 2.306 4.127 5.52299 7.34399 9.64898 9.65 4.127 2.306 8.74001 3.459 13.83802 3.459 3.884-0.06 7.49501-0.728 10.83301-2.002 3.338-1.335 6.15998-3.126 8.46698-5.371 2.366-2.246 4.03504-4.795 5.00604-7.647l26.03699 0c-1.57801 6.979-4.73402 13.2-9.46802 18.662-4.734 5.401-10.68201 9.619-17.84302 12.654-7.162 3.034-14.991 4.521-23.487 4.461z m-22.94098-71.3724c-1.455 2.5363-2.46201 5.2674-3.02301 8.1934l51.69 0c-0.375-3.6966-1.51598-7.0649-3.42297-10.1051-2.184-3.5807-5.15802-6.3422-8.92102-8.2842-3.763-2.0028-8.01099-3.0042-12.74499-3.0042-5.037 0-9.61897 1.15311-13.74598 3.4593-4.127 2.3063-7.40503 5.5532-9.83203 9.7408z",
    fill: "#080808",
    fillRule: "evenodd" as const,
    x: 44.032066345214844,
    y: 5.159067630767822
  },
  {
    d: "M16.02197 42.0585c0-8.1326 1.85202-15.3547 5.55402-21.6665 3.702-6.3725 8.89096-11.3188 15.56695-14.8388 6.736-3.5808 14.596-5.4318 23.57801-5.5532l0 22.1216c-4.188 0.0607-7.76801 0.9408-10.74201 2.6401-2.913 1.6386-5.159 4.0359-6.737 7.1918-1.453 2.9054-2.23699 6.2737-2.35199 10.105l19.28504 0 0 21.0292-19.29999 0 0 79.2924-24.85303 0 0-79.2924-16.02197 0 0-21.0292 16.02197 0z",
    fill: "#080808",
    x: 63.59836196899414,
    y: 1.6300324201583862
  },
  {
    d: "M52.70996 104.6915c-10.135 0-19.20797-2.216-27.21997-6.646-7.95-4.491-14.20099-10.682-18.75299-18.571-4.491-7.951-6.737-16.96301-6.737-27.038 0-10.135 2.246-19.17809 6.737-27.1286 4.552-8.0111 10.80299-14.2319 18.75299-18.6623 8.012-4.4304 17.08497-6.6456 27.21997-6.6456 10.196 0 19.30003 2.2152 27.31104 6.6456 8.072 4.4304 14.353 10.6208 18.84399 18.5713 4.491 7.9504 6.76701 17.0236 6.828 27.2196-0.06099 10.075-2.337 19.087-6.828 27.038-4.43 7.889-10.68099 14.08-18.75299 18.571-8.072 4.43-17.20604 6.646-27.40204 6.646z m0-22.84999c5.341 0 10.07503-1.214 14.20203-3.642 4.127-2.488 7.31298-5.94801 9.55798-10.37801 2.246-4.491 3.36902-9.61901 3.36902-15.385 0-5.826-1.12302-10.9849-3.36902-15.476-2.245-4.4911-5.43099-7.9504-9.55798-10.3781-4.127-2.4883-8.86103-3.7324-14.20203-3.7324-5.28 0-9.98299 1.2441-14.10998 3.7324-4.067 2.4277-7.22302 5.887-9.46802 10.3781-2.246 4.4911-3.33798 9.65-3.27698 15.476 0 5.766 1.12198 10.894 3.36798 15.385 2.306 4.43 5.46202 7.89001 9.46802 10.37801 4.066 2.428 8.73898 3.642 14.01898 3.642z",
    fill: "#080808",
    fillRule: "evenodd" as const,
    x: 72.9472885131836,
    y: 5.151034355163574
  },
  {
    d: "M27.67401 0l-27.67401 0 29.95001 100.32159 24.21601 0 19.69903-64.07539 21.26996 64.07539 23.84998 0 30.04003-100.32159-25.03002 0-17.03992 62.4436-18.83008-62.4436-24.21796 0-18.74102 63.8196-17.49201-63.8196z",
    fill: "#080808",
    x: 82.20794677734375,
    y: 5.343935012817383
  }
];
function DottedSurface() {
  return (
    <>
      <div className="h-full w-full bg-[radial-gradient(circle_at_6px_6px,#a8b5c8_1.4px,transparent_1.5px)] bg-[length:12px_12px]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
    </>
  );
}

function FigmaAssetImage({
  slot,
  alt,
  className,
  fallback,
  parallax = false,
  parallaxMaxTranslate = UI_MOTION.parallax.defaultMaxTranslate,
  parallaxScale = scaleFromPercent(UI_MOTION.parallax.defaultImageScalePercent),
  loading = "lazy",
  fetchPriority = "auto"
}: {
  slot: BaseFigmaSlotName;
  alt: string;
  className: string;
  fallback: ReactNode;
  parallax?: boolean;
  parallaxMaxTranslate?: number;
  parallaxScale?: number;
  loading?: "eager" | "lazy";
  fetchPriority?: "auto" | "high" | "low";
}) {
  const [hasError, setHasError] = useState(false);
  const desktopSrc = getFigmaSrc(slot);
  const mobileSrc = getFigmaSrc(getFigmaMobileSlot(slot));
  const src = desktopSrc || mobileSrc;
  const hasDistinctMobileSrc = !!mobileSrc && mobileSrc !== desktopSrc;
  const imageRef = useRef<HTMLImageElement | null>(null);
  const parallaxBaseStyle = parallax
    ? ({
        transform: `translate3d(0,0,0) scale(${parallaxScale})`
      } as CSSProperties)
    : undefined;

  useEffect(() => {
    setHasError(false);
  }, [desktopSrc, mobileSrc]);

  useEffect(() => {
    const image = imageRef.current;
    if (!image) {
      return;
    }

    const applyTransform = (translateY: number) => {
      image.style.transform = `translate3d(0, ${translateY.toFixed(2)}px, 0) scale(${parallaxScale})`;
    };

    if (!parallax) {
      image.style.transform = "";
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frameId = 0;
    let lastTranslate = Number.NaN;

    const update = () => {
      frameId = 0;

      if (!imageRef.current) {
        return;
      }

      if (mediaQuery.matches) {
        applyTransform(0);
        return;
      }

      const rect = imageRef.current.getBoundingClientRect();
      const viewportHeight = Math.max(window.innerHeight, 1);
      const viewportHalf = viewportHeight / 2;
      const elementCenter = rect.top + rect.height / 2;
      const progress = (elementCenter - viewportHalf) / viewportHalf;
      const clampedProgress = Math.max(-1, Math.min(1, progress));
      const responsiveFactor = window.innerWidth < 768 ? UI_MOTION.parallax.mobileFactor : 1;
      const nextTranslate = clampedProgress * parallaxMaxTranslate * responsiveFactor;

      if (Math.abs(nextTranslate - lastTranslate) < 0.2) {
        return;
      }

      lastTranslate = nextTranslate;
      applyTransform(nextTranslate);
    };

    const requestUpdate = () => {
      if (frameId !== 0) {
        return;
      }
      frameId = window.requestAnimationFrame(update);
    };

    requestUpdate();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    const addMediaListener =
      typeof mediaQuery.addEventListener === "function"
        ? () => mediaQuery.addEventListener("change", requestUpdate)
        : () => mediaQuery.addListener(requestUpdate);
    const removeMediaListener =
      typeof mediaQuery.removeEventListener === "function"
        ? () => mediaQuery.removeEventListener("change", requestUpdate)
        : () => mediaQuery.removeListener(requestUpdate);

    addMediaListener();

    return () => {
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }
      removeMediaListener();
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, [parallax, parallaxMaxTranslate, parallaxScale]);

  if (!src || hasError) {
    return <>{fallback}</>;
  }

  return (
    <>
      {hasDistinctMobileSrc ? (
        <picture>
          <source media="(max-width: 767px)" srcSet={mobileSrc} />
          <img
            ref={imageRef}
            src={src}
            alt={alt}
            className={className}
            onError={() => setHasError(true)}
            loading={loading}
            fetchPriority={fetchPriority}
            decoding="async"
            style={parallaxBaseStyle}
          />
        </picture>
      ) : (
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          className={className}
          onError={() => setHasError(true)}
          loading={loading}
          fetchPriority={fetchPriority}
          decoding="async"
          style={parallaxBaseStyle}
        />
      )}
    </>
  );
}

function FigmaAssetIcon({
  slot,
  className,
  fallback
}: {
  slot: BaseFigmaSlotName;
  className: string;
  fallback: ReactNode;
}) {
  const [hasError, setHasError] = useState(false);
  const desktopSrc = getFigmaSrc(slot);
  const mobileSrc = getFigmaSrc(getFigmaMobileSlot(slot));
  const src = desktopSrc || mobileSrc;
  const hasDistinctMobileSrc = !!mobileSrc && mobileSrc !== desktopSrc;

  useEffect(() => {
    setHasError(false);
  }, [desktopSrc, mobileSrc]);

  if (!src || hasError) {
    return <>{fallback}</>;
  }

  return (
    <>
      {hasDistinctMobileSrc ? (
        <picture>
          <source media="(max-width: 767px)" srcSet={mobileSrc} />
          <img
            src={src}
            alt=""
            aria-hidden
            className={className}
            onError={() => setHasError(true)}
            loading="lazy"
            decoding="async"
          />
        </picture>
      ) : (
        <img
          src={src}
          alt=""
          aria-hidden
          className={className}
          onError={() => setHasError(true)}
          loading="lazy"
          decoding="async"
        />
      )}
    </>
  );
}

function FeatureIconFallback({ index }: { index: number }) {
  if (index === 0) {
    return (
      <svg viewBox="0 0 48 48" className="h-12 w-12" fill="none" aria-hidden>
        <path
          d="M8 36L20 12L28 28L40 8"
          stroke="#0b74ff"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (index === 1) {
    return (
      <svg viewBox="0 0 48 48" className="h-12 w-12" fill="none" aria-hidden>
        <path
          d="M10 34L18 10L30 24L38 14"
          stroke="#0b74ff"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M12 38H36" stroke="#0b74ff" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12" fill="none" aria-hidden>
      <path
        d="M12 10H36V38H12V10Z"
        stroke="#0b74ff"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M20 18V30" stroke="#0b74ff" strokeWidth="3" strokeLinecap="round" />
      <path d="M28 18V30" stroke="#0b74ff" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function FeatureIcon({ index, slot }: { index: number; slot: BaseFigmaSlotName }) {
  return (
    <FigmaAssetIcon
      slot={slot}
      className="h-12 w-12 object-contain"
      fallback={<FeatureIconFallback index={index} />}
    />
  );
}

function ChevronFallback() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden>
      <path
        d="M6 9L12 15L18 9"
        stroke="#01060d"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Chevron() {
  return (
    <FigmaAssetIcon
      slot="iconFaqChevron"
      className="h-6 w-6 object-contain"
      fallback={<ChevronFallback />}
    />
  );
}

function CloseIcon() {
  return (
    <FigmaAssetIcon
      slot="iconClose"
      className="h-6 w-6 object-contain"
      fallback={
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden>
          <path
            d="M6 6L18 18M18 6L6 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      }
    />
  );
}

function WebflowWordmark() {
  return (
    <svg
      viewBox="0 0 95.36737060546875 15.982864379882812"
      className="h-[15.982864px] w-[95.36737px]"
      fill="none"
      aria-hidden
    >
      {WEBFLOW_LOGO_PATHS.map((path, index) => (
        <path
          key={`${index}-${path.x}-${path.y}`}
          d={path.d}
          fill={path.fill}
          fillRule={path.fillRule}
          clipRule={path.fillRule}
          transform={`translate(${path.x} ${path.y}) scale(${WEBFLOW_LOGO_SCALE})`}
        />
      ))}
    </svg>
  );
}

function FramerWordmark() {
  return (
    <img
      src="/figma/icons/framer-wordmark.svg"
      alt=""
      aria-hidden
      className="h-[20px] w-[69px] shrink-0"
      loading="lazy"
      decoding="async"
    />
  );
}

function HeroPlatformLogos() {
  return (
    <div className="flex items-center justify-center gap-6 sm:gap-12">
      <div className="flex items-center self-center">
        <WebflowWordmark />
      </div>

      <div className="flex items-center self-center gap-2">
        <div className="inline-flex items-center justify-center self-center rounded-2xl border border-[#549dff] px-2 py-1">
          <span className="text-[12px] font-semibold leading-none text-[#0b74ff]">Скоро!</span>
        </div>
        <FramerWordmark />
      </div>
    </div>
  );
}

export default function Step1Frame({
  siteTextValues,
  faqItems
}: {
  siteTextValues: SiteTextValues;
  faqItems: FaqItem[];
}) {
  const container = "mx-auto w-full max-w-[1360px] px-4 sm:px-8 lg:px-[48px]";
  const easeClass = UI_MOTION.easingClass;
  const durationFastClass = UI_MOTION.durationClass.fast;
  const durationMediumClass = UI_MOTION.durationClass.medium;
  const durationSlowClass = UI_MOTION.durationClass.slow;
  const buttonDurationClass = UI_MOTION.button.durationClass;
  const buttonHoverScaleDownClass = UI_MOTION.button.hoverScaleDownClass;
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isVideoMounted, setIsVideoMounted] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const modalTransitionMs = 320;

  const openVideoModal = () => {
    setIsVideoMounted(true);
    requestAnimationFrame(() => setIsVideoOpen(true));
  };

  const closeVideoModal = () => {
    setIsVideoOpen(false);
  };

  useEffect(() => {
    if (isVideoMounted) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isVideoMounted]);

  useEffect(() => {
    if (isVideoOpen || !isVideoMounted) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsVideoMounted(false);
    }, modalTransitionMs);

    return () => window.clearTimeout(timeoutId);
  }, [isVideoOpen, isVideoMounted, modalTransitionMs]);

  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeVideoModal();
      }
    };

    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, []);

  const content = (
    <div id="top" className="overflow-x-hidden bg-[var(--bg-primary)] pt-[72px] text-[var(--text-primary)]">
      <SiteHeader navItems={homeNavItems} brandName={siteTextValues.brandName} />

      {isVideoMounted && (
        <div
          className={`fixed inset-0 z-[60] flex items-center justify-center bg-[#01060dcc] p-4 transition-opacity ${durationMediumClass} ${easeClass} ${isVideoOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
          onClick={closeVideoModal}
        >
          <div
            className={`w-full max-w-[960px] rounded-[24px] border border-[#ffffff26] bg-[#0d1626] p-3 shadow-[0_30px_50px_rgba(1,6,13,0.5)] transition-all ${durationMediumClass} ${easeClass} ${isVideoOpen ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"} sm:p-4`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-end sm:mb-4">
              <button
                className={`inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#ffffff26] bg-[#ffffff14] text-white transition-colors ${durationMediumClass} ${easeClass} hover:bg-[#ffffff26]`}
                onClick={closeVideoModal}
                aria-label="Закрыть видео"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="overflow-hidden rounded-[16px] border border-[#ffffff1f] bg-black">
              <div className="relative h-0 pb-[64.90384615384616%]">
                <iframe
                  src="https://www.loom.com/embed/816fde410f384671892cabec285b7cf6"
                  frameBorder="0"
                  allowFullScreen
                  allow="fullscreen; picture-in-picture"
                  className="absolute left-0 top-0 h-full w-full"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="flex min-h-[max(100vh,760px)] items-center overflow-hidden py-10 sm:py-12 lg:py-16">
        <div className={`${container} w-full`}>
          <div className="flex w-full flex-col items-center gap-10 lg:gap-20">
            <div className="flex w-full max-w-[768px] flex-col items-center gap-8">
              <div className="flex w-full flex-col items-center gap-6">
                <h1 className="text-center font-display text-[34px] font-bold leading-[1.1] tracking-[-0.01em] break-words sm:text-[48px] lg:text-[64px]">
                  Деплой&nbsp;сайтов
                  <br />
                  на RU-сервер
                </h1>
                <p className="text-center text-[16px] leading-[1.5] sm:text-[20px]">
                  Разрабатываете на Webflow?
                  <br />
                  Публикуйте сайты для клиентов из России в 1 клик
                </p>
              </div>

              <div className="relative z-[2] flex flex-wrap justify-center gap-3 sm:gap-4">
                <a
                  href={SIGN_IN_URL}
                  className={`rounded-[6px] border border-[#0b74ff] bg-[#0b74ff] px-5 py-[10px] text-[16px] font-medium leading-[1.5] text-white transition-transform ${buttonDurationClass} ${easeClass} ${buttonHoverScaleDownClass} sm:px-6 sm:text-[18px]`}
                >
                  Попробовать
                </a>
                <button
                  type="button"
                  className={`rounded-[6px] border border-transparent bg-[#01060d0d] px-5 py-[10px] text-[16px] font-medium leading-[1.5] transition-colors ${durationMediumClass} ${easeClass} hover:bg-[#01060d14] sm:px-6 sm:text-[18px]`}
                  onClick={openVideoModal}
                  onTouchEnd={openVideoModal}
                >
                  Как это работает
                </button>
              </div>
            </div>

            <div className="flex w-full max-w-[768px] flex-col gap-4">
              <div className="relative h-[289.4px] overflow-hidden rounded-t-[32px] rounded-r-[32px] rounded-bl-none border border-[var(--line)]">
                <FigmaAssetImage
                  slot="imageHeroPreview"
                  alt="Preview"
                  className={`h-full w-full object-cover will-change-transform transition-transform ${durationSlowClass} ${easeClass}`}
                  loading="eager"
                  fetchPriority="high"
                  parallax
                  parallaxMaxTranslate={UI_MOTION.parallax.heroMaxTranslate}
                  parallaxScale={scaleFromPercent(UI_MOTION.parallax.heroImageScalePercent)}
                  fallback={<DottedSurface />}
                />
              </div>

              <HeroPlatformLogos />
            </div>
          </div>
        </div>
      </section>

      <section id="process" className="scroll-mt-[92px] overflow-hidden py-14 lg:py-[112px]">
        <div className={container}>
          <div className="flex w-full flex-col gap-10 lg:gap-20">
            <h2 className="max-w-[768px] whitespace-pre-line font-display text-[34px] font-bold leading-[1.2] tracking-[-0.01em] break-words sm:text-[40px] lg:text-[48px]">
              Привычный флоу.
              {"\n"}
              Скорость. Доступность
            </h2>

            <div className="grid gap-8 lg:grid-cols-3">
              {featureItems.map((item, index) => (
                <article key={item.title} className="flex flex-col gap-6 pr-[3rem] sm:gap-8 sm:pr-0">
                  <FeatureIcon index={index} slot={item.iconSlot} />
                  <div className="flex flex-col gap-4">
                    <h3 className="font-display text-[26px] font-bold leading-[1.25] tracking-[-0.01em] break-words sm:text-[30px] lg:text-[32px]">
                      {item.title}
                    </h3>
                    <p className="text-[16px] leading-[1.5] sm:text-[18px]">{item.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden bg-[var(--bg-alt)] py-14 lg:py-[112px]">
        <div className={container}>
          <div className="flex w-full flex-col gap-10 lg:flex-row lg:gap-20">
            <div className="flex flex-1 flex-col gap-8">
              <div className="flex flex-col gap-4">
                <div className="inline-flex w-fit rounded-2xl border border-[#549dff] px-4 py-1">
                  <span className="text-[16px] font-semibold leading-[1.5] text-[#0b74ff]">
                    Платформы
                  </span>
                </div>
                <h2 className="font-display text-[42px] font-bold leading-[1.2] tracking-[-0.01em] break-words lg:text-[60px]">
                  Скоро будет больше
                </h2>
              </div>

              <div className="flex flex-col gap-6 pt-2 lg:flex-row lg:gap-6">
                <div className="flex flex-1 flex-col gap-4 p-4">
                  <div className="flex h-6 items-center gap-[10px]">
                    <img
                      src="/figma/icons/webflow-sign.svg"
                      alt=""
                      aria-hidden
                      className="h-[15.896938px] w-[25.484808px] shrink-0"
                      loading="lazy"
                      decoding="async"
                    />
                    <span className="text-[16px] font-semibold leading-[1.5] text-[#0b74ff]">
                      уже работает
                    </span>
                  </div>
                  <p className="text-[16px] leading-[1.5] sm:text-[18px]">
                    Публикуйтесь в один клик прямо из интерфейса Webflow
                  </p>
                </div>

                <div className="flex flex-1 flex-col gap-4 rounded-3xl border border-[#549dff] p-4">
                  <div className="flex h-6 items-center">
                    <span className="text-[16px] font-semibold leading-[1.5] text-[#0b74ff]">
                      Cкоро будет
                    </span>
                  </div>
                  <p className="text-[16px] leading-[1.5] sm:text-[18px]">
                    Сейчас мы разрабатываем решение для Framer и&nbsp;вайбкод-сервисов
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1">
              <div className="h-[374px] overflow-hidden rounded-[32px] border border-[var(--line)]">
                <FigmaAssetImage
                  slot="imagePlatformsPreview"
                  alt="Platforms preview"
                  className={`h-full w-full object-cover will-change-transform transition-transform ${durationSlowClass} ${easeClass}`}
                  parallax
                  parallaxMaxTranslate={UI_MOTION.parallax.platformsMaxTranslate}
                  parallaxScale={scaleFromPercent(UI_MOTION.parallax.platformsImageScalePercent)}
                  fallback={<DottedSurface />}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden py-14 lg:py-[112px]">
        <div className={container}>
          <div className="flex flex-col items-center gap-20">
            <div className="flex max-w-[768px] flex-col items-center gap-4 text-center">
              <div className="inline-flex rounded-2xl border border-[#549dff] px-4 py-1">
                <span className="text-[16px] font-semibold leading-[1.5] text-[#0b74ff]">
                  Процесс
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="font-display text-[42px] font-bold leading-[1.2] tracking-[-0.01em] break-words lg:text-[60px]">
                  Можно по-разному
                </h2>
                <p className="text-[18px] leading-[1.5] sm:text-[20px]">
                  Используйте Reflow там, где удобно
                </p>
              </div>
            </div>

            <div className="grid w-full gap-8 lg:grid-cols-2">
              {processCards.map((card) => (
                <article
                  key={card.title}
                  className="flex flex-col overflow-hidden rounded-[32px] bg-[var(--bg-alt)] sm:flex-row"
                >
                  <div className="flex h-[180px] w-full items-end justify-end overflow-hidden sm:h-auto sm:w-[240px]">
                    <FigmaAssetImage
                      slot={card.imageSlot}
                      alt={card.title}
                      className={`h-[230px] w-full object-cover will-change-transform transition-transform ${durationSlowClass} ${easeClass} sm:h-[345px] sm:w-[336px]`}
                      parallax
                      parallaxMaxTranslate={UI_MOTION.parallax.processCardMaxTranslate}
                      parallaxScale={scaleFromPercent(
                        UI_MOTION.parallax.processCardImageScalePercent
                      )}
                      fallback={
                        <div className="h-[230px] w-full bg-[radial-gradient(circle_at_6px_6px,#a8b5c8_1.4px,transparent_1.5px)] bg-[length:12px_12px] sm:h-[345px] sm:w-[336px]" />
                      }
                    />
                  </div>

                  <div className="flex flex-1 flex-col justify-center gap-6 px-5 pb-8 pt-5 sm:px-6 sm:pb-20 sm:pt-6">
                    <div className="flex flex-col gap-2">
                      <h3 className="text-[23px] font-bold leading-[1.35] tracking-[-0.01em] sm:text-[26px]">
                        {card.title}
                      </h3>
                      <p className="text-[16px] leading-[1.5] sm:text-[18px]">{card.text}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="scroll-mt-[92px] overflow-hidden py-14 lg:py-[112px]">
        <div className={container}>
          <div className="flex flex-col items-center gap-20">
            <div className="flex max-w-[768px] flex-col items-center gap-4 text-center">
              <div className="inline-flex rounded-2xl border border-[#549dff] px-4 py-1">
                <span className="text-[16px] font-semibold leading-[1.5] text-[#0b74ff]">
                  Стоимость
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="font-display text-[42px] font-bold leading-[1.2] tracking-[-0.01em] break-words lg:text-[60px]">
                  Тарифы
                </h2>
                <p className="text-[18px] leading-[1.5] sm:text-[20px]">
                  Дешевле. Отмена подписки в один клик
                </p>
              </div>
            </div>

            <div className="flex w-full flex-col gap-12">
              <div className="grid gap-6 lg:grid-cols-2">
                <article className="flex flex-col gap-10 rounded-[32px] bg-[var(--bg-alt)] p-6 sm:gap-12 sm:p-8">
                  <div className="flex flex-col items-center gap-8">
                    <div className="flex w-full flex-col items-center gap-2">
                      <p className="text-center text-[24px] font-bold leading-[1.35] tracking-[-0.01em] sm:text-[26px]">
                        Базовый
                      </p>
                      <div className="flex w-full items-end justify-center gap-[6px]">
                        <span className="font-display text-[40px] font-bold leading-[1.2] tracking-[-0.01em] sm:text-[48px]">
                          {siteTextValues.pricingMonthlyRubDisplay}
                        </span>
                        <span className="font-display text-[26px] font-bold leading-[1.3] tracking-[-0.01em] opacity-30 sm:text-[32px]">
                          / мес
                        </span>
                      </div>
                    </div>

                    <ul className="flex w-full flex-col gap-4 pt-2">
                      {[
                        "Один активный проект",
                        "Плагин для Webflow",
                        "Простое подключение без лишних шагов",
                        "Работает с CMS"
                      ].map((item) => (
                        <li key={item} className="flex items-center gap-4">
                          <span className="inline-flex h-6 w-6 items-center justify-center text-[14px] text-[#0b74ff]">
                            ✓
                          </span>
                          <span className="text-[16px] leading-[1.5] sm:text-[18px]">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>

                <article className="flex flex-col gap-10 rounded-[32px] bg-[var(--bg-alt)] p-6 sm:gap-12 sm:p-8">
                  <div className="flex flex-col items-center gap-8">
                    <div className="flex w-full flex-col items-center gap-2">
                      <div className="flex w-full items-center justify-center gap-[10px]">
                        <p className="text-center text-[24px] font-bold leading-[1.35] tracking-[-0.01em] sm:text-[26px]">
                          Если на год
                        </p>
                        <span className="rounded-2xl border border-[#549dff] px-4 py-1 text-[16px] font-semibold leading-[1.5] text-[#0b74ff]">
                          -{siteTextValues.pricingAnnualDiscountPercent}%
                        </span>
                      </div>

                      <div className="flex w-full items-end justify-center gap-[6px]">
                        <span className="font-display text-[40px] font-bold leading-[1.2] tracking-[-0.01em] sm:text-[48px]">
                          {siteTextValues.pricingAnnualRubDisplay}
                        </span>
                        <span className="font-display text-[26px] font-bold leading-[1.3] tracking-[-0.01em] opacity-30 sm:text-[32px]">
                          / мес
                        </span>
                      </div>
                    </div>

                    <ul className="flex w-full flex-col gap-4 pt-2">
                      {["Все, что в Базовом", "Фиксируем стоимость на год"].map((item) => (
                        <li key={item} className="flex items-center gap-4">
                          <span className="inline-flex h-6 w-6 items-center justify-center text-[14px] text-[#0b74ff]">
                            ✓
                          </span>
                          <span className="text-[16px] leading-[1.5] sm:text-[18px]">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              </div>

              <div className="flex justify-center">
                <a
                  href={SIGN_IN_URL}
                  className={`rounded-[6px] border border-[#0b74ff] bg-[#0b74ff] px-6 py-[10px] text-[16px] font-medium leading-[1.5] text-white transition-transform ${buttonDurationClass} ${easeClass} ${buttonHoverScaleDownClass} sm:text-[18px]`}
                >
                  Подключиться сейчас
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden bg-[var(--bg-alt)] pb-0 pt-14 lg:pt-[112px]">
        <div className={container}>
          <div className="flex flex-col items-center gap-20">
            <div className="flex max-w-[768px] flex-col items-center gap-1 text-center">
              <h2 className="font-display text-[42px] font-bold leading-[1.2] tracking-[-0.01em] break-words lg:text-[60px]">
                Вопросы
              </h2>
              <p className="text-[18px] leading-[1.5] sm:text-[20px]">
                Ответы на распространённые вопросы о сервисе и его возможностях
              </p>
            </div>

            <div className="w-full border-b border-[var(--line)]">
              {faqItems.map((item, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <article key={item.q} className="border-t border-[var(--line)]">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpenFaqIndex(isOpen ? -1 : index)}
                      className={`flex w-full items-center gap-4 text-left transition-colors ${durationMediumClass} ${easeClass} ${UI_MOTION.faq.itemPadding} ${UI_MOTION.faq.hoverBgClass} ${UI_MOTION.faq.hoverRadiusClass} sm:gap-6`}
                    >
                      <p className="min-w-0 flex-1 text-[18px] font-bold leading-[1.5] break-words sm:text-[20px]">
                        {item.q}
                      </p>
                      <span
                        className={`inline-flex h-8 w-8 items-center justify-center transition-transform ${durationMediumClass} ${easeClass} ${
                          isOpen ? "rotate-180" : "rotate-0"
                        }`}
                      >
                        <Chevron />
                      </span>
                    </button>

                    <div
                      className={`grid overflow-hidden transition-[grid-template-rows,opacity] ${durationMediumClass} ${easeClass} ${
                        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="min-h-0">
                        <div className={`${UI_MOTION.faq.itemPadding} pt-0`}>
                          <p className="text-[16px] leading-[1.5] break-words sm:text-[18px]">
                            {item.a}
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

          </div>
        </div>
      </section>

      <SiteFooter
        brandName={siteTextValues.brandName}
        supportEmail={siteTextValues.supportEmail}
        supportPhone={siteTextValues.supportPhone}
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
