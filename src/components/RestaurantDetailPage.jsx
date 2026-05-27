import { useMemo, useState } from "react";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import {
  Star,
  Map,
  Bookmark,
  Share2,
  BookOpen,
  Info,
} from "lucide-react";
import { usePushPhoneChrome } from "./PhoneFrame";
import { SubTabs } from "./SubTabs";
import { ActionTile } from "./ActionTile";
import { DealCardLarge } from "./DealCardLarge";
import { RecommendationsView } from "./RecommendationsView";
import { ReviewCard } from "./ReviewCard";
import { BottomSheet } from "./BottomSheet";
import { FriendPicker } from "./FriendPicker";
import { MessageSheet } from "./MessageSheet";
import { PhoneEntry } from "./PhoneEntry";
import { BookingConfirmation } from "./BookingConfirmation";
import { copy } from "../copy";
import { usersById } from "../data/users";
import { reviewsByRestaurantId } from "../data/reviews";

const SUBTABS = [
  { id: "overview", label: copy.detailPage.overview },
  { id: "reviews", label: copy.detailPage.reviews },
  { id: "about", label: copy.detailPage.about },
];

export function RestaurantDetailPage({
  restaurant,
  deals = [],
  recommendationsByDealId = {},
  user,
  friends = [],
  userBookings = [],
  phoneGiftsUsed = 0,
  phoneGiftLimit,
  onShare,
  onCreateBooking,
  onOpenUser,
  onBack,
}) {
  // flow = null | { deal, type: 'gift', step: 'pick' | 'phone' | 'message', friends?, phone? }
  const [flow, setFlow] = useState(null);
  // Which deal's recommendations are open in the long-press sheet (null = closed).
  const [recsSheetDealId, setRecsSheetDealId] = useState(null);
  // Deal the user is currently booking (null = no confirmation screen open).
  const [bookingDraft, setBookingDraft] = useState(null);
  // Sticky header state. `scrolled` flips when the user has scrolled past the
  // in-flow SubTabs so the compact title + tab bar at the top fades in.
  const [scrolled, setScrolled] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState("overview");

  function handleScroll(e) {
    // 280px is roughly where the in-flow SubTabs sit (below title block +
    // image gallery). Hysteresis-free toggle reads fine for this short list.
    setScrolled(e.currentTarget.scrollTop > 280);
  }
  const c = copy.detailPage;

  // BookingConfirmation slides over this page from the right. While it's
  // up, the global back chevron should pop it (not the whole detail
  // page). Push our override only when there's a draft — otherwise leave
  // the underlying back (set by BookingsScreen) untouched.
  const overriddenBack = useMemo(() => {
    if (!bookingDraft) return null;
    return () => setBookingDraft(null);
  }, [bookingDraft]);
  usePushPhoneChrome("back", overriddenBack);
  const restaurantReviews = reviewsByRestaurantId[restaurant.id] ?? [];

  // Resolve a deal's eligible recommenders for the viewer.
  // Recommendations are directed (each has a `targetUserId`) — only the ones
  // addressed to the current viewer surface, and the viewer is never shown
  // as a recommender on their own deal pages.
  // If the viewer already has a booking for this deal, only recommendations
  // made *after* the most recent activity on that booking still count — the
  // assumption is that older recommendations have already led the viewer
  // to book, so the avatars become noise.
  function getRecommendersForDeal(deal) {
    if (!deal) return [];
    const viewerId = user?.id;
    const allRecs = (recommendationsByDealId[deal.id] ?? []).filter(
      (r) => r.targetUserId === viewerId && r.userId !== viewerId,
    );
    const userBookingForDeal = userBookings.find((b) => b.dealId === deal.id);
    const cutoff = userBookingForDeal
      ? (userBookingForDeal.lastActivity ?? userBookingForDeal.createdAt ?? 0)
      : null;
    const eligible =
      cutoff === null
        ? allRecs
        : allRecs.filter((r) => (r.createdAt ?? 0) > cutoff);
    return eligible
      .map((r) => {
        const u = usersById[r.userId];
        return u ? { ...u, message: r.message, createdAt: r.createdAt } : null;
      })
      .filter(Boolean);
  }

  const recsSheetRecommenders = recsSheetDealId
    ? getRecommendersForDeal(deals.find((d) => d.id === recsSheetDealId))
    : [];

  function handleGift(deal) {
    setFlow({ deal, type: "gift", step: "pick" });
  }

  function handleBook(deal) {
    setBookingDraft(deal);
  }

  function handleConfirmBooking() {
    if (!bookingDraft) return;
    onCreateBooking?.({ deal: bookingDraft });
    // Intentionally do NOT clear bookingDraft here — leaving the confirmation
    // mounted lets it slide off-screen with the detail page in one motion
    // instead of doing two staged exits. The wrapper unmounts when the
    // detail page unmounts, so there's no leak.
    onBack?.();
  }

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

  function handleSend(message) {
    if (!flow || (!flow.friends && !flow.phone)) return;
    onShare?.({
      deal: flow.deal,
      type: flow.type,
      friends: flow.friends,
      phone: flow.phone,
      fromUserId: user.id,
      message,
    });
    setFlow(null);
  }

  return (
    <div className="w-full h-full flex flex-col bg-white relative">
      {/* Back chevron is rendered globally by PhoneFrame; this row only
          carries the sticky restaurant name that blur-fades in once the
          large title has scrolled past. The min-h-13 reserves the same
          vertical footprint as before so the floating back has somewhere
          to sit and the scroll body starts in the same place. */}
      <div className="shrink-0 relative z-20 bg-white">
        <div className="px-3 py-2 flex items-center relative min-h-13">
          <motion.h2
            initial={false}
            animate={{
              opacity: scrolled ? 1 : 0,
              filter: scrolled ? "blur(0px)" : "blur(8px)",
            }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="absolute inset-x-14 text-center text-[18px] font-bold text-ink uppercase pointer-events-none truncate"
          >
            {restaurant.name}
          </motion.h2>
        </div>
      </div>

      <div
        onScroll={handleScroll}
        className={clsx("flex-1 overflow-y-auto no-scrollbar pb-12")}
      >
        <div className="px-4">
          <h1 className="text-[30px] font-bold text-ink leading-[1.1] uppercase">
            {restaurant.name}
          </h1>
          {restaurant.category && (
            <p className="text-[15px] text-ink mt-1">{restaurant.category}</p>
          )}
          <div className="flex items-center gap-1.5 mt-2 text-[13px]">
            <Star className="w-4 h-4 fill-ink text-ink" />
            <span className="font-bold text-ink">{restaurant.rating}</span>
            <span className="text-ink-muted">({restaurant.reviews})</span>
            <span className="text-ink-muted">·</span>
            <span className="text-ink-muted">{restaurant.category}</span>
            <span className="text-ink-muted">·</span>
            <span className="text-ink-muted">€€€</span>
          </div>
          <p className="text-[13px] text-ink-muted mt-1.5">
            {c.open} · {c.closesAt(restaurant.closesAt)} · {restaurant.district}{" "}
            ({c.distance(restaurant.distanceKm)})
          </p>
        </div>

        <div className="px-4 mt-4 flex gap-2">
          <ActionTile icon={BookOpen} label={c.actions.menu} />
          <ActionTile icon={Map} label={c.actions.location} />
          <ActionTile icon={Bookmark} label={c.actions.save} />
          <ActionTile icon={Share2} label={c.actions.share} />
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar pl-4 pr-4">
          <img
            src={restaurant.image}
            alt=""
            className="w-72 h-44 rounded-lg object-cover shrink-0"
          />
          <img
            src={restaurant.image}
            alt=""
            className="w-72 h-44 rounded-lg object-cover shrink-0"
          />
        </div>

        {/* SubTabs uses CSS position:sticky so it scrolls naturally below
            the title block and then locks to the top of the scroll
            container once it reaches it. No appear/disappear dance — one
            element, one position. bg-white keeps the deal cards from
            bleeding through while it's stuck. */}
        <div className="sticky top-0 z-60 bg-white mt-5">
          <SubTabs
            tabs={SUBTABS}
            active={activeSubTab}
            onChange={setActiveSubTab}
          />
        </div>

        <div className="px-4 mt-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[22px] font-bold text-ink">{c.deals}</h2>
            <span className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-surface text-ink-muted text-[12px] font-semibold">
              <Info className="w-3.5 h-3.5" strokeWidth={2} />
              {c.info}
            </span>
          </div>
          <div className="space-y-3">
            {deals.map((deal) => {
              const recommenders = getRecommendersForDeal(deal);
              // Only an *upcoming* booking should swap the deal card into
              // "scheduled" mode. Once redeemed, the booking sits in
              // History and the deal card goes back to its "Book deal"
              // affordance so the user can book the same deal again.
              const userBooking = userBookings.find(
                (b) => b.dealId === deal.id && b.status !== "history",
              );
              return (
                <DealCardLarge
                  key={deal.id}
                  deal={deal}
                  recommenders={recommenders}
                  userBooking={userBooking}
                  onGift={() => handleGift(deal)}
                  onBook={
                    onCreateBooking && !userBooking
                      ? () => handleBook(deal)
                      : undefined
                  }
                  onShowRecommenders={
                    recommenders.length > 0
                      ? () => setRecsSheetDealId(deal.id)
                      : undefined
                  }
                />
              );
            })}
          </div>
        </div>

        <div className="px-4 mt-8">
          <h2 className="text-[22px] font-bold text-ink mb-3">{c.reviews}</h2>
          <div className="flex items-center gap-4 mb-2">
            <span className="text-[40px] font-bold text-ink leading-none">
              {restaurant.rating}
            </span>
            <div className="flex items-center gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star
                  key={i}
                  className={
                    i < Math.round(restaurant.rating)
                      ? "w-5 h-5 fill-ink text-ink"
                      : "w-5 h-5 fill-surface-strong text-surface-strong"
                  }
                />
              ))}
            </div>
          </div>

          {restaurantReviews.length > 0 ? (
            <>
              <div>
                {restaurantReviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    onOpenUser={onOpenUser}
                  />
                ))}
              </div>
              <button
                type="button"
                className="w-full h-12 mt-4 rounded-lg bg-surface text-ink font-semibold text-[14px] cursor-default"
              >
                {c.seeAllReviews}
              </button>
            </>
          ) : null}
        </div>
      </div>

      <BottomSheet
        open={!!flow}
        onClose={() => setFlow(null)}
        initialSnap={flow?.step === "pick" ? "compact" : "full"}
      >
        {flow?.step === "pick" && (
          <FriendPicker
            mode="single"
            max={1}
            initialSelectedIds={flow?.friends?.map((f) => f.id) ?? []}
            title={copy.picker.giftTitle}
            subtitle={copy.picker.giftSubtitle}
            friends={friends}
            onConfirm={handleFriendsConfirmed}
            onPickPhone={handlePickPhone}
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
            type="gift"
            friends={flow?.friends}
            phone={flow?.phone}
            quotaUsed={phoneGiftsUsed}
            quotaTotal={phoneGiftLimit}
            onSend={handleSend}
            onBack={() =>
              setFlow((f) =>
                f ? { ...f, step: f.phone ? "phone" : "pick" } : null,
              )
            }
            onClose={() => setFlow(null)}
          />
        )}
      </BottomSheet>

      <BottomSheet
        open={!!recsSheetDealId}
        onClose={() => setRecsSheetDealId(null)}
        initialSnap="compact"
      >
        <RecommendationsView
          recommenders={recsSheetRecommenders}
          onOpenUser={
            onOpenUser
              ? (userId) => {
                  setRecsSheetDealId(null);
                  onOpenUser(userId);
                }
              : undefined
          }
          onClose={() => setRecsSheetDealId(null)}
        />
      </BottomSheet>

      <AnimatePresence>
        {bookingDraft && (
          <motion.div
            key="booking-confirmation"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
            className="absolute inset-0 z-80"
          >
            <BookingConfirmation
              deal={bookingDraft}
              restaurant={restaurant}
              onConfirm={handleConfirmBooking}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
