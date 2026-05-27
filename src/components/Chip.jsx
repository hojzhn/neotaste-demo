import clsx from "clsx";

const TONE = {
  default: "bg-white text-ink border border-black/10",
  dark: "bg-white/10 text-brand border border-white/10",
  loyalty: "bg-loyalty text-ink",
  top10: "bg-top10 text-ink",
};

export function Chip({ tone = "default", icon: Icon, children, className }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 h-7 px-3 rounded-lg text-[12px] font-semibold",
        TONE[tone],
        className,
      )}
    >
      {Icon && <Icon className="w-3.5 h-3.5" strokeWidth={2.5} />}
      {children}
    </span>
  );
}
