import { useMemo, useState } from "react";
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
  UserRound,
} from "lucide-react";
import clsx from "clsx";
import { BottomSheet } from "../components/BottomSheet";
import { Pin } from "../components/Pin";
import { restaurants } from "../data/restaurants";
import { deals as allDeals } from "../data/deals";
import { lists } from "../data/lists";
import { usersById } from "../data/users";
import { recommendationsByDealId } from "../data/recommendations";
import { copy } from "../copy";

// Deals per restaurant, keyed by restaurant id. Build once at
// module load; the deals list is static so we don't need to recompute.
const dealsByRestaurantId = allDeals.reduce((map, d) => {
  if (!map[d.restaurantId]) map[d.restaurantId] = [];
  map[d.restaurantId].push(d);
  return map;
}, {});
// Map basemap is bundled through Vite (src/img/) so it gets a hashed
// production URL. Drop a different file in src/img/ and update this
// import path to swap in a new map.
import mapImage from "../img/discover-map.png";

// Filter chips — non-functional for now, just visual. Mirrors the
// reference site's row order so once the real filter sheets land it's
// a 1:1 swap.
const FILTER_CHIPS = [
  { id: "filters", label: "Filters", Icon: SlidersHorizontal },
  { id: "now", label: "Now", caret: true, Icon: Clock3 },
  { id: "cuisine", label: "Cuisine", caret: true, Icon: Utensils },
  { id: "sort", label: "Sort", caret: true, Icon: ArrowUpDown },
  { id: "flash", label: "Flash Deals", Icon: Flame },
  { id: "loyalty", label: "Loyalty", Icon: Award },
];

const RECOMMENDATION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

// Map backdrop — single static basemap image. Cream fallback under the
// img keeps the panel looking deliberate if the asset ever 404s.
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

// Non-functional search bar — pure visual chrome for the bare-bones
// pass. Inputs and chips don't fire any handlers yet.
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

// Floating round control button — sits in the right-stacked map
// controls (list view + locate-me). Bell on the phone chrome is the
// other place we explicitly want a round button, otherwise this is
// the only spot in the project that uses rounded-full on a button.
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

