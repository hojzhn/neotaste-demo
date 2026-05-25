import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import { Search, X, ChevronRight, Check, Phone } from 'lucide-react'
import { Avatar } from './Avatar'
import { copy } from '../copy'

export function FriendPicker({
  mode = 'single',
  max = 3,
  excludeIds = [],
  initialSelectedIds = [],
  title,
  subtitle,
  friends,
  onConfirm,
  onPickPhone,
  onClose,
}) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(() => new Set(initialSelectedIds))
  const inputRef = useRef(null)

  useEffect(() => {
    const t = setTimeout(() => {
      inputRef.current?.focus({ preventScroll: true })
    }, 260)
    return () => clearTimeout(t)
  }, [])

  const excludeSet = new Set(excludeIds)
  const q = query.trim().toLowerCase()
  const filtered = q
    ? friends.filter(
        (f) =>
          f.fullName.toLowerCase().includes(q) ||
          f.name.toLowerCase().includes(q) ||
          f.id.toLowerCase().includes(q),
      )
    : friends

  function handleRowTap(friend) {
    if (mode === 'single') {
      onConfirm([friend])
      return
    }
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(friend.id)) next.delete(friend.id)
      else if (next.size < max) next.add(friend.id)
      return next
    })
  }

  function handleContinue() {
    if (selected.size === 0) return
    const picked = friends.filter((f) => selected.has(f.id))
    onConfirm(picked)
  }

  const atMax = selected.size >= max

  return (
    <>
      <div className="px-6 flex items-start justify-between gap-3 mb-4 shrink-0">
        <div className="min-w-0">
          <h2 className="text-[22px] font-bold text-ink leading-tight">{title}</h2>
          {subtitle && (
            <p className="text-[14px] text-ink-muted mt-1">{subtitle}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={copy.picker.close}
          className="w-9 h-9 rounded-full bg-surface flex items-center justify-center hover:bg-surface-strong shrink-0"
        >
          <X className="w-5 h-5 text-ink" strokeWidth={2.5} />
        </button>
      </div>
      <div className="px-6 mb-3 shrink-0">
        <div className="flex items-center gap-2 px-3 h-11 bg-surface rounded-md">
          <Search className="w-4 h-4 text-ink-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={copy.picker.searchPlaceholder}
            className="flex-1 bg-transparent outline-none text-[15px] text-ink placeholder:text-ink-muted"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar px-3 pb-2 min-h-0">
        {mode === 'single' && onPickPhone && (
          <button
            type="button"
            onClick={onPickPhone}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-black/3 active:bg-black/6 transition-colors text-left"
          >
            <span className="w-11 h-11 rounded-full bg-ink flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5 text-white" strokeWidth={2.25} />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[16px] font-bold text-ink truncate">
                {copy.picker.sendToPhone}
              </p>
              <p className="text-[13px] text-ink-muted truncate">
                {copy.picker.sendToPhoneDesc}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-ink-muted shrink-0" />
          </button>
        )}
        {filtered.length === 0 ? (
          <p className="text-center text-ink-muted py-10 text-[14px]">
            {copy.picker.empty}
          </p>
        ) : (
          filtered.map((friend) => {
            const isExcluded = excludeSet.has(friend.id)
            const isSelected = selected.has(friend.id)
            const showChecked = isExcluded || isSelected
            const disabledRow =
              isExcluded || (mode === 'multi' && atMax && !isSelected)
            return (
              <button
                key={friend.id}
                type="button"
                onClick={() => !disabledRow && handleRowTap(friend)}
                disabled={disabledRow}
                className={clsx(
                  'w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-colors text-left',
                  !disabledRow && 'hover:bg-black/3 active:bg-black/6',
                  disabledRow && 'opacity-40 cursor-not-allowed',
                  isSelected && !isExcluded && 'bg-brand-subtle/40',
                )}
              >
                <Avatar
                  initials={friend.initials}
                  color={friend.avatarColor}
                  size={44}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[16px] font-bold text-ink truncate">
                    {friend.fullName}
                  </p>
                  <p className="text-[13px] text-ink-muted truncate">
                    {copy.picker.memberLabel}
                  </p>
                </div>
                {mode === 'multi' ? (
                  <span
                    className={clsx(
                      'w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors',
                      showChecked
                        ? 'bg-brand text-ink'
                        : 'border-2 border-black/20',
                    )}
                  >
                    {showChecked && (
                      <Check className="w-4 h-4" strokeWidth={3} />
                    )}
                  </span>
                ) : (
                  <ChevronRight className="w-5 h-5 text-ink-muted shrink-0" />
                )}
              </button>
            )
          })
        )}
      </div>
      {mode === 'multi' && (
        <div className="border-t border-black/5 p-3 shrink-0">
          <button
            type="button"
            onClick={handleContinue}
            disabled={selected.size === 0}
            className={clsx(
              'w-full h-13 rounded-full font-semibold text-[16px] transition',
              selected.size > 0
                ? 'bg-brand text-ink hover:bg-brand-strong active:bg-brand-subtle'
                : 'bg-surface text-ink-muted cursor-not-allowed',
            )}
          >
            {copy.picker.continue(selected.size)}
          </button>
        </div>
      )}
    </>
  )
}
