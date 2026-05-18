import { Pressable, StyleSheet, Text, View } from 'react-native';
import { APP_DISPLAY_NAME } from '../config/appStore';
import { colors, radius, spacing } from '../theme';

type Props = {
  onDone: () => void;
};

export function OnboardingScreen({ onDone }: Props) {
  return (
    <View style={styles.root}>
      <Text style={styles.kicker}>{APP_DISPLAY_NAME}</Text>
      <Text style={styles.title}>Pause before you send.</Text>
      <Text style={styles.body}>
        This is a tiny pocket of friction between impulse and action. When you want to text him, open this instead—read
        one reminder, breathe, or paste the draft in Unsent text and hear why it can stay unsent.
      </Text>
      <Pressable style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]} onPress={onDone}>
        <Text style={styles.buttonLabel}>Continue</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl * 2,
    justifyContent: 'center',
  },
  kicker: {
    color: colors.accent,
    fontSize: 13,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: spacing.md,
    lineHeight: 34,
  },
  body: {
    color: colors.textMuted,
    fontSize: 17,
    lineHeight: 26,
    marginBottom: spacing.xl,
  },
  button: {
    backgroundColor: colors.accentDeep,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonLabel: {
    color: colors.textOnAccent,
    fontSize: 17,
    fontWeight: '600',
  },
});
