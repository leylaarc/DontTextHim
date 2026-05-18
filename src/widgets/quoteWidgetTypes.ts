/** Props serialized to the iOS WidgetKit timeline (must stay JSON-friendly). */
export type QuoteWidgetProps = {
  title: string;
  body: string;
  /** Set when the main app syncs; required for shuffle / deck logic on the widget */
  categoryId?: string;
  /**
   * Merged quote lines for this category (same order as `getMergedQuotesForCategoryId`).
   * Required for widget rendering — the widget JS environment cannot import app data modules.
   */
  quotes?: string[];
  order?: number[];
  pos?: number;
  /** Shown after tapping “I didn’t text them” on the widget */
  affirmedLine?: string | null;
};

export type QuoteWidgetHandle = {
  updateSnapshot: (props: QuoteWidgetProps) => void;
  getTimeline: () => Promise<{ date: Date; props: QuoteWidgetProps }[]>;
};
