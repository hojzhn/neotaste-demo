const NOW = Date.now()
const DAY = 24 * 60 * 60 * 1000

// Helper for seeded historical bookings — fixed dates so the History tab
// always has something to render regardless of when the demo is opened.
const fixed = (y, m, d, h = 13, min = 24) =>
  new Date(y, m - 1, d, h, min).getTime()

export const bookings = [
  {
    id: 'b-maria-1',
    userId: 'maria',
    dealId: 'menu-upgrade',
    dateLabel: 'Today',
    timeWindow: '19:00 – 22:00',
    status: 'upcoming',
    createdAt: NOW - 3 * DAY,
  },
  {
    id: 'b-maria-2',
    userId: 'maria',
    dealId: '2for1-bowl',
    dateLabel: 'Tomorrow',
    timeWindow: '12:00 – 15:00',
    status: 'upcoming',
    createdAt: NOW - 1 * DAY,
  },
  {
    id: 'b-tom-1',
    userId: 'tom',
    dealId: 'free-burger',
    dateLabel: 'Sunday',
    timeWindow: '18:00 – 21:00',
    status: 'upcoming',
    createdAt: NOW - 2 * DAY,
  },
  // ── seeded history ────────────────────────────────────────────────
  {
    id: 'b-maria-h1',
    userId: 'maria',
    dealId: 'menu-upgrade',
    dateLabel: '08.03.2026',
    timeWindow: '13:24',
    status: 'history',
    outcome: 'redeemed',
    rating: 4,
    savings: 9,
    redeemedAt: fixed(2026, 3, 8, 13, 24),
    createdAt: fixed(2026, 3, 8, 13, 24),
  },
  {
    id: 'b-maria-h2',
    userId: 'maria',
    dealId: '2for1-bowl',
    dateLabel: '08.03.2026',
    timeWindow: '',
    status: 'history',
    outcome: 'cancelled',
    redeemedAt: fixed(2026, 3, 8, 19, 0),
    createdAt: fixed(2026, 3, 8, 19, 0),
  },
  {
    id: 'b-tom-h1',
    userId: 'tom',
    dealId: 'free-burger',
    dateLabel: '14.02.2026',
    timeWindow: '20:10',
    status: 'history',
    outcome: 'redeemed',
    rating: 5,
    savings: 12,
    redeemedAt: fixed(2026, 2, 14, 20, 10),
    createdAt: fixed(2026, 2, 14, 20, 10),
  },
]
