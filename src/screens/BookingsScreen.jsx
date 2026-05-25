import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { Bell } from "lucide-react";
import { StatusBar } from "../components/StatusBar";
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
import { RedeemFlow } from "../components/RedeemFlow";
import { Toast } from "../components/Toast";
import { copy } from "../copy";
import { bookings as seedBookings } from "../data/bookings";
import { restaurantsById } from "../data/restaurants";
import { deals as allDeals, dealsById } from "../data/deals";
import { usersById } from "../data/users";
import { recommendationsByDealId } from "../data/recommendations";
import { MAX_CREW } from "../lib/constants";

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
  interactive = true,
}) {
  // flow = null | { booking, type: 'gift' | 'dine', step: 'pick' | 'message', friends?: User[] }
  const [flow, setFlow] = useState(null);
  const [toast, setToast] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [detailRestaurantId, setDetailRestaurantId] = useState(null);
  const [redeemingBookingId, setRedeemingBookingId] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState("upcoming");
  const seenShareIdsRef = useRef(new Set());

  // Filter bookings by the active sub-tab. Anything redeemed gets its status
  // flipped to "history" upstream by App.jsx, so the simple status check
  // covers both newly-redeemed and any pre-seeded history items.
  const visibleBookings = bookings.filter((b) => {
    const status = b.status ?? "upcoming";
    return activeSubTab === "history" ? status === "history" : status !== "history";
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
        map.set(key, { key, label, sortKey: d.getFullYear() * 12 + d.getMonth(), items: [] });
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
  const redeemingRecommenders = redeemingDeal
    ? (recommendationsByDealId[redeemingDeal.id] ?? [])
        .map((r) => {
          const u = usersById[r.userId];
          return u ? { ...u, message: r.message } : null;
        })
        .filter(Boolean)
    : [];

  const detailRestaurant = detailRestaurantId
    ? restaurantsById[detailRestaurantId]
    : null;
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
        const otherUserId =
          s.toUserId === user.id ? s.fromUserId : s.toUserId;
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

  const hasNotifications = notifications.length > 0;

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
          s.type === "recommend"),
    );
    if (incoming) {
      const sender = usersById[incoming.fromUserId];
      if (sender) {
        setToast({
          kind: "received",
          type: incoming.type,
          who: sender.name,
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
          : s.toPhone ?? null;
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

  return (
    <div className="w-full h-full flex flex-col bg-white relative">
      <StatusBar />

      {/* Compact title — fades + un-blurs in once the large title has scrolled past the threshold. */}
      <div
        className={clsx(
          "absolute top-11 inset-x-0 z-20 transition-opacity duration-300 ease-out",
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

      {/* Bell button — sits next to the large title row, animates up to top-right when scrolled. */}
      <motion.button
        type="button"
        onClick={() => setNotificationsOpen(true)}
        aria-label={copy.notifications.button}
        initial={false}
        animate={{ top: scrolled ? 48 : 84 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="absolute right-4 z-30 w-10 h-10 rounded-full bg-white shadow-[0_2px_8px_-2px_rgba(0,0,0,0.15)] border border-black/5 flex items-center justify-center hover:bg-surface active:scale-95 transition-[background,transform]"
      >
        <Bell className="w-5 h-5 text-ink" strokeWidth={2.25} />
        {hasNotifications && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-error ring-2 ring-white" />
        )}
      </motion.button>

      <div
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
                      />
                    );
                  })}
                </section>
              ))
            )
          ) : visibleBookings.length === 0 && pendingInvitations.length === 0 ? (
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
                  canGift={!isHistory && booking.crew.length === 0}
                  onGift={
                    interactive && booking.crew.length === 0
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
      <TabBar active="bookings" />

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

      <AnimatePresence>
        {notificationsOpen && (
          <motion.div
            key="notifications-screen"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
            className="absolute inset-0 z-40 bg-white"
          >
            <NotificationsScreen
              notifications={notifications}
              onBack={() => setNotificationsOpen(false)}
              onAcceptShare={interactive ? onAcceptShare : undefined}
              onDeclineShare={interactive ? onDeclineShare : undefined}
              onSeeInformation={(restaurantId) => {
                setNotificationsOpen(false);
                setDetailRestaurantId(restaurantId);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {detailRestaurant && (
          <motion.div
            key="detail-page"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
            className="absolute inset-0 z-40 bg-white"
          >
            <RestaurantDetailPage
              restaurant={detailRestaurant}
              deals={detailDeals}
              recommendationsByDealId={recommendationsByDealId}
              user={user}
              friends={friends}
              userBookings={bookings}
              phoneGiftsUsed={phoneGiftsUsed}
              phoneGiftLimit={phoneGiftLimit}
              onShare={interactive ? onShare : undefined}
              onCreateBooking={interactive ? onCreateBooking : undefined}
              onBack={() => setDetailRestaurantId(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>

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
              gifter={redeemingBooking.gifter}
              giftMessage={redeemingBooking.giftMessage}
              recommenders={redeemingRecommenders}
              friends={friends}
              onShare={interactive ? onShare : undefined}
              onRedeem={(bookingId) => {
                // Slide-to-redeem completed: flip the booking to history
                // immediately and switch the underlying tab so when the
                // flow closes the user lands on History with the booking
                // visible at the top.
                onRedeemBooking?.(bookingId);
                setActiveSubTab("history");
              }}
              onComplete={({ bookingId, savings, rating }) => {
                // Final flow step delivers the savings + rating that the
                // History card needs to render the saved-€ pill and stars.
                onRedeemBooking?.(bookingId, { savings, rating });
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
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
