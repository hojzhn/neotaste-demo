import { useState } from "react";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { Star, Bookmark, Users } from "lucide-react";
import { SubTabs } from "./SubTabs";
import { Avatar } from "./Avatar";
import { reviewsByUserId } from "../data/reviews";
import { lists, listsByUserId } from "../data/lists";
import { restaurantsById } from "../data/restaurants";
import { usersById } from "../data/users";
import { copy } from "../copy";

const USER_SUBTABS = [
  { id: "reviews", label: copy.userDetail.reviews },
  { id: "lists", label: copy.userDetail.lists },
];

// Small "N" seal next to the badge label, à la the NeoTaste profile icon.
function NeoBadge() {
  return (
    <span
      aria-hidden="true"
      className="inline-flex items-center justify-center w-5 h-5 rounded-lg bg-loyalty text-ink text-[10px] font-bold shadow-[0_1px_2px_-1px_rgba(0,0,0,0.4)]"
    >
      N
    </span>
  );
}

function StarRow({ value = 0 }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={clsx(
            "w-4 h-4",
            n <= value
              ? "fill-ink text-ink"
              : "fill-surface-strong text-surface-strong",
          )}
          strokeWidth={0}
        />
      ))}
    </span>
  );
}

// Display-only restaurant tile under a review. Originally clickable; kept
// inert for now until the list-page / restaurant-from-profile flows are
// fleshed out.
function ReviewRestaurantTile({ restaurant }) {
  return (
    <div className="w-full text-left flex items-center gap-3 p-3 rounded-lg border border-black/10">
      <img
        src={restaurant.image}
        alt=""
        className="w-14 h-14 rounded-lg object-cover shrink-0"
      />
      <div className="flex-1 min-w-0">
        <h3 className="text-[15px] font-bold text-ink truncate">
          {restaurant.name}
        </h3>
        <p className="text-[12px] text-ink-muted truncate flex items-center gap-1">
          <Star
            className="w-3 h-3 fill-brand-darker text-brand-darker shrink-0"
            strokeWidth={0}
          />
          <span className="font-semibold text-ink">{restaurant.rating}</span>
          <span>({restaurant.reviews})</span>
          <span>·</span>
          <span>{restaurant.distanceKm} km</span>
          <span>·</span>
          <span className="truncate">{restaurant.category}</span>
        </p>
      </div>
    </div>
  );
}

function UserReviewItem({ review }) {
  const restaurant = restaurantsById[review.restaurantId];
  if (!restaurant) return null;

  return (
    <article className="space-y-3 border-b border-black/5 pb-5">
      <div className="flex items-center gap-2 text-[13px] text-ink-muted">
        <StarRow value={review.rating} />
        <span>·</span>
        <span>{copy.detailPage.timeAgoShort(review.ageDays)}</span>
      </div>

      <ReviewRestaurantTile restaurant={restaurant} />

      {review.text && (
        <p className="text-[14px] text-ink leading-snug">{review.text}</p>
      )}
    </article>
  );
}

