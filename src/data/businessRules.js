export const BOXES_PER_PALLET = 72;
export const KG_PER_BOX = 4;

export const SUPERMARKETS = ['Coles', 'Woolworths', 'Aldi', 'Drakes', 'IGA', 'Costco'];

export const LABELS = ['VIC', 'TRG', 'QLD', 'SA', 'CP', 'WA', 'NSW'];

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
