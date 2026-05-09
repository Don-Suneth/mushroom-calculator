import { BOXES_PER_PALLET } from '../data/businessRules.js';

function applyFormula(supermarket, weight, trays) {
  if (weight === '500g') return trays * 0.87;

  if (weight === '375g') return trays * 0.77; // Woolworths only

  if (weight === '650g') return (trays / 3.9) * 4.2; // Costco only

  if (weight === 'Brown') return (trays * 1.5) / 3.2;

  if (weight === '200g') {
    if (supermarket === 'Coles' || supermarket === 'Aldi') return trays * 0.66;
    // Woolworths, Drakes, IGA
    return (trays / 2) * 0.66;
  }

  return 0;
}

export function calculateBoxes(supermarket, weight, trays) {
  const t = Number(trays);
  if (!t || t <= 0) return 0;
  return applyFormula(supermarket, weight, t);
}

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

export function sumMultiInput(input) {
  if (!input || !input.trim()) return 0;
  const nums = input
    .trim()
    .split(/\s+/)
    .map(Number)
    .filter((n) => !isNaN(n) && n > 0);
  return nums.reduce((sum, n) => sum + n, 0);
}
