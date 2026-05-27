# NeoTaste — deal-sharing demo

An interactive portfolio piece exploring how a NeoTaste-style restaurant-deals
app could feel if the social layer were treated as a first-class surface:
gifting a deal, inviting friends to dine on it, thanking the friend whose
recommendation brought you in, and discovering new spots from people you
follow.

The whole thing is a static React app — no backend, all state lives in
memory — but it simulates two real users (**Arabel** and **Hicks**) talking
to each other so that shares, accepts, redemptions, thanks and
recommendations all round-trip live between the two phones on screen.

## What the demo shows

- **Two phones side-by-side on desktop.** Arabel's screen on the left,
  Hicks's on the right. Gift Hicks a deal from Arabel and watch the toast
  + notification land on his side instantly.
- **One phone on mobile** (≤ md breakpoint). Full-screen, no bezel. A
  bottom-left FAB flips the view to the other user with a 3D card flip,
  and lights up with a red `!` badge whenever the other user has a fresh
  unread share.
- **Four master tabs** wired in TabBar order: Home, Feed, Discover,
  Bookings, Profile. Home and Feed are intentionally inert (faded out);
  Discover, Bookings, and Profile slide horizontally as paired panels.

### Flows you can poke at

- **Gift** a deal → recipient gets a toast + notification. The booking
  transfers ownership; you lose it from Upcoming, they gain it (with a
  red gift chip on the cover image).
- **Invite to dine** (≤ MAX_CREW friends) → pending invites with
  Accept / Decline. Accepted ones turn into crew avatars on the card.
- **Slide-to-redeem** → the dark-green ticket card flips to a bright
  redeemed state. Crew members get a "X redeemed your deal" toast +
  notification. Attribution comes from the actual redeemer (not
  `booking.userId`), so gifted deals don't mis-attribute the redemption
  back to the gifter.
- **Rate + recommend after redeeming** → thank the friends who got you
  here (gifter + targeted recommenders), then optionally recommend
  forward to a friend group. Already-thanked / "consumed by a prior
  redemption" recommenders are filtered out.
- **Discover** → map view with a real basemap image, restaurant pins
  rendered from data, and a peek drawer at the bottom. Pins where a
  friend has recommended the place to you swap their N for a ThumbsUp +
  tiny count badge. Tap a pin → floating card with deals + a brand-darker
  "X recommends this" banner (or white "X was here" for friend reviews).
  Tap the banner to cycle through every friend's take.
