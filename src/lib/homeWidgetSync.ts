import quoteWidget from '../widgets/quoteWidgetEntry';

import type { QuoteWidgetProps } from '../widgets/quoteWidgetTypes';

const EMPTY: QuoteWidgetProps = {
  title: "Don't Text Him",
  body: 'Open the app, pick a situation, and your quote will show on the Home Screen.',
  affirmedLine: null,
};

export function syncHomeScreenQuoteWidget(props: QuoteWidgetProps | null) {
  quoteWidget.updateSnapshot(props ?? EMPTY);
}
