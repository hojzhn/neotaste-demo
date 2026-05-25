import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import { ChevronLeft, X, Phone, Gift } from 'lucide-react'
import { copy } from '../copy'

// Accept +, digits, spaces, dashes, parens, dots. Strip non-digits (except a
// leading +) and require 7-15 digits — loose enough for international numbers,
// tight enough to catch typos like an empty field or "asdf".
const PHONE_RE = /^\+?\d{7,15}$/

function normalizePhone(raw) {
  return raw.replace(/[\s\-().]/g, '')
}

export function PhoneEntry({
  initialPhone = '',
  quotaUsed = 0,
  quotaTotal,
  onContinue,
  onBack,
  onClose,
}) {
  const [phone, setPhone] = useState(initialPhone)
  const [touched, setTouched] = useState(initialPhone.length > 0)
  const inputRef = useRef(null)
  const c = copy.phone

  useEffect(() => {
    const t = setTimeout(() => {
      inputRef.current?.focus({ preventScroll: true })
    }, 260)
    return () => clearTimeout(t)
  }, [])

  const trimmed = phone.trim()
  const formatValid = PHONE_RE.test(normalizePhone(trimmed))
  const hasQuota = quotaTotal == null || quotaUsed < quotaTotal
  const remaining = quotaTotal == null ? null : Math.max(0, quotaTotal - quotaUsed)
  const canContinue = formatValid && hasQuota
  // Only show the format error once the user has typed something, so we don't
  // accuse an empty field on first paint.
  const showFormatError = touched && trimmed.length > 0 && !formatValid

  return (
    <>
      <div className="px-5 flex items-start justify-between gap-3 mb-4 shrink-0">
        <button
          type="button"
          onClick={onBack}
          aria-label={copy.picker.back}
          className="w-9 h-9 rounded-lg bg-surface flex items-center justify-center hover:bg-surface-strong shrink-0"
        >
          <ChevronLeft className="w-5 h-5 text-ink" strokeWidth={2.5} />
        </button>
        <h2 className="flex-1 text-[20px] font-bold text-ink leading-tight pt-1">
          {c.title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label={copy.picker.close}
          className="w-9 h-9 rounded-lg bg-surface flex items-center justify-center hover:bg-surface-strong shrink-0"
        >
          <X className="w-5 h-5 text-ink" strokeWidth={2.5} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 min-h-0">
        <p className="text-[14px] text-ink-muted leading-snug mb-4">{c.subtitle}</p>

        {remaining !== null && (
          <div
            className={clsx(
              'inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-[12px] font-semibold mb-4',
              hasQuota ? 'bg-surface text-ink' : 'bg-error/10 text-error',
            )}
          >
            <Gift className="w-3.5 h-3.5" strokeWidth={2.25} />
            <span>
              {hasQuota ? c.quota(remaining, quotaTotal) : c.quotaReached}
            </span>
          </div>
        )}

        <label className="block text-[11px] font-semibold uppercase tracking-wide text-ink-muted mb-2">
          {c.label}
        </label>
        <div
          className={clsx(
            'flex items-center gap-2 px-3 h-11 rounded-md transition-colors',
            showFormatError
              ? 'bg-error/10 ring-1 ring-error'
              : 'bg-surface',
          )}
        >
          <Phone className="w-4 h-4 text-ink-muted shrink-0" />
          <input
            ref={inputRef}
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder={c.placeholder}
            className="flex-1 bg-transparent outline-none text-[15px] text-ink placeholder:text-ink-muted"
          />
        </div>
        {showFormatError && (
          <p className="text-[12px] text-error mt-1.5">{c.invalidFormat}</p>
        )}
      </div>

      <div className="px-5 pt-3 pb-4 shrink-0">
        <button
          type="button"
          onClick={() => {
            setTouched(true)
            if (canContinue) onContinue(trimmed)
          }}
          disabled={!canContinue}
          className={clsx(
            'w-full h-13 rounded-full font-semibold text-[16px] transition',
            canContinue
              ? 'bg-brand text-ink hover:bg-brand-strong active:bg-brand-subtle'
              : 'bg-surface text-ink-muted cursor-not-allowed',
          )}
        >
          {c.continue}
        </button>
      </div>
    </>
  )
}
