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
import { PressableButton, PressableLink } from "./PressableCta";
import TelegramIcon from "./TelegramIcon";
import type { FaqItem } from "../../lib/faq";
import type { HeroFeatureCarouselItem } from "../../lib/hero-feature-carousel";
import type { SiteTextValues } from "../../lib/placeholders";
import { applyRussianNbspToNode } from "../../lib/typography";
import { scaleFromPercent, UI_MOTION } from "../../config/motion";
import { ACTIVE_HERO_VARIANT, ACTIVE_SECOND_BLOCK_VARIANT } from "../../config/hero";

type BaseFigmaSlotName =
  | "imageHeroPreview"
  | "imagePlatformsPreview"
  | "imageProcessWebInterface"
  | "imageProcessPlugin"
  | "imageStats55Card"
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

const processCards = [
  {
    imageSlot: "imageProcessWebInterface" as const,
    title: "Веб-интерфейс",
    items: [
      "Множество проектов в одном аккаунте",
      "Возможность добавить несколько аккаунтов",
      "Доступен весь функционал"
    ],
    loomUrl: "https://www.loom.com/share/21ca06dfe7a7403ca88b3bf10590b5b2"
  },
  {
    imageSlot: "imageProcessPlugin" as const,
    title: "Webflow App",
    items: [
      "Публикация не покидая Webflow Designer",
      "Синхронизация с веб-интерфейсом",
      "Возможность добавить новый проект прямо из Webflow"
    ],
    loomUrl: "https://www.loom.com/share/04d04bc2ed144d3fbd11a010a226d859"
  }
];
const PRICING_FEATURES = [
  "За один проект",
  "Высокая скорость загрузки",
  "Поддержка всех функций Webflow*",
  "Оплата российскими картами",
  "Бесплатно 3 дня"
] as const;

const solutionItems = [
  {
    iconSlot: "iconFeature3" as const,
    title: "Привычная разработка",
    text: "Прежний процесс разработки и управления контентом"
  },
  {
    iconSlot: "iconFeature2" as const,
    title: "100% доступ для\u00a0России",
    text: "Ваш сайт размещен в российском контуре. Теперь никаких ограничений и высокая скорость загрузки"
  },
  {
    iconSlot: "iconFeature1" as const,
    title: "Соответствие законам РФ",
    text: "С Reflow вы не используете Cloudflare и не передаете ПДн зарубеж"
  }
];
const SIGN_UP_URL = "https://www.reflowapp.pro/auth/sign-up";
const SUPPORT_TELEGRAM_URL = "https://t.me/+Eunyahnhp8UzMGQy";
const HERO_LOOM_URL = "https://www.loom.com/share/816fde410f384671892cabec285b7cf6";
const SHOW_PLATFORMS_BLOCK = false;
const HERO_STATUS_DOT_PATH =
  "M3.05566 6.11133c-0.42188 0-0.81738-0.08008-1.18652-0.24024-0.36914-0.1582-0.69434-0.37793-0.97559-0.65918-0.2793-0.2793-0.49805-0.60254-0.65625-0.96972-0.1582-0.36914-0.2373-0.76465-0.2373-1.18653 0-0.42188 0.0791-0.81738 0.2373-1.18652 0.1582-0.36914 0.37695-0.69336 0.65625-0.97266 0.28125-0.28125 0.60645-0.50098 0.97559-0.65918 0.36914-0.1582 0.76465-0.2373 1.18652-0.2373 0.42188 0 0.81738 0.0791 1.18653 0.2373 0.36914 0.1582 0.69336 0.37793 0.97265 0.65918 0.2793 0.2793 0.49805 0.60352 0.65625 0.97266 0.16016 0.36914 0.24023 0.76465 0.24024 1.18652 0 0.42188-0.08008 0.81738-0.24024 1.18653-0.1582 0.36719-0.37695 0.69043-0.65625 0.96972-0.2793 0.28125-0.60352 0.50098-0.97265 0.65918-0.36914 0.16016-0.76465 0.24023-1.18653 0.24024z";
const HERO_BADGE_BG_PATH = "M0 0l1024 0 0 1024-1024 0 0-1024z";
const HERO_BADGE_MARK_PATH =
  "M70.77148 0.69336l19.59668 0.24414c12.58426 0.17025 23.01256 0.15748 33.42481 8.59473 6.37077 5.14699 10.43236 12.61736 11.28808 20.76269 0.77584 7.78204-2.07757 17.09788-7.13183 22.98828-8.14626 9.49397-23.94829 13.2165-29.55274 14.07715-5.604 0.8605-12.39607 1.1394 1.87793 0.70215 14.43171-0.442 17.22596 3.89722 20.85743 10.63574 3.63158 6.73874 11.96476 22.42604 17.27343 33.6416-8.12338-0.23848-17.19214-0.02269-25.42773-0.02343l-44.91992 0.0332c-4.26698-11.64494-9.0532-23.18304-13.30469-34.84473-1.25622-3.44566-2.60805-7.08875-4.05176-10.44043l0.00196 45.20606c-3.99825-0.25775-8.50013-0.07091-12.54688-0.25391-12.45093-0.56298-25.81658-0.15068-38.15625-0.87793 0.2295-5.16698 0.08176-11.5647 0.08301-16.78418l0.00195-30.08887c-0.00025-21.017 0.39881-43.39513-0.05469-64.26562l70.74121 0.69336z m-1.02929 45.70215c-6.29639-0.42796-12.685 0.00048-18.99414-0.16602l-0.00977 20.77637c4.40834 0.00525 8.83217 0.00992 13.23926 0.01367 5.02146 0.004 8.72183 0.24683 12.85254-3.16309 4.12275-4.675 4.26757-10.19601-0.25293-14.69726-1.53436-1.52759-4.6741-2.61693-6.83496-2.76367z";
const HERO_DESCRIPTION_END_ICON_PATH =
  "M1.02539 16.95313c-0.30599 0-0.55339-0.09766-0.74219-0.29297-0.1888-0.19531-0.2832-0.45247-0.2832-0.77149l0-4.38476c0-0.31901 0.0944-0.57292 0.2832-0.76172 0.1888-0.19531 0.4362-0.29297 0.74219-0.29297l2.35352 0c0.30599 0 0.55339 0.09766 0.74218 0.29297 0.1888 0.1888 0.2832 0.44271 0.28321 0.76172l0 4.38476c0 0.31901-0.0944 0.57617-0.28321 0.77149-0.1888 0.19531-0.4362 0.29297-0.74218 0.29296l-2.35352 0z m7.31445-0.00001c-0.30599 0-0.55339-0.09766-0.74218-0.29296-0.1888-0.19531-0.2832-0.45247-0.28321-0.77149l0-7.43164c0-0.31901 0.0944-0.57617 0.28321-0.77148 0.1888-0.19531 0.4362-0.29297 0.74218-0.29297l2.35352 0c0.30599 0 0.55339 0.09766 0.74219 0.29297 0.1888 0.19531 0.2832 0.45247 0.2832 0.77148l0 7.43164c0 0.31901-0.0944 0.57617-0.2832 0.77149-0.1888 0.19531-0.4362 0.29297-0.74219 0.29296l-2.35352 0z m7.31446 0c-0.30599 0-0.55339-0.09766-0.74219-0.29296-0.1888-0.19531-0.2832-0.45247-0.2832-0.77149l0-10.9668c0-0.31901 0.0944-0.57617 0.2832-0.77148 0.1888-0.19531 0.4362-0.29297 0.74219-0.29297l2.35351 0c0.30599 0 0.55338 0.09766 0.74219 0.29297 0.1888 0.19531 0.2832 0.45247 0.2832 0.77148l0 10.9668c0 0.31901-0.0944 0.57617-0.2832 0.77149-0.1888 0.19531-0.4362 0.29297-0.74219 0.29296l-2.35351 0z m7.30468 0c-0.30599 0-0.55338-0.09766-0.74218-0.29296-0.1888-0.19531-0.2832-0.45247-0.28321-0.77149l0-14.82422c0-0.31901 0.0944-0.57617 0.28321-0.77148 0.1888-0.19531 0.4362-0.29297 0.74218-0.29297l2.37305 0c0.30599 0 0.55013 0.09766 0.73242 0.29297 0.1888 0.19531 0.2832 0.45247 0.28321 0.77148l0 14.82422c0 0.31901-0.0944 0.57617-0.28321 0.77149-0.18229 0.19531-0.42643 0.29297-0.73242 0.29296l-2.37305 0z";

