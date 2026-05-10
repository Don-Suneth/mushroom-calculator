import { BOXES_PER_PALLET } from '../data/businessRules.js';

// Routes to the correct formula based on supermarket + weight combination.
// Formulas are derived from physical pack sizes and tray yields verified with
// production — do not adjust without re-confirming against actual floor numbers.
function applyFormula(supermarket, weight, trays) {
  if (weight === '500g') return trays * 0.87;

  if (weight === '375g') return trays * 0.77; // Woolworths-only pack size

  if (weight === '650g') return (trays / 3.9) * 4.2; // Costco-only large pack

  if (weight === 'Brown') return (trays * 1.5) / 3.2;

  if (weight === '200g') {
    if (supermarket === 'Coles' || supermarket === 'Aldi') return trays * 0.66;
    // Woolworths, Drakes, and IGA use a different tray-fill ratio for 200g
    return (trays / 2) * 0.66;
  }

  return 0;
}

// Validates input and delegates to applyFormula. All box calculations pass through here.
export function calculateBoxes(supermarket, weight, trays) {
  const t = Number(trays);
  if (!t || t <= 0) return 0;
  return applyFormula(supermarket, weight, t);
}

// Converts a raw box count into pallet numbers for the result cards.
// Math.ceil is applied first because a partial box still occupies physical space.
// fullPallets uses 0.5 steps so dispatchers can see at a glance whether a pallet
// is roughly half-full (e.g. 1.5) or nearly complete (e.g. 2).
// showLastPallet drives the red alert banner — only shown when there is a remainder.
export function calculatePallets(rawBoxes) {
  const totalBoxes = Math.ceil(rawBoxes);
  if (totalBoxes <= 0) return { fullPallets: 0, remainder: 0, showLastPallet: false };
  const wholePallets = Math.floor(totalBoxes / BOXES_PER_PALLET);
  const remainder = totalBoxes % BOXES_PER_PALLET;
  const halfThreshold = BOXES_PER_PALLET / 2; // 36
  const fullPallets =
    remainder === 0 ? wholePallets :
    remainder <= halfThreshold ? wholePallets + 0.5 :
    wholePallets + 1;
  const showLastPallet = remainder > 0;
  return { fullPallets, remainder, showLastPallet };
}

// Parses a multi-value tray input and returns the total.
// Accepts spaces, commas, and + as delimiters so workers can enter counts
// however feels natural on a mobile keyboard: "12 15 9", "12,15,9", "12+15+9".
export function parseNumberInput(input) {
  if (!input || !input.trim()) return 0;
  const nums = input
    .trim()
    .split(/[.,+\s]+/)   // dot treated as separator — handles iPhone decimal keyboard
    .map(Number)
    .filter((n) => !isNaN(n) && n > 0);
  return nums.reduce((sum, n) => sum + n, 0);
}
