import { Button, HStack, Link, Text, VStack } from '@expo/ui/swift-ui';
import { background, buttonStyle, font, foregroundStyle, padding } from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

import type { QuoteWidgetProps } from './quoteWidgetTypes';

/**
 * The `'widget'` directive serializes ONLY this function body for JavaScriptCore.
 * Anything referenced from outside (module-level `const`, sibling `function`, Babel helpers like
 * `_toConsumableArray`) is undefined there → ReferenceError → blank widget.
 * Keep helpers and string/color literals inside this function; avoid `[...arr]` / `{ ...props }`
 * patterns that inject runtime helpers into the serialized code.
 */
function QuoteWidgetView(props: QuoteWidgetProps, environment: WidgetEnvironment) {
  'widget';

  const accent = '#7a4852';
  const textColor = '#2f2428';
  const successColor = '#4a7a62';
  const surface = '#faf4f5';
  const affirmedText = 'Good. Let the urge peak and fall without feeding it.';

  function shuffleOrder(n: number, avoidFirst?: number): number[] {
    const order = Array.from({ length: n }, (_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const a = order[i]!;
      const b = order[j]!;
      order[i] = b;
      order[j] = a;
    }
    if (avoidFirst !== undefined && n > 1 && order[0] === avoidFirst) {
      const k = order.findIndex((x) => x !== avoidFirst);
      if (k > 0) {
        const t = order[0]!;
        order[0] = order[k]!;
        order[k] = t;
      }
    }
    return order;
  }

  function advanceDeckOneStep(deck: { order: number[]; pos: number }, n: number): { order: number[]; pos: number } {
    if (n < 1) return { order: [0], pos: 0 };
    let order = deck.order;
    let pos = deck.pos;
    const lastShown = order[pos]!;
    pos++;
    if (pos >= n) {
      order = shuffleOrder(n, lastShown);
      pos = 0;
    }
    return { order, pos };
  }

  const surfaceBg = [background(surface)];

  const isSmall = environment.widgetFamily === 'systemSmall';
  const maxLen = isSmall ? 100 : 220;
  const body =
    props.body.length > maxLen ? `${props.body.slice(0, Math.max(0, maxLen - 1)).trim()}…` : props.body;

  const cid = props.categoryId;
  const quotes = props.quotes;
  const n = quotes?.length ?? 0;
  const canInteract = Boolean(cid && n > 0 && props.order && props.pos !== undefined && props.order.length === n);

  const shuffleWidget = (): QuoteWidgetProps => {
    if (!canInteract || !cid || !quotes || !props.order) return props;
    const deck = { order: props.order.slice(), pos: props.pos as number };
    const nextDeck = advanceDeckOneStep(deck, n);
    const qi = nextDeck.order[nextDeck.pos]!;
    const nextBody = quotes[qi] != null ? quotes[qi]! : props.body;
    return {
      title: props.title,
      body: nextBody,
      categoryId: cid,
      quotes: quotes.slice(),
      order: nextDeck.order.slice(),
      pos: nextDeck.pos,
      affirmedLine: null,
    };
  };

  const resistedWidget = (): QuoteWidgetProps => ({
    title: props.title,
    body: props.body,
    categoryId: props.categoryId,
    quotes: props.quotes ? props.quotes.slice() : undefined,
    order: props.order ? props.order.slice() : undefined,
    pos: props.pos,
    affirmedLine: affirmedText,
  });

  if (isSmall) {
    return (
      <Link destination="donttexthim://" modifiers={[padding({ all: 10 })]}>
        <VStack modifiers={surfaceBg}>
          <Text modifiers={[font({ size: 11, weight: 'semibold' }), foregroundStyle(accent)]}>{props.title}</Text>
          <Text modifiers={[font({ size: 13, weight: 'regular' }), foregroundStyle(textColor)]}>{body}</Text>
          {props.affirmedLine ? (
            <Text modifiers={[font({ size: 11, weight: 'semibold' }), foregroundStyle(successColor)]}>
              {props.affirmedLine}
            </Text>
          ) : null}
        </VStack>
      </Link>
    );
  }

  return (
    <VStack modifiers={[background(surface), padding({ all: 10 })]}>
      <Link destination="donttexthim://">
        <VStack>
          <Text modifiers={[font({ size: 11, weight: 'semibold' }), foregroundStyle(accent)]}>{props.title}</Text>
          <Text modifiers={[font({ size: 15, weight: 'regular' }), foregroundStyle(textColor)]}>{body}</Text>
        </VStack>
      </Link>
      {props.affirmedLine ? (
        <Text modifiers={[font({ size: 12, weight: 'semibold' }), foregroundStyle(successColor)]}>
          {props.affirmedLine}
        </Text>
      ) : null}
      {canInteract ? (
        <HStack spacing={8}>
          <Button
            label="Another quote"
            modifiers={[buttonStyle('bordered')]}
            onPress={shuffleWidget as unknown as () => void}
          />
          <Button
            label={"I didn't text them"}
            modifiers={[buttonStyle('borderedProminent')]}
            onPress={resistedWidget as unknown as () => void}
          />
        </HStack>
      ) : (
        <Link
          label="Open app"
          destination="donttexthim://"
          modifiers={[font({ size: 12, weight: 'semibold' }), foregroundStyle(accent)]}
        />
      )}
    </VStack>
  );
}

const quoteWidget = createWidget<QuoteWidgetProps>('QuoteWidget', QuoteWidgetView);

export default quoteWidget;
