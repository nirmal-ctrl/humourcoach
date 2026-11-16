import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/AppHeader';
import { getProgressSnapshot, type ProgressSnapshot } from '@/services/spontoApi';
import { colors, radius } from '@/theme';

const emptyProgress: ProgressSnapshot = { attemptCount: 0, practicedMinutes: 0, streak: 0, setup: 0, surprise: 0, brevity: 0 };

export default function ProgressScreen() {
  const [progress, setProgress] = useState(emptyProgress);
  useFocusEffect(useCallback(() => {
    let active = true;
    getProgressSnapshot().then((next) => { if (active) setProgress(next); });
    return () => { active = false; };
  }, []));
  const skills = [
    { label: 'Setup', value: progress.setup },
    { label: 'Surprise', value: progress.surprise },
    { label: 'Brevity', value: progress.brevity },
  ];

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <AppHeader eyebrow="YOUR GROWTH" title="Progress" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsRow}>
          <StatCard icon="checkmark-circle" number={String(progress.attemptCount)} label={progress.attemptCount === 1 ? 'Drill' : 'Drills'} />
          <StatCard icon="flame" number={String(progress.streak)} label="Day streak" />
          <StatCard icon="time" number={`${progress.practicedMinutes}m`} label="Practised" />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Skill snapshot</Text>
          <Text style={styles.cardSubtitle}>This becomes more accurate as you complete drills.</Text>
          <View style={styles.skills}>
            {skills.map((skill) => (
              <View key={skill.label}>
                <View style={styles.skillRow}>
                  <Text style={styles.skillLabel}>{skill.label}</Text>
                  <Text style={styles.skillValue}>{skill.value ? `${skill.value}%` : 'No data yet'}</Text>
                </View>
                <View style={styles.skillTrack}>
                  <View style={[styles.skillFill, { width: `${skill.value}%` }]} />
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.easeHeader}>
            <View>
              <Text style={styles.cardTitle}>Ease check-in</Text>
              <Text style={styles.cardSubtitle}>How your coached skills change over time</Text>
            </View>
            <View style={styles.easeBadge}><Text style={styles.easeScore}>{progress.attemptCount}/3</Text></View>
          </View>
          <View style={styles.emptyState}>
            <Ionicons color={colors.primary} name="trending-up-outline" size={24} />
            <Text style={styles.emptyText}>{progress.attemptCount >= 3 ? 'Your first skill trend is ready above.' : 'Complete three coached attempts to see your first reliable trend.'}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ icon, number, label }: { icon: 'checkmark-circle' | 'flame' | 'time'; number: string; label: string }) {
  return (
    <View style={styles.statCard}>
      <Ionicons color={colors.primary} name={icon} size={19} />
      <Text style={styles.statNumber}>{number}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingHorizontal: 20, paddingBottom: 28, gap: 14 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.medium, backgroundColor: colors.surface, padding: 14 },
  statNumber: { color: colors.ink, fontSize: 22, fontWeight: '800', marginTop: 9 },
  statLabel: { color: colors.muted, fontSize: 11, marginTop: 2 },
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.large, backgroundColor: colors.surface, padding: 20 },
  cardTitle: { color: colors.ink, fontSize: 18, fontWeight: '800' },
  cardSubtitle: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 4 },
  skills: { gap: 18, marginTop: 23 },
  skillRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7 },
  skillLabel: { color: colors.ink, fontSize: 13, fontWeight: '700' },
  skillValue: { color: colors.muted, fontSize: 11 },
  skillTrack: { height: 7, borderRadius: 4, backgroundColor: colors.primarySoft },
  skillFill: { height: 7, borderRadius: 4, backgroundColor: colors.primary },
  easeHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  easeBadge: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  easeScore: { color: colors.primary, fontSize: 13, fontWeight: '800' },
  emptyState: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: radius.medium, backgroundColor: colors.canvas, padding: 15, marginTop: 20 },
  emptyText: { flex: 1, color: colors.muted, fontSize: 13, lineHeight: 19 },
});
