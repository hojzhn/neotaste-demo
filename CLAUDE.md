# Project rules — NeoTaste portfolio build

A Vite + React + Tailwind v4 project building a NeoTaste-style deal-sharing UI as a portfolio piece. This file captures the conventions I want followed across the entire project. **Read this before making changes.** Update it as the project grows.

Related: [neotaste-design-system.md](neotaste-design-system.md) — colors, typography, spacing, and visual patterns extracted from the Figma source. Use those tokens; don't invent new ones.

---

## 1. No hard-coded data. Ever.

Anything that represents content — deals, restaurants, prices, user info, copy strings, image URLs, ratings, categories — lives in a data module under `src/data/`, never inline in a component.

```
src/data/
  deals.js          // [{ id, title, price, description, restaurantId, ... }]
  restaurants.js    // [{ id, name, address, rating, category, image, ... }]
  copy.js           // UI strings: { share: { title: 'Share this deal', subtitle: 'Pick what to do with it' }, ... }
```

**Why**: switching from mock data to a real API later is a one-file change instead of a grep-and-replace. Copy can be localised. The component tree stays focused on *layout*, not content.

**Rule**: if you're about to type a literal string of user-facing copy or a hardcoded data row inside a `.jsx` file — stop and move it to `src/data/` (or `src/copy.js`) first, then import it.

Exceptions: structural strings that are part of the component contract itself (e.g. `aria-label="Close"` on a generic Modal — but even those usually accept a prop). When in doubt, externalize.

---

## 2. Repeat patterns become components

If you find yourself writing the same shape twice (button, card, chip, list row, image tile), extract it to `src/components/` on the second occurrence — not the third.

```
src/components/
  Button.jsx
  DealCard.jsx
  RestaurantCard.jsx
  Chip.jsx
  BottomSheet.jsx
  TabBar.jsx
```

The design system already enumerates the recurring shapes — see [neotaste-design-system.md §6](neotaste-design-system.md) (Visual patterns). Those are the components to build.

---

## 3. Components stay dumb and lean

UI components are **presentational**: props in, JSX out. No data fetching, no app state, no business logic inside a `RestaurantCard`. Keep them so simple that swapping the data source doesn't change them.

- A UI component takes props and returns JSX. That's it.
- State (filters, selection, fetched data) lives one level up — in a *page* or *screen* component under `src/screens/` or `src/pages/`.
- No side effects in UI components. No `useEffect` for data fetching inside `DealCard`; the page passes the data in.
- Keep each component under ~80 lines. If it's longer, it's doing too much — split.
- One component per file. Filename matches the export.

```jsx
// good — dumb, prop-driven
export function DealCard({ title, price, description, onBook }) {
  return (
    <article className="bg-brand-darkest rounded-3xl p-4">
      <h3 className="text-brand text-xl font-bold">{title}</h3>
      ...
      <button onClick={onBook} className="...">Book deal</button>
    </article>
  )
}

// bad — fetches data, knows about the API
export function DealCard({ dealId }) {
  const [deal, setDeal] = useState(null)
  useEffect(() => { fetch(`/api/deals/${dealId}`)... }, [dealId])
  ...
}
```

---

## 4. Tailwind is always inline

Style with utility classes directly on JSX elements. No exceptions:

- **No `@apply`** in CSS files.
- **No `className` constants** extracted to the top of a file or to a separate `styles.js`.
- **No CSS modules**, no styled-components, no inline `style={{...}}` for things Tailwind can express.
- **No utility class strings stored as variables** ("`const cardClass = 'bg-white...'`") — keep them on the element.

Why: inline utilities make the visual intent readable at the point it applies. Refactoring a card's look means editing one JSX block, not chasing across files.

`src/index.css` should contain only `@import "tailwindcss";` plus the `@theme` block defining design tokens (see [§7 of the design system doc](neotaste-design-system.md)).

For long class lists, break across lines with a template literal or `clsx` — but keep them on the element:

```jsx
<button className={clsx(
  "h-13 px-6 rounded-full font-semibold transition",
  "bg-brand text-ink",
  "hover:bg-brand-strong active:bg-brand-subtle",
  disabled && "opacity-50 cursor-not-allowed"
)}>
```

---

## 5. Use design-system tokens, not raw values

Pull colors, spacing, radii, and type sizes from [neotaste-design-system.md](neotaste-design-system.md). Wire the most-used ones into `@theme` in `src/index.css` so they become Tailwind utilities (e.g. `bg-brand`, `rounded-2xl`, `text-h3`).

When you need a one-off, use arbitrary Tailwind values with the exact hex: `bg-[#53f293]`. Don't approximate.

---

## 6. Keep this file alive

Update CLAUDE.md whenever:
- A new convention emerges (file layout, naming, state-management choice).
- We adopt a library that other code should know about.
- A rule above turns out to be wrong in practice — change it here, don't quietly drift.

Date entries when they're added if it helps memory; remove rules that no longer hold.

---

## Project structure (current)

