import clsx from 'clsx'
import { Home, Newspaper, Compass, Bookmark, User } from 'lucide-react'
import { copy } from '../copy'

const TABS = [
  { id: 'home', label: copy.tabs.home, Icon: Home },
  { id: 'feed', label: copy.tabs.feed, Icon: Newspaper },
  { id: 'discover', label: copy.tabs.discover, Icon: Compass },
  { id: 'bookings', label: copy.tabs.bookings, Icon: Bookmark },
  { id: 'profile', label: copy.tabs.profile, Icon: User },
]

export function TabBar({
  active = 'bookings',
  onSelectProfile,
  onSelectBookings,
  onSelectDiscover,
}) {
  return (
    <nav className="absolute bottom-0 inset-x-0 bg-white border-t border-black/5 pb-6 pt-2 px-2 flex justify-around z-45">
      {TABS.map(({ id, label, Icon }) => {
        const isActive = id === active
        // Discover / Bookings / Profile are wired; Home + Feed stay
        // inert because there are no real screens behind them yet.
        const handler =
          id === 'profile'
            ? onSelectProfile
            : id === 'bookings'
              ? onSelectBookings
              : id === 'discover'
                ? onSelectDiscover
                : undefined
        const interactive = !!handler
        return (
          <button
            key={id}
            type="button"
            onClick={handler}
            disabled={!interactive}
            aria-current={isActive ? 'page' : undefined}
            className={clsx(
              'flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-lg min-w-14',
              isActive ? 'bg-ink text-white' : 'text-ink-muted',
              interactive
                ? 'cursor-pointer active:scale-95 transition'
                : 'cursor-default',
            )}
          >
            <Icon className="w-5 h-5" strokeWidth={2} />
            <span className="text-[11px] font-semibold">{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
