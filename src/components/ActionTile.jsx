export function ActionTile({ icon: Icon, label }) {
  return (
    <div className="flex-1 flex flex-col items-center gap-1 py-2.5 bg-surface rounded-lg">
      <Icon className="w-5 h-5 text-ink" strokeWidth={2} />
      <span className="text-[12px] font-semibold text-ink">{label}</span>
    </div>
  );
}
