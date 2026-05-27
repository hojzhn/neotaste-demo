import clsx from "clsx";
import { Gift, Utensils, Heart, ThumbsUp, Star } from "lucide-react";
import { Avatar } from "./Avatar";
import { copy } from "../copy";

// Small badge overlay describing what action the share represents.
// Mirrors the icon/color the Toast component uses for the same type, so
// the visual language stays consistent between toast → notification list.
const BADGE_CONFIG = {
  gift: { Icon: Gift, bg: "bg-error" },
  dine: { Icon: Utensils, bg: "bg-verified" },
  thank: { Icon: Heart, bg: "bg-loyalty" },
  recommend: { Icon: ThumbsUp, bg: "bg-brand-dark" },
  redeemed: { Icon: Star, bg: "bg-brand-dark" },
};

function NotificationIcon({ otherUser, share, onOpenUser }) {
  const config = BADGE_CONFIG[share.type];
  // Phone-only gifts have no recipient user to link to, so fall back to the
  // big gift icon that the design used before.
  if (!otherUser) {
    return (
      <span className="w-10 h-10 rounded-lg bg-error flex items-center justify-center shrink-0">
        <Gift className="w-5 h-5 text-white" strokeWidth={2.25} />
      </span>
    );
  }

  const clickable = !!onOpenUser;
  const WrapEl = clickable ? "button" : "span";

  return (
    <WrapEl
      type={clickable ? "button" : undefined}
      onClick={clickable ? () => onOpenUser(otherUser.id) : undefined}
      className={clsx(
        "relative shrink-0 rounded-full",
        clickable && "active:scale-95 transition",
      )}
    >
      <Avatar
        initials={otherUser.initials}
        color={otherUser.avatarColor}
        image={otherUser.avatarImage}
        size={40}
      />
      {config && (
        <span
          aria-hidden="true"
          className={clsx(
            "absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full ring-2 ring-white flex items-center justify-center",
            config.bg,
          )}
        >
          <config.Icon
            className="w-3 h-3 text-white"
            strokeWidth={2.5}
            fill="currentColor"
          />
        </span>
      )}
    </WrapEl>
  );
}

function pickTemplate(share, role) {
  const t = copy.notifications.tpl;
  if (role === "sent" && share.toPhone) return t.giftSentPhone;
  if (role === "received") {
    if (share.type === "gift") return t.giftReceived;
    if (share.type === "dine" && share.status === "pending")
      return t.dineInvited;
    if (share.type === "dine" && share.status === "accepted")
      return t.dineJoined;
    if (share.type === "thank") return t.thankReceived;
    if (share.type === "recommend") return t.recommendReceived;
    if (share.type === "redeemed") return t.redeemedReceived;
  } else {
    if (share.type === "gift") return t.giftSent;
    if (share.type === "dine" && share.status === "pending") return t.dineSent;
    if (share.type === "dine" && share.status === "accepted")
      return t.dineAccepted;
  }
  return null;
}

// "See bookings" when the viewer owns the deal at the time of this notification
// (gift received, dine accepted, or any dine they sent). "See information"
// otherwise (gift sent away, pending dine invite they haven't acted on,
// thank / recommend notifications which just point at the restaurant).
function pickCta(share, role) {
  if (share.type === "thank" || share.type === "recommend") {
    return copy.notifications.seeInformation;
  }
  if (share.type === "redeemed") return copy.notifications.seeBookings;
  if (role === "received") {
    if (share.type === "gift") return copy.notifications.seeBookings;
    if (share.status === "accepted") return copy.notifications.seeBookings;
    return copy.notifications.seeInformation;
  }
  if (share.type === "gift") return copy.notifications.seeInformation;
  return copy.notifications.seeBookings;
}

