import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  Star,
  ChevronDown,
  Flame,
  Award,
  X,
  List,
  Navigation,
  SlidersHorizontal,
  Clock3,
  Utensils,
  ArrowUpDown,
  Bookmark,
} from "lucide-react";
import clsx from "clsx";
import { Avatar } from "../components/Avatar";
import { BottomSheet } from "../components/BottomSheet";
import { Pin } from "../components/Pin";
import { restaurants } from "../data/restaurants";
import { deals as allDeals } from "../data/deals";
import { lists } from "../data/lists";
import { usersById } from "../data/users";
import { recommendationsByDealId } from "../data/recommendations";
import { reviewsByRestaurantId } from "../data/reviews";
import { copy } from "../copy";
// Map basemap bundled through Vite (src/img/) so it gets a hashed URL.
import mapImage from "../img/discover-map.png";

// Deals per restaurant, keyed by restaurant id. Build once at module
// load; the deals list is static so we don't need to recompute.
const dealsByRestaurantId = allDeals.reduce((map, d) => {
  if (!map[d.restaurantId]) map[d.restaurantId] = [];
  map[d.restaurantId].push(d);
  return map;
}, {});

// Filter chips — non-functional for now, just visual.
const FILTER_CHIPS = [
  { id: "filters", label: "Filters", Icon: SlidersHorizontal },
  { id: "now", label: "Now", caret: true, Icon: Clock3 },
  { id: "cuisine", label: "Cuisine", caret: true, Icon: Utensils },
  { id: "sort", label: "Sort", caret: true, Icon: ArrowUpDown },
  { id: "flash", label: "Flash Deals", Icon: Flame },
  { id: "loyalty", label: "Loyalty", Icon: Award },
];

// Recommendations older than this are treated as stale — no longer
// shown on the pin badge or in the friend-insight banner.
const RECOMMENDATION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function MapBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 bg-[#f5f1ea] overflow-hidden"
    >
      <img
        src={mapImage}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />
    </div>
  );
}

function SearchBar() {
  return (
    <div className="flex items-center gap-2 h-9 px-3 rounded-full bg-white shadow-[0_2px_8px_-2px_rgba(0,0,0,0.15)] border border-black/5">
      <Search className="w-4 h-4 text-ink-muted shrink-0" strokeWidth={2.25} />
      <span className="text-[14px] text-ink-muted truncate">
        Search deals & more
      </span>
    </div>
  );
}

function FilterChip({ chip }) {
  const Icon = chip.Icon;
  return (
    <span className="shrink-0 inline-flex items-center gap-1 h-8 px-3 rounded-lg bg-white text-ink text-[12px] font-semibold shadow-[0_2px_8px_-2px_rgba(0,0,0,0.15)] border border-black/5">
      {Icon && <Icon className="w-3.5 h-3.5" strokeWidth={2.25} />}
      {chip.label}
      {chip.caret && (
        <ChevronDown className="w-3.5 h-3.5 -mr-0.5" strokeWidth={2.25} />
      )}
    </span>
  );
}

function RoundMapButton({ Icon, label, onClick, active = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={clsx(
        "w-11 h-11 rounded-full bg-white shadow-[0_2px_8px_-2px_rgba(0,0,0,0.18)] flex items-center justify-center hover:bg-surface active:scale-95 transition",
        active ? "border-2 border-ink" : "border border-black/5",
      )}
    >
      <Icon className="w-5 h-5 text-ink" strokeWidth={2.25} />
    </button>
  );
}

function MapControls({ browseMode, onToggleBrowseMode }) {
  return (
    <div className="flex flex-col gap-2">
      <RoundMapButton
        Icon={List}
        label="Your lists"
        active={browseMode === "lists"}
        onClick={onToggleBrowseMode}
      />
      <RoundMapButton Icon={Navigation} label="Use current location" />
    </div>
  );
}

