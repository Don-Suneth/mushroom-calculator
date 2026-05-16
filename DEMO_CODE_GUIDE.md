# Demo Code Guide — Production Optimisation Calculator

A plain-English walkthrough of the codebase for interview preparation.
Read this before your demo so you can explain every part confidently.

---

## 1. Project Overview

### What the app does
This is a production-floor calculator for a mushroom packaging operation.
Workers enter the number of **trays** picked for a supermarket order, and the
app instantly calculates how many **boxes** are needed and how many **pallets**
those boxes will fill.

### What real problem it solves
Before this tool, workers had to manually calculate box and pallet counts for
every order using pen, paper, or a plain calculator. Different supermarkets use
different pack sizes, so the math varies by product. Mistakes caused over- or
under-packing, which wastes produce and delays dispatch.

### Why it is useful in a production environment
- Instant results with no mental arithmetic required
- Handles 6 supermarkets × 5 weight variants with the correct formula for each
- Shows a red alert when the last pallet is only partially filled — a critical
  signal for dispatchers who need to plan truck loads
- Works on mobile/tablet with large tap targets so it is usable with gloves
- State persists through page refreshes so workers don't lose results
- Each supermarket has a distinct colour on its result card (border + header
  tint) so workers can scan a list of orders by retailer without reading every
  label — reduces errors during busy dispatch periods

---

## 2. File Structure

| File | Purpose |
|------|---------|
| `src/App.jsx` | Main React component. Holds all state, renders the UI, and wires form inputs to calculation outputs. |
| `src/App.css` | All styling. Mobile-first with CSS custom properties (variables). No UI library. |
| `src/data/businessRules.js` | Single source of truth for all production constants and supermarket lookup tables. |
| `src/utils/calculations.js` | All calculation logic — box formulas, pallet logic, and multi-number input parsing. |
| `PROJECT_CONTEXT.md` | Technical documentation describing the business rules, formulas, and feature list. |
| `DEMO_CODE_GUIDE.md` | This file — interview preparation guide. |

---

## 3. Most Important Code Areas

| What | Where |
|------|-------|
| Business rules (constants, supermarket lists) | `src/data/businessRules.js` |
| Box calculation formulas | `applyFormula()` in `src/utils/calculations.js` |
| Pallet logic | `calculatePallets()` in `src/utils/calculations.js` |
| Multi-number input parsing | `sumMultiInput()` in `src/utils/calculations.js` |
| localStorage persistence | `loadSaved()` and `useEffect` in `src/App.jsx` |
| Result display (boxes, pallets, red alert) | `ResultCard` component in `src/App.jsx` |
| Supermarket colour mapping | `SUPERMARKET_COLOURS` in `src/data/businessRules.js` |

---

## 4. Key Functions

### `applyFormula(supermarket, weight, trays)` — private, in `calculations.js`
**What it does:** Applies the correct box-count formula for a given supermarket
and weight combination.

**Input:** Supermarket name (string), weight variant (string), tray count (number)

**Output:** Raw box count (number, can be a decimal before rounding)

**Why it matters:** Each supermarket and pack size has a different yield per
tray. Centralising all formulas here means there is only one place to update if
production standards change.

| Weight / Market | Formula |
|----------------|---------|
| 500g (all) | `trays × 0.87` |
| 375g (Woolworths only) | `trays × 0.77` |
| 650g (Costco only) | `(trays / 3.9) × 4.2` |
| Brown (all) | `(trays × 1.5) / 3.2` |
| 200g Coles / Aldi | `trays × 0.66` |
| 200g Woolworths / Drakes / IGA | `(trays / 2) × 0.66` |

---

### `calculateBoxes(supermarket, weight, trays)` — exported, in `calculations.js`
**What it does:** Validates the tray count, then calls `applyFormula`.

**Input:** Same three fields as `applyFormula`

**Output:** Box count (number), or `0` if the tray input is empty or invalid

**Why it matters:** This is the single entry point all components use for box
calculations. Validating here means `applyFormula` never receives bad input.

---

### `calculatePallets(rawBoxes)` — exported, in `calculations.js`
**What it does:** Converts a raw box count into display values for the result card.

**Input:** Raw box count (number, may be a decimal)

**Output:** Object with three values:
- `fullPallets` — display value using 0.5 steps (e.g. `1.5` means one and a half pallets)
- `remainder` — how many boxes are on the partial pallet
- `showLastPallet` — boolean that controls the red alert banner

**Why it matters:** This is where the key business logic lives. It tells
dispatchers whether they have a complete or partial pallet load.

---

### `sumMultiInput(input)` — exported, in `calculations.js`
**What it does:** Accepts a space-separated string of numbers and returns their sum.

**Input:** String like `"12 15 9 8"`

**Output:** Sum of all valid numbers (e.g. `44`)

**Why it matters:** Workers count trays in multiple picking runs. Rather than
doing mental addition before typing, they can enter each run's count separated
by a space and let the app add them up.

---

### `loadSaved()` — private, in `App.jsx`
**What it does:** Reads the last saved state from `localStorage` on app start.

**Input:** None (reads from `localStorage` using the key `mushroom-calc-v3`)

**Output:** Parsed state object, or `null` if nothing is saved or the JSON is corrupt

