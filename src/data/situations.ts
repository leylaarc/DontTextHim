import type { QuoteCategory, Situation } from './quoteData/types';
import { QUOTE_CATEGORIES_A } from './quoteData/categoriesPartA';
import { QUOTE_CATEGORIES_B } from './quoteData/categoriesPartB';
import { EXTRA_QUOTES_BY_CATEGORY } from './quoteData/extraQuotesByCategory';

export type { QuoteCategory, Situation } from './quoteData/types';

export const QUOTE_CATEGORIES: readonly QuoteCategory[] = [
  ...QUOTE_CATEGORIES_A,
  ...QUOTE_CATEGORIES_B,
];

export function getCategoryById(id: string): QuoteCategory | undefined {
  return QUOTE_CATEGORIES.find((c) => c.id === id);
}

/** Base quotes plus supplementary lines for this category (used for deck length and display). */
export function getMergedQuotesForCategoryId(id: string): readonly string[] | undefined {
  const cat = getCategoryById(id);
  if (!cat) return undefined;
  const extra = EXTRA_QUOTES_BY_CATEGORY[cat.id];
  return extra ? [...cat.quotes, ...extra] : [...cat.quotes];
}

/** Build a card for merged quote index `quoteIndex`. */
export function situationAtQuoteIndex(categoryId: string, quoteIndex: number): Situation {
  const cat = getCategoryById(categoryId);
  const quotes = getMergedQuotesForCategoryId(categoryId);
  if (!cat || !quotes || quotes.length === 0) {
    throw new Error(`Unknown or empty category: ${categoryId}`);
  }
  const n = quotes.length;
  const idx = ((quoteIndex % n) + n) % n;
  const body = quotes[idx]!;
  return {
    id: `${categoryId}-q${idx}`,
    categoryId,
    title: cat.title,
    body,
    quoteIndex: idx,
  };
}
