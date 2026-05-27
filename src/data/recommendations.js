// Recommendations are directed: each entry has a `targetUserId` pointing at
// the friend the recommendation was sent to. When a deal page renders
// recommenders for a viewer, only the entries whose target matches the
// viewer's id are shown (and the viewer's own recommendations are further
// excluded, so they don't see themselves in their own deal cards).
//
// Messages are written like real DMs / instagram stories: tossed off,
// referential, internet-ty. They're aimed at one specific friend, not a
// public review, so casual + personal is the vibe.
//
// `createdAt` is used by RestaurantDetailPage to hide avatars after the
// viewer has already booked this deal — only recommendations made *after*
// the viewer's last booking for the deal keep surfacing. Most demo entries
// are seeded several days back so the "you've already booked this" cases
// drop the avatars; a handful are deliberately recent to demonstrate the
// "new recommendation after your booking" path.
const NOW = Date.now();
const DAY = 24 * 60 * 60 * 1000;

export const recommendations = [
  // ── flash-cookie (1€ Cookie at Peter Pane)
  {
    dealId: "flash-cookie",
    userId: "maria",
    targetUserId: "tom",
    message: "cookie",
    createdAt: NOW - 18 * DAY,
  },
  {
    dealId: "flash-cookie",
    userId: "anna",
    targetUserId: "maria",
    message:
      "broo i had this yesterday i literally cant stop thinking about it",
    createdAt: NOW - 12 * DAY,
  },
  {
    dealId: "flash-cookie",
    userId: "felix",
    targetUserId: "maria",
    message: "Highway robbery in the best way",
    createdAt: NOW - 9 * DAY,
  },
  {
    dealId: "flash-cookie",
    userId: "lukas",
    targetUserId: "maria",
    message: "remember when we said we'd do a cookie crawl. plz start here",
    createdAt: NOW - 5 * DAY,
  },
  {
    dealId: "flash-cookie",
    userId: "tom",
    targetUserId: "maria",
    message: "saw mia post about this last week and yeah she was right",
    createdAt: NOW - 2 * DAY,
  },

  // ── coffee-dessert-bundle (Peter Pane)
  {
    dealId: "coffee-dessert-bundle",
    userId: "maria",
    targetUserId: "tom",
    message: "remember when we were broke last month. THIS would have saved us",
    createdAt: NOW - 6 * DAY,
  },

  // ── menu-upgrade (The Spot)
  {
    dealId: "menu-upgrade",
    userId: "anna",
    targetUserId: "maria",
    message: "thinking abt that 6 course we did at the spot. go w hannah",
    createdAt: NOW - 22 * DAY,
  },
  {
    dealId: "menu-upgrade",
    userId: "hannah",
    targetUserId: "maria",
    message: "Uour bday is coming up Consider this my contribution to planning",
    createdAt: NOW - 4 * DAY,
  },

  // ── 2for1-bowl (Camping Coffee)
  {
    dealId: "2for1-bowl",
    userId: "tom",
    targetUserId: "maria",
    message: "you owe me a lunch!!",
    createdAt: NOW - 14 * DAY,
  },
  {
    dealId: "2for1-bowl",
    userId: "sofia",
    targetUserId: "tom",
    message: "ok so this is now our spot",
    createdAt: NOW - 8 * DAY,
  },
  {
    dealId: "2for1-bowl",
    userId: "niko",
    targetUserId: "tom",
    message: "bro i went here twice this week. the spicy chicken one please",
    createdAt: NOW - 3 * DAY,
  },

  // ── free-burger (Otto's Burger)
  {
    dealId: "free-burger",
    userId: "felix",
    targetUserId: "tom",
    message:
      "i KNOW you. i know what burger you'll order. just go. the free side is unreal",
    createdAt: NOW - 11 * DAY,
  },

  // ── welcome-glass (The Spot)
  {
    dealId: "welcome-glass",
    userId: "felix",
    targetUserId: "tom",
    message: "Thinking abt u",
    createdAt: NOW - 7 * DAY,
  },
  {
    dealId: "welcome-glass",
    userId: "hannah",
    targetUserId: "maria",
    message: "tuesday night the spot you in?",
    createdAt: NOW - 1 * DAY,
  },

  // ── coffee-loyalty (Camping Coffee)
  {
    dealId: "coffee-loyalty",
    userId: "tom",
    targetUserId: "maria",
    message: "already on stamp 4 this month. it's a problem. join me!!",
    createdAt: NOW - 6 * DAY,
  },

  // ── extra-patty (Otto's Burger)
  {
    dealId: "extra-patty",
    userId: "maria",
    targetUserId: "tom",
    message:
      "fyi i did the double the other day and im a changed woman. sending bc i love u",
    createdAt: NOW - 4 * DAY,
  },
];

export const recommendationsByDealId = recommendations.reduce((acc, r) => {
  if (!acc[r.dealId]) acc[r.dealId] = [];
  acc[r.dealId].push(r);
  return acc;
}, {});

// Filter helper: returns only the recommendations addressed to `viewerId`,
// excluding any the viewer made themselves. Use this everywhere a viewer
// is shown recommenders for a deal (deal card avatars, recommendations
// sheet, redeem-flow thank avatars, etc.).
export function recommendationsForViewer(dealId, viewerId) {
  if (!viewerId) return [];
  const all = recommendationsByDealId[dealId] ?? [];
  return all.filter(
    (r) => r.targetUserId === viewerId && r.userId !== viewerId,
  );
}