// One row in the "Browse all deals" drawer — image, name, rating /
// category / distance, and the deal pills. Whole row is a button when
// `onOpen` is wired so tapping anywhere jumps to RestaurantDetailPage.
function RestaurantRow({ restaurant, deals, onOpen }) {
  const c = copy.detailPage;
  const Tag = onOpen ? "button" : "article";
  return (
    <Tag
      type={onOpen ? "button" : undefined}
      onClick={onOpen}
      className={clsx(
        "w-full text-left flex items-center gap-3 p-2 rounded-lg",
        onOpen &&
          "cursor-pointer hover:bg-surface/40 active:bg-surface/60 transition-colors",
      )}
    >
      <img
        src={restaurant.image}
        alt=""
        className="w-14 h-14 rounded-lg object-cover shrink-0"
      />
      <div className="flex-1 min-w-0">
        <h3 className="text-[15px] font-bold text-ink truncate leading-tight">
          {restaurant.name}
        </h3>
        <p className="text-[12px] text-ink-muted truncate flex items-center gap-1 mt-0.5">
          <Star
            className="w-3 h-3 fill-brand-darker text-brand-darker shrink-0"
            strokeWidth={0}
          />
          <span className="font-semibold text-ink">{restaurant.rating}</span>
          <span>({restaurant.reviews})</span>
          <span>·</span>
          <span className="truncate">{restaurant.category}</span>
          <span>·</span>
          <span>{c.distance(restaurant.distanceKm)}</span>
        </p>
        {deals?.length > 0 && (
          <div className="mt-1.5 flex flex-nowrap gap-1 overflow-x-auto no-scrollbar">
            {deals.map((deal) => (
              <span
                key={deal.id}
                className="shrink-0 inline-flex items-center py-0.5 px-2 rounded-lg bg-brand text-ink text-[11px] font-bold"
              >
                {deal.title}
              </span>
            ))}
          </div>
        )}
      </div>
    </Tag>
  );
}

// One row in the "Bookmarked lists" drawer. Tapping the row body
// selects the list (which filters pins + swaps the drawer to list
// detail). Tapping the author's avatar specifically opens
// UserDetailPage.
function ListRow({ list, viewerId, onSelect, onOpenUser }) {
  const author = usersById[list.userId];
  const count = list.restaurantIds.length;
  const previewRestaurants = list.restaurantIds
    .slice(0, 3)
    .map((id) => restaurants.find((r) => r.id === id))
    .filter(Boolean);
  const authorClickable = !!author && !!onOpenUser && author.id !== viewerId;
  const authorLabel = author?.id === viewerId ? "You" : author?.name;
  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full text-left flex items-center gap-3 p-2 rounded-lg hover:bg-surface/40 active:bg-surface/60 transition-colors"
    >
      <div className="w-14 h-14 rounded-lg overflow-hidden bg-surface grid grid-cols-2 grid-rows-2 shrink-0">
        {previewRestaurants.map((restaurant) => (
          <img
            key={restaurant.id}
            src={restaurant.image}
            alt=""
            className="w-full h-full object-cover"
          />
        ))}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-[15px] font-bold text-ink truncate leading-tight">
          {list.name}
        </h3>
        <div className="flex items-center gap-1.5 text-[12px] text-ink-muted truncate mt-0.5">
          {author && (
            <span
              role={authorClickable ? "button" : undefined}
              tabIndex={authorClickable ? 0 : undefined}
              onClick={
                authorClickable
                  ? (e) => {
                      e.stopPropagation();
                      onOpenUser(author.id);
                    }
                  : undefined
              }
              className={clsx(
                "inline-flex items-center gap-1 shrink-0",
                authorClickable && "cursor-pointer hover:opacity-80",
              )}
            >
              <Avatar
                initials={author.initials}
                color={author.avatarColor}
                image={author.avatarImage}
                size={16}
              />
              <span>{authorLabel}</span>
            </span>
          )}
          <span>·</span>
          <span>{count === 1 ? "1 spot" : `${count} spots`}</span>
        </div>
        {list.description && (
          <p className="text-[12px] text-ink-muted truncate mt-1">
            {list.description}
          </p>
        )}
      </div>
    </button>
  );
}

