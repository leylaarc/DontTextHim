import { Platform } from 'react-native';

import { APP_DISPLAY_NAME } from '../config/appStore';
import quoteWidget from '../widgets/quoteWidgetEntry';
import type { QuoteWidgetProps } from '../widgets/quoteWidgetTypes';

/** Prefer reloading every timeline — ensures WidgetKit sees shared Defaults writes reliably after snapshots. */
function reloadIosWidgetTimelines(): void {
  if (Platform.OS !== 'ios') return;
  try {
    const ExpoWidgetsNative =
      require('expo-widgets/build/ExpoWidgets') as typeof import('expo-widgets/build/ExpoWidgets');
    ExpoWidgetsNative.default.reloadAllWidgets();
    return;
  } catch {
    /* Expo Go / missing native module */
  }
  const w = quoteWidget as unknown as { reload?: () => void };
  w.reload?.();
}

const EMPTY: QuoteWidgetProps = {
  title: APP_DISPLAY_NAME,
  body: 'Choose a situation in the app — your reminder quote appears here.',
};

/**
 * UserDefaults / plist storage rejects NSNull; explicit `null` fields from JS become NSNull and can block writes.
 */
function quoteWidgetPropsSafeForStorage(props: QuoteWidgetProps): QuoteWidgetProps {
  const next: QuoteWidgetProps = {
    title: props.title,
    body: props.body,
  };
  if (props.categoryId) next.categoryId = props.categoryId;
  if (props.order?.length) next.order = props.order;
  if (typeof props.pos === 'number') next.pos = props.pos;
  if (props.quotes?.length) next.quotes = props.quotes;
  if (props.affirmedLine) next.affirmedLine = props.affirmedLine;
  return next;
}

export function syncHomeScreenQuoteWidget(props: QuoteWidgetProps | null) {
  try {
    quoteWidget.updateSnapshot(quoteWidgetPropsSafeForStorage(props ?? EMPTY));
    reloadIosWidgetTimelines();
  } catch (e) {
    console.warn('[syncHomeScreenQuoteWidget]', e);
  }
}
