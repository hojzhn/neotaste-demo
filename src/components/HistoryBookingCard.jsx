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

export function HistoryBookingCard({
  booking,
  deal,
  restaurant,
  onBookAgain,
  onShowRecommendations,
  onWriteReview,
  onWriteRecommendation,
  onOpenDetail,
}) {
  const c = copy.bookings;
  const isCancelled = booking.outcome === "cancelled";
  const dateLine = booking.redeemedAt
    ? formatGermanDateTime(booking.redeemedAt)
    : booking.dateLabel;
  const sentRecommendations = booking.sentRecommendations ?? [];
  const hasRecommended = sentRecommendations.length > 0;
  const ratingValue = booking.rating ?? 0;
  const hasReview = !!booking.review;

  // Card body taps now navigate to the restaurant page (mirrors the upcoming
  // BookingCard's title-tap → detail). Rating still lives on the explicit
  // star button below.
  const BodyEl = onOpenDetail ? "button" : "div";
  const bodyClickable = !!onOpenDetail;

  return (
    <article className="bg-white rounded-lg border border-black/5 shadow-[0_4px_24px_-12px_rgba(0,0,0,0.15)] overflow-hidden">
      <BodyEl
        type={bodyClickable ? "button" : undefined}
        onClick={bodyClickable ? onOpenDetail : undefined}
        className={clsx(
          "w-full text-left p-3 flex gap-3",
          bodyClickable &&
            "cursor-pointer hover:bg-surface/40 active:bg-surface/60 transition-colors",
        )}
      >
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
              <span className="inline-flex items-center h-7 px-3 rounded-lg bg-error/10 text-error text-[12px] font-semibold">
                {c.cancelled}
              </span>
            ) : booking.savings != null ? (
              <span className="inline-flex items-center h-7 px-3 rounded-lg bg-surface text-ink text-[12px] font-semibold">
                {c.saved(booking.savings)}
              </span>
            ) : null}
          </div>
        </div>
      </BodyEl>

      {!isCancelled && (
        <div className="px-4 pb-3">
          <div className="border-t border-black/10 pt-3 flex items-center justify-between">
            <button
              type="button"
              onClick={onWriteReview}
              disabled={!onWriteReview}
              aria-label={c.writeReviewSubmit}
              className={clsx(
                "rounded-lg -mx-1 px-1 py-0.5",
                onWriteReview &&
                  "cursor-pointer hover:bg-surface active:scale-95 transition",
                !onWriteReview && "cursor-default",
              )}
            >
              <StarRow value={ratingValue} />
            </button>
            <div className="flex items-center gap-3 text-ink">
              <button
                type="button"
                aria-label="Comment"
                onClick={onWriteReview}
                disabled={!onWriteReview}
                className={clsx(
                  "p-1 active:scale-90 transition",
                  onWriteReview
                    ? hasReview
                      ? "text-ink cursor-pointer"
                      : "text-ink-muted cursor-pointer"
                    : "text-ink-muted cursor-default",
                )}
              >
                <MessageCircle
                  className="w-5 h-5"
                  strokeWidth={2}
                  fill={hasReview ? "currentColor" : "none"}
                />
              </button>
              <button
                type="button"
                aria-label="Like"
                onClick={
                  hasRecommended
                    ? onShowRecommendations
                    : onWriteRecommendation
                }
                disabled={
                  hasRecommended
                    ? !onShowRecommendations
                    : !onWriteRecommendation
                }
                className={clsx(
                  "p-1 active:scale-90 transition",
                  hasRecommended
                    ? "text-brand-darker cursor-pointer"
                    : onWriteRecommendation
                      ? "text-ink-muted cursor-pointer"
                      : "text-ink-muted cursor-default",
                )}
              >
                <ThumbsUp
                  className="w-5 h-5"
                  strokeWidth={2}
                  fill={hasRecommended ? "currentColor" : "none"}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="px-3 pb-3">
        <button
          type="button"
          onClick={onBookAgain}
          className="w-full h-13 rounded-lg bg-brand text-ink font-semibold text-[16px] hover:bg-brand-strong active:bg-brand-subtle transition cursor-default"
        >
          {c.bookAgain}
        </button>
      </div>
    </article>
  );
}
