// User-curated lists of restaurants. Surfaced on UserDetailPage in a "Lists"
// tab next to Reviews. Each list belongs to one user (`userId`), has a
// playful title + short description, references restaurants by id, and
// carries:
//
//   - `bookmarkCount` → how many people saved the list. Shown under the
//     bookmark icon on ListCard / ListDetailPage.
//   - `friendsOnly`   → if true, the list is only visible to the author's
//     friends (and the author themselves). Non-friends never see the
//     list at all; friends see it rendered with a small green "Friends"
//     badge in the top-left corner of the card.
//
// `coverImage` is optional; consumers fall back to the first restaurant's
// image when it's missing.
const NOW = Date.now();
const DAY = 24 * 60 * 60 * 1000;

export const lists = [
  // ── Lena: enthusiast, lots of "definitive" picks
  {
    id: "list-lena-brunch",
    userId: "lena",
    name: "Best brunch in Berlin!!",
    description: "Crowd-pleasers + secret weapons",
    restaurantIds: ["camping-coffee", "morgenstern", "kombi-kitchen"],
    coverImage: null,
    bookmarkCount: 124,
    friendsOnly: false,
    createdAt: NOW - 40 * DAY,
  },
  {
    id: "list-lena-date",
    userId: "lena",
    name: "Date",
    description: "",
    restaurantIds: ["trattoria-libero", "the-spot", "izakaya-soto"],
    coverImage: null,
    bookmarkCount: 87,
    friendsOnly: false,
    createdAt: NOW - 9 * DAY,
  },

  // ── Yuki: food-obsessed, specific
  {
    id: "list-yuki-noodles",
    userId: "yuki",
    name: "noodles",
    description: "ramen, phở, biang biang, all of it",
    restaurantIds: ["mama-shu", "izakaya-soto", "pho-lan"],
    coverImage: null,
    bookmarkCount: 342,
    friendsOnly: false,
    createdAt: NOW - 18 * DAY,
  },

  // ── Mia: deal-hunter
  {
    id: "list-mia-broke",
    userId: "mia",
    name: "broke girl bistro",
    description: "eating well for under 15€ all week",
    restaurantIds: [
      "peter-pane",
      "camping-coffee",
      "taqueria-pico",
      "dosen-deli",
    ],
    coverImage: null,
    bookmarkCount: 218,
    friendsOnly: false,
    createdAt: NOW - 22 * DAY,
  },

  // ── Selin: very online
  {
    id: "list-selin-snack",
    userId: "selin",
    name: "selin",
    description: "places i go when i'm not really hungry but kinda am",
    restaurantIds: ["sandwich-society", "dosen-deli", "peter-pane"],
    coverImage: null,
    bookmarkCount: 54,
    friendsOnly: false,
    createdAt: NOW - 4 * DAY,
  },
  {
    id: "list-selin-vibe",
    userId: "selin",
    name: "the vibe",
    description: "for when you wanna be SEEN",
    restaurantIds: ["the-spot", "trattoria-libero", "izakaya-soto"],
    coverImage: null,
    bookmarkCount: 198,
    friendsOnly: false,
    createdAt: NOW - 14 * DAY,
  },

  // ── Asli: emotional, themed
  {
    id: "list-asli-feelings",
    userId: "asli",
    name: "mood",
    description: "places to visit after break up",
    restaurantIds: ["trattoria-libero", "tofu-and-co", "nono-pasta"],
    coverImage: null,
    bookmarkCount: 67,
    friendsOnly: false,
    createdAt: NOW - 30 * DAY,
  },

  // ── Karim: thoughtful curator
  {
    id: "list-karim-evening",
    userId: "karim",
    name: "tuesday night out",
    description: "Low-key, no booking required, never disappointing. ",
    restaurantIds: ["the-spot", "masala-house", "flammkuchen-haus"],
    coverImage: null,
    bookmarkCount: 31,
    friendsOnly: false,
    createdAt: NOW - 50 * DAY,
  },

  // ── Ola: wholesome, slow living
  {
    id: "list-ola-canal",
    userId: "ola",
    name: "Waterside",
    description: "",
    restaurantIds: ["morgenstern", "camping-coffee", "kombi-kitchen"],
    coverImage: null,
    bookmarkCount: 92,
    friendsOnly: false,
    createdAt: NOW - 12 * DAY,
  },

  // ── Lara: legend, all-rounder
  {
    id: "list-lara-favorites",
    userId: "lara",
    name: "meine favoriten",
    description: "",
    restaurantIds: [
      "peter-pane",
      "kombi-kitchen",
      "trattoria-libero",
      "the-spot",
      "morgenstern",
    ],
    coverImage: null,
    bookmarkCount: 411,
    friendsOnly: false,
    createdAt: NOW - 60 * DAY,
  },

  // ── Arabel (the demo user) — her own list, public
  {
    id: "list-maria-coffee",
    userId: "maria",
    name: "satloop",
    description: "rr",
    restaurantIds: ["camping-coffee", "morgenstern", "sandwich-society"],
    coverImage: null,
    bookmarkCount: 8,
    friendsOnly: true,
    createdAt: NOW - 6 * DAY,
  },

  // ── Friends-only lists from Arabel/Hicks's friend circle. These only
  // surface on UserDetailPage when the viewer is in the author's friendIds
  // (so Arabel sees Anna's friends-only list, but random social-only
  // viewers don't).
  // ── Anna (friend of Arabel)
  {
    id: "list-anna-date",
    userId: "anna",
    name: "date night radar",
    description: "Places i'd take someone i actually like",
    restaurantIds: ["trattoria-libero", "the-spot", "izakaya-soto"],
    coverImage: null,
    bookmarkCount: 12,
    friendsOnly: true,
    createdAt: NOW - 16 * DAY,
  },
  // ── Hannah (friend of Arabel)
  {
    id: "list-hannah-brunch",
    userId: "hannah",
    name: "brunch with my girls",
    description: "weekend dishonor",
    restaurantIds: ["morgenstern", "camping-coffee", "kombi-kitchen"],
    coverImage: null,
    bookmarkCount: 18,
    friendsOnly: true,
    createdAt: NOW - 25 * DAY,
  },
  // ── Felix (friend of both Arabel and Hicks) — public
  {
    id: "list-felix-burger",
    userId: "felix",
    name: "burger summit 2026",
    description: "goated",
    restaurantIds: ["ottos-burger", "peter-pane", "pizzeria-stella"],
    coverImage: null,
    bookmarkCount: 45,
    friendsOnly: false,
    createdAt: NOW - 11 * DAY,
  },
  // ── Sofia (friend of Hicks) — friends-only, so it shows up on Hicks's
  // side with the banner, hidden from Arabel.
  {
    id: "list-sofia-toms",
    userId: "sofia",
    name: "hik's hits",
    description: "what to feed him so he stops complaining",
    restaurantIds: ["camping-coffee", "ottos-burger", "taqueria-pico"],
    coverImage: null,
    bookmarkCount: 8,
    friendsOnly: true,
    createdAt: NOW - 7 * DAY,
  },
  // ── Emma (friend of Arabel) — public
  {
    id: "list-emma-quiet",
    userId: "emma",
    name: "quiet places to read",
    description: "good coffee",
    restaurantIds: ["camping-coffee", "sandwich-society", "dosen-deli"],
    coverImage: null,
    bookmarkCount: 22,
    friendsOnly: false,
    createdAt: NOW - 28 * DAY,
  },
];

export const listsByUserId = lists.reduce((acc, l) => {
  if (!acc[l.userId]) acc[l.userId] = [];
  acc[l.userId].push(l);
  return acc;
}, {});
