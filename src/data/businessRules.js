// All production constants and lookup tables live here so any changes to pack
// sizes, pallet limits, or supermarket constraints only need updating in one place.

export const BOXES_PER_PALLET = 72;  // physical pallet capacity on the production floor
export const KG_PER_BOX = 4;         // standard box weight; used for load projections

export const SUPERMARKETS = ['Coles', 'Woolworths', 'Aldi', 'Drakes', 'IGA', 'Costco'];

export const LABELS = ['VIC', 'TRG', 'QLD', 'SA', 'CP', 'WA', 'NSW'];

// Each supermarket ships to a specific subset of distribution labels —
// filtering here prevents workers from selecting invalid label combinations.
export const SUPERMARKET_LABELS = {
  Coles:      ['VIC', 'SA', 'CP', 'WA', 'NSW'],
  Woolworths: ['TRG', 'QLD', 'SA', 'WA'],
  Aldi:       ['SA', 'NSW'],
  Drakes:     ['SA', 'QLD'],
  IGA:        ['SA'],
  Costco:     ['NSW', 'SA'],
};

// Available weights per supermarket (order matters — first is the default)
export const SUPERMARKET_WEIGHTS = {
  Coles:      ['200g', '500g', 'Brown'],
  Woolworths: ['200g', '375g', '500g','Brown' ],
  Aldi:       ['200g', '500g', 'Brown'],
  Drakes:     ['200g', '500g', 'Brown'],
  IGA:        ['200g', '500g', 'Brown'],
  Costco:     [ '650g'],
};

// Accent colour per supermarket — used only for the result card's left border stripe.
export const SUPERMARKET_COLOURS = {
  Coles:      '#c62828',
  Woolworths: '#2e7d32',
  Aldi:       '#1565c0',
  Drakes:     '#e65100',
  IGA:        '#6a1010',
  Costco:     '#1a237e',
};
