# Mapa Design System

## Core Identity

Mapa is a "Tactical Cartography Terminal" — a military-grade GPS workstation meets
retro arcade map screen. The UI should feel like a piece of field equipment: rugged,
legible in low light, every pixel intentional.

## Design Principles

1. **No generic cards.** Every surface has a reason to exist. Glass panels are for
   tertiary info only. Primary actions are solid, grounded, physical.

2. **Data is the UI.** Coordinates, distances, room IDs, stake amounts — these are
   not text in boxes, they are the interface itself. Typography carries the weight.

3. **Mobile-first hierarchy.** On small screens, one thing at a time. No 3-column
   layouts that collapse into a wall of cards. Tabs, drawers, and sequential views.

4. **Motion has meaning.** No spring bounces or floating animations. Movement is
   instantaneous or linear — like a machine responding to input.

5. **Every state is designed.** Loading, empty, error, success — each has a distinct
   visual language that communicates without words.

## Color

| Token | Hex | Usage |
|-------|-----|-------|
| `bg` | `#0d0f10` | Deepest background — the terminal bezel |
| `surface` | `#14181a` | Panel surfaces |
| `surface-raised` | `#1a1f22` | Hovered/active panels |
| `border` | `#1e2629` | Subtle edges |
| `border-strong` | `#2a3438` | Focused/active borders |
| `accent` | `#00f2ff` | Primary cyan — active elements, coordinates |
| `accent-dim` | `#00a2a8` | Secondary cyan — inactive |
| `gold` | `#fed639` | Stake amounts, wins, rewards |
| `green` | `#22c55e` | Close distance, success |
| `red` | `#ef4444` | Far distance, error |
| `text-primary` | `#e1e2e7` | Primary text |
| `text-secondary` | `#748288` | Secondary/label text |
| `text-tertiary` | `#3d494e` | Tertiary/meta text |

## Typography

- **UI labels, headers:** Geist Sans (--font-sans), weight 500 or 600, tight tracking
- **Data, coordinates, IDs:** Geist Mono (--font-mono), all weights, tabular-nums
- **No uppercase lock for body text.** Only labels and headings use tracking.
- **Line height 1.0 for data displays**, 1.4 for reading text.

## Spacing Scale

Use multiples of 4px. On mobile, halve the padding. Effective mobile padding: 12px.

- Page margin mobile: `px-3` (12px)
- Page margin desktop: `px-6 md:px-8`
- Panel padding mobile: `p-3`
- Panel padding desktop: `p-5`

## Components

### Terminal Header
Fixed-top bar with thin bottom border. Left: back/logo. Right: wallet.
On mobile: 40px height, smaller text.
On desktop: 48px height.

### Action Button
Solid accent background, no glow/shadow on default state.
Hover: slightly brighter (accent-300).
Disabled: 40% opacity, no pointer events.
Icon + text, gap-1.5.

### Secondary Button
Border-only, no background fill.
Hover: bg-white/[0.04].
Active: bg-white/[0.06].

### Data Row
Two-line compact display:
- Top: tiny label (9px, mono, tertiary)
- Bottom: value (13px, mono, primary/accent/gold)
No extra decoration. Minimal height.

### Panel (glass-panel)
Only for tertiary/overlay content. No glass for primary surfaces.
Background: rgba(20, 24, 26, 0.75)
Border: 1px solid rgba(255,255,255,0.06)
Border-radius: 10px.

### Modal/Drawer (mobile)
Bottom-attached panel on mobile, centered modal on desktop.
No backdrop blur — overlay is a solid dim (rgba(0,0,0,0.6)).

### Coordinate Display
Largest readable mono type for the context.
Always with N/S/E/W suffix.
Precision: 4 decimal places for gameplay, 2 for overview.

## Motion

- No spring physics anywhere.
- Fade in: 200ms linear.
- Slide up: 200ms ease-out, 8px.
- Stagger: 60ms intervals, nothing longer.
- Route transitions: instant or 150ms cross-fade.
- Ping/pulse: only for awaiting-opponent state. Single ring, subtle.

## Responsive Breakpoints

- `sm` (640px): single column, bottom sheets
- `md` (768px): two-column layouts possible
- `lg` (1024px): full three-column lobby, side-by-side game view

## Empty States

- **No rooms:** "No active rooms. Create one." in monospace, secondary color.
- **No history:** No section rendered at all (don't show empty history panels).
- **Loading:** Simple spinner, no skeleton screens.
- **Error:** Red mono text, inline near the action that failed.
