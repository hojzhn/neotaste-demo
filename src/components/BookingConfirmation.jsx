import { ChevronLeft, Calendar, Clock, Check } from "lucide-react";
import { StatusBar } from "./StatusBar";
import { copy } from "../copy";

// Placeholder for the real booking flow. In a real app this would let the
// user pick a time slot, party size and payment method — here we just show
// the deal + default date/time and a single Confirm CTA.
export function BookingConfirmation({ deal, restaurant, onConfirm, onClose }) {
  const c = copy.bookingConfirmation;

  return (
    <div className="h-full bg-white flex flex-col">
      <StatusBar />

      <div className="px-3 py-2 shrink-0">
        <button
          type="button"
          onClick={onClose}
          aria-label={c.close}
          className="w-9 h-9 rounded-full bg-surface flex items-center justify-center hover:bg-surface-strong active:scale-95 transition"
        >
          <ChevronLeft className="w-5 h-5 text-ink" strokeWidth={2.5} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-4">
        <h1 className="text-[28px] font-bold text-ink leading-tight">
          {c.title}
        </h1>
        <p className="text-[14px] text-ink-muted mt-2">{c.subtitle}</p>

        <div className="mt-6 rounded-2xl bg-surface p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
            {restaurant.name}
          </p>
          <h2 className="text-[20px] font-bold text-ink mt-1 leading-tight">
            {deal.title}
          </h2>
          <p className="text-[13px] text-ink mt-2 leading-snug">
            {deal.description}
          </p>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-surface p-4">
            <div className="flex items-center gap-1.5 text-ink-muted">
              <Calendar className="w-3.5 h-3.5" strokeWidth={2.25} />
              <span className="text-[11px] font-semibold uppercase tracking-wide">
                {c.dateLabel}
              </span>
            </div>
            <p className="text-[15px] font-semibold text-ink mt-1">
              {c.defaultDate}
            </p>
          </div>
          <div className="rounded-2xl bg-surface p-4">
            <div className="flex items-center gap-1.5 text-ink-muted">
              <Clock className="w-3.5 h-3.5" strokeWidth={2.25} />
              <span className="text-[11px] font-semibold uppercase tracking-wide">
                {c.timeLabel}
              </span>
            </div>
            <p className="text-[15px] font-semibold text-ink mt-1">
              {c.defaultTime}
            </p>
          </div>
        </div>

        <p className="text-[12px] text-ink-muted mt-6 leading-snug">
          {c.note}
        </p>
      </div>

      <div className="px-5 pt-3 pb-4 shrink-0">
        <button
          type="button"
          onClick={onConfirm}
          className="w-full h-13 rounded-full bg-brand text-ink font-semibold text-[16px] inline-flex items-center justify-center gap-2 hover:bg-brand-strong active:bg-brand-subtle transition"
        >
          <Check className="w-5 h-5" strokeWidth={2.5} />
          {c.confirm}
        </button>
      </div>
    </div>
  );
}
