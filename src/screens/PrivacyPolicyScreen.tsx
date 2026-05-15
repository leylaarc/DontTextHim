import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SUPPORT_EMAIL } from '../config/appStore';
import { colors, radius, spacing } from '../theme';

type Props = {
  onBack: () => void;
};

export function PrivacyPolicyScreen({ onBack }: Props) {
  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={12} style={({ pressed }) => pressed && styles.backPressed}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>
      </View>
      <Text style={styles.title}>Privacy policy</Text>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.p}>Last updated: May 14, 2026</Text>
        <Text style={styles.h2}>Summary</Text>
        <Text style={styles.p}>
          {"Don't Text Him"} is designed to work on your device without an account. We do not sell your personal
          information. Preferences and progress are stored only on your device.
        </Text>
        <Text style={styles.h2}>Information we process</Text>
        <Text style={styles.p}>
          The app may store locally on your phone: whether you have completed the intro flow, your selected situation
          category, and which quotes you have seen in the current session (for variety). This data stays on your device
          and is not transmitted to our servers by the app itself.
        </Text>
        <Text style={styles.h2}>Analytics and third parties</Text>
        <Text style={styles.p}>
          The app does not include in-app advertising SDKs or social logins. Apple, Google, or other platform services
          involved in distributing or updating the app may process data according to their own policies.
        </Text>
        <Text style={styles.h2}>Children</Text>
        <Text style={styles.p}>
          The app is not directed at children under 13, and we do not knowingly collect personal information from
          children.
        </Text>
        <Text style={styles.h2}>Changes</Text>
        <Text style={styles.p}>
          We may update this policy from time to time. The “Last updated” date at the top will change when we do.
        </Text>
        <Text style={styles.h2}>Contact</Text>
        <Text style={styles.p}>
          For privacy questions, email {SUPPORT_EMAIL} or use the contact information on the app store listing.
        </Text>
      </ScrollView>
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
    marginBottom: spacing.md,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl * 2,
  },
  h2: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  p: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
});