function renderTemplate(template, vars) {
  if (!template) return null;
  const parts = template.split(/(\{[a-z]+\})/g).filter(Boolean);
  return parts.map((part, i) => {
    const m = part.match(/^\{([a-z]+)\}$/);
    if (m) {
      const v = vars[m[1]];
      return (
        <span key={i} className="font-bold">
          {v ?? part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export function NotificationCard({
  notif,
  onAcceptShare,
  onDeclineShare,
  onSeeInformation,
  onSeeBookings,
  onWriteReview,
  onOpenUser,
}) {
  const { share, deal, restaurant, otherUser, role } = notif;
  const isGiftType = share.type === "gift";
  const highlight = isGiftType && role === "received";
  const isPendingDineReceived =
    role === "received" && share.type === "dine" && share.status === "pending";
  // Crew member receiving the "Arabel redeemed your deal" share — they get a
  // dual CTA: leave a review for the meal they shared OR jump back to
  // their bookings list.
  const isRedeemedReceived = role === "received" && share.type === "redeemed";
  const template = pickTemplate(share, role);
  if (!template) return null;

  const vars = {
    name: otherUser?.name,
    phone: share.toPhone,
  };

  return (
    <div className={clsx("px-4 py-4", highlight && "bg-brand-subtle/40")}>
      <div>
        <div className="flex gap-3">
          <NotificationIcon
            otherUser={otherUser}
            share={share}
            onOpenUser={onOpenUser}
          />

          <div className="flex-1 min-w-0">
            <p className="text-[14px] text-ink leading-snug">
              {renderTemplate(template, vars)}
            </p>
            {share.message && (
              <p className="text-[13px] text-ink-muted mt-1 leading-snug italic">
                “{share.message}”
              </p>
            )}
          </div>
        </div>

        {deal && restaurant && (
          <article className="bg-white rounded-lg border border-black/5 p-3 mt-3">
            <div className="flex items-center gap-3">
              <img
                src={restaurant.image}
                alt=""
                className="w-12 h-12 rounded-lg object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-[15px] font-bold text-ink truncate">
                  {restaurant.name}
                </h3>
                <p className="text-[13px] text-ink-muted truncate">
                  {deal.title}
                </p>
              </div>
            </div>
            {isPendingDineReceived ? (
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => onDeclineShare?.(share.id)}
                  className="flex-1 h-10 rounded-lg bg-surface text-ink font-semibold text-[14px] hover:bg-surface-strong active:scale-[0.98] transition"
                >
                  {copy.invitations.decline}
                </button>
                <button
                  type="button"
                  onClick={() => onAcceptShare?.(share.id)}
                  className="flex-1 h-10 rounded-lg bg-brand text-ink font-semibold text-[14px] hover:bg-brand-strong active:scale-[0.98] transition"
                >
                  {copy.invitations.accept}
                </button>
              </div>
            ) : isRedeemedReceived ? (
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={onSeeBookings}
                  className="flex-1 h-10 rounded-lg bg-surface text-ink font-semibold text-[14px] hover:bg-surface-strong active:scale-[0.98] transition"
                >
                  {copy.notifications.seeBookings}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    share.bookingId && onWriteReview?.(share.bookingId)
                  }
                  className="flex-1 h-10 rounded-lg bg-brand text-ink font-semibold text-[14px] hover:bg-brand-strong active:scale-[0.98] transition"
                >
                  {copy.notifications.writeReview}
                </button>
              </div>
            ) : (
              (() => {
                const label = pickCta(share, role);
                const isInfo = label === copy.notifications.seeInformation;
                const isBookings = label === copy.notifications.seeBookings;
                const handler =
                  isInfo && restaurant
                    ? () => onSeeInformation?.(restaurant.id)
                    : isBookings
                      ? onSeeBookings
                      : undefined;
                return (
                  <button
                    type="button"
                    onClick={handler}
                    className={
                      handler
                        ? "w-full h-10 mt-3 rounded-lg bg-brand text-ink font-semibold text-[14px] hover:bg-brand-strong active:scale-[0.98] transition"
                        : "w-full h-10 mt-3 rounded-lg bg-brand text-ink font-semibold text-[14px] cursor-default"
                    }
                  >
                    {label}
                  </button>
                );
              })()
            )}
          </article>
        )}
      </div>
    </div>
  );
}
