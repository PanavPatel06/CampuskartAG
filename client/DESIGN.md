# Design System: CampusKart Premium Redesign
**Project ID:** 7746256905197181799

## 1. Visual Theme & Atmosphere
An ultra-clean, SaaS-caliber ecommerce experience for a campus marketplace. The aesthetic is airy and spacious, channeling modern Dribbble-quality product design with generous whitespace and a confident typographic hierarchy. The mood is trustworthy and fresh — inviting students to browse, order, and transact effortlessly.

## 2. Color Palette & Roles
- **Snow White** (#FFFFFF) — Primary page surface, cards, and navigation bar
- **Cool Mist Gray** (#F9FAFB) — Page backgrounds, section alternation, input fills
- **Deep Indigo** (#4F46E5) — Primary call-to-action buttons, active states, gradient hero text, and links
- **Rich Purple** (#7C3AED) — Gradient accent paired with indigo for hero text and decorative blurs
- **Near Black** (#111827) — All headings, primary text, product names
- **Medium Slate** (#6B7280) — Body copy, subtitles, secondary labels
- **Emerald Vitality** (#10B981) — Wallet balance (sufficient funds), success badges, confirmed statuses
- **Warm Amber** (#F59E0B) — Pending/warning status badges
- **Signal Red** (#EF4444) — Insufficient funds indicator, remove actions, error text

## 3. Typography Rules
- **Font Family:** Inter (loaded via Google Fonts or @fontsource)
- **Headings:** Extra-bold to Black weight (700–900), tightly tracked (`tracking-tight` / `tracking-tighter`). Hero headings reach 72px+
- **Body:** Regular to Medium weight (400–500), relaxed leading for readability
- **Labels & Badges:** Bold uppercase with widest tracking (`tracking-widest`, `text-xs`)

## 4. Component Stylings
* **Buttons:** Generously rounded (16px / `rounded-2xl`). Primary: Deep Indigo fill, white bold text, subtle shadow. Outline: White fill, gray border. Height 56px (`h-14`). Hover: darken + lift (`hover:-translate-y-0.5`)
* **Cards:** Large rounded corners (24px / `rounded-3xl`). White background, no visible border, soft diffused shadow (`shadow-md`). Hover: shadow increase (`hover:shadow-xl`) + subtle lift
* **Inputs:** Rounded 12px / `rounded-xl`. Soft gray background fill, gray border. Focus: indigo ring (`focus:ring-indigo-100`)
* **Status Badges:** Pill-shaped (`rounded-full`). Color-coded: Emerald for delivered, Blue for in-transit, Amber for pending, Red for cancelled

## 5. Layout Principles
- **Max-width:** 7xl (`max-w-7xl`) containers
- **Padding:** Section padding minimum 96px vertical (`py-24`), 48px+ horizontal
- **Grid:** 4-column product grids, 3-column feature grids, 2-column cart layout (8:4 ratio)
- **Spacing:** 8px grid system, 32px gap between grid items (`gap-8`)
- **Decorative:** Subtle gradient blur circles (`blur-3xl`) for visual depth in hero sections
