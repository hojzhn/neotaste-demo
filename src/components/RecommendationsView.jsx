import clsx from 'clsx'
import { X } from 'lucide-react'
import { Avatar } from './Avatar'
import { copy } from '../copy'

export function RecommendationsView({ recommenders = [], onOpenUser, onClose }) {
  const clickable = !!onOpenUser
  return (
    <>
      <div className="px-6 flex items-start justify-between gap-3 mb-4 shrink-0">
        <div className="min-w-0">
          <h2 className="text-[22px] font-bold text-ink leading-tight">
            {copy.recommendations.title}
          </h2>
          {recommenders.length > 0 && (
            <p className="text-[14px] text-ink-muted mt-1">
              {copy.recommendations.subtitle(recommenders.length)}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={copy.picker.close}
          className="w-9 h-9 rounded-lg bg-surface flex items-center justify-center hover:bg-surface-strong shrink-0"
        >
          <X className="w-5 h-5 text-ink" strokeWidth={2.5} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-3 pb-4 min-h-0">
        {recommenders.length === 0 ? (
          <p className="text-center text-ink-muted py-10 text-[14px]">
            {copy.recommendations.empty}
          </p>
        ) : (
          recommenders.map((r) => {
            const RowEl = clickable ? 'button' : 'div'
            return (
              <RowEl
                key={r.id}
                type={clickable ? 'button' : undefined}
                onClick={clickable ? () => onOpenUser(r.id) : undefined}
                className={clsx(
                  'w-full text-left flex items-start gap-3 px-3 py-3 rounded-lg',
                  clickable &&
                    'hover:bg-surface/60 active:bg-surface transition-colors',
                )}
              >
                <Avatar
                  initials={r.initials}
                  color={r.avatarColor}
                  image={r.avatarImage}
                  size={40}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-bold text-ink truncate">
                    {r.fullName}
                  </p>
                  {r.message && (
                    <p className="text-[13px] text-ink-muted mt-0.5 italic leading-snug">
                      “{r.message}”
                    </p>
                  )}
                </div>
              </RowEl>
            )
          })
        )}
      </div>
    </>
  )
}
