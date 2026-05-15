import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, AppState, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AddWidgetInstructionsModal } from '../components/AddWidgetInstructionsModal';
import { WhiteConfetti } from '../components/WhiteConfetti';
import { getMergedQuotesForCategoryId, situationAtQuoteIndex, type Situation } from '../data/situations';
import { syncHomeScreenQuoteWidget } from '../lib/homeWidgetSync';
import {
  advanceQuoteDeck,
  currentQuoteIndex,
  getDeckState,
  resetQuoteDeck,
} from '../lib/quoteDeck';
import {
  clearSelectedCategory,
  getSelectedCategoryId,
  setSelectedCategoryId,
} from '../lib/storage';
import { CategoryPickerScreen } from './CategoryPickerScreen';
import { colors, radius, spacing } from '../theme';

type Props = {
  onOpenSettings: () => void;
  onOpenUnsentText: () => void;
  /** Increment from parent to re-load category from storage (e.g. after Settings reset). */
  categoryKey: number;
};

export function HomeScreen({ onOpenSettings, onOpenUnsentText, categoryKey }: Props) {
  const [ready, setReady] = useState(false);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [card, setCard] = useState<Situation | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [confettiBurst, setConfettiBurst] = useState(0);
  const [widgetHelpOpen, setWidgetHelpOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    (async () => {
      const id = await getSelectedCategoryId();
      if (cancelled) return;
      setCategoryId(id);
      if (id) {
        const quotes = getMergedQuotesForCategoryId(id);
        if (quotes?.length) {
          const qi = await currentQuoteIndex(id, quotes.length);
          setCard(situationAtQuoteIndex(id, qi));
        } else {
          setCard(null);
        }
      } else {
        setCard(null);
      }
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [categoryKey]);

  useEffect(() => {
    if (!card || !categoryId) {
      syncHomeScreenQuoteWidget(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const quotes = getMergedQuotesForCategoryId(categoryId);
      const n = quotes?.length ?? 0;
      if (!n) {
        syncHomeScreenQuoteWidget(null);
        return;
      }
      const deck = await getDeckState(categoryId, n);
      if (cancelled) return;
      const qi = deck.order[deck.pos]!;
      const s = situationAtQuoteIndex(categoryId, qi);
      syncHomeScreenQuoteWidget({
        title: s.title,
        body: s.body,
        categoryId,
        order: deck.order,
        pos: deck.pos,
        affirmedLine: null,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [card, categoryId]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active' || !categoryId) return;
      void (async () => {
        const quotes = getMergedQuotesForCategoryId(categoryId);
        const n = quotes?.length ?? 0;
        if (!n) return;
        const qi = await currentQuoteIndex(categoryId, n);
        const nextCard = situationAtQuoteIndex(categoryId, qi);
        setCard(nextCard);
        const deck = await getDeckState(categoryId, n);
        syncHomeScreenQuoteWidget({
          title: nextCard.title,
          body: nextCard.body,
          categoryId,
          order: deck.order,
          pos: deck.pos,
          affirmedLine: null,
        });
      })();
    });
    return () => sub.remove();
  }, [categoryId]);

  /** Prevent confetti replay when `WhiteConfetti` remounts after visiting the situation picker. */
  useEffect(() => {
    if (!categoryId) {
      setConfettiBurst(0);
    }
  }, [categoryId]);

  const selectCategory = useCallback(async (id: string) => {
    await resetQuoteDeck(id);
    await setSelectedCategoryId(id);
    setCategoryId(id);
    const quotes = getMergedQuotesForCategoryId(id);
    if (quotes?.length) {
      const qi = await currentQuoteIndex(id, quotes.length);
      setCard(situationAtQuoteIndex(id, qi));
    } else {
      setCard(null);
    }
    setToast(null);
  }, []);

  const shuffle = useCallback(async () => {
    if (!categoryId) return;
    const quotes = getMergedQuotesForCategoryId(categoryId);
    if (!quotes?.length) return;
    const qi = await advanceQuoteDeck(categoryId, quotes.length);
    setCard(situationAtQuoteIndex(categoryId, qi));
    setToast(null);
  }, [categoryId]);

  const resistedToastOnly = useCallback(() => {
    setToast('Good. Let the urge peak and fall without feeding it.');
    setTimeout(() => setToast(null), 3200);
  }, []);

  const resistedWithConfetti = useCallback(() => {
    setConfettiBurst((n) => n + 1);
    resistedToastOnly();
  }, [resistedToastOnly]);

  const changeSituation = useCallback(async () => {
    await clearSelectedCategory();
    setCategoryId(null);
    setCard(null);
    setToast(null);
  }, []);

  if (!ready) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (!categoryId) {
    return <CategoryPickerScreen onSelectCategory={selectCategory} />;
  }

  if (!card) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <WhiteConfetti burst={confettiBurst} />
      <AddWidgetInstructionsModal visible={widgetHelpOpen} onClose={() => setWidgetHelpOpen(false)} />
      <View style={styles.root}>
        <View style={styles.header}>
          <Text style={styles.logo}>{"Don't Text Him"}</Text>
          <View style={styles.headerRight}>
            <Pressable onPress={onOpenUnsentText} hitSlop={10} style={({ pressed }) => pressed && styles.linkPressed}>
              <Text style={styles.link}>Unsent text</Text>
            </Pressable>
            <Pressable onPress={changeSituation} hitSlop={10} style={({ pressed }) => pressed && styles.linkPressed}>
              <Text style={styles.link}>Situation</Text>
            </Pressable>
            <Pressable onPress={onOpenSettings} hitSlop={12} style={({ pressed }) => pressed && styles.iconPressed}>
              <Text style={styles.gear}>⚙︎</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.centerBlock}>
          <Text style={styles.brand}>{"Don't Text Him"}</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{card.title}</Text>
            <Text style={styles.cardBody}>{card.body}</Text>
          </View>
          {toast ? (
            <View style={styles.toast}>
              <Text style={styles.toastText}>{toast}</Text>
            </View>
          ) : null}
        </View>

        <SafeAreaView edges={['bottom']} style={styles.bottomSafe}>
          {Platform.OS === 'ios' ? (
            <Pressable
              style={({ pressed }) => [styles.widgetCta, pressed && styles.widgetCtaPressed]}
              onPress={() => setWidgetHelpOpen(true)}
              accessibilityRole="button"
              accessibilityLabel="How to add the Home Screen widget"
            >
              <Text style={styles.widgetCtaText}>Add Home Screen widget</Text>
              <Text style={styles.widgetCtaHint}>See steps — then leave the app and add it from your Home Screen</Text>
            </Pressable>
          ) : null}
          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [styles.unsentCta, pressed && styles.unsentCtaPressed]}
              onPress={onOpenUnsentText}
              accessibilityRole="button"
              accessibilityLabel="Open unsent text — type your draft instead of sending"
            >
              <Text style={styles.unsentCtaText}>Type what you almost sent</Text>
              <Text style={styles.unsentCtaHint}>Get perspective before you hit send</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.primary, pressed && styles.primaryPressed]}
              onPress={resistedWithConfetti}
            >
              <Text style={styles.primaryLabel}>{"I didn't text him"}</Text>
            </Pressable>
            <Pressable style={({ pressed }) => [styles.secondary, pressed && styles.secondaryPressed]} onPress={shuffle}>
              <Text style={styles.secondaryLabel}>Another quote in this situation</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.md,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  logo: {
    color: colors.textMuted,
    fontSize: 13,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  link: {
    color: colors.accent,
    fontSize: 15,
    fontWeight: '600',
  },
  linkPressed: {
    opacity: 0.7,
  },
  gear: {
    color: colors.text,
    fontSize: 22,
  },
  iconPressed: {
    opacity: 0.6,
  },
  centerBlock: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    minHeight: 0,
  },
  brand: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  cardBody: {
    color: colors.text,
    fontSize: 18,
    lineHeight: 28,
    textAlign: 'center',
  },
  toast: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  toastText: {
    color: colors.success,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  bottomSafe: {
    backgroundColor: colors.bg,
  },
  widgetCta: {
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  widgetCtaPressed: {
    opacity: 0.92,
  },
  widgetCtaText: {
    color: colors.accentDeep,
    fontSize: 16,
    fontWeight: '700',
  },
  widgetCtaHint: {
    marginTop: spacing.xs,
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  actions: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  unsentCta: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  unsentCtaPressed: {
    opacity: 0.92,
    borderColor: colors.accent,
  },
  unsentCtaText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  unsentCtaHint: {
    marginTop: spacing.xs,
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  primary: {
    backgroundColor: colors.accentDeep,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  primaryPressed: {
    opacity: 0.92,
  },
  primaryLabel: {
    color: colors.textOnAccent,
    fontSize: 17,
    fontWeight: '600',
  },
  secondary: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  secondaryPressed: {
    opacity: 0.7,
  },
  secondaryLabel: {
    color: colors.textMuted,
    fontSize: 16,
  },
});
