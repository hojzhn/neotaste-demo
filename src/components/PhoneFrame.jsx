export function PhoneFrame({ label, sublabel, children }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-[390px] h-[844px] bg-black rounded-[54px] p-[10px] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.35)]">
        <div className="w-full h-full rounded-[46px] overflow-hidden bg-white relative">
          {children}
        </div>
      </div>
      {(label || sublabel) && (
        <div className="text-center">
          {label && <p className="text-[15px] font-semibold text-ink">{label}</p>}
          {sublabel && <p className="text-[13px] text-ink-muted">{sublabel}</p>}
        </div>
      )}
    </div>
  )
}
