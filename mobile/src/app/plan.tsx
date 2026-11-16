import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/PrimaryButton';
import { useAppState } from '@/state/AppState';
import { colors, radius } from '@/theme';

export default function PlanScreen() {
  const { plan } = useAppState();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.successMark}>
          <Text style={styles.successMarkText}>✓</Text>
        </View>
        <Text style={styles.kicker}>YOUR STARTING PATH</Text>
        <Text style={styles.title}>{plan.title}</Text>
        <Text style={styles.intro}>{plan.reason}</Text>

        <View style={styles.planCard}>
          <PlanRow label="First focus" value={plan.focus} />
          <View style={styles.divider} />
          <PlanRow label="Start with" value={plan.startingTechnique} />
          <View style={styles.divider} />
          <PlanRow label="Practice in" value={plan.contextLabel} />
          <View style={styles.divider} />
          <PlanRow label="Your pace" value={plan.pace} />
        </View>

        <View style={styles.lessonCard}>
          <View style={styles.lessonBadge}>
            <Text style={styles.lessonBadgeText}>LESSON 1</Text>
          </View>
          <Text style={styles.lessonTitle}>{plan.firstLesson}</Text>
          <Text style={styles.lessonMeta}>About 4 minutes · one guided drill</Text>
        </View>

        <PrimaryButton label="Open my dashboard" onPress={() => router.replace('/home')} />
        <Text style={styles.adjustmentNote}>Your path will adjust as you practise.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function PlanRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.planRow}>
      <Text style={styles.planLabel}>{label}</Text>
      <Text style={styles.planValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 32 },
  successMark: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  successMarkText: { color: colors.primary, fontSize: 24, fontWeight: '800' },
  kicker: { color: colors.primary, fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  title: { color: colors.ink, fontSize: 38, lineHeight: 43, fontWeight: '800', letterSpacing: -1.2, marginTop: 9 },
  intro: { color: colors.muted, fontSize: 16, lineHeight: 24, marginTop: 13 },
  planCard: {
    borderRadius: radius.medium,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 18,
    marginTop: 28,
  },
  planRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 18, paddingVertical: 16 },
  planLabel: { color: colors.muted, fontSize: 14 },
  planValue: { flex: 1, color: colors.ink, fontSize: 14, fontWeight: '700', textAlign: 'right' },
  divider: { height: 1, backgroundColor: colors.border },
  lessonCard: {
    borderRadius: radius.medium,
    backgroundColor: colors.primary,
    padding: 20,
    marginTop: 18,
    marginBottom: 20,
  },
  lessonBadge: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  lessonBadgeText: { color: colors.ink, fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },
  lessonTitle: { color: colors.white, fontSize: 21, lineHeight: 27, fontWeight: '800', marginTop: 14 },
  lessonMeta: { color: '#D5E6DA', fontSize: 13, marginTop: 8 },
  adjustmentNote: { color: colors.muted, fontSize: 13, textAlign: 'center', marginTop: 12 },
});
