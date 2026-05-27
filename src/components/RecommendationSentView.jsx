import clsx from "clsx";
import { X } from "lucide-react";
import { Avatar } from "./Avatar";
import { copy } from "../copy";

// Bottom-sheet content shown when the user taps the highlighted ThumbsUp on
// their history card — surfaces the recipients (avatars + names) and the
// shared message they sent with the recommendation. Tapping a recipient
// opens their profile via `onOpenUser`.
export function RecommendationSentView({ shares = [], onOpenUser, onClose }) {
  const c = copy.bookings;
  const recipients = shares.map((s) => s.toUser).filter(Boolean);
  const message = shares.find((s) => s.message)?.message ?? null;
  const rowsClickable = !!onOpenUser;

  return (
    <>
      <div className="px-5 flex items-start justify-between gap-3 mb-3 shrink-0">
        <div className="min-w-0">
          <h2 className="text-[20px] font-bold text-ink leading-tight">
            {c.recommendedTitle}
          </h2>
          <p className="text-[13px] text-ink-muted mt-1">
            {c.recommendedSubtitle(recipients.length)}
          </p>
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

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-4 min-h-0">
        <ul className="space-y-2">
          {recipients.map((r) => {
            const RowEl = rowsClickable ? "button" : "div";
            return (
              <li key={r.id}>
                <RowEl
                  type={rowsClickable ? "button" : undefined}
                  onClick={
                    rowsClickable ? () => onOpenUser(r.id) : undefined
                  }
                  className={clsx(
                    "w-full text-left flex items-center gap-3 p-3 rounded-lg bg-surface",
                    rowsClickable &&
                      "hover:bg-surface-strong active:scale-[0.99] transition",
                  )}
                >
                  <Avatar
                    initials={r.initials}
                    color={r.avatarColor}
                    image={r.avatarImage}
                    size={36}
                  />
                  <p className="flex-1 min-w-0 text-[15px] font-semibold text-ink truncate">
                    {r.fullName}
                  </p>
                </RowEl>
              </li>
            );
          })}
        </ul>

        <div className="mt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted mb-2">
            {c.recommendedMessageLabel}
          </p>
          {message ? (
            <p className="text-[15px] text-ink italic leading-snug">
              “{message}”
            </p>
          ) : (
            <p className="text-[14px] text-ink-muted">{c.recommendedNoMessage}</p>
          )}
        </div>
      </div>
    </>
  );
}
