import clsx from "clsx";
import { Star, Heart } from "lucide-react";
import { Avatar } from "./Avatar";
import { usersById } from "../data/users";
import { copy } from "../copy";

export function ReviewCard({ review, onOpenUser }) {
  const { userId, rating, text, ageDays, photos = [], likes } = review;
  const reviewer = usersById[userId];
  if (!reviewer) return null;

  const avatarClickable = !!onOpenUser;

  return (
    <article className="py-4 border-b border-black/5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={avatarClickable ? () => onOpenUser(userId) : undefined}
          disabled={!avatarClickable}
          className={clsx(
            "rounded-full shrink-0",
            avatarClickable && "active:scale-95 transition",
          )}
        >
          <Avatar
            initials={reviewer.initials}
            color={reviewer.avatarColor}
            image={reviewer.avatarImage}
            size={36}
          />
        </button>
        <div className="flex-1 min-w-0">
          <button
            type="button"
            onClick={avatarClickable ? () => onOpenUser(userId) : undefined}
            disabled={!avatarClickable}
            className={clsx(
              "block text-left text-[15px] font-bold text-ink truncate",
              avatarClickable && "hover:underline",
            )}
          >
            {reviewer.name}
          </button>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={
                    i <= rating
                      ? "w-3.5 h-3.5 fill-ink text-ink"
                      : "w-3.5 h-3.5 fill-surface-strong text-surface-strong"
                  }
                  strokeWidth={0}
                />
              ))}
            </span>
            <span className="text-[12px] text-ink-muted">·</span>
            <span className="text-[12px] text-ink-muted">
              {copy.detailPage.timeAgo(ageDays)}
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
  );
}
