import { useState } from "react";
import { PhoneFrame } from "./components/PhoneFrame";
import { BookingsScreen } from "./screens/BookingsScreen";
import { users, usersById } from "./data/users";
import { bookings as seedBookings } from "./data/bookings";
import { dealsById } from "./data/deals";
import { restaurantsById } from "./data/restaurants";
import { copy } from "./copy";
import { MAX_CREW, OUTSIDER_GIFT_LIMIT } from "./lib/constants";

// Two demo phone users. IDs are still 'maria' / 'tom' under the hood — the
// seed shares and bookings reference those — but the display names are
// Arabel and Hicks.
const [arabel, hicks] = users;
const DEFAULT_BOOKMARKS_BY_USER_ID = {
  [arabel.id]: ["list-lena-date", "list-lena-brunch"],
  [hicks.id]: ["list-sofia-toms"],
};

function App() {
  const [shares, setShares] = useState([]);
  // Bookings the user creates from the "Book deal" flow on RestaurantDetailPage.
  // Combined with seedBookings to feed bookingsForUser — keeping them separate
  // means we never mutate the seed data.
  const [extraBookings, setExtraBookings] = useState([]);
  // Per-booking redemption data captured from the Redeem flow:
  //   { [bookingId]: { redeemedAt, savings? } }
  // Slide-to-redeem creates the entry (with redeemedAt only). When the
  // user finishes the rate sheet, savings is merged in.
  const [redemptions, setRedemptions] = useState({});
  // Per-user reviews — each diner on a booking can write their own rating
  // and review independently of whoever redeemed the deal:
  //   { [bookingId]: { [userId]: { rating, review, savedAt } } }
  const [userReviews, setUserReviews] = useState({});
  // Per-user bookmarks: which user-curated lists each phone user has saved.
  //   { [userId]: ["list-id-1", "list-id-2", ...] }
  // Lives in App so the saved state persists across opens of UserDetailPage
  // and ListDetailPage, and so the same user sees the same bookmark count
  // / filled icon from both surfaces.
  const [bookmarksByUserId, setBookmarksByUserId] = useState(
    DEFAULT_BOOKMARKS_BY_USER_ID,
  );
  // Per-phone StatusBar tone. Most screens are light-on-white; the redeem
  // flow's pre-redeem state runs on a dark background and reports up so the
  // single global StatusBar in PhoneFrame can flip to white text. Keyed by
  // user id so each phone is independent.
  const [statusBarToneByUserId, setStatusBarToneByUserId] = useState({});
  function handleSetStatusBarTone(userId, tone) {
    if (!userId) return;
    setStatusBarToneByUserId((prev) =>
      prev[userId] === tone ? prev : { ...prev, [userId]: tone },
    );
  }

  function handleToggleListBookmark(userId, listId) {
    if (!userId || !listId) return;
    setBookmarksByUserId((prev) => {
      const current = prev[userId] ?? [];
      const next = current.includes(listId)
        ? current.filter((id) => id !== listId)
        : [...current, listId];
      return { ...prev, [userId]: next };
    });
  }
  const allBookings = [...seedBookings, ...extraBookings];

  function handleRedeemBooking(bookingId, viewerId, data = {}) {
    if (!bookingId) return;
    const isFirstTime = !redemptions[bookingId];
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
    // On the very first redemption, fan out a "redeemed" share to each
    // accepted crew member so their phones get a toast + notification
    // ("Hicks redeemed your deal — leave a review"). The redeemer (the
    // viewer who actually ran the flow) is the share's `from` —
    // booking.userId would point at the gifter for gift transfers, not
    // at the person who just stood in the restaurant.
    if (isFirstTime) {
      const booking = allBookings.find((b) => b.id === bookingId);
      if (booking) {
        const redeemerId = viewerId ?? booking.userId;
        const crewIds = new Set();
        for (const s of shares) {
          if (
            s.bookingId === bookingId &&
            s.type === "dine" &&
            s.status === "accepted" &&
            s.toUserId !== redeemerId
          ) {
            crewIds.add(s.toUserId);
          }
        }
        const ts = Date.now();
        const fanOut = Array.from(crewIds).map((toUserId, i) => ({
          id: `redeemed-${bookingId}-${toUserId}-${ts}-${i}`,
          fromUserId: redeemerId,
          toUserId,
          toPhone: null,
          bookingId,
          dealId: booking.dealId,
          type: "redeemed",
          message: null,
          status: "accepted",
          createdAt: ts,
          lastUpdatedAt: ts,
        }));
        // Two side effects on first redemption:
        //   - fan out "redeemed" shares to anyone who accepted, and
        //   - drop pending dine invites for this booking — by the time the
        //     host has redeemed, the meal is moot and the invitee
        //     shouldn't still see an Accept/Decline notification.
        setShares((prev) => {
          if (
            prev.some((s) => s.bookingId === bookingId && s.type === "redeemed")
          ) {
            return prev;
          }
          const cleaned = prev.filter(
            (s) =>
              !(
                s.bookingId === bookingId &&
                s.type === "dine" &&
                s.status === "pending"
              ),
          );
          return fanOut.length > 0 ? [...cleaned, ...fanOut] : cleaned;
        });
      }
    }
  }

  function handleSaveReview(bookingId, userId, data = {}) {
    if (!bookingId || !userId) return;
    setUserReviews((prev) => ({
      ...prev,
      [bookingId]: {
        ...(prev[bookingId] ?? {}),
        [userId]: {
          ...(prev[bookingId]?.[userId] ?? {}),
          ...data,
          savedAt: Date.now(),
        },
      },
    }));
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

        // Recommendations the viewer sent for this booking — used to
        // highlight the ThumbsUp on the history card and surface the
        // recipients + message in a tap-through sheet.
        const sentRecommendations = shares
          .filter(
            (s) =>
              s.bookingId === seed.id &&
              s.type === "recommend" &&
              s.fromUserId === userId,
          )
          .map((s) => ({
            ...s,
            toUser: s.toUserId ? usersById[s.toUserId] : null,
          }))
          .filter((s) => s.toUser);
        // Per-user review for this booking. Each diner writes their own,
        // so the rating shown on the history card reflects the *viewer's*
        // take, not the host's. Falls back to the seed value only when the
        // viewer is the seed booking's owner (covers the pre-seeded history
        // entries that have a rating baked in).
        const myReview = userReviews[seed.id]?.[userId];
        const rating =
          myReview?.rating ??
          (seed.userId === userId ? seed.rating : undefined);
        const review = myReview?.review;
        const savings = redemption?.savings ?? seed.savings;
        const redeemedAt = redemption?.redeemedAt ?? seed.redeemedAt;
        const outcome = seed.outcome ?? (redemption ? "redeemed" : undefined);

        return {
          ...seed,
          status: isHistory ? "history" : (seed.status ?? "upcoming"),
          outcome,
          rating,
          review,
          hasReview: rating != null,
          savings,
          redeemedAt,
          redeemed: isHistory,
          gifter,
          giftMessage: giftShare?.message ?? null,
          crew,
          hasPendingInvites,
          dineRecipientIds,
          remainingSlots,
          sentRecommendations,
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

  const arabelFriends = arabel.friendIds.map((id) => usersById[id]);
  const hicksFriends = hicks.friendIds.map((id) => usersById[id]);

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-start py-12 px-6 gap-10">
      <header className="max-w-3xl text-center space-y-2">
        {/* <h1 className="text-[32px] font-bold text-ink">{copy.app.title}</h1>
        <p className="text-ink-muted">{copy.app.subtitle}</p> */}
      </header>
      <div className="flex flex-wrap items-start justify-center gap-12">
        <PhoneFrame
          user={arabel}
          role="User A"
          statusBarDark={statusBarToneByUserId[arabel.id] === "dark"}
        >
          <BookingsScreen
            user={arabel}
            bookings={bookingsForUser(arabel.id)}
            pendingInvitations={pendingInvitationsForUser(arabel.id)}
            friends={arabelFriends}
            shares={shares}
            phoneGiftsUsed={phoneGiftsUsedBy(arabel.id)}
            phoneGiftLimit={OUTSIDER_GIFT_LIMIT}
            onShare={handleShare}
            onAcceptShare={handleAcceptShare}
            onDeclineShare={handleDeclineShare}
            onCreateBooking={({ deal }) =>
              handleCreateBooking({ userId: arabel.id, deal })
            }
            onRedeemBooking={handleRedeemBooking}
            onSaveReview={handleSaveReview}
            bookmarkedListIds={bookmarksByUserId[arabel.id] ?? []}
            onToggleListBookmark={(listId) =>
              handleToggleListBookmark(arabel.id, listId)
            }
            onSetStatusBarTone={(tone) =>
              handleSetStatusBarTone(arabel.id, tone)
            }
            interactive
          />
        </PhoneFrame>
        <PhoneFrame
          user={hicks}
          role="User B"
          statusBarDark={statusBarToneByUserId[hicks.id] === "dark"}
        >
          <BookingsScreen
            user={hicks}
            bookings={bookingsForUser(hicks.id)}
            pendingInvitations={pendingInvitationsForUser(hicks.id)}
            friends={hicksFriends}
            shares={shares}
            phoneGiftsUsed={phoneGiftsUsedBy(hicks.id)}
            phoneGiftLimit={OUTSIDER_GIFT_LIMIT}
            onShare={handleShare}
            onAcceptShare={handleAcceptShare}
            onDeclineShare={handleDeclineShare}
            onCreateBooking={({ deal }) =>
              handleCreateBooking({ userId: hicks.id, deal })
            }
            onRedeemBooking={handleRedeemBooking}
            onSaveReview={handleSaveReview}
            bookmarkedListIds={bookmarksByUserId[hicks.id] ?? []}
            onToggleListBookmark={(listId) =>
              handleToggleListBookmark(hicks.id, listId)
            }
            onSetStatusBarTone={(tone) =>
              handleSetStatusBarTone(hicks.id, tone)
            }
            interactive
          />
        </PhoneFrame>
      </div>
    </main>
  );
}

export default App;
