import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = '@dth/quoteDeck:';

export type DeckPersist = {
  /** Shuffled indices 0..n-1 for this cycle */
  order: number[];
  /** Index into `order` for the quote currently on screen */
  pos: number;
};

function storageKey(categoryId: string): string {
  return `${PREFIX}${categoryId}`;
}

/** Fisher–Yates shuffle; optional `avoidFirst` prevents that index at position 0 when n > 1. */
export function shuffleOrder(n: number, avoidFirst?: number): number[] {
  const order = Array.from({ length: n }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  if (avoidFirst !== undefined && n > 1 && order[0] === avoidFirst) {
    const k = order.findIndex((x) => x !== avoidFirst);
    if (k > 0) [order[0], order[k]] = [order[k], order[0]];
  }
  return order;
}

function isValidDeck(p: unknown, n: number): p is DeckPersist {
  if (!p || typeof p !== 'object') return false;
  const d = p as DeckPersist;
  return (
    Array.isArray(d.order) &&
    d.order.length === n &&
    typeof d.pos === 'number' &&
    d.pos >= 0 &&
    d.pos < n &&
    new Set(d.order).size === n
  );
}

/** Load or create deck. If stored deck size mismatches `n` (quote list changed), start a new cycle. */
export async function getDeckState(categoryId: string, n: number): Promise<DeckPersist> {
  if (n < 1) {
    return { order: [0], pos: 0 };
  }
  const raw = await AsyncStorage.getItem(storageKey(categoryId));
  if (raw) {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (isValidDeck(parsed, n)) {
        return parsed;
      }
    } catch {
      /* fall through */
    }
  }
  return { order: shuffleOrder(n), pos: 0 };
}

/** Quote index currently shown for this category. */
export async function currentQuoteIndex(categoryId: string, n: number): Promise<number> {
  const { order, pos } = await getDeckState(categoryId, n);
  return order[pos]!;
}

/**
 * Advance to the next quote in the deck. Cycles through every index once, then shuffles a new order.
 * Avoids starting the new cycle on the same quote that just ended the last cycle (when possible).
 */
export async function advanceQuoteDeck(categoryId: string, n: number): Promise<number> {
  if (n < 1) return 0;
  const deck = await getDeckState(categoryId, n);
  const next = advanceDeckOneStep(deck, n);
  await AsyncStorage.setItem(storageKey(categoryId), JSON.stringify(next satisfies DeckPersist));
  return next.order[next.pos]!;
}

/** Advance one step in the quote deck (same rules as `advanceQuoteDeck`, no I/O). */
export function advanceDeckOneStep(deck: DeckPersist, n: number): DeckPersist {
  if (n < 1) return { order: [0], pos: 0 };
  let { order, pos } = deck;
  const lastShown = order[pos]!;
  pos++;
  if (pos >= n) {
    order = shuffleOrder(n, lastShown);
    pos = 0;
  }
  return { order, pos };
}

/** Persist deck state (e.g. after Home Screen widget buttons update the shared timeline). */
export async function setDeckState(categoryId: string, n: number, deck: DeckPersist): Promise<void> {
  if (n < 1) return;
  if (!isValidDeck(deck, n)) return;
  await AsyncStorage.setItem(storageKey(categoryId), JSON.stringify(deck));
}

export async function resetQuoteDeck(categoryId: string): Promise<void> {
  await AsyncStorage.removeItem(storageKey(categoryId));
}

export async function clearAllQuoteDecks(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  await AsyncStorage.multiRemove(keys.filter((k) => k.startsWith(PREFIX)));
}
