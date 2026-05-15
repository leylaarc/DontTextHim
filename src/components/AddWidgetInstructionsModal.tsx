import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';

type Props = {
  visible: boolean;
  onClose: () => void;
};

const STEPS: { n: string; text: string }[] = [
  {
    n: '1',
    text: 'Leave this app and go to your iPhone Home Screen. Touch and hold a **blank area** (wallpaper) until apps jiggle or you see **Edit**.',
  },
  {
    n: '2',
    text: 'Tap **+** in the top corner to open the widget gallery.',
  },
  {
    n: '3',
    text: "Search **Don't Text Him**. Pick **Medium** for **Another quote** and **I didn't text him** on the widget (iOS 17+), or **Small** for the quote only—then **Add Widget**.",
  },
  {
    n: '4',
    text: 'Tap **Done**. When you open the app again, the quote and deck stay matched with the widget.',
  },
];

function StepLine({ n, text }: { n: string; text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return (
    <View style={styles.stepRow}>
      <View style={styles.stepBadge}>
        <Text style={styles.stepBadgeText}>{n}</Text>
      </View>
      <Text style={styles.stepBody}>
        {parts.map((chunk, i) => (
          <Text key={i} style={i % 2 === 1 ? styles.stepEm : undefined}>
            {chunk}
          </Text>
        ))}
      </Text>
    </View>
  );
}

export function AddWidgetInstructionsModal({ visible, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close instructions">
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>Add to Home Screen</Text>
          <Text style={styles.sheetSubtitle}>
            Add your current reminder to the Home Screen. The widget updates when you use the app.
          </Text>
          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            {STEPS.map((s) => (
              <StepLine key={s.n} n={s.n} text={s.text} />
            ))}
          </ScrollView>
          <Pressable style={({ pressed }) => [styles.doneBtn, pressed && styles.doneBtnPressed]} onPress={onClose}>
            <Text style={styles.doneLabel}>Got it</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(42, 31, 36, 0.45)',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    maxHeight: '88%',
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  sheetSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  scroll: {
    maxHeight: 360,
    marginBottom: spacing.md,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  stepBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accent,
  },
  stepBody: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
  },
  stepEm: {
    fontWeight: '700',
    color: colors.accentDeep,
  },
  doneBtn: {
    backgroundColor: colors.accentDeep,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  doneBtnPressed: {
    opacity: 0.92,
  },
  doneLabel: {
    color: colors.textOnAccent,
    fontSize: 17,
    fontWeight: '600',
  },
});
