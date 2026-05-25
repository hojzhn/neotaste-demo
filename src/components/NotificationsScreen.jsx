import { ChevronLeft } from 'lucide-react'
import { StatusBar } from './StatusBar'
import { NotificationCard } from './NotificationCard'
import { copy } from '../copy'

export function NotificationsScreen({
  notifications = [],
  onBack,
  onAcceptShare,
  onDeclineShare,
  onSeeInformation,
}) {
  return (
    <div className="w-full h-full flex flex-col bg-white">
      <StatusBar />

      <div className="flex items-center justify-center py-3 px-4 relative shrink-0 border-b border-black/5">
        <button
          type="button"
          onClick={onBack}
          aria-label={copy.picker.back}
          className="absolute left-3 w-9 h-9 rounded-full flex items-center justify-center hover:bg-surface active:scale-95 transition"
        >
          <ChevronLeft className="w-6 h-6 text-ink" strokeWidth={2.5} />
        </button>
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
            />
          ))
        )}
      </div>
    </div>
  )
}
