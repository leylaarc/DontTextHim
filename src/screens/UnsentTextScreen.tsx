import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WhiteConfetti } from '../components/WhiteConfetti';
import { COACH_API_URL } from '../config/coach';
import { getCategoryById } from '../data/situations';
import { coachUnsentText } from '../lib/textCoach';
import { getSelectedCategoryId } from '../lib/storage';
import {
  deleteUnsentText,
  listUnsentTexts,
  markUnsentTextResisted,
  saveUnsentText,
  updateUnsentTextCoach,
  type UnsentTextEntry,
} from '../lib/unsentTextsStorage';
import { colors, radius, spacing } from '../theme';

type Props = {
  onBack: () => void;
};

function formatWhen(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  if (sameDay) {
    return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  }
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function excerpt(text: string, max = 72): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

export function UnsentTextScreen({ onBack }: Props) {
  const [draft, setDraft] = useState('');
  const [situationLabel, setSituationLabel] = useState<string | undefined>();
  const [history, setHistory] = useState<UnsentTextEntry[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [advice, setAdvice] = useState<string | null>(null);
  const [adviceSource, setAdviceSource] = useState<'llm' | 'offline' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confettiBurst, setConfettiBurst] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  const refreshHistory = useCallback(async () => {
    setHistory(await listUnsentTexts());
  }, []);

  useEffect(() => {
    void refreshHistory();
    void (async () => {
      const categoryId = await getSelectedCategoryId();
      if (!categoryId) return;
      setSituationLabel(getCategoryById(categoryId)?.title);
    })();
  }, [refreshHistory]);

  const openEntry = useCallback((entry: UnsentTextEntry) => {
    setDraft(entry.draft);
    setActiveId(entry.id);
    setAdvice(entry.coachAdvice);
    setAdviceSource(entry.coachSource);
    setError(null);
  }, []);

  const startFresh = useCallback(() => {
    setDraft('');
    setActiveId(null);
    setAdvice(null);
    setAdviceSource(null);
    setError(null);
  }, []);

  const analyze = useCallback(async () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      setError('Paste the message you were about to send.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await coachUnsentText({ draft: trimmed, situationLabel });
      setAdvice(result.advice);
      setAdviceSource(result.source);

      if (activeId) {
        await updateUnsentTextCoach(activeId, result);
        await refreshHistory();
      } else {
        const entry = await saveUnsentText(trimmed, result);
        setActiveId(entry.id);
        await refreshHistory();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }, [activeId, draft, refreshHistory, situationLabel]);

  const resisted = useCallback(async () => {
    if (activeId) {
      await markUnsentTextResisted(activeId);
      await refreshHistory();
    } else if (draft.trim()) {
      await saveUnsentText(draft.trim());
      await refreshHistory();
    }
    setConfettiBurst((n) => n + 1);
    setToast('Good. Let this one stay unsent.');
    setTimeout(() => setToast(null), 3200);
    startFresh();
  }, [activeId, draft, refreshHistory, startFresh]);

  const removeEntry = useCallback(
    async (id: string) => {
      await deleteUnsentText(id);
      if (activeId === id) startFresh();
      await refreshHistory();
    },
    [activeId, refreshHistory, startFresh],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <WhiteConfetti burst={confettiBurst} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <View style={styles.header}>
          <Pressable onPress={onBack} hitSlop={12} style={({ pressed }) => pressed && styles.backPressed}>
            <Text style={styles.back}>← Back</Text>
          </Pressable>
          {draft.trim() ? (
            <Pressable onPress={startFresh} hitSlop={10} style={({ pressed }) => pressed && styles.backPressed}>
              <Text style={styles.clearLink}>New draft</Text>
            </Pressable>
          ) : null}
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.kicker}>Unsent texts</Text>
          <Text style={styles.title}>Type it here instead of sending it.</Text>
          <Text style={styles.sub}>
            Paste what you were about to text him. Tap below for a read of your exact words — why this specific message
            is unlikely to give you what you are hoping for.
          </Text>

          <TextInput
            testID="unsent-draft-input"
            style={styles.input}
            value={draft}
            onChangeText={setDraft}
            placeholder="The message you almost sent…"
            placeholderTextColor={colors.textMuted}
            multiline
            textAlignVertical="top"
            maxLength={4000}
            accessibilityLabel="Draft message you almost sent"
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            style={({ pressed }) => [styles.primary, (pressed || loading) && styles.primaryPressed, loading && styles.disabled]}
            onPress={() => void analyze()}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Get perspective on this draft"
          >
            {loading ? (
              <ActivityIndicator color={colors.textOnAccent} />
            ) : (
              <Text style={styles.primaryLabel}>Why shouldn&apos;t I send this?</Text>
            )}
          </Pressable>

          {!COACH_API_URL ? (
            <Text style={styles.hint}>
              Reads your exact draft on this phone (not a live AI model). Nothing is sent over the internet.
            </Text>
          ) : (
            <Text style={styles.hint}>AI reads your exact draft — only sent when you tap the button above.</Text>
          )}

          {advice ? (
            <View style={styles.adviceCard}>
              <Text style={styles.adviceKicker}>
                {adviceSource === 'llm' ? 'Why not to send this' : 'Why not to send this (your draft)'}
              </Text>
              <Text style={styles.adviceBody}>{advice}</Text>
            </View>
          ) : null}

          {toast ? (
            <View style={styles.toast}>
              <Text style={styles.toastText}>{toast}</Text>
            </View>
          ) : null}

          {advice ? (
            <Pressable
              style={({ pressed }) => [styles.successBtn, pressed && styles.primaryPressed]}
              onPress={() => void resisted()}
            >
              <Text style={styles.primaryLabel}>I&apos;m leaving it unsent</Text>
            </Pressable>
          ) : null}

          {history.length > 0 ? (
            <View style={styles.historyBlock}>
              <Text style={styles.historyTitle}>Your unsent drafts</Text>
              {history.map((entry) => (
                <View key={entry.id} style={styles.historyRow}>
                  <Pressable
                    style={({ pressed }) => [styles.historyMain, pressed && styles.historyPressed]}
                    onPress={() => openEntry(entry)}
                    accessibilityRole="button"
                    accessibilityLabel={`Open unsent draft from ${formatWhen(entry.createdAt)}`}
                  >
                    <Text style={styles.historyMeta}>
                      {formatWhen(entry.createdAt)}
                      {entry.resistedAt ? ' · stayed unsent' : ''}
                      {entry.coachAdvice ? ' · has perspective' : ''}
                    </Text>
                    <Text style={styles.historyExcerpt}>{excerpt(entry.draft)}</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => void removeEntry(entry.id)}
                    hitSlop={10}
                    style={({ pressed }) => pressed && styles.backPressed}
                    accessibilityRole="button"
                    accessibilityLabel="Delete this draft"
                  >
                    <Text style={styles.delete}>Delete</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  back: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '600',
  },
  clearLink: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: '600',
  },
  backPressed: {
    opacity: 0.7,
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
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 30,
    marginBottom: spacing.sm,
  },
  sub: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    minHeight: 140,
    fontSize: 17,
    lineHeight: 24,
    color: colors.text,
    marginBottom: spacing.md,
  },
  error: {
    color: '#9b4a52',
    fontSize: 14,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  primary: {
    backgroundColor: colors.accentDeep,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  successBtn: {
    backgroundColor: colors.success,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  primaryPressed: {
    opacity: 0.92,
  },
  disabled: {
    opacity: 0.85,
  },
  primaryLabel: {
    color: colors.textOnAccent,
    fontSize: 17,
    fontWeight: '600',
  },
  hint: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  adviceCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.sm,
  },
  adviceKicker: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  adviceBody: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 25,
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
  historyBlock: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  historyTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  historyMain: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  historyPressed: {
    borderColor: colors.accent,
  },
  historyMeta: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  historyExcerpt: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 21,
  },
  delete: {
    color: colors.textMuted,
    fontSize: 13,
    paddingTop: spacing.md,
  },
});