- **Your lists** → toggle the bottom drawer to a list of bookmarked /
  authored restaurant lists. Tap a list to filter the map to its spots
  and swap the drawer to list-detail; un-bookmark (or X if it's yours)
  from the header.

## Tech stack

| | |
|---|---|
| Build | [Vite 8](https://vite.dev) + React 19 |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) via `@tailwindcss/vite` |
| Animation | [framer-motion 12](https://www.framer.com/motion/) |
| Icons | [lucide-react](https://lucide.dev/) |
| Utility | `clsx` for conditional class composition |

## Running locally

```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # → dist/
npm run preview # serve the production build
npm run lint    # eslint .
```

## Deploying

Vercel auto-detects Vite. Push to GitHub, import the repo, accept the
defaults (Framework: Vite, Build: `npm run build`, Output: `dist`).

## Project layout

```
src/
├── App.jsx              ← top-level: lifts all cross-phone state, picks
│                          desktop (two phones) vs mobile (one + FAB)
├── main.jsx
├── index.css            ← @import "tailwindcss"; + @theme tokens
├── copy.js              ← every user-facing string (no inline copy)
├── data/                ← seed data (no hardcoded data in components)
│   ├── users.js         ← Arabel + Hicks + ~15 supporting characters
│   ├── restaurants.js   ← 20 restaurants with mapX / mapY pin coords
│   ├── deals.js         ← deals keyed to restaurants
│   ├── bookings.js      ← seeded bookings (upcoming + history)
│   ├── lists.js         ← user-curated restaurant lists
│   ├── recommendations.js
│   └── reviews.js
├── img/
│   ├── 1.jpg            ← Arabel avatar photo
│   ├── 2.jpg            ← Hicks avatar photo
│   └── discover-map.png ← basemap for the Discover tab
├── screens/
│   ├── BookingsScreen.jsx   ← Bookings tab + the deep overlay machinery
│   ├── DiscoverScreen.jsx   ← Discover map + drawer + map controls
│   └── MyProfileScreen.jsx  ← thin wrapper around UserDetailPage
├── components/
│   ├── PhoneFrame.jsx       ← bezel + global back / bell / StatusBar
│   ├── SlideInOverlay.jsx   ← in-tab slide-in pages
│   ├── BottomSheet.jsx      ← multi-snap draggable sheet
│   ├── Pin.jsx              ← NeoTaste map pin (teardrop + N or 👍×N)
│   ├── …                    ← cards, chips, avatars, etc.
└── lib/constants.js          ← MAX_CREW, OUTSIDER_GIFT_LIMIT, etc.
```

## Architecture notes

### State lifted to `App.jsx`

`App.jsx` is the source of truth for everything that needs to round-trip
between the two phones:

| state | shape |
|---|---|
| `shares` | every gift / dine / recommend / thank / redeemed share, in send order |
| `extraBookings` | bookings created via the "Book deal" flow |
| `redemptions` | per-booking redemption metadata (`redeemedAt`, `savings`) |
| `userReviews` | per-booking-per-user rating + review (each diner has their own) |
| `bookmarksByUserId` | which lists each user has saved |
| `statusBarToneByUserId` | dark / light StatusBar tone per phone (driven by RedeemFlow) |
| `notificationsSeenAtByUserId` | last bell-tap timestamp per phone (drives bell dot + mobile FAB) |
| `mobileActiveUserId` | which phone is in the foreground on mobile |

Helpers in `App.jsx` derive per-user views from this raw state:
`bookingsForUser`, `pendingInvitationsForUser`, `phoneGiftsUsedBy`, plus
`latestIncomingFor` / `hasUnreadFor` for the bell + mobile flip dot.

### `PhoneFrame` owns the device chrome

The phone bezel, status bar, back chevron, and bell button all live in
`PhoneFrame` — not in the screens. A small React Context exposes a
`usePushPhoneChrome(kind, value)` hook so any descendant can register a
back-handler or bell config. The chrome is a **stack**: the topmost
entry wins, so a RestaurantDetailPage with a nested BookingConfirmation
can override the back action without coordinating with its parent.
Closing a screen transparently restores whatever was active under it.

In **naked** mode (`<PhoneFrame naked>`), the bezel is dropped and the
screen interior fills the viewport — used by the mobile App layout.

### Master tabs slide as a single track

`BookingsScreen` plays the role of "phone shell" — it owns the three
master tab panels (Discover, Bookings, Profile) and renders them as
absolutely-positioned `motion.div`s with `animate.x` computed from
`(panelIndex - activeIndex) * 100%`. The deep slide-in overlays
(RestaurantDetail, UserDetail, Notifications) are rendered **inside**
the bookings panel via the `SlideInOverlay` component, so they travel
left along with the panel when you swap to Profile.

The Notifications overlay tracks an `origin` tab so the same overlay
component can render in the Bookings panel or the Profile panel
depending on which tab launched it.

### BottomSheet has three snap positions

`compact` (≈ 35% hidden), `peek` (≈ 82% hidden), `full` (0% hidden). The
Discover screen uses a controlled `snap` prop driven by an effect:
entering list-mode or picking a specific list forces the sheet to
`compact`; backing out returns it to `peek`. After the forced snap the
user can drag freely between snaps via the drag handle.

### Discover

The map is a single static basemap image (`src/img/discover-map.png`).
Each restaurant carries `mapX` / `mapY` percent coordinates so pins land
without any projection work. `Pin` swaps its inner "N" mark for a
ThumbsUp + tiny count badge when there are non-stale (≤30 d) friend →
viewer recommendations on the restaurant's deals.

Selecting a pin shows a floating card. A banner at the top of the card
cycles through every friend-insight in priority order:

1. **Targeted recommendation** from a friend → viewer (brand-darker bg,
   white text, brand-green name, "X recommends this").
2. **Friend review** of the restaurant (white bg, ink text, "X was here").

Dots at the bottom of the banner animate between active / dim states.
Tapping anywhere on the banner cycles forward; tapping a specific dot
jumps to that take.

## Conventions

These rules are enforced across the codebase (and saved as memory so
future iterations don't drift):

- **No hardcoded data in components.** Strings live in `copy.js`; demo
  data lives in `src/data/`. Components are dumb / prop-driven.
- **Inline Tailwind only.** No `@apply`, no extracted `className`
  constants, no CSS modules. Long class lists break across lines via
  template literal or `clsx`.
- **Border radii.** Default to `rounded-lg`. The only allowed
  `rounded-full` is on `Avatar.jsx` and small indicator badges /
  notification dots. No `rounded-2xl` / `rounded-3xl` anywhere — every
  card, image, button, chip, sheet, and icon button is `rounded-lg`.
- **Design tokens.** Brand colors (`bg-brand`, `text-brand-darker`,
  `bg-error`, etc.) come from `@theme` in `src/index.css`. Don't reach
  for raw hex values when a token exists.
- **One overlay closes at a time.** The global back stack pops the
  topmost overlay; the backdrop click on Discover peels off one layer
  per tap (pin selection → list detail → list-browse → deals).

See [CLAUDE.md](./CLAUDE.md) for the full set of project rules and
[neotaste-design-system.md](./neotaste-design-system.md) for the design
tokens extracted from the source Figma file.
