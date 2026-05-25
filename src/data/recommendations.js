// Friends who recommend a given deal. Each entry has a short personal
// message — surfaced as the "You'll love this!"-style tooltip on the deal
// card and listed in full inside the long-press recommendations view.
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
  {
    dealId: "flash-cookie",
    userId: "maria",
    message: "You'll love this!",
    createdAt: NOW - 18 * DAY,
  },
  {
    dealId: "flash-cookie",
    userId: "anna",
    message: "Best cookie I had in months.",
    createdAt: NOW - 12 * DAY,
  },
  {
    dealId: "flash-cookie",
    userId: "felix",
    message: "Worth every cent.",
    createdAt: NOW - 9 * DAY,
  },
  {
    dealId: "flash-cookie",
    userId: "lukas",
    message: "Go for the chocolate one.",
    createdAt: NOW - 5 * DAY,
  },
  {
    dealId: "flash-cookie",
    userId: "tom",
    message: "Cookie + coffee = perfect.",
    createdAt: NOW - 2 * DAY,
  },

  {
    dealId: "coffee-dessert-bundle",
    userId: "maria",
    message: "Such a steal for the quality.",
    createdAt: NOW - 6 * DAY,
  },

  {
    dealId: "menu-upgrade",
    userId: "anna",
    message: "The 6-course is amazing.",
    createdAt: NOW - 22 * DAY,
  },
  {
    dealId: "menu-upgrade",
    userId: "hannah",
    message: "Go hungry! Portions are huge.",
    createdAt: NOW - 4 * DAY,
  },

  {
    dealId: "2for1-bowl",
    userId: "tom",
    message: "Order the spicy chicken bowl.",
    createdAt: NOW - 14 * DAY,
  },
  {
    dealId: "2for1-bowl",
    userId: "sofia",
    message: "Great for a quick lunch.",
    createdAt: NOW - 8 * DAY,
  },
  {
    dealId: "2for1-bowl",
    userId: "niko",
    message: "Generous portions, fresh ingredients.",
    createdAt: NOW - 3 * DAY,
  },

  {
    dealId: "free-burger",
    userId: "felix",
    message: "The free side beats the entrée at most spots.",
    createdAt: NOW - 11 * DAY,
  },

  {
    dealId: "welcome-glass",
    userId: "felix",
    message: "Pairs perfectly with the lamb.",
    createdAt: NOW - 7 * DAY,
  },
  {
    dealId: "welcome-glass",
    userId: "hannah",
    message: "Lovely touch on a Tuesday night.",
    createdAt: NOW - 1 * DAY,
  },

  {
    dealId: "coffee-loyalty",
    userId: "tom",
    message: "Already on my fourth stamp this month.",
    createdAt: NOW - 6 * DAY,
  },

  {
    dealId: "extra-patty",
    userId: "maria",
    message: "For €1 extra, why would you not?",
    createdAt: NOW - 4 * DAY,
  },
  {
    dealId: "extra-patty",
    userId: "anna",
    message: "Double cheese is the move.",
    createdAt: NOW - 1 * DAY,
  },
];

export const recommendationsByDealId = recommendations.reduce((acc, r) => {
  if (!acc[r.dealId]) acc[r.dealId] = [];
  acc[r.dealId].push(r);
  return acc;
}, {});