```
neotaste/
├── CLAUDE.md                    ← this file
├── neotaste-design-system.md    ← design tokens + visual patterns
├── README.md                    ← how to run / deploy
├── index.html                   ← loads Inter from Google Fonts
├── vite.config.js               ← Vite + Tailwind v4 plugin
├── src/
│   ├── main.jsx
│   ├── App.jsx                  ← two phones side by side, lifts shares state
│   ├── index.css                ← @import "tailwindcss"; + @theme tokens
│   ├── copy.js                  ← all UI strings (single source of truth)
│   ├── data/
│   │   ├── users.js             ← demo users (maria, tom)
│   │   ├── restaurants.js
│   │   ├── deals.js
│   │   └── bookings.js          ← per-user bookings
│   ├── components/              ← dumb / prop-driven UI primitives
│   │   ├── PhoneFrame.jsx       ← phone bezel wrapper for the desktop demo
│   │   ├── StatusBar.jsx
│   │   ├── TabBar.jsx           ← only the active tab is highlighted; ALL are non-interactive
│   │   ├── SubTabs.jsx          ← Upcoming/History sub-tabs (currently inert)
│   │   ├── Button.jsx
│   │   ├── Chip.jsx
│   │   ├── Avatar.jsx
│   │   ├── ActionTile.jsx       ← inert icon+label tile used in BookingCard's action row
│   │   ├── BookingCard.jsx      ← gift chip overlay (when giftedBy is set), crew avatars + add-crew (+) on image, 4-button action row, Gift + Redeem CTA. Image is INSET inside the card with its own rounded corners.
│   │   ├── FriendPicker.jsx     ← bottom-sheet picker with search. Supports `mode="single"` (gift, tap-to-fire) and `mode="multi"` (dine, max 3, Continue button). "NeoTaste Member" subtitle per row.
│   │   ├── MessageSheet.jsx     ← step 2 of BOTH flows: shows the picked friend(s) + textarea for an optional message + Send CTA. Labels & icon swap based on `type` prop ('gift' | 'dine').
│   │   ├── PendingInvitationCard.jsx ← shown in the receiver's "Invitations" section above Upcoming. Accept moves the booking into Upcoming; Decline removes the share.
│   │   └── Toast.jsx            ← receiver-side notification. Fires for both gift AND dine shares; icon + title swap by `type`. Auto-dismisses after 5s.
│   └── screens/
│       └── BookingsScreen.jsx   ← Bookings tab content (used by both phones); owns the picker open/close state.
└── public/
    └── favicon.svg
```

### Token utilities (from `@theme` in `src/index.css`)
Use these instead of arbitrary hex values where they exist:
- Colors: `bg-brand` `bg-brand-strong` `bg-brand-subtle` `bg-brand-dark` `bg-brand-darker` `bg-brand-darkest` · `bg-loyalty` `bg-top10` `bg-verified` · `bg-surface` `bg-surface-strong` · `text-ink` `text-ink-muted` · `text-error`
- Same names work for `text-*`, `border-*`, `fill-*`, `from-*`, `hover:bg-*`, etc.
- Type family: `font-sans` resolves to Inter
- Radii: `rounded-xl` (24px), `rounded-2xl` (32px), `rounded-3xl` (48px) match the design system

For truly per-instance values (avatar color from data, dynamic widths) use `style={{...}}` — that's the one allowed escape from the inline-Tailwind rule, because Tailwind v4 can't generate utilities for runtime-only values.

### Inter-screen state model
- `App.jsx` holds the `shares` array (lifted state). A share is `{ id, fromUserId, toUserId, bookingId, dealId, type, message, status, createdAt }` where:
  - `type ∈ { 'gift', 'dine' }`
  - `status ∈ { 'pending', 'accepted' }` — gifts start as `'accepted'` (immediate transfer); dine invitations start as `'pending'` until the receiver taps Accept.
- `BookingCard` exposes two action callbacks. Both open the `FriendPicker` first — they do **not** directly send a share:
  - `onGift(booking)` — Gift icon button at the bottom-left of the CTA row → `mode="single"` picker.
  - `onAddCrew(booking)` — green `UserPlus` button overlaid on the bottom-right of the thumbnail → `mode="multi"` picker, max 3.
- **Both flows are two-step**: FriendPicker → MessageSheet → Send. The picker confirms with `friends: User[]` (array of 1 for gift, 1–3 for dine). `BookingsScreen` then calls `onShare({ booking, type, friends, fromUserId, message })` → App fans out one share per friend with the appropriate initial `status`.
- Flow state lives in `BookingsScreen` as `flow = { booking, type, step, friends? } | null`.
- **Derivations** in `App.jsx`:
  - `bookingsForUser(userId)` includes seeded-own (minus gifted-away), gift-received (status accepted), and dine-accepted bookings; crew is built from accepted dine shares.
  - `pendingInvitationsForUser(userId)` returns the share + enriched booking/deal/restaurant/sender for every dine share that is `status: 'pending'` for that user.
- **Accept / Decline**: `handleAcceptShare(shareId)` flips status to `'accepted'`; `handleDeclineShare(shareId)` removes the share. Accept causes the booking to appear in the receiver's Upcoming and the crew to update on the sender's view, in one render.
- **Toast on receiver**: `BookingsScreen` receives the raw `shares` and uses a `useRef` set of seen share IDs. New gift OR dine shares targeting `user.id` trigger a `Toast` slide-down with type-specific icon + title.
- **Bookings per user are derived** from `shares + seedBookings`:
  - `bookingsForUser(userId)` returns own seeded bookings **minus** any the user has gifted away, **plus** any bookings gifted to them (rendered as `{ ...orig, userId, giftedBy }` so the BookingCard shows the gift chip).
  - Gifts therefore transfer ownership end-to-end; the sender loses the deal from their Upcoming list and the receiver gains it.
- **Crew per booking is derived** from `shares.filter(type='dine')`. The owner's view shows everyone they've added; the viewer is filtered out of the avatars they see for their own booking.
- Recommend flow (the third share type) is intentionally not implemented yet.
- No Context — lifted state in `App.jsx` is enough for two consumers.

Folders to create as features land: `src/hooks/`, `src/lib/`, additional screens under `src/screens/`.
