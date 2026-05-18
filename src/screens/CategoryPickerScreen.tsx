import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { QUOTE_CATEGORIES } from '../data/situations';
import { colors, radius, spacing } from '../theme';

type Props = {
  onSelectCategory: (categoryId: string) => void;
};

export function CategoryPickerScreen({ onSelectCategory }: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>Step one</Text>
        <Text style={styles.title}>What fits closest?</Text>
        {QUOTE_CATEGORIES.map((cat) => (
          <Pressable
            key={cat.id}
            onPress={() => onSelectCategory(cat.id)}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            accessibilityRole="button"
            accessibilityLabel={`Select ${cat.title}`}
          >
            <Text style={styles.cardTitle}>{cat.title}</Text>
            <Text style={styles.cardHint}>{cat.hint}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  kicker: {
    color: colors.accent,
    fontSize: 13,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '700',
    marginBottom: spacing.lg,
    lineHeight: 32,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardPressed: {
    opacity: 0.92,
    borderColor: colors.accent,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  cardHint: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
});
