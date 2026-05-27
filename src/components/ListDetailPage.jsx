import clsx from "clsx";
import { Star, Heart, Bookmark, Users, Check, X } from "lucide-react";
import { Avatar } from "./Avatar";
import { restaurantsById } from "../data/restaurants";
import { deals as allDeals } from "../data/deals";
import { usersById } from "../data/users";
import { copy } from "../copy";

function dealsForRestaurant(restaurantId) {
  return allDeals.filter((d) => d.restaurantId === restaurantId);
}

function formatBookmarkCount(n) {
  if (n == null) return null;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

// Single row in a list — image on the left, restaurant info + a horizontal
// strip of deal pills on the right. Matches the "places list" reference:
// saved heart, star + rating + reviews, distance, category line; then a
// scrollable row of green deal pills underneath. If the viewer has already
// redeemed a booking at this restaurant the thumbnail dims and a small
// "Visited" check badge sits on top. Items are display-only — tapping
// doesn't navigate anywhere.
function ListRestaurantItem({ restaurant, visited }) {
  const deals = dealsForRestaurant(restaurant.id);

  return (
    <div className="w-full text-left flex gap-3 py-3">
      <div className="relative w-20 h-20 shrink-0">
        <img
          src={restaurant.image}
          alt=""
          className={clsx(
            "w-20 h-20 rounded-lg object-cover transition",
            visited && "contrast-60 opacity-60",
          )}
        />
        {visited && (
          <span className="absolute bottom-1 right-1 inline-flex items-center gap-1 h-5 w-5 justify-center rounded-md bg-ink/90 text-white text-[10px] font-bold ">
            <Check className="w-2.5 h-2.5" strokeWidth={3} />
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <h3 className="text-[16px] font-bold text-ink leading-tight truncate">
          {restaurant.name}
        </h3>
        <div className="flex items-center gap-1.5 text-[12px] text-ink-muted truncate">
          <Heart
            className="w-3.5 h-3.5 fill-error text-error shrink-0"
            strokeWidth={0}
          />
          <span className="text-ink-muted">|</span>
          <Star
            className="w-3.5 h-3.5 fill-brand text-brand shrink-0"
            strokeWidth={0}
          />
          <span className="font-semibold text-ink">{restaurant.rating}</span>
          <span>({restaurant.reviews})</span>
          <span>|</span>
          <span>{restaurant.distanceKm} km</span>
          <span>|</span>
          <span className="truncate">{restaurant.category}</span>
        </div>
        {deals.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {deals.slice(0, 3).map((d) => (
              <span
                key={d.id}
                className="shrink-0 inline-flex items-center py-1 px-3 rounded-lg bg-brand text-ink text-[13px] font-bold"
              >
                {d.title}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ListDetailPage({
  list,
  viewer,
  isBookmarked = false,
  onToggleBookmark,
  visitedRestaurantIds,
  onClose,
}) {
  // Hide the bookmark affordance entirely on your own list — you don't
  // bookmark yourself. The "saved-by N" chip below the title still shows
  // (it's informational, not a control).
  const isOwnList = !!viewer && viewer.id === list.userId;
  const visitedSet =
    visitedRestaurantIds instanceof Set
      ? visitedRestaurantIds
      : new Set(visitedRestaurantIds ?? []);
  const author = usersById[list.userId];
  const items = list.restaurantIds
    .map((id) => restaurantsById[id])
    .filter(Boolean);
  const c = copy.userDetail;
  // Optimistic bookmark count: the static value from the seed plus a +1
  // when the current viewer has the list bookmarked. Bookmark state itself
  // is controlled (lives in App), so the chip stays in sync with the
  // ListCard rendering of the same list.
  const liveBookmarkCount = (list.bookmarkCount ?? 0) + (isBookmarked ? 1 : 0);
  const bookmarkLabel = formatBookmarkCount(liveBookmarkCount);

  return (
    <div className="w-full h-full min-h-0 flex flex-col bg-white relative">
      {/* Back chevron is rendered globally by PhoneFrame; this row only
          carries the page-specific bookmark control on the right. The
          min-h-13 + justify-end keeps the bookmark aligned with where
          the floating back sits on the left. */}

      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar pb-8">
        <div className="px-4 pt-2 flex flex-col gap-2">
          <div className="flex flex-row items-baseline justify-between">
            <div className="flex flex-col gap-2">
              <h1 className="text-[28px] font-bold text-ink leading-tight">
                {list.name}
              </h1>
              <div className="flex-row flex gap-2">
                {list.friendsOnly && (
                  <span className="flex items-center gap-1.5 h-6 px-2.5 rounded-md bg-brand-darker text-brand text-[11px] font-bold mb-2">
                    <Users className="w-3 h-3" strokeWidth={2.5} />
                    {c.friendsOnly}
                  </span>
                )}{" "}
                {bookmarkLabel && (
                  <span className="flex items-center gap-1 h-6 px-2 rounded-md bg-surface text-ink-muted text-[11px] font-semibold">
                    <Bookmark
                      className="w-3 h-3"
                      strokeWidth={2.5}
                      fill={isBookmarked ? "currentColor" : "none"}
                    />
                    {c.listSavedBy(bookmarkLabel)}
                  </span>
                )}
              </div>
            </div>
            <div className="px-3 py-2 shrink-0 flex gap-2 items-center justify-end">
              {!isOwnList && (
                <button
                  type="button"
                  aria-label={c.saveList}
                  aria-pressed={isBookmarked}
                  onClick={onToggleBookmark}
                  disabled={!onToggleBookmark}
                  className={clsx(
                    "w-9 h-9 rounded-lg flex items-center justify-center active:scale-90 transition",
                    isBookmarked
                      ? "text-ink bg-surface"
                      : "text-ink-muted hover:text-ink hover:bg-surface",
                  )}
                >
                  <Bookmark
                    className="w-5 h-5"
                    strokeWidth={2}
                    fill={isBookmarked ? "currentColor" : "none"}
                  />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label={copy.picker.close}
                className="w-9 h-9 rounded-lg bg-surface flex items-center justify-center hover:bg-surface-strong shrink-0"
              >
                <X className="w-5 h-5 text-ink" strokeWidth={2.5} />
              </button>
            </div>
          </div>
          {list.description && (
            <p className="text-[14px] text-ink-muted leading-snug">
              {list.description}
            </p>
          )}
          {author && (
            <div className="flex items-center flex-wrap gap-2 mt-2 text-[13px] text-ink-muted">
              <Avatar
                initials={author.initials}
                color={author.avatarColor}
                image={author.avatarImage}
                size={20}
              />
              <span>{c.listBy(author.name)}</span>
              <span>·</span>
              <span>
                {items.length === 1
                  ? c.listCountOne
                  : c.listCount(items.length)}
              </span>
            </div>
          )}
        </div>

        <div className="px-4 mt-3 divide-y divide-black/5">
          {items.map((restaurant) => (
            <ListRestaurantItem
              key={restaurant.id}
              restaurant={restaurant}
              visited={visitedSet.has(restaurant.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
