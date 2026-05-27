import clsx from "clsx";

function dimColor(hex, amount = 0.5) {
  const c = hex.replace("#", "");

  let r = parseInt(c.slice(0, 2), 16);
  let g = parseInt(c.slice(2, 4), 16);
  let b = parseInt(c.slice(4, 6), 16);

  const gray = (r + g + b) / 3;

  r = Math.round(r + (gray - r) * amount);
  g = Math.round(g + (gray - g) * amount);
  b = Math.round(b + (gray - b) * amount);

  return `rgb(${r}, ${g}, ${b})`;
}
export function Avatar({
  initials,
  color = "#737373",
  image,
  size = 32,
  ring = false,
  pending = false,
  className,
}) {
  if (image) {
    return (
      <span
        style={{ width: size, height: size }}
        className={clsx(
          "inline-flex items-center justify-center rounded-full overflow-hidden ",
          ring && (pending ? "ring-2 ring-gray-300" : "ring-2 ring-white"),

          className,
        )}
      >
        <img
          src={image}
          alt=""
          className={`w-full h-full object-cover ${pending && "contrast-70"}`}
          draggable={false}
        />
      </span>
    );
  }

  const bg = pending ? dimColor(color, 0.7) : color;

  return (
    <span
      style={{
        width: size,
        height: size,
        background: bg,
        color: pending ? "rgba(0,0,0,0.45)" : "var(--ink)",
      }}
      className={clsx(
        "inline-flex items-center justify-center rounded-full font-semibold text-[12px]",
        ring && (pending ? "ring-2 ring-gray-300 " : "ring-2 ring-white"),
        className,
      )}
    >
      {initials}
    </span>
  );
}
