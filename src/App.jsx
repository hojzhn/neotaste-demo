import { useState } from "react";
import { PhoneFrame } from "./components/PhoneFrame";
import { BookingsScreen } from "./screens/BookingsScreen";
import { users, usersById } from "./data/users";
import { bookings as seedBookings } from "./data/bookings";
import { dealsById } from "./data/deals";
import { restaurantsById } from "./data/restaurants";
import { copy } from "./copy";
import { MAX_CREW, OUTSIDER_GIFT_LIMIT } from "./lib/constants";

const [maria, tom] = users;

function App() {
  const [shares, setShares] = useState([]);
  // Bookings the user creates from the "Book deal" flow on RestaurantDetailPage.
  // Combined with seedBookings to feed bookingsForUser — keeping them separate
  // means we never mutate the seed data.
  const [extraBookings, setExtraBookings] = useState([]);
  // Per-booking redemption data captured from the Redeem flow:
  //   { [bookingId]: { redeemedAt, savings?, rating? } }
  // Slide-to-redeem creates the entry (with redeemedAt only). When the
  // user finishes the rate / credit sheet, savings + rating are merged in.
  const [redemptions, setRedemptions] = useState({});
  const allBookings = [...seedBookings, ...extraBookings];

  function handleRedeemBooking(bookingId, data = {}) {
    if (!bookingId) return;
    setRedemptions((prev) => {
      const existing = prev[bookingId];
      return {
        ...prev,
        [bookingId]: {
          redeemedAt: existing?.redeemedAt ?? Date.now(),
          ...existing,
          ...data,
        },
      };
    });
  }

  function handleCreateBooking({ userId, deal }) {
    if (!deal || !userId) return;
    const now = Date.now();
    setExtraBookings((prev) => [
      ...prev,
      {
        id: `b-${userId}-${now}`,
        userId,
        dealId: deal.id,
        dateLabel: copy.bookingConfirmation.defaultDate,
        timeWindow: copy.bookingConfirmation.defaultTime,
        status: "upcoming",
        createdAt: now,
      },
    ]);
  }

  function handleShare({
    booking,
    deal,
    type,
    friends,
    phone,
    fromUserId,
    message,
  }) {
    const ts = Date.now();
    const newShares = [];
    // booking-based shares carry both booking + deal; deal-only shares
    // (originated from a DetailPage Gift) carry just dealId, no bookingId.
    const bookingId = booking?.id ?? null;
    const dealId = booking?.dealId ?? deal?.id ?? null;
    if (!dealId) return;
    if (phone) {
      newShares.push({
        id: `share-${ts}-phone`,
        fromUserId,
        toUserId: null,
        toPhone: phone,
        bookingId,
        dealId,
        type,
        message: message || null,
        status: "accepted",
        createdAt: ts,
        lastUpdatedAt: ts,
      });
    } else if (friends && friends.length > 0) {
      // Gift and recommend land in the recipient's feed immediately —
      // only dine invitations require accept/decline.
      const status = type === "dine" ? "pending" : "accepted";
      friends.forEach((friend, i) => {
        newShares.push({
          id: `share-${ts}-${i}`,
          fromUserId,
          toUserId: friend.id,
          toPhone: null,
          bookingId,
          dealId,
          type,
          message: message || null,
          status,
          createdAt: ts,
          lastUpdatedAt: ts,
        });
      });
    }
    if (newShares.length === 0) return;
    setShares((prev) => [...prev, ...newShares]);
  }

  function handleAcceptShare(shareId) {
    setShares((prev) =>
      prev.map((s) =>
        s.id === shareId
          ? { ...s, status: "accepted", lastUpdatedAt: Date.now() }
          : s,
      ),
    );
  }

  function handleDeclineShare(shareId) {
    setShares((prev) => prev.filter((s) => s.id !== shareId));
  }

  function bookingsForUser(userId) {
    const giftedAway = new Set(
      shares
        .filter(
          (s) =>
            s.fromUserId === userId &&
            s.type === "gift" &&
            s.status === "accepted",
        )
        .map((s) => s.bookingId),
    );

    const visibleIds = new Set();
    for (const b of allBookings) {
      if (b.userId === userId && !giftedAway.has(b.id)) visibleIds.add(b.id);
    }
    for (const s of shares) {
      if (s.toUserId === userId && s.status === "accepted") {
        if (s.type === "gift" || s.type === "dine") visibleIds.add(s.bookingId);
      }
    }

    return Array.from(visibleIds)
      .map((id) => {
        const seed = allBookings.find((b) => b.id === id);
        if (!seed) return null;

        const giftShare = shares.find(
          (s) =>
            s.bookingId === id &&
            s.type === "gift" &&
            s.toUserId === userId &&
            s.status === "accepted",
        );
        const gifter = giftShare ? usersById[giftShare.fromUserId] : null;

        // Dine recipients (regardless of viewer) — used for the MAX_CREW cap.
        const dineRecipientIds = [];
        for (const s of shares) {
          if (
            s.bookingId === id &&
            s.type === "dine" &&
            (s.status === "accepted" || s.status === "pending")
          ) {
            if (!dineRecipientIds.includes(s.toUserId)) {
              dineRecipientIds.push(s.toUserId);
            }
          }
        }

        // Crew to render on this booking (excluding the viewer).
        // Includes host (if not gifted to viewer) + accepted + pending dine recipients.
        const seen = new Map(); // id -> { pending }
        if (!gifter) seen.set(seed.userId, { pending: false });
        for (const s of shares) {
          if (s.bookingId !== id || s.type !== "dine") continue;
          if (s.status !== "accepted" && s.status !== "pending") continue;
          const existing = seen.get(s.toUserId);
          const pending = s.status === "pending";
          if (!existing || (!pending && existing.pending)) {
            seen.set(s.toUserId, { pending });
          }
        }
        seen.delete(userId);
        const crew = Array.from(seen.entries())
          .map(([uid, { pending }]) => {
            const u = usersById[uid];
            return u ? { ...u, pending } : null;
          })
          .filter(Boolean);

        const hasPendingInvites = dineRecipientIds.some((rid) =>
          shares.some(
            (s) =>
              s.bookingId === id &&
              s.toUserId === rid &&
              s.type === "dine" &&
              s.status === "pending" &&
              (s.fromUserId === userId || s.toUserId === userId),
          ),
        );

        const remainingSlots = Math.max(0, MAX_CREW - dineRecipientIds.length);

        // lastActivity = max(seed createdAt, share timestamps relevant to this viewer)
        let lastActivity = seed.createdAt ?? 0;
        for (const s of shares) {
          if (s.bookingId !== id) continue;
          const senderInvolved = s.fromUserId === userId;
          const receiverInvolved =
            s.toUserId === userId && s.status === "accepted";
          if (!senderInvolved && !receiverInvolved) continue;
          const t = s.lastUpdatedAt ?? s.createdAt;
          if (t > lastActivity) lastActivity = t;
        }

        const redemption = redemptions[seed.id];
        const seedIsHistory = seed.status === "history";
        const isHistory = !!redemption || seedIsHistory;
        // Merge live redemption data over seed values so a seed history
        // entry (cancelled / pre-rated) keeps its own fields while a
        // freshly-redeemed booking gets ours.
        const rating = redemption?.rating ?? seed.rating;
        const savings = redemption?.savings ?? seed.savings;
        const redeemedAt = redemption?.redeemedAt ?? seed.redeemedAt;
        const outcome =
          seed.outcome ?? (redemption ? "redeemed" : undefined);

        return {
          ...seed,
          status: isHistory ? "history" : (seed.status ?? "upcoming"),
          outcome,
          rating,
          savings,
          redeemedAt,
          redeemed: isHistory,
          gifter,
          giftMessage: giftShare?.message ?? null,
          crew,
          hasPendingInvites,
          dineRecipientIds,
          remainingSlots,
          lastActivity: redeemedAt ?? lastActivity,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.lastActivity - a.lastActivity);
  }

  // Outsider gifts = gift shares sent to a phone number (no toUserId). They
  // count against OUTSIDER_GIFT_LIMIT regardless of status.
  function phoneGiftsUsedBy(userId) {
    return shares.filter(
      (s) => s.fromUserId === userId && s.type === "gift" && s.toPhone != null,
    ).length;
  }

  function pendingInvitationsForUser(userId) {
    return shares
      .filter(
        (s) =>
          s.toUserId === userId && s.type === "dine" && s.status === "pending",
      )
      .map((s) => {
        const booking = allBookings.find((b) => b.id === s.bookingId);
        if (!booking) return null;
        const deal = dealsById[booking.dealId];
        const restaurant = deal ? restaurantsById[deal.restaurantId] : null;
        const sender = usersById[s.fromUserId];
        if (!deal || !restaurant || !sender) return null;
        return { share: s, booking, deal, restaurant, sender };
      })
      .filter(Boolean);
  }

  const mariaFriends = maria.friendIds.map((id) => usersById[id]);
  const tomFriends = tom.friendIds.map((id) => usersById[id]);

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-start py-12 px-6 gap-10">
      <header className="max-w-3xl text-center space-y-2">
        {/* <h1 className="text-[32px] font-bold text-ink">{copy.app.title}</h1>
        <p className="text-ink-muted">{copy.app.subtitle}</p> */}
      </header>
      <div className="flex flex-wrap items-start justify-center gap-12">
        <PhoneFrame label={maria.fullName} sublabel="Sender">
          <BookingsScreen
            user={maria}
            bookings={bookingsForUser(maria.id)}
            pendingInvitations={pendingInvitationsForUser(maria.id)}
            friends={mariaFriends}
            shares={shares}
            phoneGiftsUsed={phoneGiftsUsedBy(maria.id)}
            phoneGiftLimit={OUTSIDER_GIFT_LIMIT}
            onShare={handleShare}
            onAcceptShare={handleAcceptShare}
            onDeclineShare={handleDeclineShare}
            onCreateBooking={({ deal }) =>
              handleCreateBooking({ userId: maria.id, deal })
            }
            onRedeemBooking={handleRedeemBooking}
            interactive
          />
        </PhoneFrame>
        <PhoneFrame label={tom.fullName} sublabel="Receiver">
          <BookingsScreen
            user={tom}
            bookings={bookingsForUser(tom.id)}
            pendingInvitations={pendingInvitationsForUser(tom.id)}
            friends={tomFriends}
            shares={shares}
            phoneGiftsUsed={phoneGiftsUsedBy(tom.id)}
            phoneGiftLimit={OUTSIDER_GIFT_LIMIT}
            onShare={handleShare}
            onAcceptShare={handleAcceptShare}
            onDeclineShare={handleDeclineShare}
            onCreateBooking={({ deal }) =>
              handleCreateBooking({ userId: tom.id, deal })
            }
            onRedeemBooking={handleRedeemBooking}
            interactive
          />
        </PhoneFrame>
      </div>
    </main>
  );
}

export default App;
