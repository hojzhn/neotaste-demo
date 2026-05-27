import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { usePushPhoneChrome } from "../components/PhoneFrame";
import { SlideInOverlay } from "../components/SlideInOverlay";
import { TabBar } from "../components/TabBar";
import { SubTabs } from "../components/SubTabs";
import { BookingCard } from "../components/BookingCard";
import { HistoryBookingCard } from "../components/HistoryBookingCard";
import { BottomSheet } from "../components/BottomSheet";
import { FriendPicker } from "../components/FriendPicker";
import { MessageSheet } from "../components/MessageSheet";
import { PhoneEntry } from "../components/PhoneEntry";
import { PendingInvitationCard } from "../components/PendingInvitationCard";
import { NotificationsScreen } from "../components/NotificationsScreen";
import { RestaurantDetailPage } from "../components/RestaurantDetailPage";
import { UserDetailPage } from "../components/UserDetailPage";
import { ListDetailPage } from "../components/ListDetailPage";
import { MyProfileScreen } from "./MyProfileScreen";
import { RedeemFlow } from "../components/RedeemFlow";
import { RecommendationSentView } from "../components/RecommendationSentView";
import { WriteReviewSheet } from "../components/WriteReviewSheet";
import { Toast } from "../components/Toast";
import { DiscoverScreen } from "./DiscoverScreen";
import { copy } from "../copy";
import { bookings as seedBookings } from "../data/bookings";
import { restaurantsById } from "../data/restaurants";
import { deals as allDeals, dealsById } from "../data/deals";
import { usersById } from "../data/users";
import { recommendationsByDealId } from "../data/recommendations";
import { lists } from "../data/lists";
import { MAX_CREW } from "../lib/constants";

// Master tab order matches the TabBar visual order (Discover sits left
// of Bookings; Profile sits right of it). Each panel's animate.x is
// computed as (panelIndex - activeIndex) * 100% so the three panels
// slide as a single horizontal track.
const MASTER_TABS = ["discover", "bookings", "profile"];

const SUBTABS = [
  { id: "upcoming", label: copy.bookings.upcoming },
  { id: "history", label: copy.bookings.history },
];

