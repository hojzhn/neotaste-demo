// NeoTaste map pin — uses the exact SVG geometry from the Figma
// component: a 24×32 teardrop in brand green with a 10%-opacity dark
// border, and the official "N" logo mark (12×14 path, dark/100)
// centred inside the head.
//
// The pin anchors to its bottom tip via translate(-50%, -100%) so the
// pointy end lands exactly on the (x, y) coordinate passed in by the
// parent. Pass `x`/`y` (percent of the parent's box) for absolutely-
// positioned placement on a map, or omit them and render inline.
// `onClick` makes the pin clickable (becomes a <button>); `selected`
// inverts the fill colours so the active pin reads as distinct against
// the rest of the cluster.
import { ThumbsUp } from "lucide-react";

export function Pin({
  x,
  y,
  size = 32,
  selected = false,
  recommended = false,
  onClick,
  className,
}) {
  const positioned = x != null && y != null;
  const interactive = !!onClick;
  const Tag = interactive ? "button" : "span";
  const fill = recommended
    ? "var(--color-brand-darker)"
    : selected
      ? "var(--color-brand-dark)"
      : "var(--color-brand)";
  const nFill = selected ? "var(--color-brand)" : "var(--color-brand-darker)";
  const inkFill = "var(--color-ink)";
  return (
    <Tag
      type={interactive ? "button" : undefined}
      onClick={onClick}
      aria-pressed={interactive ? selected : undefined}
      style={positioned ? { left: `${x}%`, top: `${y}%` } : undefined}
      className={[
        positioned
          ? "absolute -translate-x-1/2 -translate-y-full z-10"
          : "inline-block",
        interactive
          ? "cursor-pointer active:scale-95 transition-transform"
          : "pointer-events-none",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {" "}
      <svg
        className="absolute bottom-0 left-2 "
        width="23"
        height="23"
        viewBox="0 0 23 23"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          opacity="0.1"
          d="M23 7.05682C23 12.5455 3 23 3 23C3 23 0 12.5455 0 7.05682C4.54484e-08 5.18523 1.2116 3.3903 3.36827 2.06689C5.52494 0.743484 8.45001 0 11.5 0C14.55 0 17.4751 0.743484 19.6317 2.06689C21.7884 3.3903 23 5.18523 23 7.05682Z"
          fill={inkFill}
        />
      </svg>
      <svg
        className="relative"
        width={(size * 24) / 32}
        height={size}
        viewBox="0 0 24 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Teardrop body — brand green fill. */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 12V12.5853C0 15.4431 0.972602 18.2158 2.75783 20.4473L12 32L21.2422 20.4473C23.0274 18.2158 24 15.4431 24 12.5853V12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12Z"
          fill={fill}
        />
        {/* 10%-opacity dark outline inset by 0.5px so the fill isn't
            clipped. Matches the Figma "border-opacity-10" stroke. */}
        <path
          d="M12 0.5C18.3513 0.5 23.5 5.64873 23.5 12V12.585C23.5 15.3292 22.5659 17.9919 20.8516 20.1348L12 31.1992L3.14844 20.1348C1.43414 17.9919 0.5 15.3292 0.5 12.585V12C0.5 5.64873 5.64873 0.5 12 0.5Z"
          stroke={inkFill}
          strokeOpacity="0.1"
        />
        {!recommended && (
          <g transform="translate(6 5)">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M11.4429 12.0429C11.7644 11.9861 12 11.6914 12 11.3462V0.353265C12 0.13502 11.8151 -0.0309896 11.6119 0.00489391L8.27853 0.593528C8.1178 0.62191 8 0.76925 8 0.9419V6.6468L4.24433 1.6727C4.09347 1.47288 3.8524 1.37514 3.6142 1.41721L0.560393 1.95648L0.557067 1.95707C0.235607 2.01384 0 2.30852 0 2.65382V13.6467C0 13.865 0.184953 14.031 0.388133 13.9951L3.72147 13.4064C3.8822 13.3781 4 13.2307 4 13.058V7.35316L7.75567 12.3273C7.90653 12.5271 8.1476 12.6248 8.3858 12.5828L8.38813 12.5824L11.4396 12.0435L11.4429 12.0429Z"
              fill={nFill}
            />
          </g>
        )}
      </svg>
      {recommended && (
        <span className="absolute left-1/2 top-[4.5px] -translate-x-1/2 pointer-events-none">
          <ThumbsUp className="w-[13px] h-[13px] text-white" strokeWidth={3} />
        </span>
      )}
    </Tag>
  );
}
