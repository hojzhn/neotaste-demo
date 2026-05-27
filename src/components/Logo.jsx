// NeoTaste "N" wordmark — exact path from the Figma component, hoisted
// out of Pin.jsx so it can be reused on the loader, the intro modal,
// the navbar, etc. Default fill is `currentColor`, so callers control
// the colour with a parent `text-*` class.
//
// The original path lives in a 12×14 viewBox, so the rendered width is
// derived from `size` (height) at 6:7. `aria-hidden` by default since
// the mark is decorative in most contexts; pass `title` to surface it
// to assistive tech.
export function Logo({ size = 48, className, color = "currentColor", title }) {
  const width = (size * 12) / 14;
  return (
    <svg
      width={width}
      height={size}
      viewBox="0 0 12 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      className={className}
    >
      {title && <title>{title}</title>}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.4429 12.0429C11.7644 11.9861 12 11.6914 12 11.3462V0.353265C12 0.13502 11.8151 -0.0309896 11.6119 0.00489391L8.27853 0.593528C8.1178 0.62191 8 0.76925 8 0.9419V6.6468L4.24433 1.6727C4.09347 1.47288 3.8524 1.37514 3.6142 1.41721L0.560393 1.95648L0.557067 1.95707C0.235607 2.01384 0 2.30852 0 2.65382V13.6467C0 13.865 0.184953 14.031 0.388133 13.9951L3.72147 13.4064C3.8822 13.3781 4 13.2307 4 13.058V7.35316L7.75567 12.3273C7.90653 12.5271 8.1476 12.6248 8.3858 12.5828L8.38813 12.5824L11.4396 12.0435L11.4429 12.0429Z"
        fill={color}
      />
    </svg>
  );
}
