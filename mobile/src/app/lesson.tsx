import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/PrimaryButton';
import { safeBack } from '@/navigation/safeBack';
import { colors, radius } from '@/theme';
import { useAppState } from '@/state/AppState';

export default function LessonScreen() {
  const { plan } = useAppState();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.navRow}>
          <Pressable accessibilityLabel="Go back" accessibilityRole="button" onPress={() => safeBack('/home')} style={styles.backButton}>
            <Ionicons color={colors.ink} name="arrow-back" size={22} />
          </Pressable>
          <Text style={styles.navTitle}>Lesson</Text>
          <View style={styles.navSpacer} />
        </View>
        <Text style={styles.kicker}>{plan.startingTechnique.toUpperCase()} · LESSON 1</Text>
        <Text style={styles.title}>{plan.firstLesson}</Text>
        <Text style={styles.body}>
          Misdirection begins with something familiar. The final phrase changes what the listener thought you meant.
        </Text>

        <View style={styles.exampleCard}>
          <Text style={styles.exampleLabel}>EXAMPLE</Text>
          <Text style={styles.exampleText}>
            “I finally reached inbox zero. Then Outlook finished loading.”
          </Text>
          <Text style={styles.explanation}>
            The setup suggests productivity. The turn reveals that the achievement lasted only because the inbox was incomplete.
          </Text>
        </View>

        <View style={styles.tipCard}>
          <Ionicons color={colors.primary} name="bulb-outline" size={22} />
          <View style={styles.tipCopy}>
            <Text style={styles.tipTitle}>Keep the setup believable</Text>
            <Text style={styles.tipText}>The turn works best when the opening makes the listener confidently expect something else.</Text>
          </View>
        </View>

        <PrimaryButton label="Try the guided drill" onPress={() => router.push('/drill')} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingHorizontal: 24, paddingTop: 36, paddingBottom: 32 },
  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 34 },
  backButton: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  navTitle: { color: colors.ink, fontSize: 15, fontWeight: '700' },
  navSpacer: { width: 42 },
  kicker: { color: colors.primary, fontSize: 11, fontWeight: '800', letterSpacing: 1.1 },
  title: { color: colors.ink, fontSize: 36, lineHeight: 42, fontWeight: '800', letterSpacing: -1, marginTop: 10 },
  body: { color: colors.muted, fontSize: 17, lineHeight: 26, marginTop: 18 },
  exampleCard: {
    borderRadius: radius.large,
    backgroundColor: colors.primary,
    padding: 24,
    marginTop: 30,
  },
  exampleLabel: { color: colors.accent, fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  exampleText: { color: colors.white, fontSize: 23, lineHeight: 32, fontWeight: '700', marginTop: 13 },
  explanation: { color: '#D5E6DA', fontSize: 14, lineHeight: 21, marginTop: 18 },
  tipCard: { flexDirection: 'row', gap: 12, borderWidth: 1, borderColor: colors.border, borderRadius: radius.medium, backgroundColor: colors.surface, padding: 18, marginVertical: 20 },
  tipCopy: { flex: 1 },
  tipTitle: { color: colors.ink, fontSize: 15, fontWeight: '700' },
  tipText: { color: colors.muted, fontSize: 13, lineHeight: 20, marginTop: 5 },
});
