import clsx from "clsx";
import { Star, MessageCircle, ThumbsUp } from "lucide-react";
import { copy } from "../copy";

function formatGermanDateTime(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${dd}.${mm}.${yyyy}, ${hh}:${min} Uhr`;
}

function StarRow({ value = 0 }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= value;
        return (
          <Star
            key={n}
            className={clsx(
              "w-4 h-4",
              filled
                ? "fill-brand-darker text-brand-darker"
                : "fill-surface-strong text-surface-strong",
            )}
            strokeWidth={0}
          />
        );
      })}
    </div>
  );
}

export function HistoryBookingCard({ booking, deal, restaurant, onBookAgain }) {
  const c = copy.bookings;
  const isCancelled = booking.outcome === "cancelled";
  const dateLine = booking.redeemedAt
    ? formatGermanDateTime(booking.redeemedAt)
    : booking.dateLabel;

  return (
    <article className="bg-white rounded-xl border border-black/5 shadow-[0_4px_24px_-12px_rgba(0,0,0,0.15)] overflow-hidden">
      <div className="p-3 flex gap-3">
        <img
          src={restaurant.image}
          alt=""
          className="w-22 h-22 rounded-lg object-cover shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-[18px] font-bold text-ink leading-tight truncate">
            {restaurant.name}
          </h3>
          <p className="text-[14px] text-ink mt-0.5 truncate">{deal.title}</p>
          <p className="text-[12px] text-ink-muted mt-1">{dateLine}</p>
          <div className="mt-2">
            {isCancelled ? (
              <span className="inline-flex items-center h-7 px-3 rounded-full bg-error/10 text-error text-[12px] font-semibold">
                {c.cancelled}
              </span>
            ) : booking.savings != null ? (
              <span className="inline-flex items-center h-7 px-3 rounded-full bg-surface text-ink text-[12px] font-semibold">
                {c.saved(booking.savings)}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {!isCancelled && (
        <div className="px-4 pb-3">
          <div className="border-t border-black/10 pt-3 flex items-center justify-between">
            <StarRow value={booking.rating ?? 0} />
            <div className="flex items-center gap-3 text-ink">
              <button
                type="button"
                aria-label="Comment"
                className="w-8 h-8 rounded-full bg-ink text-white flex items-center justify-center active:scale-95 transition cursor-default"
              >
                <MessageCircle
                  className="w-4 h-4"
                  strokeWidth={2.25}
                  fill="currentColor"
                />
              </button>
              <button
                type="button"
                aria-label="Like"
                className="text-ink active:scale-95 transition cursor-default"
              >
                <ThumbsUp className="w-5 h-5" strokeWidth={2.25} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="px-3 pb-3">
        <button
          type="button"
          onClick={onBookAgain}
          className="w-full h-13 rounded-full bg-brand text-ink font-semibold text-[16px] hover:bg-brand-strong active:bg-brand-subtle transition cursor-default"
        >
          {c.bookAgain}
        </button>
      </div>
    </article>
  );
}