**Why it matters:** This is how the app restores mode, quick-form values, and
detailed orders when a worker refreshes the page or returns to the tab.

---

## 5. Pallet Logic Explained

The fundamental rule: **72 boxes = 1 full pallet**.

```
wholePallets = Math.floor(totalBoxes / 72)   // complete pallets only
remainder    = totalBoxes % 72               // boxes left over
```

The `fullPallets` display value uses half-pallet steps so dispatchers can
quickly gauge how full a partial pallet is:

```
remainder === 0           → fullPallets = wholePallets        (exact)
remainder > 0 && <= 36   → fullPallets = wholePallets + 0.5  (under half full)
remainder > 36            → fullPallets = wholePallets + 1    (more than half full)
```

The **red "Last pallet" alert** appears only when `remainder > 0` — meaning
there is a partial pallet that needs attention.

### Worked examples

| Total boxes | Full pallets (display) | Remainder | Red alert? |
|------------|----------------------|-----------|------------|
| 50 | 0.5 | 50 | No — under one full pallet |
| 72 | 1 | 0 | No — exact |
| 100 | 1.5 | 28 | Yes — 28 boxes on last pallet |
| 144 | 2 | 0 | No — exact |
| 150 | 2.5 | 6 | Yes — 6 boxes on last pallet |
| 216 | 3 | 0 | No — exact |

> Note: The red alert only shows when `showLastPallet` is true, which requires
> `remainder > 0`. An order with fewer than 72 boxes still shows a 0.5
> `fullPallets` value but no red alert.

---

## 6. What to Say in the Interview

Here is a clear, confident explanation you can say out loud:

> "This is a production-floor calculator I built for a mushroom packaging
> facility. The problem was that workers had to manually calculate how many
> boxes and pallets they needed for each supermarket order, and the formulas
> are different depending on which supermarket and pack size they're packing
> for. Mistakes caused wasted produce and delayed dispatches.
>
> I built this in React with Vite — no backend, no database. All the
> calculation logic is in a dedicated utility file so the formulas are easy to
> find and update. The app uses localStorage so results survive a page refresh,
> which matters when workers step away from the tablet and come back.
>
> The most important piece of logic is the pallet calculator — it tells
> dispatchers exactly how many full pallets they have and highlights any
> partial pallet in red so it doesn't get missed during truck loading.
>
> Workers can also enter tray counts from multiple picking runs in a single
> input field, separated by spaces, and the app adds them automatically."

---

## 7. Questions an Interviewer May Ask

**Why did you use React?**
React's component model made it easy to separate the form, result card, and
summary into reusable pieces. State management with `useState` is simple enough
for an app of this size without needing Redux or a more complex library.

**Why did you use Vite?**
Vite has near-instant hot module reload, which made iterating on UI changes
fast. It also produces a lightweight production build that can be deployed as
static files on GitHub Pages or any simple hosting service.

**Why did you use localStorage?**
The app has no backend. localStorage gives simple persistence that survives
page refreshes without any server setup. It's appropriate for an internal tool
where data doesn't need to be shared between users or devices.

**Where is the calculation logic?**
All formulas are in `src/utils/calculations.js` and all constants are in
`src/data/businessRules.js`. Nothing is hardcoded inside the UI components.

**How do you handle edge cases?**
- Empty or zero tray input returns `0` boxes immediately
- `loadSaved()` wraps localStorage in a try/catch to handle corrupt JSON
- The `sumMultiInput` parser filters out non-numeric tokens so bad input is ignored
- `Math.ceil` is applied to box counts before pallet calculation because a
  partial box still occupies physical space on a pallet

**What would you improve in version 2?**
See Section 9 below.

**Is this a full production system?**
No — it is a working prototype based on a real workflow. There is no backend,
no login, and no shared database. It runs entirely in the browser.

**How would you add a backend later?**
I would add a Node/Express or Next.js API layer, move the formulas to the
server so they can be updated without a frontend redeploy, and store order
history in a database like PostgreSQL or SQLite. Authentication could be added
with a simple JWT approach or a provider like Auth0.

---

## 8. What NOT to Exaggerate

Be honest about the scope of this project. Do not claim:

- **"This is a full enterprise production system"** — it is a browser-based
  calculator prototype
- **"It has a backend"** — it does not; everything runs in the browser
- **"It has a database"** — it uses localStorage, not a database
- **"It is deployed internally at the facility"** — say what is actually true
  about its deployment status

**What you can accurately say:**
- It is a working tool built around a real production workflow
- The formulas were verified against actual production numbers
- It is designed to work on mobile/tablet devices used on the floor
- It solves a real problem that previously required manual calculation

---

## 9. Version 2 Improvements

Realistic next steps if this were taken further:

| Feature | Why it matters |
|---------|---------------|
| CSV export | Supervisors could download daily order summaries |
| Backend API | Formulas could be updated without redeploying the frontend |
| User login | Different roles (worker vs. supervisor) with different permissions |
| Database storage | Order history, audit trail, daily reports |
| Historical reports | Compare production across days or weeks |
| Admin panel for formulas | Non-developers could update pack-size formulas |
| PWA / offline support | App works even when the production floor Wi-Fi drops |
| Barcode scanner input | Scan tray labels instead of typing counts |

---