// Header + restaurant rows for a single selected list. Sits in the
// drawer when the user picks a list to drill into. Top-right always
// has an X to back out; lists owned by someone else also get a
// filled bookmark button next to it (taps un-bookmark + close the
// detail, since the list would no longer be in the drawer).
function ListDetailView({
  list,
  listRestaurants,
  viewerId,
  onOpenUser,
  onOpenRestaurant,
  onClose,
  onUnbookmark,
}) {
  const author = usersById[list.userId];
  const authorClickable = !!author && !!onOpenUser && author.id !== viewerId;
  const authorLabel = author?.id === viewerId ? "You" : author?.name;
  const isOwn = author?.id === viewerId;
  return (
    <>
      <div className="px-4 pt-1 pb-3 shrink-0 relative pr-20">
        <div className="absolute top-0 right-3 flex items-center gap-1.5">
          {!isOwn && onUnbookmark && (
            <button
              type="button"
              onClick={onUnbookmark}
              aria-label="Remove bookmark"
              className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-ink hover:bg-surface-strong active:scale-95 transition"
            >
              <Bookmark
                className="w-4 h-4"
                strokeWidth={2}
                fill="currentColor"
              />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close list"
            className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-ink-muted hover:text-ink hover:bg-surface-strong active:scale-95 transition"
          >
            <X className="w-4 h-4" strokeWidth={2.25} />
          </button>
        </div>
        <h2 className="text-[17px] font-bold text-ink leading-tight">
          {list.name}
        </h2>
        {author && (
          <div className="flex items-center gap-1.5 text-[12px] text-ink-muted mt-1">
            <span
              role={authorClickable ? "button" : undefined}
              tabIndex={authorClickable ? 0 : undefined}
              onClick={
                authorClickable ? () => onOpenUser(author.id) : undefined
              }
              className={clsx(
                "inline-flex items-center gap-1",
                authorClickable && "cursor-pointer hover:opacity-80",
              )}
            >
              <Avatar
                initials={author.initials}
                color={author.avatarColor}
                image={author.avatarImage}
                size={16}
              />
              <span>{authorLabel}</span>
            </span>
            <span>·</span>
            <span>
              {list.restaurantIds.length === 1
                ? "1 spot"
                : `${list.restaurantIds.length} spots`}
            </span>
          </div>
        )}
        {list.description && (
          <p className="text-[12px] text-ink-muted mt-1.5 leading-snug">
            {list.description}
          </p>
        )}
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar px-3 pb-3 divide-y divide-black/5">
        {listRestaurants.map((restaurant) => (
          <RestaurantRow
            key={restaurant.id}
            restaurant={restaurant}
            deals={dealsByRestaurantId[restaurant.id] ?? []}
            onOpen={onOpenRestaurant ? () => onOpenRestaurant(restaurant.id) : undefined}
          />
        ))}
      </div>
    </>
  );
}

// Drawer content. Three pages — list detail (drill-in), lists
// (browse), deals (browse). Wrapped in AnimatePresence so swapping
// between them slides + fades instead of cutting.
function BrowseSheetContent({
  mode,
  dealItems,
  listItems,
  selectedList,
  listRestaurants,
  viewerId,
  onSelectList,
  onOpenUser,
  onOpenRestaurant,
  onCloseList,
  onUnbookmarkList,
  onExitListsMode,
}) {
  // Stable key per page so AnimatePresence can run an exit + enter
  // when the user navigates between modes.
  const pageKey = selectedList ? `list-${selectedList.id}` : mode;
  return (
    <div className="relative flex-1 min-h-0 flex flex-col">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={pageKey}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="absolute inset-0 flex flex-col"
        >
          {selectedList ? (
            <ListDetailView
              list={selectedList}
              listRestaurants={listRestaurants}
              viewerId={viewerId}
              onOpenUser={onOpenUser}
              onOpenRestaurant={onOpenRestaurant}
              onClose={onCloseList}
              onUnbookmark={onUnbookmarkList}
            />
          ) : (
            <>
              <div className="px-4 pt-3 pb-2 shrink-0 flex items-center justify-between gap-3">
                <h2 className="text-[15px] font-bold text-ink truncate">
                  {mode === "lists" ? "Your lists" : "Browse all deals"}
                </h2>
                {mode === "lists" && onExitListsMode && (
                  <button
                    type="button"
                    onClick={onExitListsMode}
                    aria-label="Close lists"
                    className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-ink-muted hover:text-ink hover:bg-surface-strong active:scale-95 transition shrink-0"
                  >
                    <X className="w-4 h-4" strokeWidth={2.25} />
                  </button>
                )}
              </div>
              <div className="flex-1 overflow-y-auto no-scrollbar px-3 pb-3 divide-y divide-black/5">
                {mode === "lists"
                  ? listItems.map((list) => (
                      <ListRow
                        key={list.id}
                        list={list}
                        viewerId={viewerId}
                        onSelect={() => onSelectList(list.id)}
                        onOpenUser={onOpenUser}
                      />
                    ))
                  : dealItems.map(({ restaurant, deals }) => (
                      <RestaurantRow
                        key={restaurant.id}
                        restaurant={restaurant}
                        deals={deals}
                        onOpen={
                          onOpenRestaurant
                            ? () => onOpenRestaurant(restaurant.id)
                            : undefined
                        }
                      />
                    ))}
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Returns every relevant friend insight for this restaurant, in
// display priority order:
//   1. Targeted recommendations from friends → viewer, freshest first.
//   2. Friend reviews on this restaurant, freshest first.
// Tapping the banner cycles through whatever's in the array, so the
// viewer can see all friends' takes — not just the highest-priority one.
function collectFriendInsights(restaurant, user, recsByDealId) {
  if (!user) return [];
  const friendSet = new Set(user.friendIds ?? []);
  if (friendSet.size === 0) return [];
  const now = Date.now();
  const restaurantDealIds = allDeals
    .filter((d) => d.restaurantId === restaurant.id)
    .map((d) => d.id);
  const recs = [];
  for (const dealId of restaurantDealIds) {
    for (const rec of recsByDealId[dealId] ?? []) {
      if (rec.userId === user.id) continue;
      if (rec.targetUserId !== user.id) continue;
      if (!friendSet.has(rec.userId)) continue;
      if (now - (rec.createdAt ?? 0) > RECOMMENDATION_TTL_MS) continue;
      recs.push(rec);
    }
  }
  recs.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  const reviews = (reviewsByRestaurantId[restaurant.id] ?? [])
    .filter((r) => friendSet.has(r.userId))
    .sort((a, b) => (a.ageDays ?? Infinity) - (b.ageDays ?? Infinity));
  return [
    ...recs.map((r) => ({
      key: `rec-${r.dealId}-${r.userId}-${r.createdAt ?? 0}`,
      kind: "rec",
      author: usersById[r.userId],
      text: r.message || null,
    })),
    ...reviews.map((r) => ({
      key: `review-${r.id}`,
      kind: "review",
      author: usersById[r.userId],
      text: r.text || null,
    })),
  ].filter((entry) => entry.author);
}

// Count of non-stale friend → viewer recommendations across every
// deal at this restaurant — drives the pin's badge.
function countActiveRecommendations(restaurant, user, recsByDealId) {
  if (!user) return 0;
  const friendSet = new Set(user.friendIds ?? []);
  if (friendSet.size === 0) return 0;
  const now = Date.now();
  let count = 0;
  for (const deal of allDeals) {
    if (deal.restaurantId !== restaurant.id) continue;
    for (const rec of recsByDealId[deal.id] ?? []) {
      if (rec.userId === user.id) continue;
      if (rec.targetUserId !== user.id) continue;
      if (!friendSet.has(rec.userId)) continue;
      if (now - (rec.createdAt ?? 0) > RECOMMENDATION_TTL_MS) continue;
      count++;
    }
  }
  return count;
}

// Selected-restaurant card with an optional friend-insight banner on
// top. The banner shows ONE friend's take at a time — tap the quote
// to cycle to the next friend's insight. Two visual variants:
//   • rec  → brand-darker bg + white text + brand-green name.
//   • review → white bg + ink text + border-bottom divider.
function SelectedRestaurantCard({
  restaurant,
  deals,
  friendInsights,
  insightIndex,
  onCycleInsight,
  onSelectInsight,
  onOpen,
  onClose,
  onOpenUser,
}) {
  const c = copy.detailPage;
  const friendInsight = friendInsights[insightIndex] ?? null;
  const insightAuthor = friendInsight?.author;
  const insightAuthorClickable = !!insightAuthor && !!onOpenUser;
  const canCycle = friendInsights.length > 1;
  return (
    <article className="mx-3 mb-4 bg-white rounded-lg pointer-events-auto shadow-[0_8px_24px_-8px_rgba(0,0,0,0.25)] overflow-hidden relative">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-2 right-2 z-10 w-7 h-7 rounded-lg bg-white/80 backdrop-blur-sm flex items-center justify-center text-ink-muted hover:text-ink hover:bg-white active:scale-95 transition"
      >
        <X className="w-4 h-4" strokeWidth={2.25} />
      </button>

      {friendInsight && insightAuthor && (
        <div
          role={canCycle ? "button" : undefined}
          tabIndex={canCycle ? 0 : undefined}
          onClick={canCycle ? onCycleInsight : undefined}
          onKeyDown={
            canCycle
              ? (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onCycleInsight?.();
                  }
                }
              : undefined
          }
          aria-label={canCycle ? "Show next friend's take" : undefined}
          className={clsx(
            "px-3 pt-3 transition-colors duration-200 select-none",
            canCycle
              ? "pb-2 cursor-pointer active:opacity-90"
              : "pb-3",
            friendInsight.kind === "rec"
              ? "bg-brand-darker text-white"
              : "bg-white text-ink border-b border-black/5",
          )}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={friendInsight.key}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="flex gap-2 items-start"
            >
              <button
                type="button"
                onClick={(e) => {
                  // Avatar tap opens the author's profile — don't let
                  // it bubble up to the banner's cycle handler.
                  e.stopPropagation();
                  if (insightAuthorClickable) onOpenUser(insightAuthor.id);
                }}
                disabled={!insightAuthorClickable}
                className={clsx(
                  "shrink-0",
                  insightAuthorClickable &&
                    "cursor-pointer active:scale-95 transition",
                )}
              >
                <Avatar
                  initials={insightAuthor.initials}
                  color={insightAuthor.avatarColor}
                  image={insightAuthor.avatarImage}
                  size={28}
                  ring
                />
              </button>
              <div className="flex-1 min-w-0 pr-8">
                <p className="text-[13px] font-semibold leading-tight truncate">
                  <span
                    className={
                      friendInsight.kind === "rec" ? "text-brand" : "text-ink"
                    }
                  >
                    {insightAuthor.name}
                  </span>{" "}
                  <span
                    className={
                      friendInsight.kind === "rec"
                        ? "text-white/85 font-medium"
                        : "text-ink-muted font-medium"
                    }
                  >
                    {friendInsight.kind === "rec"
                      ? "recommended to you"
                      : "was here"}
                  </span>
                </p>
                {friendInsight.text && (
                  <p
                    className={clsx(
                      "text-[12px] mt-0.5 leading-snug line-clamp-3",
                      friendInsight.kind === "rec"
                        ? "text-white/85"
                        : "text-ink-muted",
                    )}
                  >
                    “{friendInsight.text}”
                  </p>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {canCycle && (
            <div
              role="tablist"
              aria-label="Friend takes"
              className="flex justify-center items-center gap-1.5 mt-2"
            >
              {friendInsights.map((entry, i) => {
                const isActive = i === insightIndex;
                return (
                  <button
                    key={entry.key}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-label={`Show take ${i + 1}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectInsight?.(i);
                    }}
                    className="p-1 -m-1 cursor-pointer"
                  >
                    <motion.span
                      animate={{
                        scale: isActive ? 1 : 0.7,
                        opacity: isActive ? 1 : 0.4,
                      }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className={clsx(
                        "block w-1.5 h-1.5 rounded-full",
                        friendInsight.kind === "rec" ? "bg-white" : "bg-ink",
                      )}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {(() => {
        const BodyTag = onOpen ? "button" : "div";
        return (
          <BodyTag
            type={onOpen ? "button" : undefined}
            onClick={onOpen}
            className={clsx(
              "w-full text-left p-3 flex items-start gap-3",
              onOpen &&
                "cursor-pointer hover:bg-surface/40 active:bg-surface/60 transition-colors",
            )}
          >
            <img
              src={restaurant.image}
              alt=""
              className="w-16 h-16 rounded-lg object-cover shrink-0"
            />
            <div className="flex-1 min-w-0 pr-6">
              <h3 className="text-[16px] font-bold text-ink truncate leading-tight">
                {restaurant.name}
              </h3>
              <p className="text-[12px] text-ink-muted truncate flex items-center gap-1 mt-0.5">
                <Star
                  className="w-3 h-3 fill-brand-darker text-brand-darker shrink-0"
                  strokeWidth={0}
                />
                <span className="font-semibold text-ink">
                  {restaurant.rating}
                </span>
                <span>({restaurant.reviews})</span>
                <span>·</span>
                <span className="truncate">{restaurant.category}</span>
                <span>·</span>
                <span>{c.distance(restaurant.distanceKm)}</span>
              </p>
              {deals?.length > 0 && (
                <div className="mt-1.5 flex flex-nowrap gap-1 overflow-x-auto no-scrollbar">
                  {deals.map((deal) => (
                    <span
                      key={deal.id}
                      className="shrink-0 inline-flex items-center py-0.5 px-2 rounded-lg bg-brand text-ink text-[11px] font-bold"
                    >
                      {deal.title}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </BodyTag>
        );
      })()}
    </article>
  );
}

function getDiscoverLists(user, bookmarkedListIds) {
  if (!user) return [];
  const bookmarkSet = new Set(bookmarkedListIds);
  const friendSet = new Set(user.friendIds ?? []);
  return lists
    .filter((list) => {
      const isOwn = list.userId === user.id;
      const isBookmarked = bookmarkSet.has(list.id);
      const isFriend = friendSet.has(list.userId);
      const isVisible = !list.friendsOnly || isOwn || isFriend;
      return isVisible && (isOwn || isBookmarked);
    })
    .map((list) => ({ ...list, viewerId: user.id }))
    .sort((a, b) => {
      const aPinned =
        Number(a.userId === user.id) + Number(bookmarkSet.has(a.id));
      const bPinned =
        Number(b.userId === user.id) + Number(bookmarkSet.has(b.id));
      return bPinned - aPinned || (b.createdAt ?? 0) - (a.createdAt ?? 0);
    })
    .slice(0, 10);
}

export function DiscoverScreen({
  user,
  bookmarkedListIds = [],
  recommendationsByDealIdForViewer = recommendationsByDealId,
  onOpenUser,
  onOpenRestaurant,
  onToggleListBookmark,
}) {
  const [selectedId, setSelectedId] = useState(null);
  const [selectedListId, setSelectedListId] = useState(null);
  const [browseMode, setBrowseMode] = useState("deals");

  const dealItems = useMemo(() => {
    return restaurants
      .map((r) => ({ restaurant: r, deals: dealsByRestaurantId[r.id] ?? [] }))
      .filter((row) => row.deals.length > 0);
  }, []);
  const discoverLists = useMemo(
    () => getDiscoverLists(user, bookmarkedListIds),
    [user, bookmarkedListIds],
  );
  const selectedList = selectedListId
    ? (discoverLists.find((l) => l.id === selectedListId) ?? null)
    : null;
  // When a single list is selected, pins filter to that list. When
  // browse-mode is "lists" but no specific list selected, pins show
  // every restaurant that appears in any visible list.
  const listScopeIds = useMemo(() => {
    if (selectedList) return new Set(selectedList.restaurantIds);
    if (browseMode === "lists") {
      const ids = new Set();
      for (const l of discoverLists)
        for (const id of l.restaurantIds) ids.add(id);
      return ids;
    }
    return null;
  }, [selectedList, browseMode, discoverLists]);
  const visibleRestaurants = useMemo(() => {
    const base = listScopeIds
      ? restaurants.filter((r) => listScopeIds.has(r.id))
      : restaurants;
    return base.filter((r) => r.mapX != null && r.mapY != null);
  }, [listScopeIds]);
  const listRestaurants = useMemo(() => {
    if (!selectedList) return [];
    return selectedList.restaurantIds
      .map((id) => restaurants.find((r) => r.id === id))
      .filter(Boolean);
  }, [selectedList]);

  const selected = selectedId
    ? (restaurants.find((r) => r.id === selectedId) ?? null)
    : null;
  const selectedDeals = selected
    ? (dealsByRestaurantId[selected.id] ?? [])
    : [];
  const friendInsights = useMemo(
    () =>
      selected
        ? collectFriendInsights(
            selected,
            user,
            recommendationsByDealIdForViewer,
          )
        : [],
    [selected, user, recommendationsByDealIdForViewer],
  );
  // Cursor into friendInsights — resets whenever the user picks a new
  // pin so the banner always opens on the highest-priority entry.
  const [insightIndex, setInsightIndex] = useState(0);
  useEffect(() => {
    setInsightIndex(0);
  }, [selectedId, friendInsights.length]);
  const handleCycleInsight = () => {
    if (friendInsights.length <= 1) return;
    setInsightIndex((i) => (i + 1) % friendInsights.length);
  };

  // Sheet snap is a real state so the BottomSheet's drag handler can
  // update it (via onSnapChange) AND so we can force-snap it from
  // outside on certain navigations. The effect below pushes the sheet
  // to "compact" whenever the user enters list-mode (either by
  // toggling the List button or by picking a specific list); back to
  // "peek" when they leave both states. Once snapped, the user is
  // free to drag between snaps normally.
  const [sheetSnap, setSheetSnap] = useState("peek");
  const listsActive = !!selectedList || browseMode === "lists";
  useEffect(() => {
    setSheetSnap(listsActive ? "compact" : "peek");
  }, [listsActive]);

  function handlePinClick(restaurantId) {
    setSelectedId((prev) => (prev === restaurantId ? null : restaurantId));
  }

  function handleToggleBrowseMode() {
    setBrowseMode((prev) => (prev === "lists" ? "deals" : "lists"));
    setSelectedId(null);
    setSelectedListId(null);
  }

  function handleSelectList(listId) {
    setSelectedListId(listId);
    setSelectedId(null);
  }

  function handleBackdropClick() {
    // Layered dismissal:
    //   1. If a restaurant pin is selected, drop the selection.
    //   2. Else if a list is being viewed in detail, back out to the
    //      list of lists.
    //   3. Else if we're in list-browse mode, fall back to deals.
    if (selected) {
      setSelectedId(null);
    } else if (selectedListId) {
      setSelectedListId(null);
    } else if (browseMode === "lists") {
      setBrowseMode("deals");
    }
  }

  const showBackdrop = !!selected || !!selectedListId || browseMode === "lists";

  return (
    <div className="relative w-full h-full overflow-hidden bg-surface">
      <MapBackdrop />

      {showBackdrop && (
        <button
          type="button"
          aria-label="Clear selection"
          onClick={handleBackdropClick}
          className="absolute inset-0 z-5 cursor-default bg-transparent"
        />
      )}

      {/* Pin layer — one Pin per restaurant. The motion wrapper does
          the positioning (so framer-motion's transform composes cleanly
          with the bottom-tip anchor) and animates pins in/out when the
          filter set changes (list-mode toggle, specific list pick). */}
      <AnimatePresence initial={false}>
        {visibleRestaurants.map((r) => {
          const count = countActiveRecommendations(
            r,
            user,
            recommendationsByDealIdForViewer,
          );
          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, scale: 0.5, x: "-50%", y: "-100%" }}
              animate={{ opacity: 1, scale: 1, x: "-50%", y: "-100%" }}
              exit={{ opacity: 0, scale: 0.5, x: "-50%", y: "-100%" }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              style={{
                left: `${r.mapX}%`,
                top: `${r.mapY}%`,
                transformOrigin: "50% 100%",
              }}
              className="absolute z-10"
            >
              <Pin
                size={32}
                selected={r.id === selectedId}
                recommendationCount={count}
                onClick={() => handlePinClick(r.id)}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Top chrome — sits below the global StatusBar on desktop
          (top-11); on mobile the fake StatusBar isn't rendered so we
          tuck right up to top-0. */}
      <div className="absolute top-0 md:top-11 inset-x-0 px-3 pt-3 flex flex-col gap-2">
        <SearchBar />
        <div className="flex gap-1 overflow-x-auto no-scrollbar -mx-3 px-3">
          {FILTER_CHIPS.map((chip) => (
            <FilterChip key={chip.id} chip={chip} />
          ))}
        </div>
      </div>

      {/* Bottom stack — selected card slides in/out above the drawer. */}
      <div className="absolute inset-x-0 bottom-0 z-80 flex flex-col pointer-events-none">
        <AnimatePresence mode="popLayout">
          {selected && (
            <motion.div
              key={`card-${selected.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="pointer-events-auto"
            >
              <SelectedRestaurantCard
                restaurant={selected}
                deals={selectedDeals}
                friendInsights={friendInsights}
                insightIndex={insightIndex}
                onCycleInsight={handleCycleInsight}
                onSelectInsight={setInsightIndex}
                onOpen={
                  onOpenRestaurant
                    ? () => onOpenRestaurant(selected.id)
                    : undefined
                }
                onClose={() => setSelectedId(null)}
                onOpenUser={onOpenUser}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Drawer when no card is selected. Snap controlled externally
          so the sheet expands to medium height while a list is being
          drilled into. */}
      {!selected && (
        <BottomSheet
          open
          snap={sheetSnap}
          onSnapChange={setSheetSnap}
          showBackdrop={false}
          dismissible={false}
          hideFloatingControlsAtFull
          onClose={handleBackdropClick}
          floatingControls={
            <MapControls
              browseMode={browseMode}
              onToggleBrowseMode={handleToggleBrowseMode}
            />
          }
        >
          <BrowseSheetContent
            mode={browseMode}
            dealItems={dealItems}
            listItems={discoverLists}
            selectedList={selectedList}
            listRestaurants={listRestaurants}
            viewerId={user?.id}
            onSelectList={handleSelectList}
            onOpenUser={onOpenUser}
            onOpenRestaurant={onOpenRestaurant}
            onCloseList={() => setSelectedListId(null)}
            onUnbookmarkList={
              selectedList && onToggleListBookmark
                ? () => {
                    onToggleListBookmark(selectedList.id);
                    setSelectedListId(null);
                  }
                : undefined
            }
            onExitListsMode={() => {
              setBrowseMode("deals");
              setSelectedListId(null);
            }}
          />
        </BottomSheet>
      )}
    </div>
  );
}
