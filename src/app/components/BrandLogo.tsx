type BrandLogoProps = {
  brandName: string;
  href?: string;
  className?: string;
  textClassName?: string;
  iconClassName?: string;
};

export default function BrandLogo({
  brandName,
  href,
  className = "",
  textClassName = "font-display text-[19.81px] font-black leading-[1.3] tracking-[-0.04em]",
  iconClassName = "h-[29.714786px] w-[29.714786px] shrink-0"
}: BrandLogoProps) {
  const inner = (
    <>
      <img
        src="/figma/icons/navbar-logo.svg"
        alt=""
        aria-hidden
        className={iconClassName}
        loading="eager"
        decoding="async"
      />
      <span className={textClassName}>{brandName}</span>
    </>
  );

  const wrapperClass = `inline-flex items-center gap-[6.19058px] ${className}`.trim();

  if (href) {
    return (
      <a href={href} className={wrapperClass}>
        {inner}
      </a>
    );
  }

  return <div className={wrapperClass}>{inner}</div>;
}
