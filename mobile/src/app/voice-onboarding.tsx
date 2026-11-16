import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { safeBack } from '@/navigation/safeBack';
import { GeminiLiveOnboardingSession, type TranscriptLine, type VoiceStatus } from '@/services/geminiLiveVoice';
import { saveScreeningResponse } from '@/services/spontoApi';
import { useAppState } from '@/state/AppState';
import { colors, radius } from '@/theme';

export default function VoiceOnboardingScreen() {
  const { saveScreening } = useAppState();
  const session = useRef<GeminiLiveOnboardingSession | null>(null);
  const [status, setStatus] = useState<VoiceStatus | 'idle'>('idle');
  const [lines, setLines] = useState<TranscriptLine[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => () => { void session.current?.stop(); }, []);

  const start = () => {
    setError(null);
    setLines([]);
    setStatus('connecting');
    const next = new GeminiLiveOnboardingSession({
      onStatus: setStatus,
      onTranscript: (line) => setLines((current) => [...current.slice(-9), line]),
      onError: (problem) => {
        setError(problem.message);
        setStatus('idle');
      },
      onComplete: (answers) => {
        saveScreening(answers);
        void saveScreeningResponse(answers).catch(() => {});
        void next.stop();
        router.replace('/plan');
      },
    });
    session.current = next;
    void next.start();
  };

  const end = async () => {
    await session.current?.stop();
    session.current = null;
    setStatus('idle');
  };

  const active = status !== 'idle' && status !== 'finished';
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Go back" accessibilityRole="button" onPress={() => safeBack('/')} style={styles.backButton}>
          <Ionicons color={colors.ink} name="arrow-back" size={22} />
        </Pressable>
        <View style={styles.modelPill}>
          <View style={styles.liveDot} />
          <Text style={styles.modelText}>LIVEKIT · GEMINI 3.8</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>VOICE ONBOARDING</Text>
        <Text style={styles.title}>Talk your way to a course made for you.</Text>
        <Text style={styles.subtitle}>Have a natural conversation about your goals, style, and comfort level. You can interrupt or answer in your own words.</Text>

        <View style={[styles.voiceCard, active && styles.voiceCardActive]}>
          <View style={[styles.orb, status === 'speaking' && styles.orbSpeaking]}>
            <Ionicons color={colors.white} name={active ? 'mic' : 'sparkles'} size={38} />
          </View>
          <Text style={styles.statusTitle}>{statusLabel(status)}</Text>
          <Text style={styles.statusHint}>{statusHint(status)}</Text>
          {active ? (
            <View style={styles.wave} accessibilityLabel="Live audio activity">
              {[16, 29, 42, 24, 36, 19, 31].map((height, index) => <View key={index} style={[styles.waveBar, { height }]} />)}
            </View>
          ) : null}
        </View>

        {error ? (
          <View style={styles.errorCard}>
            <Ionicons color={colors.danger} name="alert-circle-outline" size={20} />
            <View style={styles.errorCopy}>
              <Text style={styles.errorTitle}>Voice couldn’t start</Text>
              <Text style={styles.errorText}>{error}</Text>
              {error.toLowerCase().includes('api key') || error.toLowerCase().includes('configured') ? (
                <Pressable onPress={() => router.push('/ai-settings?returnTo=voice-onboarding')}>
                  <Text style={styles.errorLink}>Add Google API key →</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        ) : null}

        {lines.length ? (
          <View style={styles.transcript}>
            <Text style={styles.sectionLabel}>LIVE TRANSCRIPT</Text>
            {lines.map((line) => (
              <View key={line.id} style={[styles.bubble, line.role === 'user' ? styles.userBubble : styles.assistantBubble]}>
                <Text style={styles.bubbleRole}>{line.role === 'user' ? 'YOU' : 'SPONTO'}</Text>
                <Text style={styles.bubbleText}>{line.text}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.privacyCard}>
          <Ionicons color={colors.primary} name="shield-checkmark-outline" size={21} />
          <Text style={styles.privacyText}>Audio travels through an encrypted LiveKit room to the Gemini onboarding agent. Sponto does not save your recording.</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable accessibilityRole="button" onPress={active ? end : start} style={({ pressed }) => [styles.actionButton, active && styles.endButton, pressed && styles.pressed]}>
          <Ionicons color={colors.white} name={active ? 'stop' : 'mic'} size={20} />
          <Text style={styles.actionText}>{active ? 'End conversation' : error ? 'Try again' : 'Start voice conversation'}</Text>
        </Pressable>
        {!active ? <Pressable onPress={() => router.replace('/screening')}><Text style={styles.typedLink}>Use typed onboarding instead</Text></Pressable> : null}
      </View>
    </SafeAreaView>
  );
}

function statusLabel(status: VoiceStatus | 'idle') {
  if (status === 'connecting') return 'Connecting securely…';
  if (status === 'listening') return 'I’m listening';
  if (status === 'speaking') return 'Sponto is speaking';
  if (status === 'finished') return 'Creating your path…';
  return 'Ready when you are';
}

function statusHint(status: VoiceStatus | 'idle') {
  if (status === 'connecting') return 'Preparing a private live session';
  if (status === 'listening') return 'Speak naturally—you can pause or interrupt';
  if (status === 'speaking') return 'You can interrupt at any time';
  return 'About 3 minutes · six friendly questions';
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.canvas },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8 },
  backButton: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  headerSpacer: { width: 42 },
  modelPill: { flexDirection: 'row', alignItems: 'center', gap: 7, borderRadius: radius.pill, backgroundColor: colors.primarySoft, paddingHorizontal: 11, paddingVertical: 7 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.primary },
  modelText: { color: colors.primary, fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },
  content: { paddingHorizontal: 22, paddingTop: 34, paddingBottom: 24 },
  kicker: { color: colors.primary, fontSize: 11, fontWeight: '900', letterSpacing: 1.1 },
  title: { color: colors.ink, fontSize: 35, lineHeight: 40, fontWeight: '800', letterSpacing: -1.1, marginTop: 10 },
  subtitle: { color: colors.muted, fontSize: 16, lineHeight: 24, marginTop: 12 },
  voiceCard: { alignItems: 'center', borderRadius: radius.large, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: 25, marginTop: 26 },
  voiceCardActive: { borderColor: colors.primary, backgroundColor: '#FAFCF8' },
  orb: { width: 86, height: 86, borderRadius: 43, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  orbSpeaking: { backgroundColor: '#3C7B5D', transform: [{ scale: 1.04 }] },
  statusTitle: { color: colors.ink, fontSize: 19, fontWeight: '800', marginTop: 17 },
  statusHint: { color: colors.muted, fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 5 },
  wave: { height: 44, flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 14 },
  waveBar: { width: 4, borderRadius: 2, backgroundColor: colors.primary },
  errorCard: { flexDirection: 'row', gap: 11, borderRadius: radius.medium, backgroundColor: '#FBEDEA', borderWidth: 1, borderColor: '#E9C3BD', padding: 15, marginTop: 16 },
  errorCopy: { flex: 1 }, errorTitle: { color: colors.danger, fontSize: 14, fontWeight: '800' },
  errorText: { color: colors.danger, fontSize: 13, lineHeight: 19, marginTop: 3 },
  errorLink: { color: colors.primary, fontSize: 13, fontWeight: '800', marginTop: 9 },
  transcript: { marginTop: 22, gap: 9 },
  sectionLabel: { color: colors.muted, fontSize: 10, fontWeight: '900', letterSpacing: 1.1, marginBottom: 2 },
  bubble: { maxWidth: '90%', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 11 },
  assistantBubble: { alignSelf: 'flex-start', backgroundColor: colors.primarySoft },
  userBubble: { alignSelf: 'flex-end', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  bubbleRole: { color: colors.primary, fontSize: 9, fontWeight: '900', letterSpacing: 0.8 },
  bubbleText: { color: colors.ink, fontSize: 14, lineHeight: 20, marginTop: 3 },
  privacyCard: { flexDirection: 'row', gap: 10, borderRadius: radius.medium, backgroundColor: colors.primarySoft, padding: 15, marginTop: 22 },
  privacyText: { flex: 1, color: colors.muted, fontSize: 12, lineHeight: 18 },
  footer: { paddingHorizontal: 22, paddingTop: 10, paddingBottom: 12, gap: 13 },
  actionButton: { minHeight: 54, borderRadius: radius.pill, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  endButton: { backgroundColor: colors.danger }, actionText: { color: colors.white, fontSize: 16, fontWeight: '800' },
  typedLink: { color: colors.primary, textAlign: 'center', fontSize: 14, fontWeight: '700' }, pressed: { opacity: 0.8 },
});
