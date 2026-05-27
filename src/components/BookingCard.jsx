import clsx from "clsx";
import {
  Signpost,
  Share,
  Ban,
  ConciergeBell,
  Gift,
  UserPlus,
  ChevronRight,
} from "lucide-react";
import { Avatar } from "./Avatar";
import { ActionTile } from "./ActionTile";
import { RedeemButton } from "./RedeemButton";
import { copy } from "../copy";

export function BookingCard({
  booking,
  deal,
  restaurant,
  gifter,
  giftMessage,
  crew = [],
  hasPendingInvites = false,
  canAddCrew = true,
  canGift = true,
  onGift,
  onAddCrew,
  onOpenDetail,
  onRedeem,
}) {
  const hasCrew = crew.length > 0;
  const c = copy.bookingCard;
  // Pending crew get rendered first in DOM so the accepted avatars
  // paint on top of them in the overlapping stack — the dim "pending"
  // dot sits behind, not in front. Visual identity of each avatar
  // doesn't matter here (they're all just heads), so stable ordering
  // isn't required.
  const orderedCrew = [
    ...crew.filter((u) => u.pending),
    ...crew.filter((u) => !u.pending),
  ];

  return (
    <article className="bg-white rounded-lg border border-black/5 shadow-[0_4px_24px_-12px_rgba(0,0,0,0.15)]">
      <div className="p-2">
        <div className="relative h-40 rounded-lg overflow-hidden">
          <img
            src={restaurant.image}
            alt=""
            className="w-full h-full object-cover"
          />

          {gifter && (
            <div className="absolute top-2 left-2">
              <span className="inline-flex items-center gap-1.5 py-1 px-2 rounded-lg bg-error text-white text-[10px] font-semibold">
                <Gift className="w-3.5 h-3.5" strokeWidth={2.5} />
                {c.gifted(gifter.name)}
              </span>
            </div>
          )}

          <div className="absolute bottom-3 right-3 flex items-end gap-2">
            {hasCrew && (
              <>
                <span className="text-[12px] font-semibold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                  {c.goingWith}
                </span>
                <div className="flex -space-x-2">
                  {orderedCrew.slice(0, 3).map((u) => (
                    <Avatar
                      key={u.id}
                      initials={u.initials}
                      color={u.avatarColor}
                      image={u.avatarImage}
                      size={28}
                      ring
                      pending={u.pending}
                    />
                  ))}
                </div>
              </>
            )}{" "}
            {canAddCrew && (
              <button
                type="button"
                onClick={onAddCrew}
                aria-label={c.addCrew}
                className={clsx(
                  "w-8 h-8 rounded-lg top-0.5 relative text-ink flex items-center justify-center active:scale-95 transition",
                  hasPendingInvites
                    ? "bg-brand-strong hover:bg-brand"
                    : "bg-brand hover:bg-brand-strong",
                )}
              >
                <UserPlus className="w-3.5 h-3.5" strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onOpenDetail}
        disabled={!onOpenDetail}
        className={clsx(
          "w-full text-left px-4 pt-1 pb-3 transition-colors",
          onOpenDetail && "hover:bg-black/3 active:bg-black/6 cursor-pointer",
        )}
      >
        <h3 className="text-[22px] font-bold text-ink leading-[1.2]">
          {restaurant.name}
        </h3>
        <p className="flex items-center gap-1 text-[14px] text-ink-muted mt-1.5">
          <span>
            {deal.title} · {booking.dateLabel}, {booking.timeWindow}
          </span>
          <ChevronRight className="w-4 h-4 shrink-0" />
        </p>
      </button>

      <div className="border-t border-black/5 mx-3" />

      <div className="px-3 py-2.5 flex gap-2">
        <ActionTile icon={Signpost} label={c.actions.location} />
        <ActionTile icon={Share} label={c.actions.share} />
        <ActionTile icon={Ban} label={c.actions.cancel} />
        <ActionTile icon={ConciergeBell} label={c.actions.support} />
      </div>

      <div className="px-3 pb-2.5 flex items-center gap-2">
        {canGift && (
          <button
            type="button"
            onClick={onGift}
            aria-label={c.gift}
            className="w-13 h-13 rounded-lg bg-brand-subtle flex items-center justify-center hover:bg-brand active:scale-95 transition shrink-0"
          >
            <Gift className="w-5 h-5 text-ink" strokeWidth={2} />
          </button>
        )}
        <RedeemButton
          gifter={gifter}
          giftMessage={giftMessage}
          onRedeem={onRedeem}
        />
      </div>
    </article>
  );
}
