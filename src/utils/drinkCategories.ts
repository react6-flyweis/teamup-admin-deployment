import type { DrinkCategoryEnum } from '@/hooks/useBites';

export interface DrinkCategoryOption {
  label: string;
  value: DrinkCategoryEnum;
}

export const DRINK_CATEGORY_MAP: Record<DrinkCategoryEnum, string> = {
  cocktails: 'Cocktails',
  beers: 'Beers',
  draught: 'Draught',
  mocktails: 'Mocktails',
  'soft-drinks': 'Soft Drinks',
  shots: 'Shots',
  wine: 'Wine',
  other: 'Other',
};

export const DRINK_CATEGORY_OPTIONS: DrinkCategoryOption[] = (
  Object.keys(DRINK_CATEGORY_MAP) as DrinkCategoryEnum[]
).map((key) => ({
  label: DRINK_CATEGORY_MAP[key],
  value: key,
}));

export const formatDrinkCategory = (category?: string): string => {
  if (!category) return 'Other';
  if (category in DRINK_CATEGORY_MAP) {
    return DRINK_CATEGORY_MAP[category as DrinkCategoryEnum];
  }
  // Fallback formatting if unknown string slug is provided
  return category
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
