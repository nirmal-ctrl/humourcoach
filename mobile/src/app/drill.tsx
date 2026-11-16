import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/PrimaryButton';
import { safeBack } from '@/navigation/safeBack';
import { getAIModel } from '@/domain/aiModels';
import { getCoachingFeedback, type CoachingFeedback } from '@/services/spontoApi';
import { useAppState } from '@/state/AppState';
import { colors, radius } from '@/theme';

export default function DrillScreen() {
  const { aiModel, aiProvider } = useAppState();
  const [attempt, setAttempt] = useState('');
  const [feedback, setFeedback] = useState<CoachingFeedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const model = getAIModel(aiProvider, aiModel);

  const submitAttempt = async () => {
    setLoading(true);
    setError(null);
    try {
      setFeedback(await getCoachingFeedback({ attemptText: attempt.trim(), provider: aiProvider, model: aiModel }));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Coaching is temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.navRow}>
            <Pressable accessibilityLabel="Go back" accessibilityRole="button" onPress={() => safeBack('/lesson')} style={styles.backButton}>
              <Ionicons color={colors.ink} name="arrow-back" size={22} />
            </Pressable>
            <Text style={styles.navTitle}>Guided drill</Text>
            <View style={styles.navSpacer} />
          </View>

          {!feedback ? (
            <>
              <View style={styles.stepPill}><Text style={styles.stepText}>MISDIRECTION · EASY</Text></View>
              <Text style={styles.title}>Give this meeting update a turn.</Text>
              <Text style={styles.prompt}>“The project timeline is moving exactly as planned…”</Text>
              <Text style={styles.guidance}>Finish the sentence with an unexpected—but workplace-safe—detail.</Text>
              <TextInput
                accessibilityLabel="Your attempt"
                maxLength={240}
                multiline
                onChangeText={setAttempt}
                placeholder="Write your version here…"
                placeholderTextColor="#8A918C"
                style={styles.input}
                textAlignVertical="top"
                value={attempt}
              />
              <Text style={styles.count}>{attempt.length}/240</Text>
              <View style={styles.aiLabel}>
                <Ionicons color={colors.primary} name="sparkles" size={14} />
                <Text style={styles.aiLabelText}>Coached by {model.label}</Text>
              </View>
              {error ? <View style={styles.errorCard}><Ionicons color={colors.danger} name="alert-circle-outline" size={19} /><Text style={styles.errorText}>{error}</Text></View> : null}
              <PrimaryButton disabled={attempt.trim().length < 8 || loading} label={loading ? 'Creating your feedback…' : 'Get AI coaching'} onPress={submitAttempt} />
            </>
          ) : (
            <>
              <View style={styles.successIcon}><Ionicons color={colors.primary} name="checkmark" size={26} /></View>
              <Text style={styles.title}>Nice first turn.</Text>
              <View style={styles.attemptCard}><Text style={styles.attemptLabel}>YOUR ATTEMPT</Text><Text style={styles.attemptText}>{attempt}</Text></View>
              <FeedbackBlock icon="checkmark-circle-outline" title="What worked" text={feedback.whatWorked} />
              <FeedbackBlock icon="construct-outline" title="Try next" text={feedback.tryNext} />
              <View style={styles.scoreRow}>
                <Score label="Setup" score={String(feedback.setupScore)} />
                <Score label="Surprise" score={String(feedback.surpriseScore)} />
                <Score label="Brevity" score={String(feedback.brevityScore)} />
              </View>
              <PrimaryButton label="Return home" onPress={() => router.replace('/home')} />
              <Pressable onPress={() => setFeedback(null)}><Text style={styles.tryAgain}>Edit and try again</Text></Pressable>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function FeedbackBlock({ icon, title, text }: { icon: 'checkmark-circle-outline' | 'construct-outline'; title: string; text: string }) {
  return <View style={styles.feedback}><Ionicons color={colors.primary} name={icon} size={21} /><View style={styles.feedbackCopy}><Text style={styles.feedbackTitle}>{title}</Text><Text style={styles.feedbackText}>{text}</Text></View></View>;
}

function Score({ label, score }: { label: string; score: string }) {
  return <View style={styles.score}><Text style={styles.scoreValue}>{score}<Text style={styles.scoreTotal}>/5</Text></Text><Text style={styles.scoreLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 34 },
  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 34 },
  backButton: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  navTitle: { color: colors.ink, fontSize: 15, fontWeight: '700' },
  navSpacer: { width: 42 },
  stepPill: { alignSelf: 'flex-start', borderRadius: radius.pill, backgroundColor: colors.primarySoft, paddingHorizontal: 11, paddingVertical: 6 },
  stepText: { color: colors.primary, fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },
  title: { color: colors.ink, fontSize: 32, lineHeight: 38, fontWeight: '800', letterSpacing: -0.8, marginTop: 16 },
  prompt: { color: colors.ink, fontSize: 20, lineHeight: 29, fontWeight: '600', marginTop: 25 },
  guidance: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 10 },
  input: { minHeight: 145, borderWidth: 1, borderColor: colors.border, borderRadius: radius.medium, backgroundColor: colors.surface, color: colors.ink, fontSize: 17, lineHeight: 25, padding: 17, marginTop: 24 },
  count: { color: colors.muted, fontSize: 11, textAlign: 'right', marginTop: 7, marginBottom: 20 },
  aiLabel: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 12 },
  aiLabelText: { color: colors.primary, fontSize: 11, fontWeight: '700' },
  errorCard: { flexDirection: 'row', gap: 9, borderWidth: 1, borderColor: '#EDC4BF', borderRadius: radius.small, backgroundColor: '#FFF5F3', padding: 12, marginBottom: 13 },
  errorText: { flex: 1, color: colors.danger, fontSize: 12, lineHeight: 18 },
  successIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  attemptCard: { borderRadius: radius.medium, backgroundColor: colors.primary, padding: 18, marginTop: 22 },
  attemptLabel: { color: '#C9E1D1', fontSize: 9, fontWeight: '900', letterSpacing: 0.8 },
  attemptText: { color: colors.white, fontSize: 16, lineHeight: 24, fontWeight: '600', marginTop: 8 },
  feedback: { flexDirection: 'row', gap: 12, borderWidth: 1, borderColor: colors.border, borderRadius: radius.medium, backgroundColor: colors.surface, padding: 16, marginTop: 12 },
  feedbackCopy: { flex: 1 },
  feedbackTitle: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  feedbackText: { color: colors.muted, fontSize: 13, lineHeight: 20, marginTop: 5 },
  scoreRow: { flexDirection: 'row', gap: 9, marginVertical: 16 },
  score: { flex: 1, alignItems: 'center', borderRadius: radius.medium, backgroundColor: colors.primarySoft, paddingVertical: 13 },
  scoreValue: { color: colors.primary, fontSize: 18, fontWeight: '800' },
  scoreTotal: { fontSize: 11 },
  scoreLabel: { color: colors.muted, fontSize: 10, marginTop: 3 },
  tryAgain: { color: colors.primary, fontSize: 13, fontWeight: '700', textAlign: 'center', marginTop: 15 },
});
