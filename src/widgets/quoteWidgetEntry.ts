import { NativeModules, Platform } from 'react-native';

import type { QuoteWidgetHandle, QuoteWidgetProps } from './quoteWidgetTypes';

const stub: QuoteWidgetHandle = {
  updateSnapshot(_props: QuoteWidgetProps) {},
  async getTimeline() {
    return [];
  },
};

function load(): QuoteWidgetHandle {
  if (Platform.OS !== 'ios') return stub;
  if (!(NativeModules as { ExpoWidgets?: unknown }).ExpoWidgets) return stub;
  try {
    return require('./QuoteWidget.ios').default as QuoteWidgetHandle;
  } catch {
    return stub;
  }
}

/** Resolved once at startup: real widget handle on iOS dev/prod builds, no-op elsewhere. */
const quoteWidget = load();
export default quoteWidget;
