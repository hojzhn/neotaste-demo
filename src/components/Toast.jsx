import { useEffect } from "react";
import clsx from "clsx";
import { Gift, Utensils, Heart, ThumbsUp, Star, Check, X } from "lucide-react";
import { Avatar } from "./Avatar";
import { copy } from "../copy";

// Badge config mirrors NotificationCard's BADGE_CONFIG so the toast and
// the corresponding notification list entry read as the same event.
const BADGE_CONFIG = {
  gift: { Icon: Gift, bg: "bg-error" },
  dine: { Icon: Utensils, bg: "bg-verified" },
  thank: { Icon: Heart, bg: "bg-loyalty" },
  recommend: { Icon: ThumbsUp, bg: "bg-brand-dark" },
  redeemed: { Icon: Star, bg: "bg-brand-dark" },
};

const TYPE_TITLES = {
  gift: { received: copy.toast.giftReceived, sent: copy.toast.giftSent },
  dine: { received: copy.toast.dineReceived, sent: copy.toast.dineSent },
  thank: { received: copy.toast.thankReceived, sent: copy.toast.thankSent },
  recommend: {
    received: copy.toast.recommendReceived,
    sent: copy.toast.recommendSent,
  },
  // Outgoing redeem doesn't toast — the user just lived through the flow.
  redeemed: { received: copy.toast.redeemedReceived, sent: null },
};

// Avatar + small action badge for received toasts (matches the
// NotificationCard's leading icon). When there's no real user to show
// (phone-number gifts), falls back to a generic badge-only circle.
function ReceivedIcon({ fromUser, type }) {
  const config = BADGE_CONFIG[type];
  if (!fromUser) {
    if (!config) return null;
    return (
      <span
        className={clsx(
          "w-4 h-4 rounded-full flex items-center justify-center shrink-0",
          config.bg,
        )}
      >
        <config.Icon className="w-2 h-2 text-white" strokeWidth={2.25} />
      </span>
    );
  }
  return (
    <span className="relative shrink-0 rounded-full">
      <Avatar
        initials={fromUser.initials}
        color={fromUser.avatarColor}
        image={fromUser.avatarImage}
        size={30}
      />
      {config && (
        <span
          aria-hidden="true"
          className={clsx(
            "absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full ring-2 ring-brand-darker flex items-center justify-center",
            config.bg,
          )}
        >
          <config.Icon
            className="w-2 h-2 text-white"
            strokeWidth={2.5}
            fill="currentColor"
          />
        </span>
      )}
    </span>
  );
}

// Brand-color circle with a check — confirms the user's outgoing action
// (gift sent, invite sent, etc) without re-identifying the recipient
// they just picked.
function SentIcon() {
  return (
    <span className="w-4 h-4 rounded-full bg-brand flex items-center justify-center shrink-0">
      <Check className="w-2 h-2 text-ink" strokeWidth={2.75} />
    </span>
  );
}

export function Toast({
  kind = "received",
  type,
  who,
  fromUser,
  message,
  onClose,
  autoDismissMs = 5000,
}) {
  useEffect(() => {
    if (!autoDismissMs) return;
    const t = setTimeout(onClose, autoDismissMs);
    return () => clearTimeout(t);
  }, [autoDismissMs, onClose]);

  if (!type || !who) return null;

  const titles = TYPE_TITLES[type];
  if (!titles) return null;

  const isReceived = kind === "received";
  const titleFn = isReceived ? titles.received : titles.sent;
  if (!titleFn) return null;
  const title = titleFn(who);

  return (
    <div className="absolute top-1 md:top-12 inset-x-3 z-50 animate-[slidedown_220ms_ease-out]">
      <div className="bg-brand-darker text-white rounded-md shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] p-3 flex items-center gap-3">
        {isReceived ? (
          <ReceivedIcon fromUser={fromUser} type={type} />
        ) : (
          <SentIcon />
        )}
        <div className="flex-1 min-w-0 pt-1">
          <p className="text-[14px] font-semibold leading-snug">{title}</p>
          {message && (
            <p className="text-[13px] text-white/80 mt-0.5 leading-snug">
              “{message}”
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={copy.toast.dismiss}
          className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 shrink-0"
        >
          <X className="w-4 h-4 text-white" strokeWidth={2.5} />
        </button>
      </div>
      <style>{`
        @keyframes slidedown {
          from { transform: translateY(-120%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
