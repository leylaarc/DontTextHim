export type QuoteCategory = {
  id: string;
  title: string;
  hint: string;
  quotes: readonly string[];
};

export type Situation = {
  id: string;
  categoryId: string;
  title: string;
  body: string;
  /** Index into the category quote list; used to avoid immediate repeats when shuffling. */
  quoteIndex: number;
};
