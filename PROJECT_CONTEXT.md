# Mushroom Production Calculator — Project Context

## Purpose

Automates tray-to-box and pallet calculations for a real mushroom production environment. Replaces manual calculation to reduce errors and increase speed when daily production orders change.

## Tech Stack

- React + Vite + JavaScript (no TypeScript)
- Plain CSS (no UI library)
- No backend, no database, no authentication
- localStorage for persistence

## File Structure

```
src/
  App.jsx               — main UI and state
  App.css               — all styling (mobile-first)
  utils/calculations.js — calculation logic
  data/businessRules.js — business rule constants
```

---

## Core Business Rules

### Box / Pallet Constants
- **4 kg per box**
- **72 boxes per pallet**

### Supermarkets
Coles, Woolworths, Aldi, Drakes, IGA, Costco

### Labels
VIC, TRG, QLD, SA, CP, WA, NSW

### Weights
200g, 375g, 500g, 650g, Brown

---

## Weight × Supermarket Constraints

| Supermarket | Available Weights |
|-------------|-------------------|
| Coles       | 200g, 500g, Brown |
| Woolworths  | 375g, 500g        |
| Aldi        | 200g, 500g, Brown |
| Drakes      | 200g, 500g, Brown |
| IGA         | 200g, 500g, Brown |
| Costco      | 500g, 650g        |

- **375g** — Woolworths only
- **650g** — Costco only
- **Brown** — treated as 200g equivalent (uses standard formula)

---

## Confirmed Calculation Formulas

All inputs are **tray counts** (never kg).

| Product                   | Formula                      | Notes |
|---------------------------|------------------------------|-------|
| Standard (200g, 500g, Brown) | `(trays × 3.2) / 1.5`     | Default for Coles, IGA, Drakes (excl. Drakes 200g), all 500g, Brown |
| Aldi 200g                 | `trays × 0.66`               | Aldi-specific multiplier |
| Woolworths 375g           | `trays × 0.77`               | Woolworths only |
| Drakes 200g               | `(trays × 3.2) / 1.5`        | Same as Woolworths 200g logic = standard formula |
| Costco 650g               | `(trays / 3.9) × 4.2`        | Costco only; input is trays (same as all other products) |

---

## Pallet Logic

```js
fullPallets = Math.floor(totalBoxes / 72)
remainder   = totalBoxes % 72
```

### Last Pallet Display Rules
- Show last pallet card **only when** `totalBoxes >= 72` AND `remainder > 0`
- Do **not** show when `totalBoxes < 72` (under one pallet)
- Do **not** show when remainder is 0 (perfect multiples: 72, 144, 216…)
- Last pallet card is highlighted **red**

---

## Features

### Quick Orders Mode
- Fast single-product entry
- Supermarket → Weight (filtered) → Label → Trays input → **Calculate** button
- Shows one result card

### Detailed Orders Mode
- Multiple orders per session
- Same form fields, **Add / Sum** button
- Multi-number trays input: space-separated values like `12 15 9 8` — summed before calculating
- Each submitted order renders a result card with a **Remove** button

### General
- **localStorage persistence** — state survives page refresh
- **Reset All button** — clears all inputs, results, and orders
- **Mobile-first UI** — designed for tablets/phones on the production floor
- **Result cards** — show Trays, Boxes, Full Pallets
- **Last pallet highlighted red** — partial pallet drawn to attention immediately
