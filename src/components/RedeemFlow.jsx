import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
} from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Star,
  Check,
} from "lucide-react";
import { StatusBar } from "./StatusBar";
import { Avatar } from "./Avatar";
import { BottomSheet } from "./BottomSheet";
import { FriendGroupCard } from "./FriendGroupCard";
import { copy } from "../copy";

const SLIDE_TRANSITION = { type: "spring", stiffness: 380, damping: 36 };
const SLIDE_THRESHOLD_FRACTION = 0.78;
const KNOB_SIZE = 56;
const TRACK_HEIGHT = 64;

function useNowClock(stoppedAt) {
  // Tick once a second until a timestamp is captured (redemption locks the
  // displayed time so it doesn't keep advancing during the rest of the flow).
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    if (stoppedAt) return;
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, [stoppedAt]);
  return stoppedAt ?? now;
}

function formatClock(d) {
  return d.toTimeString().slice(0, 8); // "HH:MM:SS"
}

function formatLongDate(d) {
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// ─── Slide-to-Redeem control ────────────────────────────────────────────────

function SlideToRedeem({ onComplete }) {
  const trackRef = useRef(null);
  const x = useMotionValue(0);
  const [maxX, setMaxX] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    function measure() {
      const w = trackRef.current?.offsetWidth ?? 0;
      setMaxX(Math.max(0, w - KNOB_SIZE - 8));
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  function handleDragEnd() {
    if (completed) return;
    const current = x.get();
    if (current >= maxX * SLIDE_THRESHOLD_FRACTION) {
      setCompleted(true);
      animate(x, maxX, { ...SLIDE_TRANSITION }).then(() => {
        onComplete();
      });
    } else {
      animate(x, 0, { type: "spring", stiffness: 400, damping: 35 });
    }
  }

  return (
    <div
      ref={trackRef}
      className="relative w-full rounded-full bg-brand/30"
      style={{ height: TRACK_HEIGHT }}
    >
      <span
        className="absolute inset-0 flex items-center justify-center text-ink font-semibold text-[16px] select-none pointer-events-none"
        aria-hidden="true"
      >
        {copy.redeem.slide}
      </span>
      <motion.div
        drag={completed ? false : "x"}
        dragConstraints={{ left: 0, right: maxX }}
        dragElastic={0}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        style={{ x, width: KNOB_SIZE, height: KNOB_SIZE }}
        className="absolute top-1 left-1 rounded-full bg-brand flex items-center justify-center cursor-grab active:cursor-grabbing shadow-[0_2px_8px_-2px_rgba(0,0,0,0.2)]"
      >
        <ChevronRight className="w-6 h-6 text-ink" strokeWidth={2.5} />
      </motion.div>
    </div>
  );
}

// ─── Savings stepper ────────────────────────────────────────────────────────

function SavingsStepper({ value, onChange }) {
  return (
    <div className="inline-flex items-center gap-2 h-14 pl-2 pr-2 rounded-full bg-white shadow-[0_2px_8px_-4px_rgba(0,0,0,0.15)]">
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - 1))}
        aria-label="Decrease"
        className="w-10 h-10 rounded-full bg-surface text-ink flex items-center justify-center hover:bg-surface-strong active:scale-95 transition"
      >
        <Minus className="w-4 h-4" strokeWidth={2.5} />
      </button>
      <span className="text-[20px] font-bold text-ink min-w-[3.5rem] text-center">
        {copy.redeem.saveCurrency}
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        aria-label="Increase"
        className="w-10 h-10 rounded-full bg-surface text-ink flex items-center justify-center hover:bg-surface-strong active:scale-95 transition"
      >
        <Plus className="w-4 h-4" strokeWidth={2.5} />
      </button>
    </div>
  );
}

// ─── Star rating ────────────────────────────────────────────────────────────

function StarRating({ value, onChange }) {
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= value;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            className="active:scale-90 transition"
          >
            <Star
              className={clsx(
                "w-10 h-10",
                filled
                  ? "fill-brand-darker text-brand-darker"
                  : "fill-surface text-surface-strong",
              )}
              strokeWidth={0}
            />
          </button>
        );
      })}
    </div>
  );
}

// ─── Step 1: Ticket (slide-to-redeem + savings + continue) ──────────────────

