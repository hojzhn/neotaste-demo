# NeoTaste Design System

Extracted from:
- **Base Design System**: [NeoTaste Base Design System (Copy)](https://www.figma.com/design/jvSpPHYMThtwohCDBDMXjc/Neotaste-Base-Design-System--Copy-) — Foundation page (`282:16858`)
- **Screen explorations**: [NeoTaste — Deal Sharing Screen Explorations](https://www.figma.com/design/9Au31TGmIsF5Y3FbEIunGo/NeoTaste-%E2%80%94-Deal-Sharing-Screen-Explorations)

Token names use the system's own naming convention: `category.subgroup.variant`. The semantic layer maps these names to primitive palette swatches (e.g. `background.brand.default → green.400`). When implementing in code, prefer the **semantic** name — the primitive may change but the role stays stable.

---

## 1. Color tokens

### 1.1 Primitive palette

Six chromatic ramps + neutral grey + two transparent ramps. Every chromatic ramp has 11 steps (50 → 950). The `*` in the source file marks the "default" step for that family.

#### Green (brand)
The signature NeoTaste mint. `green.400` is the brand color — used for the primary CTA fill, brand text, badges.

| Token | Hex | Notes |
|---|---|---|
| `green.50` | `#eefef4` | |
| `green.100` | `#d8ffe7` | |
| `green.200` | `#bafad4` | |
| `green.300` | `#79fcad` | |
| `green.400` ★ | `#53f293` | **Brand default** — primary CTA, foreground.brand, badge level 01 |
| `green.500` | `#3ee380` | CTA hover/pressed |
| `green.600` | `#28ce6a` | |
| `green.700` | `#219750` | |
| `green.800` | `#145b32` | Inverse background (dark mode-ish screens) |
| `green.900` | `#11301d` | Border strong (focus, validation) |
| `green.950` | `#08180f` | Inverse background, darker; deal card "dark variant" fill |

#### Mustard (loyalty / accent 01)
Yellow ramp. Used for loyalty-related affordances and accent buttons.

| Token | Hex |
|---|---|
| `mustard.50` | `#fefce8` |
| `mustard.100` | `#fffbc2` |
| `mustard.200` ★ | `#fff592` (background.accent.01.default — loyalty UI) |
| `mustard.300` | `#ffe645` |
| `mustard.400` | `#fcd413` |
| `mustard.500` | `#ecbb06` |
| `mustard.600` | `#cc9102` |
| `mustard.700` | `#a26706` |
| `mustard.800` | `#86510d` |
| `mustard.900` | `#724211` |
| `mustard.950` | `#432205` |

#### Mango (accent 02)
Orange ramp. Used for the "Top 10" tag and accent confetti levels.

| Token | Hex |
|---|---|
| `mango.50` | `#fff8eb` |
| `mango.100` | `#feeac6` |
| `mango.200` ★ | `#ffc86a` (background.accent.02 — Top 10 tag) |
| `mango.300` | `#ffb64a` |
| `mango.400` | `#ff9b20` |
| `mango.500` | `#f97607` |
| `mango.600` | `#dd5202` |
| `mango.700` | `#b73506` |
| `mango.800` | `#94280c` |
| `mango.900` | `#7a220d` |
| `mango.950` | `#460e02` |

#### Strawberry (error / danger)
Red ramp. The error-state color across the system.

| Token | Hex |
|---|---|
| `strawberry.50` | `#fef2f2` |
| `strawberry.100` | `#fee2e2` |
| `strawberry.200` | `#ffc9c9` |
| `strawberry.300` | `#fca4a4` |
| `strawberry.400` | `#fa6f6f` |
| `strawberry.500` ★ | `#f24141` (foreground.error, border.error — alerts, validation errors) |
| `strawberry.600` | `#df2323` |
| `strawberry.700` | `#bc1919` |
| `strawberry.800` | `#9b1919` |
| `strawberry.900` | `#811b1b` |
| `strawberry.950` | `#460909` |

#### Spirulina (accent 03 / info)
Blue ramp. Used for the verified-creator checkmark and "Level 02" badges.

| Token | Hex |
|---|---|
| `spirulina.50` | `#eff8ff` |
| `spirulina.100` | `#dff0ff` |
| `spirulina.200` | `#b8e3ff` |
| `spirulina.300` | `#78cdff` |
| `spirulina.400` ★ | `#24afff` (background.accent.03 — verified creator) |
| `spirulina.500` | `#069af1` |
| `spirulina.600` | `#007ace` |
| `spirulina.700` | `#0061a7` |
| `spirulina.800` | `#02528a` |
| `spirulina.900` | `#084572` |
| `spirulina.950` | `#062b4b` |

#### Grey (neutral)
Standard neutral ramp. Drives surfaces, secondary buttons, body/disabled text.

| Token | Hex |
|---|---|
| `grey.50` | `#fafafa` (very faint — not detected in raster sample; common Tailwind/neutral value) |
| `grey.100` | `#f5f5f5` (surface.default — cards, secondary CTA, input bg) |
| `grey.200` | `#e5e5e5` (surface.strong — secondary CTA pressed) |
| `grey.300` | `#d4d4d4` |
| `grey.400` | `#a3a3a3` (badge level 04) |
| `grey.500` | `#737373` (foreground.tertiary — hints, placeholders, 4.74:1 contrast) |
| `grey.600` | `#525252` |
| `grey.700` | `#404040` (inverse.neutral.subtle) |
| `grey.800` | `#262626` (inverse.neutral.default — secondary button on dark bg) |
| `grey.900` | `#171717` |
| `grey.950` | `#0a0a0a` (foreground.primary — high-emphasis text/icon, 19.80:1 AAA) |

#### Black-Opacity
Pure black at varying alpha. Used for borders and overlays. Token name encodes the alpha as a percentage.

| Token | rgba | Renders as (on white) |
|---|---|---|
| `black-opacity.05` | `rgba(0,0,0,0.05)` | `#f2f2f2` |
| `black-opacity.10` | `rgba(0,0,0,0.10)` | `#e5e5e5` (border.primary) |
| `black-opacity.20` | `rgba(0,0,0,0.20)` | `#cccccc` |
| `black-opacity.30` | `rgba(0,0,0,0.30)` | `#b3b3b3` |
| `black-opacity.40` | `rgba(0,0,0,0.40)` | `#999999` |
| `black-opacity.50` | `rgba(0,0,0,0.50)` | `#7f7f7f` (foreground.disabled) |
| `black-opacity.60` | `rgba(0,0,0,0.60)` | `#666666` |
| `black-opacity.70` | `rgba(0,0,0,0.70)` | `#4d4d4d` (foreground.secondary) |
| `black-opacity.80` | `rgba(0,0,0,0.80)` | `#333333` |
| `black-opacity.90` | `rgba(0,0,0,0.90)` | `#191919` |
| `black-opacity.100` | `rgba(0,0,0,1)` | `#000000` |

#### White-Opacity
Pure white at varying alpha. Used for foreground/border on inverse (dark) backgrounds.

| Token | rgba | Notes |
|---|---|---|
| `white-opacity.05` | `rgba(255,255,255,0.05)` | Tertiary button bg |
| `white-opacity.10` | `rgba(255,255,255,0.10)` | |
| `white-opacity.20` | `rgba(255,255,255,0.20)` | Slider button overlay |
| `white-opacity.30` | `rgba(255,255,255,0.30)` | border.inverse.secondary |
| `white-opacity.40` | `rgba(255,255,255,0.40)` | |
| `white-opacity.50` | `rgba(255,255,255,0.50)` | |
| `white-opacity.60` | `rgba(255,255,255,0.60)` | |
| `white-opacity.70` | `rgba(255,255,255,0.70)` | foreground.inverse.disabled, border.inverse.primary |
| `white-opacity.80` | `rgba(255,255,255,0.80)` | |
| `white-opacity.90` | `rgba(255,255,255,0.90)` | |
| `white-opacity.100` | `#ffffff` | foreground.inverse, border.inverse.strong |

#### Green-Opacity
NeoTaste green at varying alpha. Used for brand-tinted overlays (button on flash deals card, disabled brand state).

| Token | rgba (over green.500 base) |
|---|---|
| `green-opacity.10` | `~rgba(62,227,128,0.10)` (button on flash deals card) |
| `green-opacity.20` | `~rgba(62,227,128,0.20)` (border.brand — flash deals card border) |
| `green-opacity.30` | `~rgba(62,227,128,0.30)` (button hover/pressed on flash deals) |
| `green-opacity.40` | `~rgba(62,227,128,0.40)` |
| `green-opacity.50` | `~rgba(62,227,128,0.50)` (foreground.brand.disabled) |

### 1.2 Semantic colors — Backgrounds

What each background token actually does in the product.

| Token | Maps to | Used for |
|---|---|---|
| `background.neutral.base` | `#ffffff` (white) | Default page background |
| `background.neutral.surface.default` | `grey.100` `#f5f5f5` | Cards, secondary CTA fill, input field bg |
| `background.neutral.surface.strong` | `grey.200` `#e5e5e5` | Secondary CTA hover / pressed |
| `background.brand.default` | `green.400` `#53f293` | **Primary CTA**, brand highlights |
| `background.brand.strong` | `green.500` `#3ee380` | Primary CTA hover / pressed |
| `background.brand.subtle` | `green.200` `#bafad4` | Primary CTA disabled |
| `background.accent.01.default` | `mustard.200` `#fff592` | Loyalty-related elements (status pills, level chips) |
| `background.accent.01.strong` | `mustard.300` `#ffe645` | Accent button hover / pressed |
| `background.accent.01.subtle` | `mustard.100` `#fffbc2` | Accent button disabled |
| `background.accent.02` | `mango.200` `#ffc86a` | **Top 10 tag** (Mango is the "popular deal" accent) |
| `background.accent.03` | `spirulina.400` `#24afff` | Verified-creator checkmark badge |
| `background.inverse.brand.default` | `green.800` `#145b32` | Inverse (dark) page background — used on the deal-sharing flow |
| `background.inverse.brand.strong` | `green.950` `#08180f` | Inverse background, even darker — dark variant deal cards |
| `background.inverse.neutral.default` | `grey.800` `#262626` | Secondary button on inverse background |
| `background.inverse.neutral.subtle` | `grey.700` `#404040` | Secondary button on inverse bg — hover / pressed (web only) |
| `background.overlay.white.default` | `white-opacity.20` | Slider button overlay, tertiary button hover/pressed |
| `background.overlay.white.subtle` | `white-opacity.05` | Tertiary button default fill (on dark images/photos) |
| `background.overlay.black.default` | `black-opacity.10` | Button secondary hover, pressed (web only) |
| `background.overlay.black.subtle` | `black-opacity.05` | Button inverse tertiary default / disabled |
| `background.overlay.brand.default` | `green-opacity.10` | Button on flash deals card |
| `background.overlay.brand.strong` | `green-opacity.30` | Button hover / pressed on flash deals card |
| `background.levels.01.subtle` / `.strong` | `green.200` / `green.400` | Confetti / badge for **Level 01** (entry tier) |
| `background.levels.02.subtle` / `.strong` | `spirulina.200` / `spirulina.500` | Confetti / badge for **Level 02** |
| `background.levels.03.subtle` / `.strong` | `mango.200` / `mango.500` | Confetti / badge for **Level 03** |
| `background.levels.04.subtle` / `.strong` | `grey.200` / `grey.400` | Confetti / badge for **Level 04** |
| `background.levels.05.subtle` / `.strong` | `mustard.200` / `mustard.500` | Confetti / badge for **Level 05** (top tier) |

### 1.3 Semantic colors — Foreground (text + icons)

| Token | Maps to | Used for |
|---|---|---|
| `foreground.primary` | `grey.950` `#0a0a0a` | High-emphasis text & icons. 19.80:1 contrast — passes AAA for both large and small text |
| `foreground.secondary` | `black-opacity.70` | Body copy, secondary text |
| `foreground.tertiary` | `grey.500` `#737373` | Low-emphasis text — hints, placeholders. 4.74:1 — AAA large / AA small |
| `foreground.disabled` | `black-opacity.50` | Disabled component text. (WCAG 2.1 §1.4.3 exempts inactive components from contrast requirements) |
| `foreground.brand` | `green.400` `#53f293` | Brand-color text. **NOT for text on light backgrounds** (insufficient contrast) — use only on dark / brand-dark backgrounds |
| `foreground.brand.disabled` | `green-opacity.50` | Brand-color text in disabled state |
| `foreground.inverse` | `white-opacity.100` `#ffffff` | Text on inverse (dark) background |
| `foreground.inverse.disabled` | `white-opacity.70` | Disabled text on inverse background |
| `foreground.error` | `strawberry.500` `#f24141` | Error messages, alert indication |

### 1.4 Semantic colors — Borders

| Token | Maps to | Used for |
|---|---|---|
| `border.primary` | `black-opacity.10` | **Default border** — cards, outlines, dividers, input field default state |
| `border.secondary` | `black-opacity.05` | Lower-emphasis border (subtle hairlines) |
| `border.strong` | `green.900` `#11301d` | **Emphasized state** — active field, focus ring, validation success |
| `border.inverse.primary` | `white-opacity.70` | Default border on inverse (dark) background |
| `border.inverse.secondary` | `white-opacity.30` | Subtle border on inverse background |
| `border.inverse.strong` | `white-opacity.100` `#ffffff` | Emphasized border on inverse background |
| `border.error` | `strawberry.500` `#f24141` | Error / alert state |
| `border.brand` | `green-opacity.20` | Border on flash deals card (brand-tinted) |

### 1.5 Semantic colors — Overlays (state)

Overlays are simply alpha-tinted layers — see the `background.overlay.*` rows in §1.2 for the full list. The system uses three tint variants:
- **White overlays** — for placing controls over photographs (tertiary button on a food photo)
- **Black overlays** — for hover/pressed states on light surfaces
- **Brand overlays** — for hover/pressed states on the green flash-deals card

---

## 2. Typography

### 2.1 Family + weights

The design system specimens use a **single bold-friendly geometric sans-serif** with three weights:
- **Bold** — Display + Heading
- **Semibold** — Label
- **Medium** — Paragraph

> **Note on family name**: the Figma file's text-style variables do not surface a font-family name through the screenshot pipeline, and the variable-defs MCP tool requires an in-app selection on this Figma install. Inspect the file's `Text` styles panel in Figma to confirm — visually the specimens are consistent with **Inter**, **Sora**, or a similar geometric sans. Use whichever the Figma `font-family` variable points to; fall back to `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`.

### 2.2 Scale

Five style families: **Display**, **Heading**, **Paragraph**, **Label**. (No separate "Action" style was found in the typography frame — buttons in the screen specimens use **Label / Large / Semibold**.)

Tracking is `-0.3%` only on the two largest Display sizes; everything else is `0%`.

#### Display (marketing-scale headlines)
| Style | Size | Line height | Weight | Tracking |
|---|---|---|---|---|
| `Display / Large / Bold` | 52px | 60px | Bold | -0.3% |
| `Display / Medium / Bold` | 44px | 52px | Bold | -0.3% |
| `Display / Small / Bold` | 36px | 44px | Bold | 0% |

#### Heading (in-app headings, H1 → H5)
| Style | Size | Line height | Weight | Tracking |
|---|---|---|---|---|
| `Heading / H1 / Bold` | 32px | 38px | Bold | 0% |
| `Heading / H2 / Bold` | 28px | 34px | Bold | 0% |
| `Heading / H3 / Bold` | 24px | 30px | Bold | 0% |
| `Heading / H4 / Bold` | 20px | 26px | Bold | 0% |
| `Heading / H5 / Bold` | 16px | 20px | Bold | 0% |

#### Paragraph (body copy)
| Style | Size | Line height | Weight | Tracking |
|---|---|---|---|---|
| `Paragraph / Large / Medium` | 18px | 28px | Medium | 0% |
| `Paragraph / Medium / Medium` | 16px | 24px | Medium | 0% |
| `Paragraph / Small / Medium` | 14px | 20px | Medium | 0% |
| `Paragraph / Small / Bold` | 14px | 20px | Bold | 0% |
| `Paragraph / XSmall / Medium` | 12px | 18px | Medium | 0% |

#### Label (buttons, chips, small UI)
| Style | Size | Line height | Weight | Tracking |
|---|---|---|---|---|
| `Label / Large / Semibold` | 16px | 20px | Semibold | 0% |
| `Label / Medium / Semibold` | 14px | 18px | Semibold | 0% |

### 2.3 Naming convention

`{Group} / {Size} / {Weight}` — e.g. `Heading / H2 / Bold`, `Paragraph / Small / Medium`. Three-slot, slash-delimited. When the same size has multiple weights (e.g. Paragraph/Small comes in Medium and Bold), the weight slot disambiguates.

---

## 3. Spacing

Eight steps, doubling roughly every two stops. `spacing-xS` is reserved for ultra-tight pairings (icon ↔ adjacent text); larger steps drive component padding and inter-component rhythm.

| Token | Size | Typical use |
|---|---|---|
| `spacing-xS` | 4px | Very small elements — e.g. text with leading icon |
| `spacing-S` | 8px | Tight pairings, chip internal padding |
| `spacing-M` | 12px | Standard inline spacing |
| `spacing-L` | 16px | **Default component padding** — card internals, list-item gaps |
| `spacing-XL` | 24px | Section padding, screen-edge gutter |
| `spacing-2XL` | 32px | Inter-section spacing |
| `spacing-3XL` | 48px | Large screen-section spacing |
| `spacing-4XL` | 64px | Hero / page-top spacing |

---

## 4. Border radius

Ten steps from `none` (square) to `full` (pill / circle). `radius-L` (16px) is the workhorse for cards; `radius-2xl` (32px) is used for hero images and large cards; `radius-full` is used for pill buttons and avatars.

| Token | Size |
|---|---|
| `radius-none` | 0px |
| `radius-xs` | 4px |
| `radius-S` | 8px |
| `radius-M` | 12px |
| `radius-L` | 16px |
| `radius-xl` | 24px |
| `radius-2xl` | 32px |
| `radius-3xl` | 48px |
| `radius-4xl` | 64px |
| `radius-full` | 9999px |

---

## 5. Border width

Three steps. `border-S` is the default hairline; `border-M` is reserved for emphasized states (focus rings, active inputs).

| Token | Size | Use |
|---|---|---|
| `border-S` | 1px | Default — cards, dividers, inputs at rest |
| `border-M` | 2px | Emphasized state — focus, active, validation |
| `border-L` | 4px | Heavy emphasis (rare — strong selection, special chips) |

---

## 6. Visual patterns (from the screen explorations)

Observed across the deal-sharing screen explorations. These describe how the tokens compose into real UI.

### 6.1 Restaurant cards

Two formats coexist:
- **Compact tile** (used in horizontal carousels / "Recommended by …" rails): ~248px wide. Top: full-width food photo with `radius-L` (16px) corners. Below the photo, a tight 8px-padded info stack — restaurant name (Paragraph/Small/Bold), location/category (Paragraph/XSmall/Medium, `foreground.tertiary`), a rating row "★ 4.6 (108)", and a single promo chip (e.g. "FREE Burger") in `background.accent.02` / `mango.200`.
- **Detail header** (used on the restaurant page): restaurant name in `Heading/H1/Bold`, address in `Paragraph/Medium/Medium` muted, rating in a chip, action row of icon buttons (Menu / Location / Save / Share) sitting on top of a 4-up grid of restaurant photos.

A "Recommended by ___" attribution chip floats top-right with the creator's avatar and a quoted snippet in italics — the chip uses `radius-full` and a soft drop shadow.

### 6.2 Deal cards

Three deal-card variants observed, all sharing a consistent template (header chip area, title, sub-description, CTA row):

1. **Dark flash-deal card** — `background.inverse.brand.strong` (`green.950 #08180f`). Title in `green.400` `#53f293` ("1 € Cookie", with a ⚡ lightning glyph). Metadata chips ("Avg. €25", "Limited") use `background.overlay.brand.default` (green-tinted glass) with green.400 text. CTA at the bottom is a wide pill ("Book deal") in `green.400` filled with dark text. Right of the CTA, three overlapping circular avatars with a "+2" indicator denote that friends are interested.
2. **Light brand card** — `background.brand.default` (`green.400 #53f293`). Same layout, but inverted: dark text, dark chips, and a CTA in a lighter green (or surface white). Used for "2for1 Coffee-Dessert Bundle" style deals.
3. **Dark hero card** (deal sharing screen) — full-bleed food photo with `radius-2xl` corners and a centered NeoTaste-logo watermark; below the photo, a stacked block of restaurant name, address, deal title, description, and a "Redeemed 18:23:23" timer with timestamp. All on `background.inverse.brand.default` (deep forest green).

Common to all: cards use `radius-2xl` (32px) on the outer container, `radius-full` on internal chips, and a leading **gift icon** in a square 42×42 chip on the bottom-left of the CTA row.

### 6.3 Buttons

- **Primary CTA**: `background.brand.default` (`green.400`), `foreground.primary` (dark text — because green.400 lacks contrast against white). Pill shape (`radius-full`). 52px tall. Padding ~16/24 (vertical/horizontal).
- **Secondary CTA**: `background.neutral.surface.default` (`grey.100`), `foreground.primary`. Same pill shape and height.
- **Tertiary on dark**: `background.overlay.white.subtle` (white at 5% alpha), `foreground.inverse` white text.
- **Cancel button** (bottom-sheet dismiss): full-width, `background.inverse.neutral.default` (`grey.800 #262626`) with `foreground.inverse` white, pill shape, 52px.
- **Icon-only button**: square (`radius-L`), 42–52px, paired alongside text buttons in CTAs.

### 6.4 Bottom navigation

iOS-style 5-tab bar at 50px (compact) or 95px (with iOS-26 safe area). Tabs are: **Home / Feed / Discover / Bookings / Profile**.
- Inactive tabs: icon + label in `foreground.tertiary` grey.
- Active tab: icon + label sit inside a dark **pill chip** (`background.inverse.neutral.default`) — the label is white. This makes the active tab feel "picked up" rather than underlined.
- The Bookings tab carries a numeric badge (when active bookings exist).

A separate **sub-tab bar** is used inside pages (e.g. "Upcoming | History" on Bookings, "Overview | Reviews | About" on Restaurant): plain text labels with a 2px dark **underline** below the active label, sitting on a `border.primary` hairline.

### 6.5 Lists / bottom sheets

The list/bottom-sheet pattern that powers "Share this deal", "Sort by", etc:
- Sheet rises from the bottom of the screen on top of a 50%-darkened scrim (`background.overlay.black.default` overlaid on the content underneath).
- Sheet has `radius-xl` (24px) on its **top two corners only**; sits flush at the bottom.
- 4px drag handle pill at the top, centered.
- Heading (`Heading/H4/Bold`) + supporting paragraph; supporting copy uses `foreground.secondary` for the body and an em-dash to separate restaurant ↔ deal name.
- Action rows: 24px vertical padding; leading icon in a 42×42 `radius-M` chip with `background.neutral.surface.default` fill; primary label (`Paragraph/Medium/Bold`) + description (`Paragraph/Small/Medium` muted); trailing **chevron** glyph.
- Bottom row is the Cancel button described in §6.3.

### 6.6 Food images

- Always rounded — `radius-L` for small tiles, `radius-xl` for medium cards, `radius-2xl` for hero / detail page images.
- Hero food photos may carry an overlaid centered **NeoTaste wordmark** in white (used on the deal-share confirmation screen).
- Grid images (restaurant detail page) use a 2×2 or 4-up layout with equal gutters of `spacing-S` (8px).
- Food photography is high-saturation, warm-toned, top-down or 3/4 angle. The design system relies on the image to carry visual interest; surrounding UI stays restrained.

### 6.7 Spacing rhythm

The visible rhythm across the screens:
- **Screen edge gutter**: 16px (`spacing-L`) on each side for phone-width (390px) layouts.
- **Section vertical rhythm**: 24px (`spacing-XL`) between major blocks (header → card, card → next section).
- **Card internal padding**: 16px (`spacing-L`); chips inside cards have 8px (`spacing-S`) gaps from each other.
- **Inline icon ↔ text**: 4px (`spacing-xS`) for tight pairings, 8px (`spacing-S`) for chip content.
- **List-row vertical padding**: 16–24px depending on density.
- **CTA-to-card-edge**: 16px on all sides; the CTA spans full card width minus 32px (2× padding).
- **Bottom safe area**: 24–32px on screens with no bottom nav, or 50–95px reserved for the nav.

The overall feel is **generous but contained** — full-bleed photography against tight, well-padded info blocks. The system prefers `radius-2xl` on hero containers paired with `radius-full` on chips/CTAs inside them, which gives the UI its signature "soft brick" rhythm.

---

## 7. Implementing in code

For a Tailwind v4 + React project, you can wire most of this in via `@theme` in `src/index.css`. Start from these mappings:

```css
@import "tailwindcss";

@theme {
  /* Brand */
  --color-brand: #53f293;        /* green.400 */
  --color-brand-strong: #3ee380; /* green.500 */
  --color-brand-subtle: #bafad4; /* green.200 */
  --color-brand-dark: #145b32;   /* green.800 — inverse bg */
  --color-brand-darkest: #08180f;/* green.950 */

  /* Accents */
  --color-loyalty: #fff592;      /* mustard.200 */
  --color-top10: #ffc86a;        /* mango.200 */
  --color-verified: #24afff;     /* spirulina.400 */

  /* Neutral / surface */
  --color-surface: #f5f5f5;      /* grey.100 */
  --color-surface-strong: #e5e5e5;
  --color-fg-primary: #0a0a0a;   /* grey.950 */
  --color-fg-tertiary: #737373;  /* grey.500 */
  --color-fg-error: #f24141;     /* strawberry.500 */

  /* Radii */
  --radius-xs: 4px;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-2xl: 32px;
  --radius-3xl: 48px;
  --radius-4xl: 64px;

  /* Type scale (matches Figma exactly) */
  --text-display-lg: 52px;
  --text-display-md: 44px;
  --text-display-sm: 36px;
  --text-h1: 32px;
  --text-h2: 28px;
  --text-h3: 24px;
  --text-h4: 20px;
  --text-h5: 16px;
}
```

Use `bg-brand`, `text-fg-primary`, `rounded-2xl`, etc., directly in JSX. Reach back to this doc when you need the semantic *why* behind a token (e.g. "should a button border be `border.primary` or `border.strong`?").