function formatBookmarkCount(n) {
  if (n == null) return null;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

// List card — square stacked-cover collage on the left + title/meta/desc.
// A bookmark toggle sits in the top-right (with the saved-by-N count
// directly under it), and a "Friends" badge sits in the top-left when the
// list is marked friendsOnly so the viewer can tell at a glance that the
// author intends a smaller audience. Bookmarks are controlled state from
// App, so the saved flag survives navigating away.
function ListCard({
  list,
  isSaved = false,
  showBookmark = true,
  onToggleSave,
  onOpen,
}) {
  const c = copy.userDetail;
  const author = usersById[list.userId];
  const previews = list.restaurantIds
    .map((id) => restaurantsById[id])
    .filter(Boolean);
  const cover = list.coverImage ?? previews[0]?.image ?? null;
  const count = previews.length;
  // Saved count nudges up when the local toggle flips, so the visual
  // feedback for tapping the bookmark feels alive even though there's no
  // persistent following graph in the demo.
  const liveBookmarkCount = (list.bookmarkCount ?? 0) + (isSaved ? 1 : 0);
  const bookmarkLabel = formatBookmarkCount(liveBookmarkCount);

  const BodyEl = onOpen ? "button" : "div";
  const bodyClickable = !!onOpen;

  return (
    <article className="relative">
      <BodyEl
        type={bodyClickable ? "button" : undefined}
        onClick={bodyClickable ? onOpen : undefined}
        className={clsx(
          // Default to a 1px hairline border, upgrade to 2px solid black
          // when the viewer has the list bookmarked. Own lists (no
          // bookmark affordance) stay on the hairline regardless.
          "w-full text-left flex items-center gap-3 p-2 rounded-lg",
          showBookmark ? "pr-14" : "pr-2",
          isSaved && showBookmark
            ? "border-2 border-ink"
            : "border border-black/10",
          bodyClickable &&
            "cursor-pointer hover:bg-surface/40 active:bg-surface/60 transition-colors",
        )}
      >
        <div
          className={`relative w-20 h-20 rounded-lg overflow-hidden bg-surface shrink-0`}
        >
          {cover ? (
            <img src={cover} alt="" className="w-full h-full object-cover" />
          ) : null}

          {previews[1]?.image && (
            <img
              src={previews[1].image}
              alt=""
              className="absolute right-0 bottom-0 w-10 h-10 rounded-lg ring-2 ring-white object-cover"
            />
          )}
          {list.friendsOnly && (
            <span className="absolute top-1 left-1 inline-flex items-center justify-center h-5 w-5 rounded-md bg-brand-darker text-brand text-[10px] font-bold shadow-[0_1px_2px_-1px_rgba(0,0,0,0.4)]">
              <Users className="w-2.5 h-2.5" strokeWidth={2.5} />
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-bold text-ink leading-tight gap-1 ">
            {list.name}
          </h3>
          {list.description && (
            <p className="text-[12px] text-ink-muted mt-0.5 leading-snug line-clamp-2">
              {list.description}
            </p>
          )}
          <div className="flex items-center gap-1.5 mt-1.5 text-[12px] text-ink-muted">
            {author && (
              <>
                <Avatar
                  initials={author.initials}
                  color={author.avatarColor}
                  image={author.avatarImage}
                  size={16}
                />
                <span className="truncate">{author.name}</span>
                <span>·</span>
              </>
            )}
            <span className="shrink-0">
              {count === 1 ? c.listCountOne : c.listCount(count)}
            </span>
          </div>
        </div>
      </BodyEl>
      {showBookmark && (
        <div className="absolute top-2 right-2 flex flex-col items-center gap-0">
          <button
            type="button"
            aria-label={copy.userDetail.saveList}
            aria-pressed={isSaved}
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave?.();
            }}
            disabled={!onToggleSave}
            className={clsx(
              "w-8 h-8 rounded-lg flex items-center justify-center active:scale-90 transition",
              isSaved ? "text-ink" : "text-ink-muted hover:text-ink",
            )}
          >
            <Bookmark
              className="w-5 h-5"
              strokeWidth={2}
              fill={isSaved ? "currentColor" : "none"}
            />
          </button>
          {bookmarkLabel && (
            <span className="text-[10px] font-semibold text-ink-muted -mt-0.5">
              {bookmarkLabel}
            </span>
          )}
        </div>
      )}
    </article>
  );
}

export function UserDetailPage({
  user,
  viewer,
  bookmarkedListIds = [],
  onToggleListBookmark,
  onOpenRestaurant,
  onOpenList,
  onOpenNotifications,
  hasNotifications = false,
}) {
  const [activeTab, setActiveTab] = useState("reviews");
  const c = copy.userDetail;
  const userReviews = reviewsByUserId[user.id] ?? [];
  const allLists = listsByUserId[user.id] ?? [];
  // Friends-only lists are visible to the author themselves and to anyone
  // in their friendIds. Everyone else just never sees them — they don't
  // show up at all (no "locked" placeholder), matching how close-friends
  // content disappears entirely from non-CF viewers on Instagram.
  const isOwnProfile = !!viewer && viewer.id === user.id;
  const viewerIsFriend =
    !!viewer &&
    (isOwnProfile || (user.friendIds?.includes(viewer.id) ?? false));
  const userLists = allLists.filter((l) => !l.friendsOnly || viewerIsFriend);
  // On mypage the Lists tab is split: the user's own lists (no bookmark
  // affordance — you don't bookmark yourself) sit above the lists they've
  // saved from other people (with bookmark filled). Anyone else's profile
  // only shows their own authored lists.
  const savedLists = isOwnProfile
    ? bookmarkedListIds
        .map((id) => lists.find((l) => l.id === id))
        .filter((l) => l && l.userId !== user.id)
    : [];

  // Follow chip is purely cosmetic — no toggle wired up. The label simply
  // reflects whether the viewer is already in the profile owner's friendIds
  // (Arabel ↔ Hicks are seeded as friends, so each sees "Following" on the
  // other's profile by default). On your own profile we hide the chip
  // entirely.
  const followerCount = user.followers ?? 0;

  return (
    <div className="w-full h-full flex flex-col bg-white relative">
      {/* Top-left back chevron and top-right bell are rendered globally
          by PhoneFrame; this spacer reserves their footprint so the
          avatar doesn't slide up underneath. */}
      <div className="shrink-0 min-h-13" aria-hidden="true" />

      <div className="flex-1 overflow-y-auto no-scrollbar pb-8">
        <div className="flex flex-col items-center px-6 pt-2">
          <Avatar
            initials={user.initials}
            color={user.avatarColor}
            image={user.avatarImage}
            size={120}
          />
          <h1 className="text-[28px] font-bold text-ink mt-4 leading-tight">
            {user.name}
          </h1>
          {user.badge && (
            <div className="flex items-center gap-2 mt-2">
              <NeoBadge />
              <span className="text-[15px] text-ink-muted">{user.badge}</span>
            </div>
          )}

          <div className="flex gap-12 mt-5">
            <div className="text-center">
              <p className="text-[20px] font-bold text-ink leading-none">
                {followerCount}
              </p>
              <p className="text-[13px] text-ink-muted mt-1">{c.followers}</p>
            </div>
            <div className="text-center">
              <p className="text-[20px] font-bold text-ink leading-none">
                {user.following ?? 0}
              </p>
              <p className="text-[13px] text-ink-muted mt-1">{c.following}</p>
            </div>
          </div>

          {!isOwnProfile && (
            <span
              className={clsx(
                "mt-5 inline-flex items-center justify-center h-12 px-10 rounded-lg font-bold text-[15px] cursor-default select-none",
                viewerIsFriend ? "bg-surface text-ink" : "bg-brand text-ink",
              )}
            >
              {viewerIsFriend ? c.followingBtn : c.follow}
            </span>
          )}
        </div>

        {/* Sticky SubTabs — pins to the top of the scroll container once
            the profile header scrolls past, matching the
            RestaurantDetailPage behaviour. bg-white covers the content
            below while pinned. */}
        <div className="sticky top-0 z-10 bg-white mt-6">
          <SubTabs
            tabs={USER_SUBTABS}
            active={activeTab}
            onChange={setActiveTab}
          />
        </div>

        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {activeTab === "reviews" ? (
              <div className="px-4 pt-5 space-y-5">
                {userReviews.length === 0 ? (
                  <p className="text-center text-ink-muted py-10 text-[14px]">
                    {c.emptyReviews}
                  </p>
                ) : (
                  userReviews.map((r) => (
                    <UserReviewItem key={r.id} review={r} />
                  ))
                )}
              </div>
            ) : (
              <div className="pt-5 px-3 space-y-5">
                {userLists.length === 0 && savedLists.length === 0 ? (
                  <p className="text-center text-ink-muted py-10 text-[14px]">
                    {c.emptyLists}
                  </p>
                ) : (
                  <>
                    {userLists.length > 0 && (
                      <section className="space-y-3">
                        {isOwnProfile && (
                          <h3 className="px-1 text-[12px] font-semibold uppercase tracking-wide text-ink-muted">
                            {c.yourListsHeader}
                          </h3>
                        )}
                        {userLists.map((l) => (
                          <ListCard
                            key={l.id}
                            list={l}
                            isSaved={bookmarkedListIds.includes(l.id)}
                            // Mypage: your own lists hide the bookmark toggle
                            // entirely — you can't bookmark yourself.
                            showBookmark={!isOwnProfile}
                            onToggleSave={
                              onToggleListBookmark
                                ? () => onToggleListBookmark(l.id)
                                : undefined
                            }
                            onOpen={
                              onOpenList ? () => onOpenList(l.id) : undefined
                            }
                          />
                        ))}
                      </section>
                    )}
                    {isOwnProfile && savedLists.length > 0 && (
                      <section className="space-y-3">
                        <h3 className="px-1 text-[12px] font-semibold uppercase tracking-wide text-ink-muted">
                          {c.savedListsHeader}
                        </h3>
                        {savedLists.map((l) => (
                          <ListCard
                            key={l.id}
                            list={l}
                            isSaved
                            showBookmark
                            onToggleSave={
                              onToggleListBookmark
                                ? () => onToggleListBookmark(l.id)
                                : undefined
                            }
                            onOpen={
                              onOpenList ? () => onOpenList(l.id) : undefined
                            }
                          />
                        ))}
                      </section>
                    )}
                  </>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
