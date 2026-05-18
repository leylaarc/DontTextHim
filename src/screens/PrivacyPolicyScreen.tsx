import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import privacy from '../content/privacy-policy.json';
import { APP_DISPLAY_NAME, SUPPORT_EMAIL } from '../config/appStore';
import { colors, radius, spacing } from '../theme';

type Props = {
  onBack: () => void;
};

function fillSupportEmail(text: string) {
  return text.replace(/\{\{supportEmail\}\}/g, SUPPORT_EMAIL);
}

function PolicyParagraph({ text }: { text: string }) {
  const filled = fillSupportEmail(text);
  if (!filled.includes(SUPPORT_EMAIL)) {
    return <Text style={styles.p}>{filled}</Text>;
  }
  const parts = filled.split(SUPPORT_EMAIL);
  const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`${APP_DISPLAY_NAME} \u2014 privacy`)}`;
  return (
    <Text style={styles.p}>
      {parts[0]}
      <Text style={styles.inlineLink} onPress={() => void Linking.openURL(mailto)}>
        {SUPPORT_EMAIL}
      </Text>
      {parts.slice(1).join(SUPPORT_EMAIL)}
    </Text>
  );
}

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
        <Text style={styles.p}>Last updated: {privacy.lastUpdated}</Text>
        {privacy.sections.map((section) => (
          <View key={section.heading}>
            <Text style={styles.h2}>{section.heading}</Text>
            {section.paragraphs.map((paragraph, i) => (
              <PolicyParagraph key={`${section.heading}-${i}`} text={paragraph} />
            ))}
          </View>
        ))}
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
  inlineLink: {
    color: colors.accent,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
});
