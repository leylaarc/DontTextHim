import { Platform } from 'react-native';

import type { QuoteWidgetHandle, QuoteWidgetProps } from './quoteWidgetTypes';

const stub: QuoteWidgetHandle = {
  updateSnapshot(_props: QuoteWidgetProps) {},
  async getTimeline() {
    return [];
  },
};

function load(): QuoteWidgetHandle {
  if (Platform.OS !== 'ios') return stub;
  try {
    // Don't gate on NativeModules — wrong negatives strand Turbo Modules builds as stubs forever.
    return require('./QuoteWidget.ios').default as QuoteWidgetHandle;
  } catch {
    return stub;
  }
}

/** Resolved once at startup: real widget handle on iOS dev/prod builds, no-op elsewhere. */
const quoteWidget = load();
export default quoteWidget;