function toLoomEmbedUrl(url: string) {
  const normalized = String(url || "").trim();
  if (!normalized) {
    return "";
  }

  if (normalized.includes("/embed/")) {
    return normalized;
  }

  const match = normalized.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
  if (match?.[1]) {
    return `https://www.loom.com/embed/${match[1]}`;
  }

  return normalized;
}

const WEBFLOW_LOGO_SCALE = 0.08830311894416809;
const PROCESS_DEMO_ICON_PATH =
  "M347.33002 553.73999l196.97998-125.89001c8.28668-5.38001 12.42999-12.61002 12.42999-21.69001 0-9.07333-4.14331-16.26333-12.42999-21.57l-196.97998-125.89002c-8.29334-5.81334-16.99668-6.24666-26.11002-1.29999-9.11334 4.95334-13.66998 12.59665-13.66998 22.93l0 251.54004c0 10.56665 4.55664 18.30664 13.66998 23.21997 9.11334 4.91333 17.81668 4.46337 26.11002-1.34998z m58.67999 258.45996c-55.64001 0-108.15335-10.62665-157.54001-31.88-49.38-21.25336-92.50999-50.31995-129.38999-87.19995-36.88-36.88001-65.94667-80-87.2-129.35999-21.25333-49.35999-31.88-101.86337-31.88001-157.51004 0-56.30667 10.62667-109.15335 31.88001-158.54001 21.25333-49.38 50.30666-92.34663 87.15999-128.89996 36.85334-36.56 79.96667-65.50001 129.34-86.82001 49.37333-21.32667 101.89002-31.98999 157.55002-31.98999 56.32001 0 109.18326 10.65664 158.58994 31.96997 49.40002 21.31333 92.37005 50.23669 128.91003 86.77002 36.54669 36.53333 65.47663 79.49335 86.78998 128.88001 21.32001 49.38665 31.97998 102.25329 31.97998 158.59997 0 55.66666-10.66333 108.19-31.98999 157.57001-21.32001 49.38-50.26001 92.5-86.82001 129.35998-36.55334 36.85999-79.51001 65.91663-128.86999 87.16999-49.35999 21.25335-102.19663 31.88-158.50995 31.88z m-0.03-68.13c94.02667 0 173.84329-32.91669 239.44998-98.75 65.59998-65.83997 98.39997-145.53998 98.39997-239.09998 0-94.02667-32.79999-173.84335-98.39997-239.45001-65.60669-65.6-145.46332-98.39996-239.56997-98.39997-93.44001 0-173.09002 32.79997-238.95002 98.39997-65.85333 65.60666-98.78 145.46335-98.78 239.57001 0 93.44 32.91667 173.09002 98.75 238.95001 65.84 65.85333 145.54001 98.77997 239.10001 98.77997z";
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
        <picture className="block h-full w-full">
          <source media="(max-width: 767px)" srcSet={mobileSrc} />
          <img
            ref={imageRef}
            src={src}
            alt={alt}
            className={`block ${className}`}
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
          className={`block ${className}`}
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

