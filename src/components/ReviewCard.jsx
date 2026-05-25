import { Star, Heart } from 'lucide-react'
import { Avatar } from './Avatar'
import { copy } from '../copy'

export function ReviewCard({ review }) {
  const { reviewer, rating, text, daysAgo, photos = [], likes } = review
  return (
    <article className="py-4 border-b border-black/5">
      <div className="flex items-center gap-3">
        <Avatar
          initials={reviewer.initials}
          color={reviewer.avatarColor}
          size={36}
        />
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-bold text-ink truncate">
            {reviewer.name}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={
                    i <= rating
                      ? 'w-3.5 h-3.5 fill-ink text-ink'
                      : 'w-3.5 h-3.5 fill-surface-strong text-surface-strong'
                  }
                />
              ))}
            </span>
            <span className="text-[12px] text-ink-muted">·</span>
            <span className="text-[12px] text-ink-muted">
              {copy.detailPage.timeAgo(daysAgo)}
            </span>
          </div>
        </div>
      </div>

      <p className="text-[14px] text-ink leading-snug mt-3">{text}</p>

      {photos.length > 0 && (
        <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
          {photos.map((url, i) => (
            <img
              key={i}
              src={url}
              alt=""
              className="w-32 h-32 rounded-lg object-cover shrink-0"
            />
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center gap-1.5 text-[13px] text-ink-muted">
        <Heart className="w-4 h-4 fill-current text-brand" strokeWidth={0} />
        <span>{likes}</span>
      </div>
    </article>
  )
}
