import clsx from "clsx";

const VARIANT = {
  primary: "bg-brand text-ink hover:bg-brand-strong active:bg-brand-subtle",
  dark: "bg-ink text-white hover:bg-[#262626]",
  secondary: "bg-surface text-ink hover:bg-surface-strong",
  ghost: "bg-transparent text-ink hover:bg-black/5",
};

export function Button({
  variant = "primary",
  children,
  onClick,
  disabled,
  fullWidth,
  className,
  type = "button",
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "h-13 px-6 rounded-lg font-semibold text-[16px] leading-none transition",
        "inline-flex items-center justify-center",
        VARIANT[variant],
        disabled && "opacity-50 cursor-not-allowed",
        fullWidth && "w-full",
        className,
      )}
    >
      {children}
    </button>
  );
}