export function BookingsScreen({
  user,
  bookings,
  pendingInvitations = [],
  friends,
  shares = [],
  phoneGiftsUsed = 0,
  phoneGiftLimit,
  onShare,
  onAcceptShare,
  onDeclineShare,
  onCreateBooking,
  onRedeemBooking,
  onSaveReview,
  bookmarkedListIds = [],
  onToggleListBookmark,
  onSetStatusBarTone,
  notificationsSeenAt: notificationsSeenAtProp,
  onMarkNotificationsSeen,
  interactive = true,
}) {
  // flow = null | { booking, type: 'gift' | 'dine', step: 'pick' | 'message', friends?: User[] }
  const [flow, setFlow] = useState(null);
  const [toast, setToast] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  // Which master tab the notifications screen was launched from. Captured
  // when the bell is tapped so the overlay renders inside that tab's
  // panel and slides along with it during master-tab swaps.
  const [notificationsOrigin, setNotificationsOrigin] = useState("bookings");
  const [detailRestaurantId, setDetailRestaurantId] = useState(null);
  const [detailUserId, setDetailUserId] = useState(null);
  const [detailListId, setDetailListId] = useState(null);
  const [redeemingBookingId, setRedeemingBookingId] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState("upcoming");
  // Root tab the user is currently on. Lives alongside detailUserId so the
  // user's own profile feels like a top-level tab swap (bookings slides
  // left, profile slides in from the right at the same time) while
  // *other* users' profiles still ride in as a stacked overlay.
  const [rootView, setRootView] = useState("bookings");
  const isOnProfile = rootView === "profile";
  const isOnBookings = rootView === "bookings";
  const isOnDiscover = rootView === "discover";
  const activeTabIndex = MASTER_TABS.indexOf(rootView);
  function panelOffset(panelView) {
    return `${(MASTER_TABS.indexOf(panelView) - activeTabIndex) * 100}%`;
  }
  // Overlays (RestaurantDetail / UserDetail / Notifications) are
  // SlideInOverlay panels — they translate left along with the Bookings
  // tab when the user swaps to Profile, so the visual feeling is "the
  // overlay + the bookings page leave together, profile arrives." When
  // the user taps Bookings from Profile and an overlay is still open we
  // need to close it AND swap the tab at the same time; the overlay's
  // exit would otherwise sweep across the entire screen, so this flag
  // forces a zero-duration exit for that one frame.
  const [snapCloseOverlays, setSnapCloseOverlays] = useState(false);
  const [recommendDetailsBookingId, setRecommendDetailsBookingId] =
    useState(null);
  const [reviewingBookingId, setReviewingBookingId] = useState(null);
  // The review sheet has two steps (rate → recommend). Opening it from
  // the star/body affordances starts at "rate"; opening from the
  // ThumbsUp button when there's no recommendation yet jumps straight
  // to "recommend".
  const [reviewingInitialStep, setReviewingInitialStep] = useState("rate");

  function openReviewSheet(bookingId, step = "rate") {
    setReviewingBookingId(bookingId);
    setReviewingInitialStep(step);
  }
  const seenShareIdsRef = useRef(new Set());
  // Ref to the main bookings scroll container so the Bookings tab in the
  // bottom nav can smooth-scroll back to the top when the user re-taps it
  // while already on the bookings page.
  const scrollContainerRef = useRef(null);

  const recommendDetailsShares = recommendDetailsBookingId
    ? (bookings.find((b) => b.id === recommendDetailsBookingId)
        ?.sentRecommendations ?? [])
    : [];

  const reviewingBooking = reviewingBookingId
    ? bookings.find((b) => b.id === reviewingBookingId)
    : null;
  const reviewingRestaurant = reviewingBooking
    ? restaurantsById[dealsById[reviewingBooking.dealId]?.restaurantId]
    : null;

  // Filter bookings by the active sub-tab. Anything redeemed gets its status
  // flipped to "history" upstream by App.jsx, so the simple status check
  // covers both newly-redeemed and any pre-seeded history items.
  const visibleBookings = bookings.filter((b) => {
    const status = b.status ?? "upcoming";
    return activeSubTab === "history"
      ? status === "history"
      : status !== "history";
  });

  // Group history bookings under monthly headers ("March 2026"). Newest
  // bookings sort first; we trust App.jsx to keep `lastActivity` set to the
  // redemption timestamp for redeemed bookings.
  const historyGroups = useMemo(() => {
    if (activeSubTab !== "history") return [];
    const map = new Map();
    for (const b of visibleBookings) {
      const ts = b.redeemedAt ?? b.lastActivity ?? b.createdAt ?? 0;
      const d = new Date(ts);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const label = d.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
      if (!map.has(key)) {
        map.set(key, {
          key,
          label,
          sortKey: d.getFullYear() * 12 + d.getMonth(),
          items: [],
        });
      }
      map.get(key).items.push(b);
    }
    return Array.from(map.values()).sort((a, b) => b.sortKey - a.sortKey);
  }, [activeSubTab, visibleBookings]);

  const redeemingBooking = redeemingBookingId
    ? bookings.find((b) => b.id === redeemingBookingId)
    : null;
  const redeemingDeal = redeemingBooking
    ? dealsById[redeemingBooking.dealId]
    : null;
  const redeemingRestaurant = redeemingDeal
    ? restaurantsById[redeemingDeal.restaurantId]
    : null;
  // Merge static recommendation seed data with live recommend-shares so a
  // recommendation that was actually sent in-app (Hicks → Arabel, for
  // example) shows up alongside the demo seed entries on the recipient's
  // deal card. Keyed by dealId, mirroring the shape of the imported
  // `recommendationsByDealId` so RestaurantDetailPage's existing logic
  // works unchanged.
  const recommendationsByDealIdForViewer = useMemo(() => {
    const merged = { ...recommendationsByDealId };
    for (const s of shares) {
      if (s.type !== "recommend" || !s.dealId) continue;
      const entry = {
        dealId: s.dealId,
        userId: s.fromUserId,
        targetUserId: s.toUserId,
        message: s.message,
        createdAt: s.createdAt,
      };
      merged[s.dealId] = [...(merged[s.dealId] ?? []), entry];
    }
    return merged;
  }, [shares]);

  // Recommendations are directed at a specific friend (`targetUserId`).
  // The thanks avatars on the rate sheet should only show people who
  // actually recommended this deal *to* the current viewer, never the
  // viewer themselves, and never recommendations the viewer has already
  // "consumed" by redeeming this deal on a previous booking — same
  // rationale as the deal-card chip filtering: once a rec has driven a
  // visit, it shouldn't keep surfacing on later visits to the same spot.
  const redeemingRecommenders = redeemingDeal
    ? (recommendationsByDealIdForViewer[redeemingDeal.id] ?? [])
        .filter((r) => r.targetUserId === user.id && r.userId !== user.id)
        .filter((r) => {
          const recAt = r.createdAt ?? 0;
          return !bookings.some(
            (b) =>
              b.dealId === redeemingDeal.id &&
              b.id !== redeemingBookingId &&
              b.status === "history" &&
              b.outcome === "redeemed" &&
              (b.redeemedAt ?? b.lastActivity ?? 0) > recAt,
          );
        })
        .map((r) => {
          const u = usersById[r.userId];
          return u ? { ...u, message: r.message } : null;
        })
        .filter(Boolean)
    : [];

  const detailRestaurant = detailRestaurantId
    ? restaurantsById[detailRestaurantId]
    : null;
  // detailUser is *only* used for the stacked overlay covering other
  // users' profiles. Tapping your own avatar from anywhere is routed
  // through openUserProfile below, which flips rootView instead.
  const detailUser =
    detailUserId && detailUserId !== user.id ? usersById[detailUserId] : null;

  function closeAllOverlays() {
    setDetailRestaurantId(null);
    setDetailUserId(null);
    setDetailListId(null);
    setNotificationsOpen(false);
    setRecommendDetailsBookingId(null);
    setReviewingBookingId(null);
  }

  function openUserProfile(userId) {
    if (!userId) return;
    if (userId === user.id) {
      // Tapping your own avatar from any avatar surface switches to the
      // Profile tab rather than stacking your own profile as an overlay.
      closeAllOverlays();
      setRootView("profile");
    } else {
      setDetailUserId(userId);
    }
  }
  const detailList = detailListId
    ? lists.find((l) => l.id === detailListId)
    : null;

  // Restaurants the viewer has actually visited (redeemed a booking at).
  // Used by ListDetailPage to dim the thumbnail + show a "Visited" check on
  // entries the viewer has been to.
  const visitedRestaurantIds = useMemo(() => {
    const set = new Set();
    for (const b of bookings) {
      if (b.status === "history" && b.outcome === "redeemed") {
        const deal = dealsById[b.dealId];
        if (deal?.restaurantId) set.add(deal.restaurantId);
      }
    }
    return set;
  }, [bookings]);
  const detailDeals = detailRestaurantId
    ? allDeals.filter((d) => d.restaurantId === detailRestaurantId)
    : [];

  const notifications = useMemo(() => {
    return shares
      .filter((s) => {
        const involvesViewer =
          s.toUserId === user.id || s.fromUserId === user.id;
        if (!involvesViewer) return false;
        // Exclude sender-side records that don't need a persistent
        // notification — they got a toast at the moment of the action.
        if (s.fromUserId === user.id) {
          if (s.type === "gift") return false;
          if (s.type === "thank") return false;
          if (s.type === "recommend") return false;
          if (s.type === "dine" && s.status === "pending") return false;
        }
        return true;
      })
      .map((s) => {
        const booking = s.bookingId
          ? seedBookings.find((b) => b.id === s.bookingId)
          : null;
        const dealId = booking?.dealId ?? s.dealId;
        const deal = dealId ? dealsById[dealId] : null;
        const restaurant = deal ? restaurantsById[deal.restaurantId] : null;
        if (!deal || !restaurant) return null;
        const otherUserId = s.toUserId === user.id ? s.fromUserId : s.toUserId;
        const otherUser = otherUserId ? usersById[otherUserId] : null;
        const role = s.toUserId === user.id ? "received" : "sent";
        return { share: s, booking, deal, restaurant, otherUser, role };
      })
      .filter(Boolean)
      .sort(
        (a, b) =>
          (b.share.lastUpdatedAt ?? b.share.createdAt) -
          (a.share.lastUpdatedAt ?? a.share.createdAt),
      );
  }, [shares, user.id]);

  // Timestamp of the last bell tap. Anything newer than this is "unread"
  // and lights the red dot on the bell. Now lifted to App via props so
  // the mobile flip-button can highlight when the OTHER user has a
  // fresh share. Tapping the bell calls `onMarkNotificationsSeen(now)`
  // upstream; we fall back to local state when the parent doesn't wire
  // it (kept so the component still works standalone).
  const [localSeenAt, setLocalSeenAt] = useState(0);
  const notificationsSeenAt = notificationsSeenAtProp ?? localSeenAt;
  function setNotificationsSeenAt(ts) {
    if (onMarkNotificationsSeen) onMarkNotificationsSeen(ts);
    else setLocalSeenAt(ts);
  }
  const hasNotifications = notifications.some((n) => {
    const ts = n.share.lastUpdatedAt ?? n.share.createdAt ?? 0;
    return ts > notificationsSeenAt;
  });

  function handleScroll(e) {
    setScrolled(e.currentTarget.scrollTop > 50);
  }

  // Toast on any new share involving this viewer. Incoming → received toast
  // for the first one in the batch. Outgoing → batched per type
  // ("Gift sent to X" / "Invited N people" / "Thanked N people" /
  // "Recommendation sent to N people").
  useEffect(() => {
    const unseen = shares.filter((s) => !seenShareIdsRef.current.has(s.id));
    if (unseen.length === 0) return;
    for (const s of unseen) seenShareIdsRef.current.add(s.id);

    // Prefer an incoming notification (the receiver needs to know first).
    const incoming = unseen.find(
      (s) =>
        s.toUserId === user.id &&
        (s.type === "gift" ||
          s.type === "dine" ||
          s.type === "thank" ||
          s.type === "recommend" ||
          s.type === "redeemed"),
    );
    if (incoming) {
      const sender = usersById[incoming.fromUserId];
      if (sender) {
        setToast({
          kind: "received",
          type: incoming.type,
          who: sender.name,
          fromUser: sender,
          message: incoming.message,
        });
      }
      return;
    }

    // Outgoing: batch by type so a single action that creates multiple
    // shares (dine invite, thank-everyone, recommend-to-friends) produces
    // one toast describing the whole batch.
    function batchedRecipient(filtered) {
      if (filtered.length === 0) return null;
      if (filtered.length === 1) {
        const s = filtered[0];
        return s.toUserId
          ? (usersById[s.toUserId]?.name ?? null)
          : (s.toPhone ?? null);
      }
      return copy.toast.peopleCount(filtered.length);
    }

    const sentDine = unseen.filter(
      (s) => s.fromUserId === user.id && s.type === "dine",
    );
    if (sentDine.length > 0) {
      const who = batchedRecipient(sentDine);
      if (who) setToast({ kind: "sent", type: "dine", who, message: null });
      return;
    }

    const sentRecommend = unseen.filter(
      (s) => s.fromUserId === user.id && s.type === "recommend",
    );
    if (sentRecommend.length > 0) {
      const who = batchedRecipient(sentRecommend);
      if (who)
        setToast({ kind: "sent", type: "recommend", who, message: null });
      return;
    }

    const sentThank = unseen.filter(
      (s) => s.fromUserId === user.id && s.type === "thank",
    );
    if (sentThank.length > 0) {
      const who = batchedRecipient(sentThank);
      if (who) setToast({ kind: "sent", type: "thank", who, message: null });
      return;
    }

    const sentGift = unseen.find(
      (s) => s.fromUserId === user.id && s.type === "gift",
    );
    if (sentGift) {
      const recipient = sentGift.toUserId
        ? usersById[sentGift.toUserId]?.name
        : sentGift.toPhone;
      if (recipient) {
        setToast({
          kind: "sent",
          type: "gift",
          who: recipient,
          message: null,
        });
      }
    }
  }, [shares, user.id]);

  function handleFriendsConfirmed(picked) {
    if (!flow) return;
    setFlow({ ...flow, friends: picked, phone: undefined, step: "message" });
  }

  function handlePickPhone() {
    if (!flow) return;
    setFlow({ ...flow, step: "phone" });
  }

  function handlePhoneConfirmed(phone) {
    if (!flow) return;
    setFlow({ ...flow, phone, friends: undefined, step: "message" });
  }

  function handleBackFromMessage() {
    setFlow((f) => {
      if (!f) return null;
      const previousStep = f.phone ? "phone" : "pick";
      return { ...f, step: previousStep };
    });
  }

  function handleSend(message) {
    if (!flow) return;
    if (!flow.friends && !flow.phone) return;
    onShare?.({
      booking: flow.booking,
      type: flow.type,
      friends: flow.friends,
      phone: flow.phone,
      fromUserId: user.id,
      message,
    });
    setFlow(null);
  }

  const pickerTitle =
    flow?.type === "gift" ? copy.picker.giftTitle : copy.picker.dineTitle;
  const pickerSubtitle =
    flow?.type === "gift" ? copy.picker.giftSubtitle : copy.picker.dineSubtitle;
  const pickerMode = flow?.type === "gift" ? "single" : "multi";

  // Overlay visibility is computed per-tab: an overlay rendered inside a
  // master tab that's currently swapped off-screen doesn't count for the
  // active chrome. Notifications follows wherever the user opened it
  // from; the deep page overlays (restaurant / user detail) are always
  // anchored to Bookings because they're only reachable from there.
  // Discover currently has no overlays of its own.
  const notificationsOnActive =
    notificationsOpen && notificationsOrigin === rootView;
  const bookingsDeepOverlayOpen = !!detailRestaurantId || !!detailUserId;
  const hasOverlayOnActiveTab =
    notificationsOnActive || (isOnBookings && bookingsDeepOverlayOpen);

  // Top-level back handler. Pops whichever slide-in overlay is currently
  // visible on the active tab; hidden when nothing is up. ListDetail is
  // excluded (it's a BottomSheet — dismisses via drag / backdrop).
  // RestaurantDetailPage overrides this for its nested BookingConfirmation
  // by pushing its own handler.
  const phoneBack = useMemo(() => {
    if (notificationsOnActive) return () => setNotificationsOpen(false);
    if (isOnBookings) {
      if (detailUserId) return () => setDetailUserId(null);
      if (detailRestaurantId) return () => setDetailRestaurantId(null);
    }
    return null;
  }, [notificationsOnActive, isOnBookings, detailUserId, detailRestaurantId]);
  usePushPhoneChrome("back", phoneBack);

  function openNotifications() {
    setNotificationsOrigin(rootView);
    setNotificationsOpen(true);
    setNotificationsSeenAt(Date.now());
  }

  // Bell shows on Bookings and Profile root tabs when nothing's on top
  // of the active tab. Discover gets no bell — its top chrome is the
  // search bar + filter chips, and adding a floating bell on top reads
  // as cluttered. Two Y positions on Bookings: low (≈84px) under the
  // big "Bookings" headline while it's still in view, high (≈48px)
  // otherwise. PhoneFrame animates between them.
  const phoneBell = useMemo(() => {
    if (hasOverlayOnActiveTab) return null;
    if (isOnDiscover) return null;
    const position = isOnBookings && !scrolled ? "low" : "high";
    return {
      onClick: openNotifications,
      hasNotifications,
      position,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    hasOverlayOnActiveTab,
    hasNotifications,
    isOnBookings,
    isOnDiscover,
    scrolled,
  ]);
  usePushPhoneChrome("bell", phoneBell);

  return (
    <div className="w-full h-full flex flex-col bg-white relative overflow-hidden">
      {/* Discover tab — bleeds all the way to the top of the phone
          (the map sits behind the status bar by design). The other
          master tabs start at top-11; this one fills the full height
          above the TabBar so the map can extend behind the global
          StatusBar overlay. */}
      <AnimatePresence initial={false}>
        {isOnDiscover && (
          <motion.div
            key="discover-panel"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
            className="absolute inset-x-0 top-0 bottom-20 bg-white"
          >
            <DiscoverScreen
              user={user}
              bookmarkedListIds={bookmarkedListIds}
              visitedRestaurantIds={visitedRestaurantIds}
              onToggleListBookmark={onToggleListBookmark}
              recommendationsByDealIdForViewer={
                recommendationsByDealIdForViewer
              }
              onOpenUser={openUserProfile}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bookings tab — middle panel. Its own sliding panel that ships
          left when Profile is active, right when Discover is active.
          Pairs with the own-profile + discover panels so the three
          move together like a paged tab swap. */}
      <motion.div
        animate={{ x: panelOffset("bookings") }}
        transition={{ type: "spring", stiffness: 380, damping: 36 }}
        className="absolute inset-x-0 top-11 bottom-20 flex flex-col"
      >
        {/* Compact title — fades + un-blurs in once the large title has scrolled past the threshold. */}
        <div
          className={clsx(
            "absolute top-0 inset-x-0 z-20 transition-opacity duration-300 ease-out",
            scrolled ? "opacity-100" : "opacity-0 pointer-events-none",
          )}
        >
          <div className="bg-white backdrop-blur-md py-3 px-6 border-b border-black/5">
            <h2
              className={clsx(
                "text-center text-[17px] font-bold text-ink transition duration-300 ease-out",
                scrolled ? "blur-none" : "blur-md",
              )}
            >
              {copy.bookings.title}
            </h2>
          </div>
        </div>

        {/* Bell lives at PhoneFrame level now; the bookings panel just
            renders its content. */}

        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto no-scrollbar"
        >
          <div className="px-6 pt-16 pb-4">
            <h1 className="text-[32px] font-bold text-ink leading-tight">
              {copy.bookings.title}
            </h1>
          </div>
          <SubTabs
            tabs={SUBTABS}
            active={activeSubTab}
            onChange={interactive ? setActiveSubTab : undefined}
          />
          <div className="px-4 pt-5 pb-24 space-y-5">
            {activeSubTab === "upcoming" && pendingInvitations.length > 0 && (
              <section className="space-y-2">
                <h2 className="px-2 text-[12px] font-semibold uppercase tracking-wide text-ink-muted">
                  {copy.invitations.sectionTitle}
                </h2>
                {pendingInvitations.map((inv) => (
                  <PendingInvitationCard
                    key={inv.share.id}
                    share={inv.share}
                    sender={inv.sender}
                    deal={inv.deal}
                    restaurant={inv.restaurant}
                    onAccept={
                      interactive
                        ? () => onAcceptShare?.(inv.share.id)
                        : undefined
                    }
                    onDecline={
                      interactive
                        ? () => onDeclineShare?.(inv.share.id)
                        : undefined
                    }
                  />
                ))}
              </section>
            )}

            {activeSubTab === "history" ? (
              historyGroups.length === 0 ? (
                <p className="text-center text-ink-muted mt-10 px-6">
                  {copy.bookings.historyEmpty}
                </p>
              ) : (
                historyGroups.map((group) => (
                  <section key={group.key} className="space-y-3">
                    <h2 className="px-2 text-[18px] font-bold text-ink">
                      {group.label}
                    </h2>
                    {group.items.map((booking) => {
                      const deal = dealsById[booking.dealId];
                      const restaurant = restaurantsById[deal.restaurantId];
                      return (
                        <HistoryBookingCard
                          key={booking.id}
                          booking={booking}
                          deal={deal}
                          restaurant={restaurant}
                          onShowRecommendations={
                            (booking.sentRecommendations?.length ?? 0) > 0
                              ? () => setRecommendDetailsBookingId(booking.id)
                              : undefined
                          }
                          onWriteReview={
                            interactive && booking.outcome !== "cancelled"
                              ? () => openReviewSheet(booking.id, "rate")
                              : undefined
                          }
                          onWriteRecommendation={
                            interactive && booking.outcome !== "cancelled"
                              ? () => openReviewSheet(booking.id, "recommend")
                              : undefined
                          }
                          onOpenDetail={() =>
                            setDetailRestaurantId(restaurant.id)
                          }
                          onBookAgain={() =>
                            setDetailRestaurantId(restaurant.id)
                          }
                        />
                      );
                    })}
                  </section>
                ))
              )
            ) : visibleBookings.length === 0 &&
              pendingInvitations.length === 0 ? (
              <p className="text-center text-ink-muted mt-10">
                {copy.bookings.empty}
              </p>
            ) : (
              visibleBookings.map((booking) => {
                const deal = dealsById[booking.dealId];
                const restaurant = restaurantsById[deal.restaurantId];
                const isHistory = booking.status === "history";
                return (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    deal={deal}
                    restaurant={restaurant}
                    gifter={booking.gifter}
                    giftMessage={booking.giftMessage}
                    crew={booking.crew}
                    hasPendingInvites={booking.hasPendingInvites}
                    canAddCrew={!isHistory && booking.remainingSlots > 0}
                    // Gifted-in bookings can't be re-gifted onward — the
                    // app surface treats a gifted booking as the final
                    // recipient's, not a transferable asset.
                    canGift={
                      !isHistory && booking.crew.length === 0 && !booking.gifter
                    }
                    onGift={
                      interactive &&
                      booking.crew.length === 0 &&
                      !booking.gifter
                        ? () => setFlow({ booking, type: "gift", step: "pick" })
                        : undefined
                    }
                    onAddCrew={
                      interactive && booking.remainingSlots > 0
                        ? () => setFlow({ booking, type: "dine", step: "pick" })
                        : undefined
                    }
                    onOpenDetail={() => setDetailRestaurantId(restaurant.id)}
                    onRedeem={
                      interactive && !isHistory
                        ? () => setRedeemingBookingId(booking.id)
                        : undefined
                    }
                  />
                );
              })
            )}
          </div>
        </div>

        {/* Bookings-tab overlays — render INSIDE this panel so they
            translate together with the panel when the master tab
            swaps. Restaurant + user detail are bookings-only flows;
            notifications appears here when its origin was the bookings
            bell. */}
        <SlideInOverlay
          open={notificationsOpen && notificationsOrigin === "bookings"}
          snapClose={snapCloseOverlays}
          className="absolute top-0 inset-x-0 bottom-0 z-40 bg-white"
        >
          <NotificationsScreen
            notifications={notifications}
            onAcceptShare={interactive ? onAcceptShare : undefined}
            onDeclineShare={interactive ? onDeclineShare : undefined}
            onSeeInformation={(restaurantId) => {
              setNotificationsOpen(false);
              setDetailRestaurantId(restaurantId);
            }}
            onSeeBookings={() => {
              setNotificationsOpen(false);
              setActiveSubTab("upcoming");
            }}
            onWriteReview={(bookingId) => {
              if (!bookingId) return;
              setNotificationsOpen(false);
              setActiveSubTab("history");
              setReviewingBookingId(bookingId);
            }}
            onOpenUser={(userId) => {
              setNotificationsOpen(false);
              openUserProfile(userId);
            }}
          />
        </SlideInOverlay>

        <SlideInOverlay
          open={!!detailRestaurant}
          snapClose={snapCloseOverlays}
          className="absolute top-0 inset-x-0 bottom-0 z-40 bg-white"
        >
          {detailRestaurant && (
            <RestaurantDetailPage
              restaurant={detailRestaurant}
              deals={detailDeals}
              recommendationsByDealId={recommendationsByDealIdForViewer}
              user={user}
              friends={friends}
              userBookings={bookings}
              phoneGiftsUsed={phoneGiftsUsed}
              phoneGiftLimit={phoneGiftLimit}
              onShare={interactive ? onShare : undefined}
              onCreateBooking={
                interactive
                  ? (payload) => {
                      onCreateBooking?.(payload);
                      // Drop the bookings list back to the top *and*
                      // flip back to Upcoming so the freshly-confirmed
                      // booking is the first thing the user sees once
                      // the detail page slides off. (If they were on
                      // History when they opened the detail page, the
                      // tab would otherwise stay on History and the
                      // new booking would be invisible.)
                      setActiveSubTab("upcoming");
                      scrollContainerRef.current?.scrollTo({
                        top: 0,
                        behavior: "smooth",
                      });
                    }
                  : undefined
              }
              onOpenUser={openUserProfile}
              onBack={() => setDetailRestaurantId(null)}
            />
          )}
        </SlideInOverlay>

        <SlideInOverlay
          open={!!detailUser}
          snapClose={snapCloseOverlays}
          className="absolute top-0 inset-x-0 bottom-0 z-40 bg-white"
        >
          {detailUser && (
            <UserDetailPage
              user={detailUser}
              viewer={user}
              bookmarkedListIds={bookmarkedListIds}
              onToggleListBookmark={onToggleListBookmark}
              onOpenRestaurant={(restaurantId) =>
                setDetailRestaurantId(restaurantId)
              }
              onOpenList={(listId) => setDetailListId(listId)}
            />
          )}
        </SlideInOverlay>
      </motion.div>

      {/* Own profile — sliding panel that sits to the right of Bookings.
          Always mounted (just translated off-screen when inactive) so
          coming back to it is instant. */}
      <motion.div
        animate={{ x: panelOffset("profile") }}
        transition={{ type: "spring", stiffness: 380, damping: 36 }}
        className="absolute inset-x-0 top-11 bottom-20 bg-white"
      >
        <MyProfileScreen
          user={user}
          bookmarkedListIds={bookmarkedListIds}
          onToggleListBookmark={onToggleListBookmark}
          onOpenRestaurant={(restaurantId) =>
            setDetailRestaurantId(restaurantId)
          }
          onOpenList={(listId) => setDetailListId(listId)}
          onOpenNotifications={openNotifications}
          hasNotifications={hasNotifications}
        />

        {/* Profile-tab overlay — notifications opened from the mypage
            bell renders here so it slides along with the Profile panel. */}
        <SlideInOverlay
          open={notificationsOpen && notificationsOrigin === "profile"}
          snapClose={snapCloseOverlays}
          className="absolute top-0 inset-x-0 bottom-0 z-40 bg-white"
        >
          <NotificationsScreen
            notifications={notifications}
            onAcceptShare={interactive ? onAcceptShare : undefined}
            onDeclineShare={interactive ? onDeclineShare : undefined}
            onSeeInformation={(restaurantId) => {
              setNotificationsOpen(false);
              setDetailRestaurantId(restaurantId);
              setRootView("bookings");
            }}
            onSeeBookings={() => {
              setNotificationsOpen(false);
              setActiveSubTab("upcoming");
              setRootView("bookings");
            }}
            onWriteReview={(bookingId) => {
              if (!bookingId) return;
              setNotificationsOpen(false);
              setActiveSubTab("history");
              setReviewingBookingId(bookingId);
              setRootView("bookings");
            }}
            onOpenUser={(userId) => {
              setNotificationsOpen(false);
              openUserProfile(userId);
            }}
          />
        </SlideInOverlay>
      </motion.div>

      <TabBar
        active={rootView}
        onSelectProfile={interactive ? () => setRootView("profile") : undefined}
        onSelectDiscover={
          interactive
            ? () => {
                // Same flow as Profile — overlays stay parked on their
                // origin tab; tab swap is purely cosmetic. No close.
                setRootView("discover");
              }
            : undefined
        }
        onSelectBookings={() => {
          // Per the user spec, tapping Bookings closes any open
          // slide-in overlay regardless of which tab spawned it (so deep
          // navigation doesn't survive a tab tap). On a cross-tab swap
          // we snap the overlay's exit to zero duration — otherwise it
          // would sweep across the screen while the panel beneath is
          // translating in from the other direction.
          const hasAnySlideIn =
            notificationsOpen || !!detailRestaurantId || !!detailUserId;
          if (rootView === "bookings") {
            if (hasAnySlideIn) {
              closeAllOverlays();
            } else {
              setActiveSubTab("upcoming");
              scrollContainerRef.current?.scrollTo({
                top: 0,
                behavior: "smooth",
              });
            }
          } else {
            if (hasAnySlideIn) {
              setSnapCloseOverlays(true);
              closeAllOverlays();
              requestAnimationFrame(() => {
                requestAnimationFrame(() => setSnapCloseOverlays(false));
              });
            }
            setRootView("bookings");
          }
        }}
      />

      <BottomSheet
        open={!!flow}
        onClose={() => setFlow(null)}
        initialSnap={
          flow?.type === "gift" && flow?.step === "pick" ? "compact" : "full"
        }
      >
        {flow?.step === "pick" && (
          <FriendPicker
            mode={pickerMode}
            max={
              flow?.type === "dine"
                ? (flow.booking?.remainingSlots ?? MAX_CREW)
                : 1
            }
            excludeIds={
              flow?.type === "dine"
                ? (flow.booking?.dineRecipientIds ?? [])
                : []
            }
            initialSelectedIds={flow?.friends?.map((f) => f.id) ?? []}
            title={pickerTitle}
            subtitle={pickerSubtitle}
            friends={friends}
            onConfirm={handleFriendsConfirmed}
            onPickPhone={flow?.type === "gift" ? handlePickPhone : undefined}
            onClose={() => setFlow(null)}
          />
        )}
        {flow?.step === "phone" && (
          <PhoneEntry
            initialPhone={flow?.phone ?? ""}
            quotaUsed={phoneGiftsUsed}
            quotaTotal={phoneGiftLimit}
            onContinue={handlePhoneConfirmed}
            onBack={() => setFlow((f) => (f ? { ...f, step: "pick" } : null))}
            onClose={() => setFlow(null)}
          />
        )}
        {flow?.step === "message" && (
          <MessageSheet
            type={flow?.type}
            friends={flow?.friends}
            phone={flow?.phone}
            quotaUsed={phoneGiftsUsed}
            quotaTotal={phoneGiftLimit}
            onSend={handleSend}
            onBack={handleBackFromMessage}
            onClose={() => setFlow(null)}
          />
        )}
      </BottomSheet>

      <BottomSheet
        open={!!recommendDetailsBookingId}
        onClose={() => setRecommendDetailsBookingId(null)}
        initialSnap="compact"
      >
        <RecommendationSentView
          shares={recommendDetailsShares}
          onOpenUser={(userId) => {
            setRecommendDetailsBookingId(null);
            openUserProfile(userId);
          }}
          onClose={() => setRecommendDetailsBookingId(null)}
        />
      </BottomSheet>

      <BottomSheet
        open={!!reviewingBookingId}
        onClose={() => setReviewingBookingId(null)}
        initialSnap="full"
      >
        {reviewingBooking && reviewingRestaurant && (
          <WriteReviewSheet
            // Remount whenever booking *or* initial step changes so the
            // form state re-initialises (and the step machine actually
            // starts at the requested step instead of clinging to the
            // previous one).
            key={`${reviewingBookingId}-${reviewingInitialStep}`}
            restaurant={reviewingRestaurant}
            initialStep={reviewingInitialStep}
            initialRating={reviewingBooking.rating ?? 0}
            initialReview={reviewingBooking.review ?? ""}
            hasRecommended={
              (reviewingBooking.sentRecommendations?.length ?? 0) > 0
            }
            friends={friends}
            onSubmit={({ rating, review }) =>
              onSaveReview?.(reviewingBookingId, user.id, { rating, review })
            }
            onSendRecommendation={({ friends: selected, message }) => {
              onShare?.({
                booking: reviewingBooking,
                deal: dealsById[reviewingBooking.dealId],
                type: "recommend",
                friends: selected,
                fromUserId: user.id,
                message,
              });
            }}
            onClose={() => setReviewingBookingId(null)}
          />
        )}
      </BottomSheet>

      {/* ListDetail is a BottomSheet — it isn't anchored to any master
          tab so opening it from mypage or from a deeper user profile
          both work; it stays put across tab swaps until the user drags
          it down or taps the backdrop. */}
      <BottomSheet
        open={!!detailList}
        onClose={() => setDetailListId(null)}
        initialSnap="full"
      >
        {detailList && (
          <ListDetailPage
            list={detailList}
            viewer={user}
            isBookmarked={bookmarkedListIds.includes(detailList.id)}
            onToggleBookmark={
              onToggleListBookmark
                ? () => onToggleListBookmark(detailList.id)
                : undefined
            }
            visitedRestaurantIds={visitedRestaurantIds}
            onClose={() => setDetailListId(null)}
          />
        )}
      </BottomSheet>

      <AnimatePresence>
        {redeemingBooking && redeemingDeal && redeemingRestaurant && (
          <motion.div
            key="redeem-flow"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
            className="absolute inset-0 z-50"
          >
            <RedeemFlow
              booking={redeemingBooking}
              deal={redeemingDeal}
              restaurant={redeemingRestaurant}
              viewer={user}
              gifter={redeemingBooking.gifter}
              giftMessage={redeemingBooking.giftMessage}
              recommenders={redeemingRecommenders}
              friends={friends}
              onShare={interactive ? onShare : undefined}
              onStatusBarTone={onSetStatusBarTone}
              onRedeem={(bookingId) => {
                // Slide-to-redeem completed: flip the booking to history
                // immediately and switch the underlying tab so when the
                // flow closes the user lands on History with the booking
                // visible at the top. Pass the viewer's id so the
                // "redeemed your deal" fan-out gets attributed correctly
                // for gifted bookings.
                onRedeemBooking?.(bookingId, user.id);
                setActiveSubTab("history");
              }}
              onComplete={({ bookingId, savings, rating, review }) => {
                // Final flow step. Savings is shared across the booking;
                // rating + review belong specifically to the host (whoever
                // ran the redeem flow), so they go into per-user reviews.
                onRedeemBooking?.(bookingId, user.id, { savings });
                if (rating != null) {
                  onSaveReview?.(bookingId, user.id, {
                    rating,
                    review: review || null,
                  });
                }
              }}
              onClose={() => setRedeemingBookingId(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {toast && (
        <Toast
          kind={toast.kind}
          type={toast.type}
          who={toast.who}
          fromUser={toast.fromUser}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
