import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Zap, Gift, RefreshCw } from "lucide-react";
import { Avatar } from "./Avatar";
import { copy } from "../copy";
import { RECOMMENDATION_ROTATE_MS } from "../lib/constants";

function Chip({ icon: Icon, children, isFlash }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 h-7 px-3 rounded-full border text-[12px] font-semibold",
        isFlash ? "border-brand/30 text-brand" : "border-ink/20 text-ink",
      )}
    >
      <Icon className="w-3.5 h-3.5" strokeWidth={2.25} />
      <span>{children}</span>
    </span>
  );
}

function RecommendationTooltip({ message }) {
  const containerRef = useRef(null);
  const measureRef = useRef(null);
  // Only need to know *whether* the message overflows; the keyframe handles
  // the exact distance via `calc(-100% + <content-width>)`.
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    setIsOverflowing(false);
    const rafId = requestAnimationFrame(() => {
      const inner = measureRef.current;
      const container = containerRef.current;
      if (!inner || !container) return;
      if (inner.scrollWidth > container.clientWidth) {
        setIsOverflowing(true);
      }
    });
    return () => cancelAnimationFrame(rafId);
  }, [message]);

  return (
    <div
      ref={containerRef}
      className="relative bg-ink text-white text-[11px] font-semibold py-1 px-2.5 rounded-md max-w-50 overflow-hidden shadow-[0_4px_12px_-4px_rgba(0,0,0,0.4)]"
    >
      <div
        ref={measureRef}
        className={clsx(
          "inline-block whitespace-nowrap",
          isOverflowing && "animate-[shuttleH_3.5s_ease-in-out_infinite]",
        )}
      >
        “{message}”
      </div>
      <span className="absolute right-4 top-full -mt-1 w-2 h-2 bg-ink rotate-45 pointer-events-none" />
    </div>
  );
}

const LONG_PRESS_MS = 500;

export function DealCardLarge({
  deal,
  recommenders = [],
  userBooking,
  onGift,
  onBook,
  onShowRecommenders,
}) {
  const isFlash = deal.flash;
  const visible = recommenders.slice(0, 3);
  const extra = Math.max(0, recommenders.length - visible.length);

  const [recIndex, setRecIndex] = useState(0);
  // Reset on recommender-list change so a new deal starts from index 0.
  useEffect(() => {
    setRecIndex(0);
  }, [recommenders]);

  useEffect(() => {
    if (recommenders.length <= 1) return;
    const id = setInterval(() => {
      setRecIndex((i) => (i + 1) % recommenders.length);
    }, RECOMMENDATION_ROTATE_MS);
    return () => clearInterval(id);
  }, [recommenders]);

  const currentMessage = recommenders[recIndex]?.message;

  const longPressTimerRef = useRef(null);
  // Tracks whether the current press has already fired the long-press action.
  // If so, the pointer-up that follows should NOT also fire the tap action.
  const longPressFiredRef = useRef(false);
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    };
  }, []);

  const isBooked = !!userBooking;
  const tapEnabled = !isBooked && !!onBook;

  function handleBookDealPointerDown() {
    longPressFiredRef.current = false;
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    if (!onShowRecommenders || recommenders.length === 0) return;
    longPressTimerRef.current = setTimeout(() => {
      longPressFiredRef.current = true;
      onShowRecommenders();
      longPressTimerRef.current = null;
    }, LONG_PRESS_MS);
  }

  function handleBookDealPointerUp() {
    const fired = longPressFiredRef.current;
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    if (!fired && tapEnabled) onBook();
  }

  function handleBookDealPointerCancel() {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }

  return (
    <article
      className={clsx(
        "relative rounded-xl p-4",
        isFlash ? "bg-brand-darkest" : "bg-brand",
      )}
    >
      {/* Ticket-style notch cutouts on the left/right edges of the card.
          The white half-discs straddle each edge — assumes the parent
          surface is white (true for DetailPage + BookingsScreen). */}

      <h3
        className={clsx(
          "text-[24px] font-bold leading-tight flex items-center gap-1.5",
          isFlash ? "text-brand" : "text-ink",
        )}
      >
        {isFlash && (
          <Zap className="w-5 h-5" fill="currentColor" strokeWidth={0} />
        )}
        <span>{deal.title}</span>
      </h3>

      <div className="flex gap-2 mt-3">
        {deal.avgPrice && (
          <Chip icon={Gift} isFlash={isFlash}>
            {copy.dealCard.avg(deal.avgPrice)}
          </Chip>
        )}
        {deal.badge && (
          <Chip icon={RefreshCw} isFlash={isFlash}>
            {deal.badge}
          </Chip>
        )}
      </div>

      <p
        className={clsx(
          "text-[14px] leading-snug mt-3",
          isFlash ? "text-brand" : "text-ink",
        )}
      >
        {deal.description}
      </p>
      {/* Negative left/right (-16px) cancels the article's p-4 so the notches
          sit centered on the article's actual edge instead of the padded
          content edge. h-0 wrapper anchors them vertically at this line. */}
      <div className="relative h-0 mt-3">
        <span
          aria-hidden="true"
          className="absolute -left-4 top-0 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white pointer-events-none"
        />
        <span
          aria-hidden="true"
          className="absolute -right-4 top-0 translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white pointer-events-none"
        />
      </div>
      <div className="flex items-center gap-2 mt-4 relative">
        <button
          type="button"
          onClick={onGift}
          aria-label={copy.bookingCard.gift}
          className={clsx(
            "w-13 h-13 rounded-lg flex items-center justify-center shrink-0 active:scale-95 transition",
            isFlash
              ? "bg-brand-darker hover:bg-brand-dark"
              : "bg-ink/10 hover:bg-ink/15",
          )}
        >
          <Gift
            className={clsx("w-5 h-5", isFlash ? "text-brand" : "text-ink")}
            strokeWidth={2}
          />
        </button>

        <div className="relative flex-1 z-10 group">
          {currentMessage && (
            <div className="absolute -top-4 right-0 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <RecommendationTooltip key={recIndex} message={currentMessage} />
            </div>
          )}

          <button
            type="button"
            onPointerDown={handleBookDealPointerDown}
            onPointerUp={handleBookDealPointerUp}
            onPointerLeave={handleBookDealPointerCancel}
            onPointerCancel={handleBookDealPointerCancel}
            className={clsx(
              "w-full h-13 rounded-lg font-semibold text-[16px] flex items-center justify-center relative select-none transition",
              tapEnabled
                ? "cursor-pointer active:scale-[0.98]"
                : "cursor-default",
              isFlash ? "bg-brand-darker text-brand" : "bg-ink/10 text-ink",
            )}
          >
            <span>
              {userBooking
                ? copy.dealCard.bookedAt(
                    userBooking.dateLabel,
                    userBooking.timeWindow,
                  )
                : copy.dealCard.bookDeal}
            </span>
            {visible.length > 0 && (
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                <span className="flex -space-x-2 text-ink">
                  {visible.map((u) => (
                    <Avatar
                      key={u.id}
                      initials={u.initials}
                      color={u.avatarColor}
                      size={24}
                      ring
                    />
                  ))}
                </span>
                {extra > 0 && (
                  <span
                    className={clsx(
                      "text-[12px] font-semibold",
                      isFlash ? "text-brand" : "text-ink",
                    )}
                  >
                    +{extra}
                  </span>
                )}
              </span>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
