import { useState } from "react";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { Star } from "lucide-react";
import { copy } from "../copy";
import { FriendGroupCard } from "./FriendGroupCard";

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

// Two-step sheet used for "post-meal cleanup": rate + (optionally) recommend.
// Mirrors the corresponding steps in the host's full Redeem flow so crew
// members get the same affordance to credit friends, and so that any user
// editing an existing review can also push out a recommendation in one go.
export function WriteReviewSheet({
  restaurant,
  initialStep = "rate",
  initialRating = 0,
  initialReview = "",
  hasRecommended = false,
  friends = [],
  onSubmit,
  onSendRecommendation,
  onClose,
}) {
  const c = copy.bookings;
  const cr = copy.redeem;
  const [step, setStep] = useState(initialStep);
  const [rating, setRating] = useState(initialRating);
  const [reviewText, setReviewText] = useState(initialReview);
  const [recommendMessage, setRecommendMessage] = useState("");

  const hasRated = rating > 0;
  const hasFriends = friends.length > 0;
  // Only chain into the recommend step if there's actually something to do
  // there: at least one friend, and no recommendation already sent for this
  // booking. Otherwise Post review just saves + closes.
  const shouldAdvanceAfterReview = hasFriends && !hasRecommended;
  const rateTitle =
    rating === 0
      ? c.writeReviewTitle(restaurant.name)
      : rating >= 4
        ? cr.ratedTitleGood
        : cr.ratedTitleOk;
  const friendSubtitle = hasFriends
    ? friends.length === 1
      ? cr.friendCountOne
      : cr.friendCount(friends.length)
    : null;

  function handlePostReview() {
    if (hasRated) {
      onSubmit?.({ rating, review: reviewText.trim() || null });
    }
    if (shouldAdvanceAfterReview) {
      setStep("recommend");
    } else {
      onClose?.();
    }
  }

  function handleSendRecommendation() {
    if (hasFriends) {
      onSendRecommendation?.({
        friends,
        message: recommendMessage.trim() || null,
      });
    }
    onClose?.();
  }

  function handleSkipRecommend() {
    onClose?.();
  }

  return (
    <div className="h-full flex flex-col">
      <AnimatePresence mode="wait" initial={false}>
        {step === "rate" && (
          <motion.div
            key="rate"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="flex-1 min-h-0 flex flex-col"
          >
            <div className="flex-1 overflow-y-auto no-scrollbar px-5 pt-1 pb-4">
              <h1 className="text-[22px] font-bold text-ink text-center leading-tight">
                {rateTitle}
              </h1>
              <p className="text-[14px] text-ink-muted mt-2 text-center">
                {c.writeReviewSubtitle}
              </p>

              <div className="mt-6 flex justify-center">
                <StarRating value={rating} onChange={setRating} />
              </div>

              {hasRated && (
                <div className="mt-6 border-t border-ink/10 pt-5">
                  <p className="text-[16px] font-bold text-ink mb-2">
                    {c.writeReviewHowLabel}
                  </p>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder={c.writeReviewPlaceholder}
                    rows={4}
                    className="w-full p-3 bg-surface rounded-md outline-none text-[15px] text-ink placeholder:text-ink-muted resize-none focus:ring-2 focus:ring-ink"
                  />
                </div>
              )}
            </div>

            <div className="px-5 pt-3 pb-4 shrink-0">
              <button
                type="button"
                onClick={handlePostReview}
                disabled={!hasRated && !shouldAdvanceAfterReview}
                className={clsx(
                  "w-full h-13 rounded-lg font-semibold text-[16px] transition",
                  hasRated || shouldAdvanceAfterReview
                    ? "bg-brand text-ink hover:bg-brand-strong active:bg-brand-subtle"
                    : "bg-surface text-ink-muted cursor-not-allowed",
                )}
              >
                {hasRated
                  ? c.writeReviewSubmit
                  : shouldAdvanceAfterReview
                    ? c.writeReviewContinue
                    : c.writeReviewSubmit}
              </button>
            </div>
          </motion.div>
        )}
        {step === "recommend" && (
          <motion.div
            key="recommend"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="flex-1 min-h-0 flex flex-col"
          >
            <div className="flex-1 overflow-y-auto no-scrollbar px-5 pt-1 pb-4">
              <h1 className="text-[22px] font-bold text-ink leading-tight">
                {cr.recommendTitle}
              </h1>
              <p className="text-[14px] text-ink-muted mt-2">
                {cr.recommendSubtitle}
              </p>

              {hasFriends && (
                <div className="mt-5">
                  <FriendGroupCard
                    friends={friends}
                    subtitle={friendSubtitle}
                  />
                </div>
              )}

              {hasFriends && (
                <div className="mt-5 border-t border-ink/10 pt-5">
                  <p className="text-[14px] font-semibold text-ink mb-2">
                    {cr.recommendMessageLabel}
                  </p>
                  <textarea
                    value={recommendMessage}
                    onChange={(e) => setRecommendMessage(e.target.value)}
                    placeholder={cr.recommendPlaceholder}
                    rows={3}
                    className="w-full p-3 bg-surface rounded-md outline-none text-[15px] text-ink placeholder:text-ink-muted resize-none focus:ring-2 focus:ring-ink"
                  />
                </div>
              )}
            </div>

            <div className="px-5 pt-3 pb-4 shrink-0 flex flex-col gap-2">
              {hasFriends ? (
                <>
                  <button
                    type="button"
                    onClick={handleSendRecommendation}
                    className="w-full h-13 rounded-lg bg-brand text-ink font-semibold text-[16px] hover:bg-brand-strong active:bg-brand-subtle transition"
                  >
                    {cr.recommendSend}
                  </button>
                  <button
                    type="button"
                    onClick={handleSkipRecommend}
                    className="w-full h-11 rounded-lg bg-transparent text-ink-muted font-semibold text-[14px] hover:text-ink transition"
                  >
                    {cr.recommendDone}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleSkipRecommend}
                  className="w-full h-13 rounded-lg bg-surface text-ink font-semibold text-[16px] hover:bg-surface-strong transition"
                >
                  {cr.recommendDone}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
