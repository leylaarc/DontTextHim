import { Platform } from 'react-native';
import { addUserInteractionListener } from 'expo-widgets';

import { getMergedQuotesForCategoryId } from '../data/situations';
import quoteWidget from '../widgets/quoteWidgetEntry';
import type { QuoteWidgetProps } from '../widgets/quoteWidgetTypes';
import { setDeckState } from './quoteDeck';

/**
 * When the user taps interactive widget buttons, the extension updates the timeline first;
 * we mirror `order` / `pos` into AsyncStorage so the main app matches on next open.
 */
export function registerWidgetInteractionPersistence(): () => void {
  if (Platform.OS !== 'ios') {
    return () => {};
  }
  const sub = addUserInteractionListener(async () => {
    let timeline: { date: Date; props: QuoteWidgetProps }[];
    try {
      timeline = await quoteWidget.getTimeline();
    } catch {
      return;
    }
    const p = timeline[0]?.props;
    if (!p?.categoryId || !p.order || p.pos === undefined) return;
    const n = getMergedQuotesForCategoryId(p.categoryId)?.length ?? 0;
    if (!n) return;
    await setDeckState(p.categoryId, n, { order: p.order, pos: p.pos });
  });
  return () => sub.remove();
}
