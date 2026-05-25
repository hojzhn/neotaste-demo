import clsx from 'clsx'

export function SubTabs({ tabs, active, onChange }) {
  return (
    <div className="flex items-end gap-6 px-6 border-b border-black/10">
      {tabs.map((tab) => {
        const isActive = tab.id === active
        const interactive = !!onChange
        return (
          <button
            key={tab.id}
            type="button"
            onClick={interactive ? () => onChange(tab.id) : undefined}
            disabled={!interactive}
            className={clsx(
              'pb-3 text-[15px] font-semibold relative -mb-px transition-colors',
              isActive ? 'text-ink' : 'text-ink-muted',
              interactive ? 'cursor-pointer' : 'cursor-default'
            )}
          >
            {tab.label}
            {isActive && (
              <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-ink rounded-full" />
            )}
          </button>
        )
      })}
    </div>
  )
}
