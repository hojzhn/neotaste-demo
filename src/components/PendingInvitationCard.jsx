import { copy } from '../copy'

export function PendingInvitationCard({
  share,
  sender,
  deal,
  restaurant,
  onAccept,
  onDecline,
}) {
  const c = copy.invitations
  return (
    <article className="bg-white rounded-lg border border-black/5 p-3 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.08)]">
      <div className="flex items-start gap-3">
        <img
          src={restaurant.image}
          alt=""
          className="w-12 h-12 rounded-lg object-cover shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-[14px] text-ink leading-snug">
            <span className="font-bold">{sender.name}</span> {c.invitedYou}
          </p>
          <p className="text-[13px] text-ink-muted truncate mt-0.5">
            {restaurant.name} · {deal.title}
          </p>
          {share.message && (
            <p className="text-[12px] text-ink-muted italic mt-1">
              “{share.message}”
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          type="button"
          onClick={onDecline}
          className="flex-1 h-10 rounded-lg bg-surface text-ink font-semibold text-[14px] hover:bg-surface-strong active:scale-[0.98] transition"
        >
          {c.decline}
        </button>
        <button
          type="button"
          onClick={onAccept}
          className="flex-1 h-10 rounded-lg bg-brand text-ink font-semibold text-[14px] hover:bg-brand-strong active:scale-[0.98] transition"
        >
          {c.accept}
        </button>
      </div>
    </article>
  )
}
