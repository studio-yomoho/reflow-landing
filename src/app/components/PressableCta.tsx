"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  type TouchEvent
} from "react";
import { UI_MOTION } from "../../config/motion";

type SharedProps = {
  children: ReactNode;
  className: string;
  loaderClassName?: string;
  pressFeedbackMs?: number;
  trimEffect?: "primary-loop";
  preserveRootPosition?: boolean;
};

type PressableLinkProps = SharedProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "className"> & {
    href: string;
  };

type PressableButtonProps = SharedProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className">;

function ButtonPressLoader({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`${UI_MOTION.buttonLoader.sizeClass} ${UI_MOTION.buttonLoader.spinClass} ${className ?? ""}`}
      fill="none"
      aria-hidden
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        pathLength="100"
        stroke="currentColor"
        strokeWidth={UI_MOTION.buttonLoader.strokeWidth}
        strokeLinecap="round"
        strokeDasharray="0 100"
        className={UI_MOTION.buttonLoader.trimClass}
        style={{ animationDuration: `${UI_MOTION.buttonLoader.trimDurationMs}ms` }}
      />
    </svg>
  );
}

function LoopTrimBorder({ visible }: { visible: boolean }) {
  const containerRef = useRef<HTMLSpanElement | null>(null);
  const [frameSize, setFrameSize] = useState({ width: 160, height: 48 });
  const trimMotion = UI_MOTION.buttonTrim;
  const filterId = useId().replace(/:/g, "");
  const maskId = `${filterId}-mask`;
  const fadeFilterId = `${filterId}-fade`;
  const coreFilterId = `${filterId}-core`;

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

  const inset = trimMotion.strokeWidth / 2;
  const fadeInset = trimMotion.glowFadeInsetPx;
  const innerWidth = Math.max(frameSize.width - fadeInset * 2, 0);
  const innerHeight = Math.max(frameSize.height - fadeInset * 2, 0);
  const outerRadius = Math.max((frameSize.height - trimMotion.strokeWidth) / 2, 0);
  const innerRadius = Math.max(outerRadius - fadeInset, 0);
  const glowStrokeWidth = trimMotion.strokeWidth + trimMotion.glowStrokeExtraPx;
  const glowInset = glowStrokeWidth / 2;
  const glowOuterRadius = Math.max((frameSize.height - glowStrokeWidth) / 2, 0);

  return (
    <span
      ref={containerRef}
      className={`pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden
    >
      <svg viewBox={`0 0 ${frameSize.width} ${frameSize.height}`} className="h-full w-full">
        <defs>
          <filter
            id={filterId}
            x="-10%"
            y="-20%"
            width="120%"
            height="140%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation={trimMotion.glowBlurPx / 2} />
          </filter>
          <filter
            id={fadeFilterId}
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation={trimMotion.glowFadeInsetPx / 2} />
          </filter>
          <filter
            id={coreFilterId}
            x="-10%"
            y="-20%"
            width="120%"
            height="140%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation={trimMotion.strokeBlurPx / 2} />
          </filter>
          <mask id={maskId} maskUnits="userSpaceOnUse">
            <rect x="0" y="0" width={frameSize.width} height={frameSize.height} rx={outerRadius + inset} ry={outerRadius + inset} fill="white" />
            <rect
              x={fadeInset}
              y={fadeInset}
              width={innerWidth}
              height={innerHeight}
              rx={innerRadius}
              ry={innerRadius}
              fill="black"
              filter={`url(#${fadeFilterId})`}
            />
          </mask>
        </defs>
        <rect
          x={glowInset}
          y={glowInset}
          width={Math.max(frameSize.width - glowStrokeWidth, 0)}
          height={Math.max(frameSize.height - glowStrokeWidth, 0)}
          rx={glowOuterRadius}
          ry={glowOuterRadius}
          pathLength={100}
          fill="none"
          stroke={trimMotion.glowColor}
          strokeOpacity={trimMotion.glowOpacity}
          strokeWidth={glowStrokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={`${trimMotion.segmentLength} ${100 - trimMotion.segmentLength}`}
          className={trimMotion.animationClass}
          filter={`url(#${filterId})`}
          mask={`url(#${maskId})`}
          style={{
            animationDuration: `${trimMotion.durationMs}ms`
          }}
        />
        <rect
          x={inset}
          y={inset}
          width={Math.max(frameSize.width - trimMotion.strokeWidth, 0)}
          height={Math.max(frameSize.height - trimMotion.strokeWidth, 0)}
          rx={outerRadius}
          ry={outerRadius}
          pathLength={100}
          fill="none"
          stroke={trimMotion.strokeColor}
          strokeOpacity={trimMotion.strokeOpacity}
          strokeWidth={trimMotion.strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={`${trimMotion.segmentLength} ${100 - trimMotion.segmentLength}`}
          className={trimMotion.animationClass}
          mask={`url(#${maskId})`}
          filter={`url(#${coreFilterId})`}
          style={{
            animationDuration: `${trimMotion.durationMs}ms`
          }}
        />
      </svg>
    </span>
  );
}

function usePressLoader(pressFeedbackMs: number) {
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const lastTouchAtRef = useRef(0);

  const startLoading = () => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }

    setIsLoading(true);
    timeoutRef.current = window.setTimeout(() => {
      setIsLoading(false);
      timeoutRef.current = null;
    }, pressFeedbackMs);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isLoading,
    startLoading,
    lastTouchAtRef
  };
}

function ContentWithLoader({
  isLoading,
  children,
  loaderClassName,
  trimEffect
}: {
  isLoading: boolean;
  children: ReactNode;
  loaderClassName?: string;
  trimEffect?: "primary-loop";
}) {
  return (
    <>
      {trimEffect === "primary-loop" ? <LoopTrimBorder visible={!isLoading} /> : null}
      <span
        style={{ gap: "inherit" }}
        className={`relative z-[1] inline-flex items-center justify-center gap-inherit transition-opacity duration-200 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
      >
        {children}
      </span>
      <span
        className={`pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
          isLoading ? "opacity-100" : "opacity-0"
        }`}
      >
        <ButtonPressLoader className={loaderClassName} />
      </span>
    </>
  );
}

export function PressableLink({
  children,
  className,
  loaderClassName,
  pressFeedbackMs = UI_MOTION.buttonLoader.pressFeedbackMs,
  trimEffect,
  preserveRootPosition = false,
  onClick,
  onPointerDown,
  ...props
}: PressableLinkProps) {
  const { isLoading, startLoading } = usePressLoader(pressFeedbackMs);

  const handlePointerDown = (event: PointerEvent<HTMLAnchorElement>) => {
    if (event.pointerType !== "mouse") {
      startLoading();
    }
    onPointerDown?.(event);
  };

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    startLoading();
    onClick?.(event);
  };

  return (
    <a
      {...props}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
      aria-busy={isLoading}
      className={`${preserveRootPosition ? "" : "relative"} ${className}`}
    >
      <ContentWithLoader
        isLoading={isLoading}
        loaderClassName={loaderClassName}
        trimEffect={trimEffect}
      >
        {children}
      </ContentWithLoader>
    </a>
  );
}

export function PressableButton({
  children,
  className,
  loaderClassName,
  pressFeedbackMs = UI_MOTION.buttonLoader.pressFeedbackMs,
  trimEffect,
  preserveRootPosition = false,
  onClick,
  onTouchEnd,
  type = "button",
  ...props
}: PressableButtonProps) {
  const { isLoading, startLoading, lastTouchAtRef } = usePressLoader(pressFeedbackMs);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (Date.now() - lastTouchAtRef.current < 450) {
      return;
    }

    startLoading();
    onClick?.(event);
  };

  const handleTouchEnd = (event: TouchEvent<HTMLButtonElement>) => {
    lastTouchAtRef.current = Date.now();
    startLoading();
    onTouchEnd?.(event);
  };

  return (
    <button
      {...props}
      type={type}
      onClick={handleClick}
      onTouchEnd={handleTouchEnd}
      aria-busy={isLoading}
      className={`${preserveRootPosition ? "" : "relative"} ${isLoading ? "pointer-events-none" : ""} ${className}`}
    >
      <ContentWithLoader
        isLoading={isLoading}
        loaderClassName={loaderClassName}
        trimEffect={trimEffect}
      >
        {children}
      </ContentWithLoader>
    </button>
  );
}
