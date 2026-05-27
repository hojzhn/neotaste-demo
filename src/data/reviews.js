// Reviews are keyed by reviewer userId (looks up via usersById), so tapping
// a reviewer's avatar from anywhere can navigate to that user's profile in
// UserDetailPage. Each review has an `ageDays` field plus optional `photos`
// + `likes`.
//
// Each reviewer has a personality / writing style — try to keep each
// individual user consistent across their reviews so their profile feels
// like one voice. Voices used here:
//
//   johanna  → tidy capitalisation, warm, descriptive. Occasionally drops
//              a friendly emoticon. Writes like she means it.
//   tunganh  → short, lowercase, deadpan. Wry humor.
//   mia      → very online. lowercase. "ngl", "fr", "tbh". Loves a deal.
//   jan      → proper grammar, complete sentences. The reliable reviewer.
//   karim    → considered, balanced. Often opens with context.
//   lena     → enthusiast. Full sentences, ALL CAPS for emphasis.
//   max      → blunt, telegraphic. Two-clause max.
//   sara     → expressive. SCREAMS in caps. Lots of exclamation.
//   lara     → German first language. Switches between de/en freely.
//   marvin   → snarky internet voice. mostly lowercase.
//   selin    → very online, "no cap" "fr". Sentence fragments.
//   kosta    → practical, slightly grumpy. Honest takes.
//   yuki     → food obsessive. Long, articulate, occasional caps for the dish.
//   ola      → ramble-y, descriptive, often wholesome.
//   jasper   → casual newbie. Simple takes. Earnest.
//   asli     → emotional, expressive, with a literary streak.
//   theo     → thoughtful, proper grammar. Mentions service often.
//
export const reviews = [
  // ── peter-pane ─────────────────────────────────────────────────
  {
    id: "r-pp-1",
    restaurantId: "peter-pane",
    userId: "johanna",
    rating: 5,
    text: "The burger of my dreams, honestly. Went on a Tuesday and snagged the 1€ cookie deal too, what a combo. Staff were lovely :)",
    ageDays: 21,
    photos: [
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400&auto=format&fit=crop",
    ],
    likes: 16,
  },
  {
    id: "r-pp-2",
    restaurantId: "peter-pane",
    userId: "tunganh",
    rating: 2,
    text: "lecker. forgot half my order though. character building",
    ageDays: 7,
    photos: [],
    likes: 4,
  },
  {
    id: "r-pp-3",
    restaurantId: "peter-pane",
    userId: "mia",
    rating: 4,
    text: "ok the cookie deal is so unserious. like 1€?? fresh baked?? on a sunday afternoon?? insane behavior. food was fine ngl",
    ageDays: 14,
    photos: [
      "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&auto=format&fit=crop",
    ],
    likes: 9,
  },
  {
    id: "r-pp-4",
    restaurantId: "peter-pane",
    userId: "lara",
    rating: 5,
    text: "Super lecker, super nett und einfach schöne Atmosphäre. Die Preise sind sehr fair! Gerne wieder.",
    ageDays: 30,
    photos: [],
    likes: 22,
  },
  {
    id: "r-pp-5",
    restaurantId: "peter-pane",
    userId: "marvin",
    rating: 3,
    text: "place is fine ig. fries were lukewarm. the bun tho? immaculate.",
    ageDays: 4,
    photos: [],
    likes: 2,
  },

  // ── the-spot ───────────────────────────────────────────────────
  {
    id: "r-spot-1",
    restaurantId: "the-spot",
    userId: "jan",
    rating: 5,
    text: "The 6-course menu was outstanding. Each course felt deliberate, and the wine pairings made sense without being precious about it. Worth the upgrade.",
    ageDays: 3,
    photos: [],
    likes: 28,
  },
  {
    id: "r-spot-2",
    restaurantId: "the-spot",
    userId: "karim",
    rating: 4,
    text: "Came in on a weekday for the welcome glass deal. Wine was decent, service attentive without being intrusive. The lamb is what you order.",
    ageDays: 12,
    photos: [],
    likes: 7,
  },
  {
    id: "r-spot-3",
    restaurantId: "the-spot",
    userId: "lena",
    rating: 5,
    text: "Took my PARENTS and they were obsessed. Dad still texts me about the lamb. The Menu Upgrade is genuinely a steal, do not even hesitate. 11/10!!",
    ageDays: 60,
    photos: [
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&auto=format&fit=crop",
    ],
    likes: 41,
  },
  {
    id: "r-spot-4",
    restaurantId: "the-spot",
    userId: "selin",
    rating: 4,
    text: "vibes >>> food honestly. but the food also good so. mediterranean done right no cap",
    ageDays: 9,
    photos: [],
    likes: 15,
  },

  // ── camping-coffee ─────────────────────────────────────────────
  {
    id: "r-camping-1",
    restaurantId: "camping-coffee",
    userId: "lena",
    rating: 5,
    text: "Found my new brunch HQ. Bowls are huge, coffee is excellent, and the team genuinely seems happy to be there. Bowls are a personality trait now.",
    ageDays: 10,
    photos: [
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&auto=format&fit=crop",
    ],
    likes: 12,
  },
  {
    id: "r-camping-2",
    restaurantId: "camping-coffee",
    userId: "ola",
    rating: 4,
    text: "Did the 2for1 bowl with a friend, we made it a whole afternoon. Sat by the window, watched the world go by, talked about nothing. Hit a sweet spot where the food is great and the place wants you to linger. Spicy chicken would order again.",
    ageDays: 18,
    photos: [],
    likes: 31,
  },
  {
    id: "r-camping-3",
    restaurantId: "camping-coffee",
    userId: "kosta",
    rating: 3,
    text: "Coffee is genuinely good. Seating on a Saturday morning is brutal. Wear comfy shoes if you're going to stand.",
    ageDays: 5,
    photos: [],
    likes: 6,
  },

  // ── ottos-burger ───────────────────────────────────────────────
  {
    id: "r-otto-1",
    restaurantId: "ottos-burger",
    userId: "max",
    rating: 4,
    text: "best burgers in schanze. fries cold today. patty perfect.",
    ageDays: 5,
    photos: [],
    likes: 7,
  },
  {
    id: "r-otto-2",
    restaurantId: "ottos-burger",
    userId: "sara",
    rating: 5,
    text: "FREE SIDE WITH ANY BURGER???!! I went sweet potato fries and have ZERO regrets. PLEASE EAT HERE!!!!",
    ageDays: 1,
    photos: [],
    likes: 3,
  },
  {
    id: "r-otto-3",
    restaurantId: "ottos-burger",
    userId: "yuki",
    rating: 5,
    text: "Listen. The BBQ Smashie. It is so unserious of them to make a burger that good and just casually have it on the menu. Beef-to-cheese ratio is a SCIENCE. I am deeply unwell about it.",
    ageDays: 11,
    photos: [
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop",
    ],
    likes: 88,
  },
  {
    id: "r-otto-4",
    restaurantId: "ottos-burger",
    userId: "jasper",
    rating: 4,
    text: "First time and now I kinda need to live near it. Sorry to my wallet.",
    ageDays: 2,
    photos: [],
    likes: 5,
  },

  // ── mama-shu ───────────────────────────────────────────────────
  {
    id: "r-mama-1",
    restaurantId: "mama-shu",
    userId: "yuki",
    rating: 5,
    text: "Phở with their homemade chili oil is the best in Mitte and I'm willing to put that in writing. Broth has DEPTH. Order the bún chả too.",
    ageDays: 6,
    photos: [],
    likes: 54,
  },
  {
    id: "r-mama-2",
    restaurantId: "mama-shu",
    userId: "selin",
    rating: 4,
    text: "bún chả slaps. place is TINY. book or get there early fr",
    ageDays: 22,
    photos: [],
    likes: 19,
  },
  {
    id: "r-mama-3",
    restaurantId: "mama-shu",
    userId: "marvin",
    rating: 5,
    text: "third visit this month. send help. or send phở.",
    ageDays: 3,
    photos: [],
    likes: 11,
  },

  // ── trattoria-libero ───────────────────────────────────────────
  {
    id: "r-trat-1",
    restaurantId: "trattoria-libero",
    userId: "asli",
    rating: 5,
    text: "The carbonara was a small religious experience. Pasta with the kind of egg-cheese-pepper alchemy you usually only get if your nonna's in the kitchen. The wine list is also incredibly well thought out. Take a date.",
    ageDays: 15,
    photos: [
      "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&auto=format&fit=crop",
    ],
    likes: 42,
  },
  {
    id: "r-trat-2",
    restaurantId: "trattoria-libero",
    userId: "theo",
    rating: 4,
    text: "Tiramisu was great. Mains were just okay, but the service made up for it. Genuine warmth from the staff, which is rarer than it should be.",
    ageDays: 28,
    photos: [],
    likes: 13,
  },
  {
    id: "r-trat-3",
    restaurantId: "trattoria-libero",
    userId: "ola",
    rating: 5,
    text: "Quietly one of those places where you walk in and instantly relax. Came on a rainy Wednesday, ate slowly, drank red wine, lost track of time. Italian aunties would approve, which is the highest compliment I can pay a pasta place.",
    ageDays: 8,
    photos: [],
    likes: 27,
  },

  // ── izakaya-soto ───────────────────────────────────────────────
  {
    id: "r-izakaya-1",
    restaurantId: "izakaya-soto",
    userId: "yuki",
    rating: 5,
    text: "Finally an izakaya in Berlin that actually understands the format. The karaage is dangerous. Order more sake than you think you need.",
    ageDays: 17,
    photos: [],
    likes: 36,
  },
  {
    id: "r-izakaya-2",
    restaurantId: "izakaya-soto",
    userId: "kosta",
    rating: 3,
    text: "Food was good. A bit pricy. Staff were rushed on the night we went, maybe just busy.",
    ageDays: 4,
    photos: [],
    likes: 2,
  },

  // ── taqueria-pico ──────────────────────────────────────────────
  {
    id: "r-taq-1",
    restaurantId: "taqueria-pico",
    userId: "selin",
    rating: 4,
    text: "al pastor hit. salsa bar criminally underrated. byo napkins",
    ageDays: 9,
    photos: [
      "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&auto=format&fit=crop",
    ],
    likes: 21,
  },
  {
    id: "r-taq-2",
    restaurantId: "taqueria-pico",
    userId: "asli",
    rating: 5,
    text: "The margaritas almost did me in. Tacos in the meantime were a quiet 10. Will absolutely repeat this mistake.",
    ageDays: 33,
    photos: [],
    likes: 18,
  },

  // ── kombi-kitchen ──────────────────────────────────────────────
  {
    id: "r-kombi-1",
    restaurantId: "kombi-kitchen",
    userId: "lara",
    rating: 5,
    text: "Die spicy peanut noodles werden dich zu einem besseren Menschen machen. Ja wirklich. Best comfort food in Kreuzberg.",
    ageDays: 19,
    photos: [],
    likes: 67,
  },
  {
    id: "r-kombi-2",
    restaurantId: "kombi-kitchen",
    userId: "theo",
    rating: 4,
    text: "Menu rotates often, which is a win or a loss depending on whether your favourite dish made the cut that week.",
    ageDays: 11,
    photos: [],
    likes: 9,
  },

  // ── masala-house ───────────────────────────────────────────────
  {
    id: "r-masala-1",
    restaurantId: "masala-house",
    userId: "karim",
    rating: 5,
    text: "Best butter chicken in Prenzlauer Berg, fight me on this. Naan came out hot and pillowy, exactly the way it should be.",
    ageDays: 7,
    photos: [],
    likes: 25,
  },
  {
    id: "r-masala-2",
    restaurantId: "masala-house",
    userId: "mia",
    rating: 4,
    text: "thali is the move tbh. so much food i couldn't even finish, which is a sentence i've never said before",
    ageDays: 14,
    photos: [],
    likes: 14,
  },

  // ── morgenstern ────────────────────────────────────────────────
  {
    id: "r-mor-1",
    restaurantId: "morgenstern",
    userId: "ola",
    rating: 5,
    text: "The eggs benedict here is the kind of thing you start planning your Sunday around. Canal view is the cherry on top. Saturday queue is real, but worth it.",
    ageDays: 5,
    photos: [],
    likes: 73,
  },
  {
    id: "r-mor-2",
    restaurantId: "morgenstern",
    userId: "jasper",
    rating: 4,
    text: "Decent brunch. The canal view doesn't hurt either. Wifi is mid.",
    ageDays: 12,
    photos: [],
    likes: 6,
  },

  // ── pizzeria-stella ────────────────────────────────────────────
  {
    id: "r-stella-1",
    restaurantId: "pizzeria-stella",
    userId: "johanna",
    rating: 5,
    text: "Neapolitan pizza done properly. Wood-fired oven, leopard spots, the works. I came back the next day. Apologise to no one for it.",
    ageDays: 6,
    photos: [
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&auto=format&fit=crop",
    ],
    likes: 102,
  },
  {
    id: "r-stella-2",
    restaurantId: "pizzeria-stella",
    userId: "max",
    rating: 4,
    text: "diavola = dreams made of. burrata starter = real.",
    ageDays: 20,
    photos: [],
    likes: 22,
  },

  // ── nono-pasta ─────────────────────────────────────────────────
  {
    id: "r-nono-1",
    restaurantId: "nono-pasta",
    userId: "lena",
    rating: 5,
    text: "Fresh pasta made right in front of you and a tiny little bar to sit at. Brought my mum, she nearly cried (the GOOD kind). Order the cacio e pepe!!",
    ageDays: 24,
    photos: [],
    likes: 48,
  },

  // ── tofu-and-co ────────────────────────────────────────────────
  {
    id: "r-tofu-1",
    restaurantId: "tofu-and-co",
    userId: "asli",
    rating: 5,
    text: "Came in skeptical, left a convert. The crispy tofu bowl has a kind of weight to it, you can tell someone gave a damn. I'll be back.",
    ageDays: 9,
    photos: [],
    likes: 38,
  },
];

export const reviewsByRestaurantId = reviews.reduce((acc, r) => {
  if (!acc[r.restaurantId]) acc[r.restaurantId] = [];
  acc[r.restaurantId].push(r);
  return acc;
}, {});

export const reviewsByUserId = reviews.reduce((acc, r) => {
  if (!acc[r.userId]) acc[r.userId] = [];
  acc[r.userId].push(r);
  return acc;
}, {});
