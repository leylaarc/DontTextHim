import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { SUPPORT_EMAIL } from '../config/appStore';
import { colors, radius, spacing } from '../theme';

type Props = {
  onBack: () => void;
  onChangeSituation: () => void | Promise<void>;
  onOpenPrivacy: () => void;
};

export function SettingsScreen({ onBack, onChangeSituation, onOpenPrivacy }: Props) {
  const openSupport = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Don't Text Him — support")}`);
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={12} style={({ pressed }) => pressed && styles.backPressed}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>
      </View>
      <Text style={styles.title}>Settings</Text>
      <View style={[styles.row, styles.infoBox]}>
        <Text style={styles.rowLabel}>iPhone Home Screen widget</Text>
        <Text style={styles.rowHint}>
          This is the system widget you add from the Home Screen widget gallery (long-press the Home Screen, tap +,
          search for Don&apos;t Text Him). It is not drawn inside the app. On the <Text style={styles.rowEm}>medium</Text>{' '}
          size, you can use <Text style={styles.rowEm}>Another quote</Text> and{' '}
          <Text style={styles.rowEm}>I didn&apos;t text him</Text> on the widget itself (iOS 17+).{' '}
          <Text style={styles.rowEm}>Small</Text> shows the quote; tap it to open the app. Quotes and deck stay in sync
          when you return to the app. Android home screen widgets are not available in this version.
        </Text>
      </View>
      <Pressable style={({ pressed }) => [styles.row, styles.rowSpaced, pressed && styles.rowPressed]} onPress={onChangeSituation}>
        <Text style={styles.rowLabel}>Change situation type</Text>
        <Text style={styles.rowHint}>Pick a new category. You will choose again before seeing quotes.</Text>
      </Pressable>
      <Pressable style={({ pressed }) => [styles.row, pressed && styles.rowPressed]} onPress={onOpenPrivacy}>
        <Text style={styles.rowLabel}>Privacy policy</Text>
        <Text style={styles.rowHint}>How this app handles your information.</Text>
      </Pressable>
      <Text style={styles.footer}>
        Support:{' '}
        <Text style={styles.footerLink} onPress={openSupport}>
          {SUPPORT_EMAIL}
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl * 1.25,
  },
  header: {
    marginBottom: spacing.lg,
  },
  back: {
    color: colors.accent,
    fontSize: 17,
  },
  backPressed: {
    opacity: 0.7,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: spacing.xl,
  },
  row: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowPressed: {
    opacity: 0.95,
  },
  rowLabel: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  rowHint: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  rowEm: {
    fontWeight: '700',
    color: colors.accentDeep,
  },
  infoBox: {
    marginBottom: spacing.md,
  },
  rowSpaced: {
    marginBottom: spacing.md,
  },
  footer: {
    marginTop: spacing.xl,
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  footerLink: {
    color: colors.accent,
    fontSize: 13,
  },
});
