import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { ChevronLeft, X, Gift, Utensils, Phone } from "lucide-react";
import { Avatar } from "./Avatar";
import { FriendGroupCard } from "./FriendGroupCard";
import { copy } from "../copy";

export function MessageSheet({
  type,
  friends,
  phone,
  quotaUsed = 0,
  quotaTotal,
  onSend,
  onBack,
  onClose,
}) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => {
      textareaRef.current?.focus({ preventScroll: true });
    }, 260);
    return () => clearTimeout(t);
  }, []);

  const hasFriends = friends && friends.length > 0;
  if (!hasFriends && !phone) return null;

  const isGift = type === "gift";
  const title = isGift
    ? phone
      ? copy.phone.title
      : copy.message.giftTitle(friends[0].name)
    : copy.message.inviteTitle(friends.length);
  const sendingToLabel = phone
    ? copy.phone.recipientLabel
    : isGift
      ? copy.message.sendingToGift
      : copy.message.sendingToDine;
  const placeholder = isGift
    ? copy.message.placeholderGift
    : copy.message.placeholderDine;
  const sendLabel = isGift
    ? copy.message.sendGift
    : copy.message.sendInvitation;
  const Icon = isGift ? Gift : Utensils;

  // Quota chip only applies to phone gifts. Friend-in-app gifts don't consume
  // the SMS allowance, so we don't render anything for them.
  const showQuota = isGift && !!phone && quotaTotal != null;
  const remaining = showQuota
    ? Math.max(0, quotaTotal - quotaUsed)
    : null;
  const hasQuota = remaining == null || remaining > 0;
  const canSend = !showQuota || hasQuota;

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
          {title}
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

      <div className="flex-1 overflow-y-auto no-scrollbar min-h-0">
        <div className="px-5 mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
              {sendingToLabel}
            </p>
            <button
              type="button"
              onClick={onBack}
              className="text-[12px] font-semibold text-ink-muted hover:text-ink underline underline-offset-2 transition-colors"
            >
              {copy.message.change}
            </button>
          </div>
          <div className="space-y-2">
            {phone ? (
              <button
                type="button"
                onClick={onBack}
                aria-label={copy.message.change}
                className="w-full text-left flex items-center gap-3 p-3 rounded-lg bg-surface hover:bg-surface-strong transition-colors"
              >
                <span className="w-9 h-9 rounded-lg bg-ink flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-white" strokeWidth={2.25} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-ink truncate">
                    {phone}
                  </p>
                  <p className="text-[12px] text-ink-muted truncate">
                    {copy.phone.subtitle}
                  </p>
                </div>
              </button>
            ) : friends.length === 1 ? (
              <button
                type="button"
                onClick={onBack}
                aria-label={copy.message.change}
                className="w-full text-left flex items-center gap-3 p-3 rounded-lg bg-surface hover:bg-surface-strong transition-colors"
              >
                <Avatar
                  initials={friends[0].initials}
                  color={friends[0].avatarColor}
                  image={friends[0].avatarImage}
                  size={36}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-ink truncate">
                    {friends[0].fullName}
                  </p>
                  <p className="text-[12px] text-ink-muted truncate">
                    {copy.picker.memberLabel}
                  </p>
                </div>
              </button>
            ) : (
              <FriendGroupCard
                friends={friends}
                subtitle={copy.redeem.friendCount(friends.length)}
                onClick={onBack}
              />
            )}
          </div>
        </div>

        <div className="px-5 mb-2">
          <label className="block text-[11px] font-semibold uppercase tracking-wide text-ink-muted mb-2">
            {copy.message.messageLabel}
          </label>
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={placeholder}
            rows={3}
            maxLength={140}
            className="w-full p-3 bg-surface rounded-md outline-none text-[15px] text-ink placeholder:text-ink-muted resize-none focus:ring-2 focus:ring-ink"
          />
          <p className="text-[12px] text-ink-muted mt-1.5">
            {copy.message.messageHint}
          </p>
        </div>
      </div>

      <div className="px-5 pt-3 pb-4 shrink-0">
        {showQuota && (
          <div className="flex justify-center mb-2">
            <span
              className={clsx(
                "inline-flex items-center gap-1.5 h-7 px-3 rounded-lg text-[12px] font-semibold",
                hasQuota ? "bg-surface text-ink" : "bg-error/10 text-error",
              )}
            >
              <Gift className="w-3.5 h-3.5" strokeWidth={2.25} />
              <span>
                {hasQuota
                  ? copy.phone.quota(remaining, quotaTotal)
                  : copy.phone.quotaReached}
              </span>
            </span>
          </div>
        )}
        <button
          type="button"
          onClick={() => canSend && onSend(message.trim())}
          disabled={!canSend}
          className={clsx(
            "w-full h-13 rounded-lg font-semibold text-[16px] inline-flex items-center justify-center gap-2 transition",
            canSend
              ? "bg-brand text-ink hover:bg-brand-strong active:bg-brand-subtle"
              : "bg-surface text-ink-muted cursor-not-allowed",
          )}
        >
          <Icon className="w-5 h-5" strokeWidth={2.5} />
          {sendLabel}
        </button>
      </div>
    </>
  );
}
