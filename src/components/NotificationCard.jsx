import clsx from "clsx";
import { Gift } from "lucide-react";
import { Avatar } from "./Avatar";
import { copy } from "../copy";

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
}) {
  const { share, deal, restaurant, otherUser, role } = notif;
  const isGiftType = share.type === "gift";
  const highlight = isGiftType && role === "received";
  const isPendingDineReceived =
    role === "received" &&
    share.type === "dine" &&
    share.status === "pending";
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
          {isGiftType ? (
            <span className="w-10 h-10 rounded-full bg-error flex items-center justify-center shrink-0">
              <Gift className="w-5 h-5 text-white" strokeWidth={2.25} />
            </span>
          ) : (
            <Avatar
              initials={otherUser?.initials ?? "?"}
              color={otherUser?.avatarColor ?? "#737373"}
              size={40}
            />
          )}

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
          <article className="bg-white rounded-xl border border-black/5 p-3 mt-3">
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
                  className="flex-1 h-10 rounded-full bg-surface text-ink font-semibold text-[14px] hover:bg-surface-strong active:scale-[0.98] transition"
                >
                  {copy.invitations.decline}
                </button>
                <button
                  type="button"
                  onClick={() => onAcceptShare?.(share.id)}
                  className="flex-1 h-10 rounded-full bg-brand text-ink font-semibold text-[14px] hover:bg-brand-strong active:scale-[0.98] transition"
                >
                  {copy.invitations.accept}
                </button>
              </div>
            ) : (
              (() => {
                const label = pickCta(share, role)
                const isInfo = label === copy.notifications.seeInformation
                return (
                  <button
                    type="button"
                    onClick={
                      isInfo && restaurant
                        ? () => onSeeInformation?.(restaurant.id)
                        : undefined
                    }
                    className={
                      isInfo
                        ? 'w-full h-10 mt-3 rounded-full bg-brand text-ink font-semibold text-[14px] hover:bg-brand-strong active:scale-[0.98] transition'
                        : 'w-full h-10 mt-3 rounded-full bg-brand text-ink font-semibold text-[14px] cursor-default'
                    }
                  >
                    {label}
                  </button>
                )
              })()
            )}
          </article>
        )}
      </div>
    </div>
  );
}
