export const UI_MOTION = {
  easingClass: "ease-[cubic-bezier(0.22,1,0.36,1)]",
  durationClass: {
    fast: "duration-200",
    medium: "duration-300",
    slow: "duration-500"
  },
  button: {
    durationClass: "duration-400",
    hoverScaleDownClass: "hover:scale-[0.97]"
  },
  buttonLoader: {
    spinClass: "cta-press-loader-spin",
    trimClass: "cta-press-loader-trim",
    pressFeedbackMs: 1200,
    spinDurationMs: 1200,
    trimDurationMs: 1500,
    strokeWidth: 2,
    sizeClass: "h-5 w-5"
  },
  buttonTrim: {
    animationClass: "cta-loop-trim-path",
    durationMs: 6400,
    segmentLength: 18,
    strokeWidth: 2.5,
    strokeColor: "#ffffff",
    strokeOpacity: 0.3,
    strokeBlurPx: 2.5,
    glowColor: "rgba(255,255,255,0.9)",
    glowBlurPx: 10,
    glowFadeInsetPx: 8,
    glowOpacity: 0.3,
    glowStrokeExtraPx: 6
  },
  link: {
    transitionClass: "transition-[color,text-decoration-color]",
    footerUnderlineColorClass: "decoration-[#01060d80]",
    footerUnderlineThicknessClass: "decoration-[1px]",
    footerHoverUnderlineColorClass: "hover:decoration-[#0b74ff]"
  },
  header: {
    alwaysShowAtTopY: 30,
    hideAfterY: 90,
    hideOnDownwardOffset: 160,
    revealOnUpwardOffset: 30
  },
  parallax: {
    // 30% less than previous values
    defaultMaxTranslate: 13.72,
    heroMaxTranslate: 15.68,
    platformsMaxTranslate: 13.72,
    processCardMaxTranslate: 10.78,
    mobileFactor: 0.6,
    // Percentage-based image upscale for parallax wrappers.
    // Example: 12 means scale = 1.12.
    defaultImageScalePercent: 8,
    heroImageScalePercent: 12,
    platformsImageScalePercent: 10,
    processCardImageScalePercent: 4
  },
  onlineDot: {
    animationClass: "online-dot-blink",
    blinkDurationMs: 1700
  },
  videoModalLoader: {
    animationClass: "loom-trim-pass-loader",
    trimPassDurationMs: 3600,
    segmentLength: 16,
    strokeWidth: 1.8,
    strokeColor: "#ffffff",
    strokeOpacity: 0.78
  },
  heroFeatureCarousel: {
    autoplayMs: 2600,
    transitionMs: 2100,
    stepPx: 262,
    inactiveScale: 0.8,
    inactiveOpacity: 0.3,
    timingFunction: "cubic-bezier(0.22,1,0.36,1)"
  },
  faq: {
    durationClass: "duration-[800ms]",
    itemPadding: "px-4 py-4 sm:px-5 sm:py-5",
    hoverBgClass: "hover:bg-[#01060d08]",
    hoverRadiusClass: "hover:rounded-[14px]"
  }
} as const;

export function scaleFromPercent(percent: number): number {
  return 1 + percent / 100;
}