function SolutionIcon({ slot }: { slot: BaseFigmaSlotName }) {
  return (
    <FigmaAssetIcon
      slot={slot}
      className="h-12 w-12 object-contain"
      fallback={
        <span className="inline-flex h-12 w-12 rounded-xl border border-[#98c4ff] bg-[#0b74ff14]" />
      }
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

function LoomTrimPassLoader() {
  const loaderMotion = UI_MOTION.videoModalLoader;
  const frameRadius = 28;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [frameSize, setFrameSize] = useState({ width: 1000, height: 649.0384615384615 });

  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof ResizeObserver === "undefined") {
      return;
    }

    const updateSize = () => {
      const nextWidth = node.clientWidth;
      const nextHeight = node.clientHeight;

      if (!nextWidth || !nextHeight) {
        return;
      }

      setFrameSize((current) => {
        if (current.width === nextWidth && current.height === nextHeight) {
          return current;
        }

        return { width: nextWidth, height: nextHeight };
      });
    };

    updateSize();

    const observer = new ResizeObserver(() => updateSize());
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  const isMobileFrame = frameSize.width < 768;
  const strokeWidth = loaderMotion.strokeWidth + (isMobileFrame ? 2 : 0);
  const inset = strokeWidth / 2;

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 z-[1] overflow-hidden rounded-[28px] bg-[#01060d12]"
    >
      <svg
        viewBox={`0 0 ${frameSize.width} ${frameSize.height}`}
        className="h-full w-full"
        aria-hidden
      >
        <rect
          x={inset}
          y={inset}
          width={Math.max(frameSize.width - strokeWidth, 0)}
          height={Math.max(frameSize.height - strokeWidth, 0)}
          rx={frameRadius}
          ry={frameRadius}
          pathLength={100}
          fill="none"
          stroke={loaderMotion.strokeColor}
          strokeOpacity={loaderMotion.strokeOpacity}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          shapeRendering="geometricPrecision"
          strokeDasharray={`${loaderMotion.segmentLength} ${100 - loaderMotion.segmentLength}`}
          className={loaderMotion.animationClass}
          style={{ animationDuration: `${loaderMotion.trimPassDurationMs}ms` }}
        />
      </svg>
    </div>
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
        <div className="inline-flex items-center justify-center self-center rounded-2xl border border-[#98c4ff] px-2 py-1">
          <span className="text-[12px] font-semibold leading-none text-[#0b74ff]">Скоро!</span>
        </div>
        <FramerWordmark />
      </div>
    </div>
  );
}

function OnlineStatusDot() {
  return (
    <svg
      viewBox="0 0 6.111328125 6.111328125"
      className={`h-[6.111328px] w-[6.111328px] shrink-0 ${UI_MOTION.onlineDot.animationClass}`}
      style={{ animationDuration: `${UI_MOTION.onlineDot.blinkDurationMs}ms` }}
      fill="none"
      aria-hidden
    >
      <path d={HERO_STATUS_DOT_PATH} fill="#2ECC71" />
    </svg>
  );
}

function HeroFeatureBadgeIcon() {
  return (
    <div className="absolute -right-2 -top-3 h-[41.129009px] w-[41.129009px] rotate-[-12.872503deg] overflow-hidden rounded-[12px]">
      <svg
        viewBox="0 0 41.12900924682617 41.12900924682617"
        className="h-full w-full"
        fill="none"
        aria-hidden
      >
        <path d={HERO_BADGE_BG_PATH} fill="#2787FD" transform="scale(0.040165048092603683)" />
        <path
          d={HERO_BADGE_MARK_PATH}
          fill="#FEFEFE"
          transform="translate(10.121593475341797 11.567535400390625) scale(0.16066019237041473)"
        />
      </svg>
    </div>
  );
}

function HeroDescriptionEndIcon() {
  return (
    <svg
      viewBox="0 0 26.34765625 16.953125"
      className="ml-[6px] inline-block h-[15.257813px] w-[23.712891px] align-[0.04em]"
      fill="none"
      aria-hidden
    >
      <path d={HERO_DESCRIPTION_END_ICON_PATH} fill="#2ECC71" />
    </svg>
  );
}

function getCircularDelta(index: number, activeIndex: number, total: number) {
  if (total <= 0) {
    return 0;
  }
  let delta = (index - activeIndex + total) % total;
  if (delta > total / 2) {
    delta -= total;
  }
  return delta;
}

function HeroFeatureCarousel({ items }: { items: HeroFeatureCarouselItem[] }) {
  const [activeIndex, setActiveIndex] = useState(() => (items.length > 1 ? 1 : 0));
  const carouselMotion = UI_MOTION.heroFeatureCarousel;
  const total = items.length;

  useEffect(() => {
    setActiveIndex(total > 1 ? 1 : 0);
  }, [total]);

  useEffect(() => {
    if (total <= 1) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex((previous) => (previous + 1) % total);
    }, carouselMotion.autoplayMs);

    return () => window.clearInterval(intervalId);
  }, [carouselMotion.autoplayMs, total]);

  if (total === 0) {
    return null;
  }

  return (
    <div className="relative h-[86px] w-full max-w-[768px]">
      {items.map((item, index) => {
        const delta = getCircularDelta(index, activeIndex, total);
        const absoluteDelta = Math.abs(delta);
        const isActive = delta === 0;
        const isNeighbor = absoluteDelta === 1;
        const isVisible = absoluteDelta <= 1;
        const translateX = delta * carouselMotion.stepPx;
        const scale = isActive ? 1 : carouselMotion.inactiveScale;
        const opacity = isActive ? 1 : isNeighbor ? carouselMotion.inactiveOpacity : 0;

        return (
          <div
            key={`${index}-${item.text}`}
            className={`absolute left-1/2 top-1/2 h-[82px] w-[280px] rounded-[24px] border px-6 py-4 ${isActive ? "border-[#d8e8ff]" : "border-[#d8e8ff]"} ${isVisible ? "" : "pointer-events-none"}`}
            style={{
              transform: `translate(-50%, -50%) translateX(${translateX}px) scale(${scale})`,
              opacity,
              zIndex: isActive ? 20 : isNeighbor ? 10 : 0,
              filter: isActive ? "blur(0px)" : "blur(1.5px)",
              background:
                isActive
                  ? "#ffffff"
                  : "linear-gradient(193deg,rgba(255,255,255,0.6)_0%,rgba(255,255,255,0.9)_100%)",
              boxShadow: isActive
                ? "0 8px 18px -4px rgba(0,0,0,0.06), 0 20px 32px -4px rgba(0,0,0,0.06)"
                : "none",
              transitionProperty: "transform, opacity, filter, box-shadow, border-color, background-color",
              transitionDuration: `${carouselMotion.transitionMs}ms`,
              transitionTimingFunction: carouselMotion.timingFunction,
              willChange: "transform, opacity, filter"
            }}
            aria-hidden={!isActive}
          >
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                opacity: isActive ? 1 : 0,
                transform: `scale(${isActive ? 1 : 0.9})`,
                transition: `opacity ${carouselMotion.transitionMs}ms ${carouselMotion.timingFunction}, transform ${carouselMotion.transitionMs}ms ${carouselMotion.timingFunction}`
              }}
              aria-hidden
            >
              <HeroFeatureBadgeIcon />
            </div>
            <span className="block whitespace-pre-line text-[18px] font-bold leading-[1.4] tracking-[-0.01em] text-[#0b74ff]">
              {item.text}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function HeroAlternative({
  container,
  easeClass,
  durationMediumClass,
  buttonDurationClass,
  buttonHoverScaleDownClass,
  heroFeatureItems,
  onOpenVideo
}: {
  container: string;
  easeClass: string;
  durationMediumClass: string;
  buttonDurationClass: string;
  buttonHoverScaleDownClass: string;
  heroFeatureItems: HeroFeatureCarouselItem[];
  onOpenVideo: () => void;
}) {
  const heroSectionGap = "clamp(4.5rem, 3.7683rem + 3.005vw, 7.5rem)";
  const heroContentGap = "var(--fluid-space-lg)";
  const heroBadgeRowGap = "var(--fluid-space-xs)";
  const heroHeadingFontSize = "clamp(1.5rem, -0.0714rem + 7.8571vw, 4rem)";
  const heroBodyFontSize = "var(--fluid-text-lg)";
  const heroChipFontSize = "var(--fluid-text-sm)";

  return (
    <section className="flex min-h-[calc(100dvh-72px)] items-center justify-center overflow-hidden py-0 sm:min-h-[max(100vh,760px)] sm:pt-[40px] sm:pb-12 lg:pb-16">
      <div className={`${container} w-full`}>
        <div className="flex w-full flex-col items-center" style={{ gap: heroSectionGap }}>
          <div className="flex w-full max-w-[820px] flex-col items-center" style={{ gap: heroContentGap }}>
            <div className="flex w-full flex-col items-center" style={{ gap: "var(--fluid-space-md)" }}>
              <div
                className="flex flex-wrap items-center justify-center"
                style={{ gap: heroBadgeRowGap }}
              >
                <div className="inline-flex items-center gap-[7px] rounded-2xl border border-[#cee3ff] px-4 py-1">
                  <OnlineStatusDot />
                  <span
                    className="font-semibold leading-[1.5] text-[#0b74ff]"
                    style={{ fontSize: heroChipFontSize }}
                  >
                    Пробный доступ
                  </span>
                </div>
                <div className="inline-flex items-center gap-[3px] rounded-2xl border border-[#cee3ff] px-4 py-1">
                  <span
                    className="font-semibold leading-[1.5] text-[#0b74ff]"
                    style={{ fontSize: heroChipFontSize }}
                  >
                    Не требует карту
                  </span>
                </div>
              </div>

              <h1
                className="text-center font-display font-bold leading-[1.1] tracking-[-0.01em] break-words"
                style={{ fontSize: heroHeadingFontSize }}
              >
                Сайт на Webflow
                <br />
                не грузится из РФ?
              </h1>

              <p className="text-center leading-[1.5]" style={{ fontSize: heroBodyFontSize }}>
                Публикуйте его с Reflow — 100% доступ
                <br />
                для пользователей из РФ
                <HeroDescriptionEndIcon />
              </p>
            </div>

            <div
              className="relative z-[2] flex flex-wrap justify-center"
              style={{ gap: "var(--fluid-space-sm)" }}
            >
              <PressableLink
                href={SIGN_UP_URL}
                trimEffect="primary-loop"
                className={`rounded-[50px] border border-[#0b74ff] bg-[#0b74ff] px-5 py-[10px] text-[16px] font-medium leading-[1.5] text-white transition-transform ${buttonDurationClass} ${easeClass} ${buttonHoverScaleDownClass} sm:px-6 sm:text-[18px]`}
              >
                Попробовать
              </PressableLink>
              <PressableButton
                className={`rounded-[50px] border border-transparent bg-[#01060d0d] px-5 py-[10px] text-[16px] font-medium leading-[1.5] transition-colors ${durationMediumClass} ${easeClass} hover:bg-[#01060d14] sm:px-6 sm:text-[18px]`}
                onClick={onOpenVideo}
                onTouchEnd={onOpenVideo}
              >
                Как это работает
              </PressableButton>
            </div>
          </div>

          <div className="flex w-full justify-center">
            <HeroFeatureCarousel items={heroFeatureItems} />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroLegacy({
  container,
  easeClass,
  durationMediumClass,
  durationSlowClass,
  buttonDurationClass,
  buttonHoverScaleDownClass,
  onOpenVideo
}: {
  container: string;
  easeClass: string;
  durationMediumClass: string;
  durationSlowClass: string;
  buttonDurationClass: string;
  buttonHoverScaleDownClass: string;
  onOpenVideo: () => void;
}) {
  const heroSectionGap = "clamp(2.5rem, 1.8902rem + 2.504vw, 5rem)";
  const heroContentGap = "var(--fluid-space-lg)";
  const heroHeadingFontSize = "clamp(1.5rem, -0.0714rem + 7.8571vw, 4rem)";
  const heroBodyFontSize = "var(--fluid-text-lg)";
  const heroChipFontSize = "var(--fluid-text-base)";

  return (
    <section className="flex min-h-[calc(100dvh-72px)] items-center justify-center overflow-hidden py-0 sm:min-h-[max(100vh,760px)] sm:pt-[40px] sm:pb-12 lg:pb-16">
      <div className={`${container} w-full`}>
        <div className="flex w-full flex-col items-center" style={{ gap: heroSectionGap }}>
          <div className="flex w-full max-w-[922px] flex-col items-center" style={{ gap: heroContentGap }}>
            <div className="flex w-full flex-col items-center" style={{ gap: "var(--fluid-space-md)" }}>
              <div className="inline-flex w-fit items-center justify-center rounded-2xl border border-[#98c4ff] px-4 py-1">
                <span
                  className="text-center font-semibold leading-[1.5] text-[#0b74ff]"
                  style={{ fontSize: heroChipFontSize }}
                >
                  Пробный доступ на 3 дня!
                </span>
              </div>
              <h1
                className="text-center font-display font-bold leading-[1.1] tracking-[-0.01em] break-words"
                style={{ fontSize: heroHeadingFontSize }}
              >
                Сайт на Webflow
                <br />
                не&nbsp;грузится из РФ?
              </h1>
              <p className="text-center leading-[1.5]" style={{ fontSize: heroBodyFontSize }}>
                Публикуйте сайт через Reflow — 100% доступ
                <br />
                для пользователей из России. <strong>Без VPN и ограничений</strong>
              </p>
            </div>

            <div
              className="relative z-[2] flex flex-wrap justify-center"
              style={{ gap: "var(--fluid-space-sm)" }}
            >
              <PressableLink
                href={SIGN_UP_URL}
                trimEffect="primary-loop"
                className={`rounded-[50px] border border-[#0b74ff] bg-[#0b74ff] px-5 py-[10px] text-[16px] font-medium leading-[1.5] text-white transition-transform ${buttonDurationClass} ${easeClass} ${buttonHoverScaleDownClass} sm:px-6 sm:text-[18px]`}
              >
                Попробовать
              </PressableLink>
              <PressableButton
                className={`rounded-[50px] border border-transparent bg-[#01060d0d] px-5 py-[10px] text-[16px] font-medium leading-[1.5] transition-colors ${durationMediumClass} ${easeClass} hover:bg-[#01060d14] sm:px-6 sm:text-[18px]`}
                onClick={onOpenVideo}
                onTouchEnd={onOpenVideo}
              >
                Как это работает
              </PressableButton>
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
  );
}

function SecondBlockLayout611({
  container,
  buttonDurationClass,
  buttonHoverScaleDownClass,
  easeClass
}: {
  container: string;
  buttonDurationClass: string;
  buttonHoverScaleDownClass: string;
  easeClass: string;
}) {
  const fluidBodyFontSize = "var(--fluid-text-base)";
  const fluidLeadFontSize = "var(--fluid-text-lg)";

  return (
    <section
      id="process"
      className="scroll-mt-[92px] overflow-hidden bg-[var(--bg-alt)] py-14 lg:py-[112px]"
    >
      <div className={container}>
        <div className="flex w-full flex-col gap-12">
          <div className="flex max-w-[1000px] flex-col gap-4">
            <div className="inline-flex w-fit rounded-2xl border border-[#98c4ff] px-4 py-1">
              <span className="text-[16px] font-semibold leading-[1.5] text-[#0b74ff]">Проблема</span>
            </div>
            <div className="flex flex-col gap-6">
              <h2
                className="font-display font-bold leading-[1.2] tracking-[-0.01em] break-words"
                style={{ fontSize: "var(--fluid-text-2xl)" }}
              >
                Ваш сайт на Webflow в&nbsp;России? — Вам это знакомо...
              </h2>
              <p className="leading-[1.5]" style={{ fontSize: fluidLeadFontSize }}>
                Из-за новых ограничений РКН на технологию Cloudflare все сайты на Webflow
                открываются нестабильно или вовсе становятся недоступными для пользователей из
                России.
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col">
            <div className="grid gap-12 border-t border-[var(--line)] py-12 lg:grid-cols-2 lg:gap-[76.8px]">
              <article className="flex flex-col gap-8 pr-[40px] lg:pr-[80px]">
                <p className="font-display text-[42px] font-bold leading-[1.2] tracking-[-0.01em] text-[#0b74ff] sm:text-[52px] lg:text-[60px]">
                  01
                </p>
                <div className="flex flex-col gap-4">
                  <h3 className="font-display text-[24px] font-bold leading-[1.3] tracking-[-0.01em] break-words sm:text-[27px] lg:text-[32px]">
                    Клиенты жалуются, что «не&nbsp;грузится»
                  </h3>
                  <p className="leading-[1.5]" style={{ fontSize: fluidBodyFontSize }}>
                    Недели разработки, правок и тестов. Вы запустили крутой проект, но
                    пользователи не могут нормально с ним работать. Бизнес теряет трафик
                  </p>
                </div>
              </article>

              <article className="flex flex-col gap-8 pr-[40px] lg:pr-[80px]">
                <p className="font-display text-[42px] font-bold leading-[1.2] tracking-[-0.01em] text-[#0b74ff] sm:text-[52px] lg:text-[60px]">
                  02
                </p>
                <div className="flex flex-col gap-4">
                  <h3 className="font-display text-[24px] font-bold leading-[1.3] tracking-[-0.01em] break-words sm:text-[27px] lg:text-[32px]">
                    Даже «c&nbsp;VPN» —скорость низкая
                  </h3>
                  <p className="leading-[1.5]" style={{ fontSize: fluidBodyFontSize }}>
                    Даже при использовании VPN и других способов обхода ограничений — низкая
                    скорость и нестабильность портит конверсии
                  </p>
                </div>
              </article>
            </div>

            <div className="grid gap-12 border-t border-[var(--line)] py-12 lg:grid-cols-2 lg:gap-[76.8px]">
              <article className="flex flex-col gap-8 pr-[40px] lg:pr-[80px]">
                <p className="font-display text-[42px] font-bold leading-[1.2] tracking-[-0.01em] text-[#0b74ff] sm:text-[52px] lg:text-[60px]">
                  03
                </p>
                <div className="flex flex-col gap-4">
                  <h3 className="font-display text-[24px] font-bold leading-[1.3] tracking-[-0.01em] break-words sm:text-[27px] lg:text-[32px]">
                    Приходится использовать «костыли»
                  </h3>
                  <p className="leading-[1.5]" style={{ fontSize: fluidBodyFontSize }}>
                    Заказчики выбирают Webflow за простоту в работе с контентом и удобные
                    внутренние инструменты. Они не хотят ничего экспортировать руками и&nbsp;менять
                    платформу
                  </p>
                </div>
              </article>

              <article className="mt-10 mx-auto flex w-full flex-col items-center gap-8 rounded-[24px] bg-white px-0 py-6 text-center lg:mt-0 lg:items-stretch lg:rounded-none lg:bg-transparent lg:px-0 lg:py-0 lg:pr-[80px] lg:text-left">
                <div className="hidden h-[72px] w-[106px] lg:block" aria-hidden />
                <div className="flex flex-col items-center gap-8 lg:items-start">
                  <h3 className="font-display whitespace-pre-line text-[24px] font-bold leading-[1.3] tracking-[-0.01em] break-words sm:text-[27px] lg:text-[32px]">
                    Reflow решит{"\n"}все 3 проблемы
                  </h3>
                  <div className="flex w-full justify-center lg:justify-start">
                    <PressableLink
                      href={SIGN_UP_URL}
                      trimEffect="primary-loop"
                      className={`inline-flex rounded-[50px] border border-[#0b74ff] bg-[#0b74ff] px-6 py-[10px] text-[16px] font-medium leading-[1.5] text-white transition-transform ${buttonDurationClass} ${easeClass} ${buttonHoverScaleDownClass} sm:text-[18px]`}
                    >
                      Попробовать бесплатно
                    </PressableLink>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SecondBlockStats55({
  container,
  buttonDurationClass,
  buttonHoverScaleDownClass,
  easeClass
}: {
  container: string;
  buttonDurationClass: string;
  buttonHoverScaleDownClass: string;
  easeClass: string;
}) {
  const fluidBodyFontSize = "var(--fluid-text-base)";
  const fluidLeadFontSize = "var(--fluid-text-lg)";

  return (
    <section id="process" className="scroll-mt-[92px] overflow-hidden bg-[var(--bg-primary)] py-14 lg:py-[112px]">
      <div className={container}>
        <div className="flex w-full flex-col gap-14 lg:gap-20">
          <div className="grid w-full gap-6 lg:grid-cols-2 lg:gap-10">
            <h2
              className="font-display font-bold leading-[1.25] tracking-[-0.01em] break-words"
              style={{ fontSize: "var(--fluid-text-2xl)" }}
            >
              В апреле 2025 РКН начал ограничивать Cloudflare
            </h2>
            <p className="leading-[1.5]" style={{ fontSize: fluidLeadFontSize }}>
              Сайты с хостингом на Webflow используют Cloudflare и тоже ограничиваются. Спрос на
              разработку Webflow в России сильно упал. При этом Webflow остается удобной
              платформой для сотен тысяч сайтов по всему миру
            </p>
          </div>

          <div className="grid gap-2 lg:grid-cols-3">
            <article className="relative flex min-h-[408px] flex-col justify-end rounded-[32px] bg-[#cee3ff] p-8 lg:h-[490px]">
              <div className="absolute left-[216px] top-[-49px] h-[149px] w-[191px] overflow-hidden">
                <FigmaAssetImage
                  slot="imageStats55Card"
                  alt="Stats preview"
                  className="h-full w-full object-cover"
                  fallback={
                    <div className="h-full w-full border border-[var(--line)] bg-[radial-gradient(circle_at_6px_6px,#a8b5c8_1.4px,transparent_1.5px)] bg-[length:12px_12px]" />
                  }
                />
              </div>
              <p className="font-display text-[42px] font-bold leading-[1.2] tracking-[-0.01em] text-[#0b74ff] sm:text-[60px]">
                10k+
              </p>
              <p className="text-[24px] font-bold leading-[1.35] tracking-[-0.01em]">
                проектов разработано на&nbsp;Webflow в&nbsp;России
              </p>
            </article>

            <div className="flex flex-col gap-2 lg:min-h-[408px] lg:h-[490px]">
              <article className="rounded-[32px] bg-[#cee3ff] p-8 lg:min-h-[200px]">
                <p className="text-[24px] font-bold leading-[1.35] tracking-[-0.01em]">
                  У многих пользователей сайты на Webflow открываются медленно или не грузятся
                  вообще
                </p>
              </article>
              <article className="hidden flex-1 rounded-[32px] bg-[#dbebff] lg:block" />
            </div>

            <div className="flex flex-col gap-2 lg:min-h-[408px] lg:h-[490px]">
              <article className="hidden rounded-[32px] bg-[#dbebff] lg:block lg:h-[112px]" />
              <article className="flex flex-1 flex-col justify-between gap-8 rounded-[32px] bg-[#cee3ff] p-8">
                <p className="text-[24px] font-bold leading-[1.35] tracking-[-0.01em]">
                  До Reflow решением были сложные костыли и переезды. Мы сделали действительно
                  удобно
                </p>
                <PressableLink
                  href={SIGN_UP_URL}
                  trimEffect="primary-loop"
                  className={`inline-flex w-fit rounded-[50px] border border-[#0b74ff] bg-[#0b74ff] px-6 py-[10px] text-[16px] font-medium leading-[1.5] text-white transition-transform ${buttonDurationClass} ${easeClass} ${buttonHoverScaleDownClass} sm:text-[18px]`}
                >
                  Попробовать бесплатно
                </PressableLink>
              </article>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProcessDemoIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0" fill="none" aria-hidden>
      <path d={PROCESS_DEMO_ICON_PATH} fill="#0f73ff" transform="scale(0.0295496)" />
    </svg>
  );
}

function FooterPromoCta({
  container,
  easeClass,
  buttonDurationClass,
  buttonHoverScaleDownClass
}: {
  container: string;
  easeClass: string;
  buttonDurationClass: string;
  buttonHoverScaleDownClass: string;
}) {
  const promoSectionTop = "clamp(3.5rem, 3.0122rem + 2.0031vw, 5.5rem)";
  const promoCardRadius = "var(--fluid-radius-lg)";
  const promoCardPaddingX = "clamp(1.5rem, 0.8902rem + 2.504vw, 4rem)";
  const promoCardPaddingY = "clamp(2.5rem, 2.0122rem + 2.0031vw, 4.5rem)";
  const promoContentGap = "var(--fluid-space-lg)";
  const promoTextGap = "var(--fluid-space-md)";
  const promoHeadingFontSize = "var(--fluid-text-2xl)";
  const promoBodyFontSize = "var(--fluid-text-lg)";

  return (
    <section
      className="overflow-hidden bg-[var(--bg-alt)] pb-0"
      style={{ paddingTop: promoSectionTop }}
    >
      <div className={container}>
        <div
          className="bg-[var(--bg-primary)] lg:h-[500px]"
          style={{
            borderRadius: promoCardRadius,
            paddingLeft: promoCardPaddingX,
            paddingRight: promoCardPaddingX,
            paddingTop: promoCardPaddingY,
            paddingBottom: promoCardPaddingY
          }}
        >
          <div className="flex h-full items-center justify-center">
            <div
              className="flex w-full max-w-[1040px] flex-col items-center text-center"
              style={{ gap: promoContentGap }}
            >
              <div className="flex w-full flex-col items-center" style={{ gap: promoTextGap }}>
                <h2
                  className="max-w-[1040px] font-display font-bold leading-[1.1] tracking-[-0.01em] break-words"
                  style={{ fontSize: promoHeadingFontSize }}
                >
                  Продолжайте создавать крутые проекты на&nbsp;Webflow в&nbsp;России
                </h2>
                <p className="leading-[1.5]" style={{ fontSize: promoBodyFontSize }}>
                  А проблему с ограничениями оставьте&nbsp;нам
                </p>
              </div>

              <PressableLink
                href={SIGN_UP_URL}
                trimEffect="primary-loop"
                className={`inline-flex rounded-[32px] border border-[#0b74ff] bg-[#0b74ff] px-6 py-[10px] text-[16px] font-medium leading-[1.5] text-white transition-transform ${buttonDurationClass} ${easeClass} ${buttonHoverScaleDownClass} sm:text-[18px]`}
              >
                Попробовать бесплатно
              </PressableLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Step1Frame({
  siteTextValues,
  faqItems,
  heroFeatureItems
}: {
  siteTextValues: SiteTextValues;
  faqItems: FaqItem[];
  heroFeatureItems: HeroFeatureCarouselItem[];
}) {
  const container = "mx-auto w-full max-w-[1360px] px-4 sm:px-8 lg:px-[48px]";
  const easeClass = UI_MOTION.easingClass;
  const durationFastClass = UI_MOTION.durationClass.fast;
  const durationMediumClass = UI_MOTION.durationClass.medium;
  const durationSlowClass = UI_MOTION.durationClass.slow;
  const faqDurationClass = UI_MOTION.faq.durationClass;
  const buttonDurationClass = UI_MOTION.button.durationClass;
  const buttonHoverScaleDownClass = UI_MOTION.button.hoverScaleDownClass;
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isVideoMounted, setIsVideoMounted] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [activeVideoEmbedUrl, setActiveVideoEmbedUrl] = useState(toLoomEmbedUrl(HERO_LOOM_URL));
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [pricingPeriod, setPricingPeriod] = useState<"monthly" | "annual">("monthly");
  const modalTransitionMs = 320;
  const useAlternativeHero = ACTIVE_HERO_VARIANT === "alternative";
  const isAnnualPricing = pricingPeriod === "annual";
  const pricingRubDisplay = isAnnualPricing
    ? siteTextValues.pricingAnnualRubDisplay
    : siteTextValues.pricingMonthlyRubDisplay;
  const processSectionY = "var(--fluid-section-y)";
  const processSectionGap = "var(--fluid-space-2xl)";
  const processHeaderGap = "var(--fluid-space-md)";
  const processCardGap = "var(--fluid-space-lg)";
  const processCardRadius = "var(--fluid-radius-lg)";
  const processCardPadding = "var(--fluid-space-lg)";
  const processCardPaddingBottom = "clamp(2rem, 1.2683rem + 3.005vw, 5rem)";
  const processHeadingFontSize = "var(--fluid-text-2xl)";
  const processSubheadingFontSize = "var(--fluid-text-lg)";
  const processCardTitleFontSize = "clamp(1.4375rem, 1.346rem + 0.3756vw, 1.8125rem)";
  const processCardBodyFontSize = "var(--fluid-text-base)";
  const fluidBodyFontSize = "var(--fluid-text-base)";
  const fluidLeadFontSize = "var(--fluid-text-lg)";
  const pricingSectionY = "var(--fluid-section-y)";
  const pricingSectionGap = "var(--fluid-space-xl)";
  const pricingHeaderGap = "var(--fluid-space-md)";
  const pricingCardRadius = "var(--fluid-radius-lg)";
  const pricingCardPadding = "var(--fluid-space-lg)";
  const pricingHeadingFontSize = "var(--fluid-text-2xl)";
  const pricingSubheadingFontSize = "var(--fluid-text-lg)";
  const pricingAmountFontSize = "clamp(2.5rem, 2.2561rem + 1.0016vw, 3.5rem)";
  const pricingPeriodFontSize = "clamp(1.625rem, 1.4726rem + 0.6259vw, 2.25rem)";
  const pricingFeatureFontSize = "var(--fluid-text-base)";
  const pricingFootnoteFontSize = "clamp(0.75rem, 0.7195rem + 0.1252vw, 0.875rem)";
  const faqSectionTop = "clamp(4.5rem, 3.7683rem + 3.005vw, 7.5rem)";
  const faqSectionGap = "var(--fluid-space-2xl)";
  const faqHeaderGap = "var(--fluid-space-xs)";
  const faqHeadingFontSize = "var(--fluid-text-2xl)";
  const faqSubheadingFontSize = "var(--fluid-text-lg)";
  const faqQuestionFontSize = "clamp(1.125rem, 1.064rem + 0.2504vw, 1.375rem)";
  const faqAnswerFontSize = "var(--fluid-text-base)";
  const solutionSectionY = "var(--fluid-section-y)";
  const solutionSectionGap = "var(--fluid-space-2xl)";
  const solutionHeaderGap = "clamp(0.625rem, 0.564rem + 0.2504vw, 0.875rem)";
  const solutionGridGap = "var(--fluid-space-lg)";
  const solutionItemGap = "var(--fluid-space-md)";
  const solutionContentGap = "var(--fluid-space-sm)";
  const solutionContentSidePadding = "clamp(1.5rem, 1.1341rem + 1.5025vw, 3rem)";
  const solutionHeadingFontSize = "var(--fluid-text-2xl)";
  const solutionItemTitleFontSize = "clamp(1.5rem, 1.378rem + 0.5008vw, 2rem)";
  const solutionItemBodyFontSize = "var(--fluid-text-base)";

  const openVideoModal = (videoUrl = HERO_LOOM_URL) => {
    setActiveVideoEmbedUrl(toLoomEmbedUrl(videoUrl));
    setIsVideoLoading(true);
    setIsVideoMounted(true);
    requestAnimationFrame(() => setIsVideoOpen(true));
  };

  const closeVideoModal = () => {
    setIsVideoOpen(false);
    setIsVideoLoading(false);
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
          className={`fixed inset-0 z-[60] flex items-center justify-center bg-[#01060dcc] p-4 backdrop-blur-[12px] transition-opacity ${durationMediumClass} ${easeClass} ${isVideoOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
          onClick={closeVideoModal}
        >
          <div
            className={`w-full max-w-[960px] transition-all ${durationMediumClass} ${easeClass} ${isVideoOpen ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"}`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-end sm:mb-4">
              <button
                className={`inline-flex h-10 w-10 items-center justify-center text-white/80 transition-colors ${durationMediumClass} ${easeClass} hover:text-white`}
                onClick={closeVideoModal}
                aria-label="Закрыть видео"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="relative overflow-hidden rounded-[28px]">
              {isVideoLoading && <LoomTrimPassLoader />}
              <div className="relative h-0 pb-[64.90384615384616%]">
                <iframe
                  src={activeVideoEmbedUrl}
                  frameBorder="0"
                  allowFullScreen
                  allow="fullscreen; picture-in-picture"
                  className={`absolute left-0 top-0 h-full w-full transition-opacity ${durationMediumClass} ${easeClass} ${isVideoLoading ? "opacity-0" : "opacity-100"}`}
                  onLoad={() => setIsVideoLoading(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {useAlternativeHero ? (
        <HeroAlternative
          container={container}
          easeClass={easeClass}
          durationMediumClass={durationMediumClass}
          buttonDurationClass={buttonDurationClass}
          buttonHoverScaleDownClass={buttonHoverScaleDownClass}
          heroFeatureItems={heroFeatureItems}
          onOpenVideo={() => openVideoModal(HERO_LOOM_URL)}
        />
      ) : (
        <HeroLegacy
          container={container}
          easeClass={easeClass}
          durationMediumClass={durationMediumClass}
          durationSlowClass={durationSlowClass}
          buttonDurationClass={buttonDurationClass}
          buttonHoverScaleDownClass={buttonHoverScaleDownClass}
          onOpenVideo={() => openVideoModal(HERO_LOOM_URL)}
        />
      )}

      {ACTIVE_SECOND_BLOCK_VARIANT === "stats55" ? (
        <SecondBlockStats55
          container={container}
          buttonDurationClass={buttonDurationClass}
          buttonHoverScaleDownClass={buttonHoverScaleDownClass}
          easeClass={easeClass}
        />
      ) : (
        <SecondBlockLayout611
          container={container}
          buttonDurationClass={buttonDurationClass}
          buttonHoverScaleDownClass={buttonHoverScaleDownClass}
          easeClass={easeClass}
        />
      )}

      <section
        className="overflow-hidden bg-[var(--bg-primary)]"
        style={{ paddingTop: solutionSectionY, paddingBottom: solutionSectionY }}
      >
        <div className={container}>
          <div className="flex w-full flex-col" style={{ gap: solutionSectionGap }}>
            <div
              className="flex w-full flex-col items-center text-center"
              style={{ gap: solutionHeaderGap }}
            >
              <div className="inline-flex w-fit rounded-2xl border border-[#98c4ff] px-4 py-1">
                <span className="text-[16px] font-semibold leading-[1.5] text-[#0b74ff]">
                  Решение
                </span>
              </div>
              <h2
                className="w-full font-display whitespace-pre-line font-bold leading-[1.2] tracking-[-0.01em] break-words"
                style={{ fontSize: solutionHeadingFontSize }}
              >
                Публикуйтесь через Reflow{"\n"}и забудьте об ограничениях
              </h2>
            </div>

            <div className="grid lg:grid-cols-3" style={{ gap: solutionGridGap }}>
              {solutionItems.map((item) => (
                <article
                  key={item.title}
                  className="flex flex-col items-center"
                  style={{ gap: solutionItemGap }}
                >
                  <SolutionIcon slot={item.iconSlot} />
                  <div
                    className="flex w-full flex-col items-center text-center"
                    style={{
                      gap: solutionContentGap,
                      paddingLeft: solutionContentSidePadding,
                      paddingRight: solutionContentSidePadding
                    }}
                  >
                    <h3
                      className="font-display font-bold leading-[1.3] tracking-[-0.01em] break-words"
                      style={{ fontSize: solutionItemTitleFontSize }}
                    >
                      {item.title}
                    </h3>
                    <p className="leading-[1.5]" style={{ fontSize: solutionItemBodyFontSize }}>
                      {item.text}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            <div className="flex justify-center">
              <PressableLink
                href={SIGN_UP_URL}
                trimEffect="primary-loop"
                className={`inline-flex rounded-[50px] border border-[#0b74ff] bg-[#0b74ff] px-6 py-[10px] text-[16px] font-medium leading-[1.5] text-white transition-transform ${buttonDurationClass} ${easeClass} ${buttonHoverScaleDownClass} sm:text-[18px]`}
              >
                Попобробовать бесплатно
              </PressableLink>
            </div>
          </div>
        </div>
      </section>

      {SHOW_PLATFORMS_BLOCK ? (
        <section className="overflow-hidden bg-[var(--bg-alt)] py-14 lg:py-[112px]">
          <div className={container}>
            <div className="flex w-full flex-col gap-10 lg:flex-row lg:gap-20">
              <div className="flex flex-1 flex-col gap-8">
                <div className="flex flex-col gap-4">
                  <div className="inline-flex w-fit rounded-2xl border border-[#98c4ff] px-4 py-1">
                    <span className="text-[16px] font-semibold leading-[1.5] text-[#0b74ff]">
                      Платформы
                    </span>
                  </div>
                  <h2
                    className="font-display font-bold leading-[1.2] tracking-[-0.01em] break-words"
                    style={{ fontSize: "var(--fluid-text-2xl)" }}
                  >
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
                    <p className="leading-[1.5]" style={{ fontSize: fluidBodyFontSize }}>
                      Публикуйтесь в один клик прямо из интерфейса Webflow
                    </p>
                  </div>

                  <div className="flex flex-1 flex-col gap-4 rounded-3xl border border-[#98c4ff] p-4">
                    <div className="flex h-6 items-center">
                      <span className="text-[16px] font-semibold leading-[1.5] text-[#0b74ff]">
                        Cкоро будет
                      </span>
                    </div>
                    <p className="leading-[1.5]" style={{ fontSize: fluidBodyFontSize }}>
                      Сейчас мы разрабатываем решение для Framer и&nbsp;вайбкод-сервисов
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <div className="relative h-[374px] overflow-hidden rounded-[32px]">
                  <FigmaAssetImage
                    slot="imagePlatformsPreview"
                    alt="Platforms preview"
                    className={`h-full w-full object-cover will-change-transform transition-transform ${durationSlowClass} ${easeClass}`}
                    parallax
                    parallaxMaxTranslate={UI_MOTION.parallax.platformsMaxTranslate}
                    parallaxScale={scaleFromPercent(UI_MOTION.parallax.platformsImageScalePercent)}
                    fallback={<DottedSurface />}
                  />
                  <div className="pointer-events-none absolute inset-0 rounded-[32px] shadow-[inset_0_0_64px_rgba(1,6,13,0.08),inset_0_0_28px_rgba(1,6,13,0.04)]" />
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section
        className="overflow-hidden"
        style={{ paddingTop: processSectionY, paddingBottom: processSectionY }}
      >
        <div className={container}>
          <div className="flex flex-col items-center" style={{ gap: processSectionGap }}>
            <div
              className="flex max-w-[920px] flex-col items-center text-center"
              style={{ gap: processHeaderGap }}
            >
              <div className="inline-flex rounded-2xl border border-[#98c4ff] px-4 py-1">
                <span className="text-[16px] font-semibold leading-[1.5] text-[#0b74ff]">
                  Процесс
                </span>
              </div>
              <div className="flex flex-col" style={{ gap: "var(--fluid-space-xs)" }}>
                <h2
                  className="font-display font-bold leading-[1.2] tracking-[-0.01em] break-words"
                  style={{ fontSize: processHeadingFontSize }}
                >
                  Работайте как удобно
                </h2>
                <p className="leading-[1.5]" style={{ fontSize: processSubheadingFontSize }}>
                  Используйте веб-интерфейс или приложение прямо в Designer Mode
                </p>
              </div>
            </div>

            <div className="grid w-full lg:grid-cols-2" style={{ gap: processCardGap }}>
              {processCards.map((card) => (
                <article
                  key={card.title}
                  className="flex flex-col overflow-hidden bg-[var(--bg-alt)] sm:flex-row"
                  style={{ borderRadius: processCardRadius }}
                >
                  <div className="flex h-[180px] w-full items-end justify-end overflow-hidden sm:h-auto sm:w-[240px] sm:self-stretch">
                    <FigmaAssetImage
                      slot={card.imageSlot}
                      alt={card.title}
                      className={`h-full w-full object-cover will-change-transform transition-transform ${durationSlowClass} ${easeClass} sm:h-full sm:w-full`}
                      parallax
                      parallaxMaxTranslate={UI_MOTION.parallax.processCardMaxTranslate}
                      parallaxScale={scaleFromPercent(
                        UI_MOTION.parallax.processCardImageScalePercent
                      )}
                      fallback={
                        <div className="h-full w-full bg-[radial-gradient(circle_at_6px_6px,#a8b5c8_1.4px,transparent_1.5px)] bg-[length:12px_12px]" />
                      }
                    />
                  </div>

                  <div
                    className="flex flex-1 flex-col"
                    style={{
                      paddingTop: processCardPadding,
                      paddingRight: processCardPadding,
                      paddingBottom: processCardPaddingBottom,
                      paddingLeft: processCardPadding
                    }}
                  >
                    <div className="flex flex-col" style={{ gap: "var(--fluid-space-xs)" }}>
                      <h3
                        className="font-bold leading-[1.35] tracking-[-0.01em]"
                        style={{ fontSize: processCardTitleFontSize }}
                      >
                        {card.title}
                      </h3>
                      <ul
                        className="flex flex-col pt-1"
                        style={{ gap: "var(--fluid-space-sm)" }}
                      >
                        {card.items.map((item) => (
                          <li
                            key={item}
                            className="flex items-start"
                            style={{ gap: "var(--fluid-space-sm)" }}
                          >
                            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center text-[14px] text-[#0b74ff]">
                              ✓
                            </span>
                            <span
                              className="leading-[1.5]"
                              style={{ fontSize: processCardBodyFontSize }}
                            >
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <PressableButton
                      className="group mt-auto inline-flex w-fit items-center gap-[8px] bg-transparent p-0 pt-8 text-left font-medium leading-[1.5] sm:pt-4"
                      style={{
                        fontSize: processCardBodyFontSize
                      }}
                      onClick={() => openVideoModal(card.loomUrl)}
                      onTouchEnd={() => openVideoModal(card.loomUrl)}
                    >
                      <span
                        className={`text-[#1172ff] transition-colors ${durationMediumClass} ${easeClass} group-hover:text-[#0b62dc]`}
                      >
                        Смотреть демку
                      </span>
                      <ProcessDemoIcon />
                    </PressableButton>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="pricing"
        className="scroll-mt-[92px] overflow-hidden"
        style={{ paddingTop: pricingSectionY, paddingBottom: pricingSectionY }}
      >
        <div className={container}>
          <div className="flex flex-col items-center" style={{ gap: pricingSectionGap }}>
            <div
              className="flex max-w-[768px] flex-col items-center text-center"
              style={{ gap: pricingHeaderGap }}
            >
              <h2
                className="font-display font-bold leading-[1.2] tracking-[-0.01em] break-words"
                style={{ fontSize: pricingHeadingFontSize }}
              >
                Стоимость
              </h2>
              <p className="leading-[1.5]" style={{ fontSize: pricingSubheadingFontSize }}>
                Дешевле, чем CMS-план Webflow.
              </p>
            </div>

            <div className="flex w-full flex-col gap-8">
              <div className="flex justify-center">
                <div className="inline-flex items-center rounded-[50px] border border-[#98c4ff] bg-[var(--bg-alt)] p-1">
                  <button
                    type="button"
                    onClick={() => setPricingPeriod("monthly")}
                    className={`rounded-[50px] px-4 py-2 text-[16px] font-semibold leading-[1.5] transition-colors ${durationMediumClass} ${easeClass} ${
                      !isAnnualPricing
                        ? "bg-[#0b74ff] text-white"
                        : "bg-transparent text-[#0b74ff] hover:bg-[#01060d0d]"
                    }`}
                    aria-pressed={!isAnnualPricing}
                  >
                    Месяц
                  </button>
                  <button
                    type="button"
                    onClick={() => setPricingPeriod("annual")}
                    className={`rounded-[50px] px-4 py-2 text-[16px] font-semibold leading-[1.5] transition-colors ${durationMediumClass} ${easeClass} ${
                      isAnnualPricing
                        ? "bg-[#0b74ff] text-white"
                        : "bg-transparent text-[#0b74ff] hover:bg-[#01060d0d]"
                    }`}
                    aria-pressed={isAnnualPricing}
                  >
                    Год -{siteTextValues.pricingAnnualDiscountPercent}%
                  </button>
                </div>
              </div>

              <div className="flex justify-center">
                <article
                  className="flex w-full max-w-[544px] flex-col gap-6 bg-[var(--bg-alt)] sm:gap-8"
                  style={{
                    borderRadius: pricingCardRadius,
                    padding: pricingCardPadding
                  }}
                >
                  <div className="flex flex-col items-center gap-8">
                    <div className="flex w-full flex-col items-center gap-2">
                      <div className="flex w-full items-end justify-center gap-[6px]">
                        <span
                          className="font-display font-bold leading-[1.2] tracking-[-0.01em]"
                          style={{ fontSize: pricingAmountFontSize }}
                        >
                          {pricingRubDisplay}
                        </span>
                        <span
                          className="font-display font-bold leading-[1.3] tracking-[-0.01em] opacity-30"
                          style={{ fontSize: pricingPeriodFontSize }}
                        >
                          / мес
                        </span>
                      </div>
                    </div>

                    <ul className="flex w-full flex-col gap-4 pt-2">
                      {PRICING_FEATURES.map((item) => (
                        <li key={item} className="flex items-center gap-4">
                          <span className="inline-flex h-6 w-6 items-center justify-center text-[14px] text-[#0b74ff]">
                            ✓
                          </span>
                          <span className="leading-[1.5]" style={{ fontSize: pricingFeatureFontSize }}>
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <p
                    className="text-center leading-[1.45] text-[#01060d99]"
                    style={{ fontSize: pricingFootnoteFontSize }}
                  >
                    *Поддержка поиска временно входит в базовый тариф
                  </p>
                </article>
              </div>

              <div className="flex justify-center">
                <PressableLink
                  href={SIGN_UP_URL}
                  trimEffect="primary-loop"
                  className={`rounded-[50px] border border-[#0b74ff] bg-[#0b74ff] px-6 py-[10px] text-[16px] font-medium leading-[1.5] text-white transition-transform ${buttonDurationClass} ${easeClass} ${buttonHoverScaleDownClass} sm:text-[18px]`}
                >
                  Попробовать бесплатно
                </PressableLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="overflow-hidden bg-[var(--bg-alt)] pb-0"
        style={{ paddingTop: faqSectionTop }}
      >
        <div className={container}>
          <div className="flex flex-col items-center" style={{ gap: faqSectionGap }}>
            <div
              className="flex max-w-[768px] flex-col items-center text-center"
              style={{ gap: faqHeaderGap }}
            >
              <h2
                className="font-display font-bold leading-[1.2] tracking-[-0.01em] break-words"
                style={{ fontSize: faqHeadingFontSize }}
              >
                Вопросы
              </h2>
              <p className="leading-[1.5]" style={{ fontSize: faqSubheadingFontSize }}>
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
                      className={`flex w-full items-center gap-4 text-left transition-colors ${faqDurationClass} ${easeClass} ${UI_MOTION.faq.itemPadding} ${UI_MOTION.faq.hoverBgClass} ${UI_MOTION.faq.hoverRadiusClass} sm:gap-6`}
                    >
                      <p
                        className="min-w-0 flex-1 font-bold leading-[1.5] break-words"
                        style={{ fontSize: faqQuestionFontSize }}
                      >
                        {item.q}
                      </p>
                      <span
                        className={`inline-flex h-8 w-8 items-center justify-center transition-transform ${faqDurationClass} ${easeClass} ${
                          isOpen ? "rotate-180" : "rotate-0"
                        }`}
                      >
                        <Chevron />
                      </span>
                    </button>

                    <div
                      className={`grid overflow-hidden transition-[grid-template-rows,opacity] ${faqDurationClass} ${easeClass} ${
                        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="min-h-0">
                        <div className={`${UI_MOTION.faq.itemPadding} pt-0`}>
                          <p
                            className="leading-[1.5] break-words"
                            style={{ fontSize: faqAnswerFontSize }}
                          >
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

      <FooterPromoCta
        container={container}
        easeClass={easeClass}
        buttonDurationClass={buttonDurationClass}
        buttonHoverScaleDownClass={buttonHoverScaleDownClass}
      />

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
        topPaddingClass="pt-2"
      />
    </div>
  );

  return (
    <>
      {applyRussianNbspToNode(content)}
      <PressableLink
        href={SUPPORT_TELEGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Открыть Telegram"
        trimEffect="primary-loop"
        preserveRootPosition
        className={`fixed bottom-4 right-4 z-[58] inline-flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-[#0b74ff] bg-[#0b74ff] text-white shadow-[0_18px_44px_rgba(11,116,255,0.28)] transition-transform ${buttonDurationClass} ${easeClass} ${buttonHoverScaleDownClass} sm:bottom-5 sm:right-5`}
        style={{
          right: "max(1rem, calc(1rem + env(safe-area-inset-right)))",
          bottom: "max(1rem, calc(1rem + env(safe-area-inset-bottom)))"
        }}
      >
        <TelegramIcon className="h-[18px] w-[18px] shrink-0" />
      </PressableLink>
    </>
  );
}
