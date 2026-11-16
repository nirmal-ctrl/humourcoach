import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { colors, radius } from '@/theme';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.brandRow}>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>S</Text>
          </View>
          <Text style={styles.brand}>Sponto</Text>
        </View>

        <View style={styles.hero}>
          <View style={styles.eyebrow}>
            <Text style={styles.eyebrowText}>YOUR HUMOUR COACH</Text>
          </View>
          <Text style={styles.promise}>Laughter brings people together.</Text>
          <Text style={styles.title}>Feel more at ease.{`\n`}Find your funny.</Text>
          <Text style={styles.subtitle}>
            Short, practical coaching for lighter conversations at work—shaped around your goals and style.
          </Text>

          <View style={styles.previewCard}>
            <Text style={styles.previewNumber}>01</Text>
            <View style={styles.previewCopy}>
              <Text style={styles.previewTitle}>A path made for you</Text>
              <Text style={styles.previewText}>A quick screening finds the best place to begin.</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <PrimaryButton label="Find my starting point" onPress={() => router.push('/screening')} />
          <Pressable accessibilityRole="button" onPress={() => router.push('/voice-onboarding')} style={({ pressed }) => [styles.voiceButton, pressed && styles.voiceButtonPressed]}>
            <Ionicons color={colors.primary} name="mic-outline" size={19} />
            <Text style={styles.voiceButtonText}>Talk it through with LiveKit Voice</Text>
          </Pressable>
          <Text style={styles.note}>Either option takes about 3 minutes</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.canvas },
  container: { flex: 1, paddingHorizontal: 24, paddingVertical: 16 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandMark: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandMarkText: { color: colors.white, fontSize: 18, fontWeight: '800' },
  brand: { color: colors.ink, fontSize: 21, fontWeight: '800', letterSpacing: -0.3 },
  hero: { flex: 1, justifyContent: 'center' },
  eyebrow: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginBottom: 18,
  },
  eyebrowText: { color: colors.primary, fontSize: 11, fontWeight: '800', letterSpacing: 1.1 },
  promise: { color: colors.primary, fontSize: 18, lineHeight: 25, fontWeight: '700', marginBottom: 10 },
  title: { color: colors.ink, fontSize: 44, lineHeight: 49, fontWeight: '800', letterSpacing: -1.6 },
  subtitle: { color: colors.muted, fontSize: 17, lineHeight: 26, marginTop: 18, maxWidth: 460 },
  previewCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.medium,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    marginTop: 32,
    gap: 14,
  },
  previewNumber: { color: colors.primary, fontSize: 13, fontWeight: '800' },
  previewCopy: { flex: 1 },
  previewTitle: { color: colors.ink, fontSize: 16, fontWeight: '700' },
  previewText: { color: colors.muted, fontSize: 14, lineHeight: 20, marginTop: 4 },
  footer: { gap: 12 },
  voiceButton: { minHeight: 52, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 20 },
  voiceButtonPressed: { backgroundColor: colors.primarySoft },
  voiceButtonText: { color: colors.primary, fontSize: 15, fontWeight: '800' },
  note: { color: colors.muted, fontSize: 13, textAlign: 'center' },
});