// One row in the "Browse all deals" drawer — image, name, rating /
// category / distance, and the deal pill.
function RestaurantRow({ restaurant, deals }) {
  const c = copy.detailPage;
  return (
    <article className="flex items-center gap-3 p-2 rounded-lg">
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
          <div className="mt-1.5 flex flex-wrap gap-1">
            {deals.map((deal) => (
              <span
                key={deal.id}
                className="inline-flex items-center py-0.5 px-2 rounded-lg bg-brand text-ink text-[11px] font-bold"
              >
                {deal.title}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

// Persistent "Browse all deals" drawer — peeks up from the bottom of
// the panel with a scrollable list of every restaurant that currently
// has a deal. Hidden when a single pin is selected (its card takes
// this slot instead).
function ListRow({ list }) {
  const author = usersById[list.userId];
  const count = list.restaurantIds.length;
  const previewRestaurants = list.restaurantIds
    .slice(0, 3)
    .map((id) => restaurants.find((r) => r.id === id))
    .filter(Boolean);
  return (
    <article className="flex items-center gap-3 p-2 rounded-lg">
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
        <p className="text-[12px] text-ink-muted truncate flex items-center gap-1 mt-0.5">
          <UserRound className="w-3 h-3 shrink-0" strokeWidth={2.25} />
          <span>{author?.id === list.viewerId ? "Me" : author?.name}</span>
          <span>·</span>
          <span>{count === 1 ? "1 spot" : `${count} spots`}</span>
        </p>
        {list.description && (
          <p className="text-[12px] text-ink-muted truncate mt-1">
            {list.description}
          </p>
        )}
      </div>
    </article>
  );
}

function MapControls({ browseMode, onToggleBrowseMode }) {
  return (
    <div className="flex flex-col gap-2">
      <RoundMapButton
        Icon={List}
        label="Bookmarked lists"
        active={browseMode === "lists"}
        onClick={onToggleBrowseMode}
      />
      <RoundMapButton Icon={Navigation} label="Use current location" />
    </div>
  );
}

function BrowseSheetContent({ mode, dealItems, listItems }) {
  return (
    <>
      <div className="px-4 pt-3 pb-2 shrink-0">
        <h2 className="text-[15px] font-bold text-ink">
          {mode === "lists" ? "Bookmarked lists" : "Browse all deals"}
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar px-3 pb-3 divide-y divide-black/5">
        {mode === "lists"
          ? listItems.map((list) => <ListRow key={list.id} list={list} />)
          : dealItems.map(({ restaurant, deals }) => (
              <RestaurantRow
                key={restaurant.id}
                restaurant={restaurant}
                deals={deals}
              />
            ))}
      </div>
    </>
  );
}

// Selected-restaurant card — replaces the drawer when a pin is tapped.
// Mirrors the previous bottom card layout, with an X close in the top-
// right that unselects.
function SelectedRestaurantCard({ restaurant, deals, onClose }) {
  const c = copy.detailPage;
  return (
    <article className="mx-3 mb-4 bg-white rounded-lg  pointer-events-auto shadow-[0_8px_24px_-8px_rgba(0,0,0,0.25)] p-3 flex items-start gap-3 relative">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-surface flex items-center justify-center text-ink-muted hover:text-ink hover:bg-surface-strong active:scale-95 transition"
      >
        <X className="w-4 h-4" strokeWidth={2.25} />
      </button>
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
          <span className="font-semibold text-ink">{restaurant.rating}</span>
          <span>({restaurant.reviews})</span>
          <span>·</span>
          <span className="truncate">{restaurant.category}</span>
          <span>·</span>
          <span>{c.distance(restaurant.distanceKm)}</span>
        </p>
        {deals?.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {deals.map((deal) => (
              <span
                key={deal.id}
                className="inline-flex items-center py-0.5 px-2 rounded-lg bg-brand text-ink text-[11px] font-bold"
              >
                {deal.title}
              </span>
            ))}
          </div>
        )}
      </div>
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

function hasActiveFriendRecommendation(
  restaurant,
  user,
  recommendationsByDealIdForViewer,
) {
  if (!user) return false;
  const friendSet = new Set(user.friendIds ?? []);
  const now = Date.now();
  return allDeals
    .filter((deal) => deal.restaurantId === restaurant.id)
    .some((deal) =>
      (recommendationsByDealIdForViewer[deal.id] ?? []).some(
        (rec) =>
          rec.targetUserId === user.id &&
          rec.userId !== user.id &&
          friendSet.has(rec.userId) &&
          now - (rec.createdAt ?? 0) <= RECOMMENDATION_TTL_MS,
      ),
    );
}

export function DiscoverScreen({
  user,
  bookmarkedListIds = [],
  recommendationsByDealIdForViewer = recommendationsByDealId,
}) {
  const [selectedId, setSelectedId] = useState(null);
  const [browseMode, setBrowseMode] = useState("deals");

  // Restaurants with at least one deal — drives both the "Browse all
  // deals" list and the social-proof pseudo-data on the selected card.
  const dealItems = useMemo(() => {
    return restaurants
      .map((r) => ({ restaurant: r, deals: dealsByRestaurantId[r.id] ?? [] }))
      .filter((row) => row.deals.length > 0);
  }, []);
  const discoverLists = useMemo(
    () => getDiscoverLists(user, bookmarkedListIds),
    [user, bookmarkedListIds],
  );
  const listRestaurantIds = useMemo(() => {
    const ids = new Set();
    for (const list of discoverLists) {
      for (const id of list.restaurantIds) ids.add(id);
    }
    return ids;
  }, [discoverLists]);
  const visibleRestaurants = useMemo(() => {
    const base =
      browseMode === "lists"
        ? restaurants.filter((r) => listRestaurantIds.has(r.id))
        : restaurants;
    return base.filter((r) => r.mapX != null && r.mapY != null);
  }, [browseMode, listRestaurantIds]);
  const visibleDealItems = useMemo(() => {
    if (browseMode !== "lists") {
      return dealItems;
    }
    return dealItems.filter(({ restaurant }) =>
      listRestaurantIds.has(restaurant.id),
    );
  }, [browseMode, dealItems, listRestaurantIds]);

  const selected = selectedId
    ? (restaurants.find((r) => r.id === selectedId) ?? null)
    : null;
  const selectedDeals = selected
    ? (dealsByRestaurantId[selected.id] ?? [])
    : [];
  function handlePinClick(restaurantId) {
    setSelectedId((prev) => (prev === restaurantId ? null : restaurantId));
  }

  function handleToggleBrowseMode() {
    setBrowseMode((prev) => (prev === "lists" ? "deals" : "lists"));
    setSelectedId(null);
  }

  function handleBackdropClick() {
    // Gradual deselection when clicking outside:
    // 1. If a restaurant is selected, just close it (but keep browse mode)
    // 2. Else if browsing lists, switch back to deals
    // 3. Else do nothing
    if (selected) {
      setSelectedId(null);
    } else if (browseMode === "lists") {
      setBrowseMode("deals");
    }
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-surface">
      {/* Map fills the whole panel — bleeds behind the status bar so
          the basemap reads as a single continuous surface. */}
      <MapBackdrop />

      {selected && (
        <button
          type="button"
          aria-label="Clear selection"
          onClick={handleBackdropClick}
          className="absolute inset-0 z-5 cursor-default bg-transparent"
        />
      )}

      {/* Pin layer — one Pin per restaurant, anchored to its tip at
          (mapX, mapY). Tapping toggles selection. */}
      {visibleRestaurants.map((r) => (
        <Pin
          key={r.id}
          x={r.mapX}
          y={r.mapY}
          size={32}
          selected={r.id === selectedId}
          recommended={hasActiveFriendRecommendation(
            r,
            user,
            recommendationsByDealIdForViewer,
          )}
          onClick={() => handlePinClick(r.id)}
        />
      ))}

      {/* Top chrome — sits below the global StatusBar (top-11). */}
      <div className="absolute top-11 inset-x-0 px-3 pt-3 flex flex-col gap-2">
        <SearchBar />
        <div className="flex gap-1 overflow-x-auto no-scrollbar -mx-3 px-3">
          {FILTER_CHIPS.map((chip) => (
            <FilterChip key={chip.id} chip={chip} />
          ))}
        </div>
      </div>

      {/* Bottom stack — selected card slides in/out. */}
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
                onClose={() => setSelectedId(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Drawer when no card is selected. Buttons stay consistent in floatingControls. */}
      {!selected && (
        <BottomSheet
          open
          initialSnap="peek"
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
            dealItems={visibleDealItems}
            listItems={discoverLists}
          />
        </BottomSheet>
      )}
    </div>
  );
}
