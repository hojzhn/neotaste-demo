import { NotificationCard } from "./NotificationCard";
import { copy } from "../copy";

export function NotificationsScreen({
  notifications = [],
  onAcceptShare,
  onDeclineShare,
  onSeeInformation,
  onSeeBookings,
  onWriteReview,
  onOpenUser,
}) {
  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* Back chevron is rendered globally by PhoneFrame. The header
          here only carries the centered title; the min-h-13 keeps it
          aligned with the floating back button's vertical centre. */}
      <div className="flex items-center justify-center py-3 px-4 relative shrink-0 min-h-13 border-b border-black/5">
        <h1 className="text-[17px] font-bold text-ink">
          {copy.notifications.title}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-6">
        {notifications.length === 0 ? (
          <p className="text-center text-ink-muted py-12 px-6 text-[14px]">
            {copy.notifications.empty}
          </p>
        ) : (
          notifications.map((notif) => (
            <NotificationCard
              key={notif.share.id}
              notif={notif}
              onAcceptShare={onAcceptShare}
              onDeclineShare={onDeclineShare}
              onSeeInformation={onSeeInformation}
              onSeeBookings={onSeeBookings}
              onWriteReview={onWriteReview}
              onOpenUser={onOpenUser}
            />
          ))
        )}
      </div>
    </div>
  );
}