function TicketStep({
  deal,
  restaurant,
  redeemedAt,
  savings,
  onSlideRedeem,
  onChangeSavings,
  onContinue,
  onClose,
}) {
  const isRedeemed = !!redeemedAt;
  const liveNow = useNowClock(redeemedAt ?? null);
  const c = copy.redeem;

  return (
    <div
      className={clsx(
        "h-full flex flex-col transition-colors duration-450",
        isRedeemed ? "bg-white" : "bg-brand-darkest",
      )}
    >
      <StatusBar dark={!isRedeemed} />

      <div className="px-4 py-2 shrink-0 flex items-center justify-between">
        <button
          type="button"
          onClick={onClose}
          aria-label={c.close}
          className={clsx(
            "w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-colors duration-450",
            isRedeemed ? "bg-surface hover:bg-surface-strong" : "bg-white/95",
          )}
        >
          <ChevronLeft className="w-5 h-5 text-ink" strokeWidth={2.5} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pt-3 pb-4 flex flex-col justify-center">
        <motion.article
          layout
          transition={{
            // Slow, soft layout transition. Anything inside that also has
            // `layout` (date label, divider, perforation row) inherits this
            // and animates its own position change at the same tempo, so the
            // card resizes as one continuous motion instead of the article
            // shrinking while children snap.
            layout: { duration: 0.55, ease: [0.32, 0.72, 0, 1] },
            default: { duration: 0.45, ease: [0.4, 0, 0.2, 1] },
          }}
          className={clsx(
            // `transition-colors duration-450` keeps the article's bg
            // interpolating in lockstep with the outer container's
            // dark-green → white transition. Without it the article snaps
            // green instantly while the outer is still mid-transition,
            // producing a brief low-contrast flash.
            "rounded-3xl overflow-hidden transition-colors duration-450",
            isRedeemed ? "bg-brand" : "bg-white",
          )}
        >
          <div className="relative aspect-[16/9]">
            <img
              src={restaurant.image}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>

          <div className="px-5 pt-4 pb-5">
            <h2 className="text-[22px] font-bold text-ink leading-tight">
              {restaurant.name}
            </h2>
            {restaurant.address && (
              <p className="text-[14px] text-ink-muted mt-1">
                {restaurant.address}
              </p>
            )}
            <div className="border-t border-black/10 my-4" />
            <h3 className="text-[24px] font-bold text-ink leading-tight">
              {deal.title}
            </h3>
          </div>

          {/* Ticket notches sit at the perforation line between deal title and
              time block. They take the colour of the outer background so they
              read as cut-outs of the card edge. `layout="position"` keeps them
              aligned with the (animating) bottom section as the card shrinks. */}
          <motion.div
            layout="position"
            className="relative h-0"
          >
            <span
              aria-hidden="true"
              className={clsx(
                "absolute -left-3 top-0 -translate-y-1/2 w-6 h-6 rounded-full transition-colors duration-450",
                isRedeemed ? "bg-white" : "bg-brand-darkest",
              )}
            />
            <span
              aria-hidden="true"
              className={clsx(
                "absolute -right-3 top-0 -translate-y-1/2 w-6 h-6 rounded-full transition-colors duration-450",
                isRedeemed ? "bg-white" : "bg-brand-darkest",
              )}
            />
          </motion.div>

          <motion.div layout className="px-5 pt-5 pb-5">
            {/* Two genuinely different-height variants: pre-redeem is a 3-line
                row (the VALID time is constrained to wrap onto two lines so
                the right column is taller than the left), post-redeem is a
                compact 2-line single column. `mode="popLayout"` lifts the
                exiting variant out of the flow so the entering one occupies
                its natural size right away, and the parent motion.article's
                `layout` prop then animates the card's height shrinking to
                match — no width-collapse trickery needed. */}
            <AnimatePresence mode="popLayout" initial={false}>
              {isRedeemed ? (
                <motion.div
                  key="redeemed-time"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <p className="text-[12px] font-semibold uppercase tracking-wide text-ink-muted">
                    {c.redeemedAt}
                  </p>
                  <p className="text-[22px] font-bold text-ink leading-tight mt-1">
                    {formatClock(liveNow)}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="active-time"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex gap-6 items-start"
                >
                  <div className="shrink-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                      {c.now}
                    </p>
                    <p className="text-[16px] font-bold text-ink leading-tight mt-1 whitespace-nowrap">
                      {formatClock(liveNow)}
                    </p>
                  </div>
                  <div
                    className="w-px bg-ink/10 self-stretch shrink-0"
                    aria-hidden="true"
                  />
                  <div className="max-w-27.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                      {c.valid}
                    </p>
                    <p className="text-[16px] font-bold text-ink leading-tight mt-1">
                      6:30 AM &ndash; 11:00 PM
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <motion.div
              layout="position"
              className="border-t border-black/10 my-4"
            />
            <motion.p
              layout="position"
              className="text-[14px] text-ink-muted"
            >
              {formatLongDate(liveNow)}
            </motion.p>
          </motion.div>
        </motion.article>
      </div>

      {/* `layout` here makes the panel's height animate, and `popLayout`
          inside swaps the old control out of flow the instant the state
          changes — so the flex parent (and the article above) see the new
          layout immediately and the article's own `layout` transition slides
          it up gradually instead of snapping when the swap completes. */}
      <motion.div
        layout
        transition={{ layout: { duration: 0.55, ease: [0.32, 0.72, 0, 1] } }}
        className="px-5 pb-5 pt-2 shrink-0"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {isRedeemed ? (
            <motion.div
              key="saved-controls"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex flex-col items-center gap-4"
            >
              <h3 className="text-[18px] font-bold text-ink">{c.saveTitle}</h3>
              <SavingsStepper value={savings} onChange={onChangeSavings} />
              <button
                type="button"
                onClick={onContinue}
                className="w-full h-13 rounded-full bg-brand text-ink font-semibold text-[16px] hover:bg-brand-strong active:bg-brand-subtle transition"
              >
                {c.continue}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="slide-control"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <SlideToRedeem onComplete={onSlideRedeem} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// ─── Sheet step: Rating + review (with inline thanks) ───────────────────────

function ThankAvatar({ recipient, selected, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className={clsx(
        "relative shrink-0 rounded-full transition",
        !selected && "opacity-40 grayscale",
      )}
    >
      <Avatar
        initials={recipient.initials}
        color={recipient.avatarColor}
        size={48}
      />
      {selected && (
        <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-brand-darker ring-2 ring-white flex items-center justify-center">
          <Check className="w-3 h-3 text-white" strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

function RateSheetContent({
  restaurant,
  rating,
  onChangeRating,
  recipients,
  thanked,
  onToggleThank,
  reviewText,
  onChangeReview,
  onContinue,
}) {
  const c = copy.redeem;
  const hasRated = rating > 0;
  const title =
    rating === 0
      ? c.rateTitle(restaurant.name)
      : rating >= 4
        ? c.ratedTitleGood
        : c.ratedTitleOk;
  const hasRecipients = recipients.length > 0;

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pt-1 pb-4">
        <motion.h1
          key={title}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="text-[22px] font-bold text-ink text-center leading-tight"
        >
          {title}
        </motion.h1>
        <div className="mt-4 flex justify-center">
          <StarRating value={rating} onChange={onChangeRating} />
        </div>

        {/* The review form (thanks + textarea + photos) only unrolls once
            the user has actually picked a star — keeps the initial sheet
            quiet, and the form arrives as a payoff for rating. */}
        <AnimatePresence initial={false}>
          {hasRated && (
            <motion.div
              key="review-form"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="mt-6 space-y-5"
            >
              {hasRecipients && (
                <div className="border-t border-ink/10 pt-5">
                  <p className="text-[14px] font-semibold text-ink mb-3">
                    {c.thankLabel}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {recipients.map((r) => (
                      <ThankAvatar
                        key={r.id}
                        recipient={r}
                        selected={thanked.has(r.id)}
                        onToggle={() => onToggleThank(r.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-ink/10 pt-5">
                <p className="text-[16px] font-bold text-ink mb-2">
                  {c.reviewLabel}
                </p>
                <textarea
                  value={reviewText}
                  onChange={(e) => onChangeReview(e.target.value)}
                  placeholder={c.reviewPlaceholder}
                  rows={4}
                  className="w-full p-3 bg-surface rounded-md outline-none text-[15px] text-ink placeholder:text-ink-muted resize-none focus:ring-2 focus:ring-ink"
                />
              </div>

              <div className="border-t border-ink/10 pt-5">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-[16px] font-bold text-ink">
                    {c.photosLabel}
                  </h3>
                  <span className="text-[11px] font-bold bg-loyalty text-ink rounded-md px-1.5 py-0.5">
                    {c.photosBadge}
                  </span>
                </div>
                <p className="text-[13px] text-ink-muted mb-3">
                  {c.photosHint}
                </p>
                <div className="h-24 border-2 border-dashed border-ink/15 rounded-xl flex items-center justify-center bg-surface/40">
                  <Plus className="w-6 h-6 text-ink-muted" strokeWidth={2} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-5 pt-3 pb-4 shrink-0">
        <button
          type="button"
          onClick={onContinue}
          disabled={!hasRated}
          className={clsx(
            "w-full h-13 rounded-full font-semibold text-[16px] transition",
            hasRated
              ? "bg-brand text-ink hover:bg-brand-strong active:bg-brand-subtle"
              : "bg-surface text-ink-muted cursor-not-allowed",
          )}
        >
          {c.postReview}
        </button>
      </div>
    </div>
  );
}

// ─── Sheet step: Recommend to friends ───────────────────────────────────────

function RecommendSheetContent({
  friends,
  message,
  onChangeMessage,
  onSend,
  onSkip,
}) {
  const c = copy.redeem;
  const hasFriends = friends.length > 0;
  const friendSubtitle = hasFriends
    ? friends.length === 1
      ? c.friendCountOne
      : c.friendCount(friends.length)
    : null;

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pt-1 pb-4">
        <h1 className="text-[22px] font-bold text-ink leading-tight">
          {c.recommendTitle}
        </h1>
        <p className="text-[14px] text-ink-muted mt-2">{c.recommendSubtitle}</p>

        {hasFriends && (
          <div className="mt-5">
            <FriendGroupCard friends={friends} subtitle={friendSubtitle} />
          </div>
        )}

        {hasFriends && (
          <div className="mt-5 border-t border-ink/10 pt-5">
            <p className="text-[14px] font-semibold text-ink mb-2">
              {c.recommendMessageLabel}
            </p>
            <textarea
              value={message}
              onChange={(e) => onChangeMessage(e.target.value)}
              placeholder={c.recommendPlaceholder}
              rows={3}
              className="w-full p-3 bg-surface rounded-md outline-none text-[15px] text-ink placeholder:text-ink-muted resize-none focus:ring-2 focus:ring-ink"
            />
          </div>
        )}
      </div>

      <div className="px-5 pt-3 pb-4 shrink-0">
        {hasFriends ? (
          <button
            type="button"
            onClick={onSend}
            className="w-full h-13 rounded-full bg-brand text-ink font-semibold text-[16px] hover:bg-brand-strong active:bg-brand-subtle transition"
          >
            {c.recommendSend}
          </button>
        ) : (
          <button
            type="button"
            onClick={onSkip}
            className="w-full h-13 rounded-full bg-surface text-ink font-semibold text-[16px] hover:bg-surface-strong transition"
          >
            {c.recommendDone}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Top-level flow ─────────────────────────────────────────────────────────

export function RedeemFlow({
  booking,
  deal,
  restaurant,
  gifter,
  giftMessage,
  recommenders = [],
  friends = [],
  onRedeem,
  onShare,
  onClose,
  onComplete,
}) {
  // sheetOpen drives the slide-up/slide-down. sheetStep is independent so it
  // doesn't change while the sheet is closing — otherwise the inner
  // AnimatePresence would fire its own horizontal exit at the same time the
  // sheet drops, producing a diagonal close animation.
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetStep, setSheetStep] = useState("rate");
  const [redeemedAt, setRedeemedAt] = useState(null);
  const [savings, setSavings] = useState(2);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [recommendMessage, setRecommendMessage] = useState("");

  // Gifter + recommenders, deduped. These are the people who can be thanked
  // inline on the rate sheet.
  const recipients = useMemo(() => {
    const out = [];
    if (gifter) {
      out.push({ ...gifter, role: "gift", message: giftMessage ?? null });
    }
    for (const r of recommenders) {
      if (out.some((x) => x.id === r.id)) continue;
      out.push({ ...r, role: "rec" });
    }
    return out;
  }, [gifter, giftMessage, recommenders]);

  // Thanked = Set of recipient ids the user is choosing to credit.
  // Stays null until the user explicitly toggles something; until then we
  // treat "all recipients" as selected, so it visually matches the
  // default-on UI without forcing a derived-state useEffect.
  const [explicitThanked, setExplicitThanked] = useState(null);
  const thanked = useMemo(() => {
    if (explicitThanked) return explicitThanked;
    return new Set(recipients.map((r) => r.id));
  }, [explicitThanked, recipients]);

  function toggleThank(id) {
    const next = new Set(thanked);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExplicitThanked(next);
  }

  function handleSlideRedeem() {
    setRedeemedAt(new Date());
    onRedeem?.(booking.id);
  }

  function handleContinueFromSaved() {
    setSheetStep("rate");
    setSheetOpen(true);
  }

  function handlePostReview() {
    // Fire one share per still-selected recipient so the gifter /
    // recommenders see a "X thanked you" toast + notification on the other
    // side. App.handleShare iterates the friends array, so we can batch
    // all of them in a single onShare call.
    if (onShare && thanked.size > 0) {
      const thankedRecipients = recipients.filter((r) => thanked.has(r.id));
      if (thankedRecipients.length > 0) {
        onShare({
          booking,
          deal,
          type: "thank",
          friends: thankedRecipients,
          fromUserId: booking.userId,
          message: null,
        });
      }
    }
    setSheetStep("recommend");
  }

  function finishFlow() {
    setSheetOpen(false);
    onComplete?.({
      bookingId: booking.id,
      savings,
      rating,
      review: reviewText,
    });
    // Wait for the sheet's slide-down before tearing down the whole flow,
    // so the two motions stay sequential.
    setTimeout(() => onClose?.(), 280);
  }

  function handleSendRecommendation() {
    // One-tap "send to my whole friend group" — matches the Close-Friends
    // pattern the collapsed card represents. Per-friend opt-out lives
    // elsewhere (a future "manage close friends" flow), not here.
    if (friends.length > 0 && onShare) {
      onShare({
        booking,
        deal,
        type: "recommend",
        friends,
        fromUserId: booking.userId,
        message: recommendMessage.trim() || null,
      });
    }
    finishFlow();
  }

  function handleSkipRecommend() {
    finishFlow();
  }

  function handleSheetClose() {
    // Drag-down / backdrop tap: dismiss only the sheet. The booking is
    // already marked as redeemed, so the user lands back on the redeemed
    // ticket screen and can exit via the top-left back button.
    setSheetOpen(false);
  }

  return (
    <div className="absolute inset-0 z-40 overflow-hidden">
      <TicketStep
        deal={deal}
        restaurant={restaurant}
        redeemedAt={redeemedAt}
        savings={savings}
        onSlideRedeem={handleSlideRedeem}
        onChangeSavings={setSavings}
        onContinue={handleContinueFromSaved}
        onClose={onClose}
      />

      <BottomSheet
        open={sheetOpen}
        onClose={handleSheetClose}
        initialSnap="full"
      >
        <AnimatePresence mode="wait" initial={false}>
          {sheetStep === "rate" && (
            <motion.div
              key="rate"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="flex-1 min-h-0 flex flex-col"
            >
              <RateSheetContent
                restaurant={restaurant}
                rating={rating}
                onChangeRating={setRating}
                recipients={recipients}
                thanked={thanked}
                onToggleThank={toggleThank}
                reviewText={reviewText}
                onChangeReview={setReviewText}
                onContinue={handlePostReview}
              />
            </motion.div>
          )}
          {sheetStep === "recommend" && (
            <motion.div
              key="recommend"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="flex-1 min-h-0 flex flex-col"
            >
              <RecommendSheetContent
                friends={friends}
                message={recommendMessage}
                onChangeMessage={setRecommendMessage}
                onSend={handleSendRecommendation}
                onSkip={handleSkipRecommend}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </BottomSheet>
    </div>
  );
}
