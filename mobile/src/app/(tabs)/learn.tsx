import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/AppHeader';
import { TechniqueIcon } from '@/components/TechniqueIcon';
import { useAppState } from '@/state/AppState';
import { colors, radius } from '@/theme';

const techniques = [
  { title: 'Misdirection', detail: '4 lessons · 6 drills', icon: 'sparkles' as const, status: 'Current' },
  { title: 'Rule of Three', detail: '3 lessons · 5 drills', icon: 'list' as const, status: 'Next' },
  { title: 'Exaggeration', detail: '3 lessons · 5 drills', icon: 'resize' as const, status: 'Locked' },
  { title: 'Callbacks', detail: '3 lessons · 4 drills', icon: 'repeat' as const, status: 'Locked' },
];

export default function LearnScreen() {
  const { plan } = useAppState();

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <AppHeader eyebrow="PERSONALIZED COURSE" title="Your learning path" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.summary}>
          <View style={styles.summaryTop}>
            <View>
              <Text style={styles.summaryLabel}>CURRENT TRACK</Text>
              <Text style={styles.summaryTitle}>{plan.title}</Text>
            </View>
            <View style={styles.percentBadge}><Text style={styles.percent}>8%</Text></View>
          </View>
          <View style={styles.track}><View style={styles.fill} /></View>
          <Text style={styles.summaryMeta}>1 of 13 lessons explored</Text>
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Techniques</Text>
          <Text style={styles.sectionMeta}>Adapted to your pace</Text>
        </View>

        <View style={styles.list}>
          {techniques.map((technique, index) => {
            const available = index < 2;
            return (
              <Pressable
                accessibilityState={{ disabled: !available }}
                disabled={!available}
                key={technique.title}
                onPress={() => index === 0 && router.push('/lesson')}
                style={({ pressed }) => [styles.techniqueCard, !available && styles.locked, pressed && styles.pressed]}
              >
                <TechniqueIcon name={technique.icon} />
                <View style={styles.techniqueCopy}>
                  <View style={styles.titleRow}>
                    <Text style={styles.techniqueTitle}>{technique.title}</Text>
                    {technique.status === 'Current' ? <View style={styles.currentPill}><Text style={styles.currentText}>CURRENT</Text></View> : null}
                  </View>
                  <Text style={styles.techniqueDetail}>{technique.detail}</Text>
                </View>
                <Ionicons color={colors.muted} name={available ? 'chevron-forward' : 'lock-closed-outline'} size={19} />
              </Pressable>
            );
          })}
        </View>

        <View style={styles.noteCard}>
          <Ionicons color={colors.primary} name="options-outline" size={21} />
          <Text style={styles.noteText}>Your next technique changes as your attempts reveal what will help most.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingHorizontal: 20, paddingBottom: 28 },
  summary: { backgroundColor: colors.primary, borderRadius: radius.large, padding: 21 },
  summaryTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 16 },
  summaryLabel: { color: '#C9E1D1', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  summaryTitle: { color: colors.white, fontSize: 22, fontWeight: '800', marginTop: 6, maxWidth: 255 },
  percentBadge: { width: 48, height: 48, borderRadius: 24, borderWidth: 4, borderColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  percent: { color: colors.white, fontSize: 12, fontWeight: '800' },
  track: { height: 5, borderRadius: 3, backgroundColor: '#4F8369', marginTop: 23 },
  fill: { width: '8%', height: 5, borderRadius: 3, backgroundColor: colors.accent },
  summaryMeta: { color: '#C9E1D1', fontSize: 11, marginTop: 8 },
  sectionRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 28, marginBottom: 12 },
  sectionTitle: { color: colors.ink, fontSize: 19, fontWeight: '800' },
  sectionMeta: { color: colors.muted, fontSize: 12 },
  list: { gap: 10 },
  techniqueCard: { flexDirection: 'row', alignItems: 'center', gap: 13, borderRadius: radius.medium, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, padding: 15 },
  locked: { opacity: 0.55 },
  pressed: { opacity: 0.8 },
  techniqueCopy: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  techniqueTitle: { color: colors.ink, fontSize: 16, fontWeight: '700' },
  techniqueDetail: { color: colors.muted, fontSize: 12, marginTop: 5 },
  currentPill: { borderRadius: radius.pill, backgroundColor: colors.primarySoft, paddingHorizontal: 7, paddingVertical: 3 },
  currentText: { color: colors.primary, fontSize: 8, fontWeight: '900', letterSpacing: 0.5 },
  noteCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.primarySoft, borderRadius: radius.medium, padding: 16, marginTop: 20 },
  noteText: { flex: 1, color: colors.primary, fontSize: 13, lineHeight: 19, fontWeight: '600' },
});
