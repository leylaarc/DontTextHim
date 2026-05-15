import { Button, HStack, Link, Text, VStack } from '@expo/ui/swift-ui';
import { buttonStyle, font, foregroundStyle, padding } from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

import { getMergedQuotesForCategoryId, situationAtQuoteIndex } from '../data/situations';
import { advanceDeckOneStep } from '../lib/quoteDeck';
import type { QuoteWidgetProps } from './quoteWidgetTypes';

const ACCENT = '#7a4852';
const TEXT = '#2f2428';
const SUCCESS = '#4a7a62';
const AFFIRMED = 'Good. Let the urge peak and fall without feeding it.';

function QuoteWidgetView(props: QuoteWidgetProps, environment: WidgetEnvironment) {
  'widget';
  const isSmall = environment.widgetFamily === 'systemSmall';
  const maxLen = isSmall ? 100 : 220;
  const body =
    props.body.length > maxLen ? `${props.body.slice(0, Math.max(0, maxLen - 1)).trim()}…` : props.body;

  const cid = props.categoryId;
  const n = cid ? (getMergedQuotesForCategoryId(cid)?.length ?? 0) : 0;
  const canInteract = Boolean(cid && n > 0 && props.order && props.pos !== undefined && props.order.length === n);

  const shuffleWidget = (): QuoteWidgetProps => {
    if (!canInteract || !cid) return props;
    const deck = { order: [...props.order!], pos: props.pos! };
    const nextDeck = advanceDeckOneStep(deck, n);
    const qi = nextDeck.order[nextDeck.pos]!;
    const s = situationAtQuoteIndex(cid, qi);
    return {
      ...props,
      title: s.title,
      body: s.body,
      categoryId: cid,
      order: [...nextDeck.order],
      pos: nextDeck.pos,
      affirmedLine: null,
    };
  };

  const resistedWidget = (): QuoteWidgetProps => ({
    ...props,
    affirmedLine: AFFIRMED,
  });

  if (isSmall) {
    return (
      <Link destination="donttexthim://" modifiers={[padding({ all: 10 })]}>
        <VStack>
          <Text modifiers={[font({ size: 11, weight: 'semibold' }), foregroundStyle(ACCENT)]}>{props.title}</Text>
          <Text modifiers={[font({ size: 13, weight: 'regular' }), foregroundStyle(TEXT)]}>{body}</Text>
          {props.affirmedLine ? (
            <Text modifiers={[font({ size: 11, weight: 'semibold' }), foregroundStyle(SUCCESS)]}>
              {props.affirmedLine}
            </Text>
          ) : null}
        </VStack>
      </Link>
    );
  }

  return (
    <VStack modifiers={[padding({ all: 10 })]}>
      <Link destination="donttexthim://">
        <VStack>
          <Text modifiers={[font({ size: 11, weight: 'semibold' }), foregroundStyle(ACCENT)]}>{props.title}</Text>
          <Text modifiers={[font({ size: 15, weight: 'regular' }), foregroundStyle(TEXT)]}>{body}</Text>
        </VStack>
      </Link>
      {props.affirmedLine ? (
        <Text modifiers={[font({ size: 12, weight: 'semibold' }), foregroundStyle(SUCCESS)]}>{props.affirmedLine}</Text>
      ) : null}
      {canInteract ? (
        <HStack spacing={8}>
          <Button
            label="Another quote"
            modifiers={[buttonStyle('bordered')]}
            onPress={shuffleWidget as unknown as () => void}
          />
          <Button
            label={"I didn't text him"}
            modifiers={[buttonStyle('borderedProminent')]}
            onPress={resistedWidget as unknown as () => void}
          />
        </HStack>
      ) : (
        <Link
          label="Open app"
          destination="donttexthim://"
          modifiers={[font({ size: 12, weight: 'semibold' }), foregroundStyle(ACCENT)]}
        />
      )}
    </VStack>
  );
}

const quoteWidget = createWidget<QuoteWidgetProps>('QuoteWidget', QuoteWidgetView);

export default quoteWidget;
