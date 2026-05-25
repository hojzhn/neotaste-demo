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

export function TabBar({ active = 'bookings' }) {
  return (
    <nav className="absolute bottom-0 inset-x-0 bg-white border-t border-black/5 pb-6 pt-2 px-2 flex justify-around">
      {TABS.map(({ id, label, Icon }) => {
        const isActive = id === active
        return (
          <button
            key={id}
            type="button"
            disabled
            aria-current={isActive ? 'page' : undefined}
            className={clsx(
              'flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-2xl min-w-[56px] cursor-default',
              isActive ? 'bg-ink text-white' : 'text-ink-muted'
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
