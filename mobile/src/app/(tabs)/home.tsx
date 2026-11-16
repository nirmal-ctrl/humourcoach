import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/AppHeader';
import { useAppState } from '@/state/AppState';
import { colors, radius } from '@/theme';

export default function HomeScreen() {
  const { plan } = useAppState();

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <AppHeader actionIcon="notifications-outline" eyebrow="Good afternoon" title="Ready for five minutes?" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.streakRow}>
          <View style={styles.streakIcon}>
            <Ionicons color="#9A5C00" name="flame" size={19} />
          </View>
          <Text style={styles.streakText}><Text style={styles.streakStrong}>1 day</Text> practice streak</Text>
          <Text style={styles.streakHint}>Keep it light</Text>
        </View>

        <Pressable onPress={() => router.push('/lesson')} style={({ pressed }) => [styles.heroCard, pressed && styles.pressed]}>
          <View style={styles.heroTop}>
            <View style={styles.lessonPill}><Text style={styles.lessonPillText}>UP NEXT · 4 MIN</Text></View>
            <View style={styles.heroArrow}><Ionicons color={colors.primary} name="arrow-forward" size={20} /></View>
          </View>
          <Text style={styles.heroTechnique}>{plan.startingTechnique}</Text>
          <Text style={styles.heroTitle}>{plan.firstLesson}</Text>
          <Text style={styles.heroBody}>Learn the idea, see two examples, then try one guided workplace prompt.</Text>
          <View style={styles.progressTrack}><View style={styles.progressFill} /></View>
          <Text style={styles.progressLabel}>Your first step</Text>
        </Pressable>

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Your focus</Text>
          <Pressable onPress={() => router.push('/learn')}><Text style={styles.link}>View path</Text></Pressable>
        </View>

        <View style={styles.focusCard}>
          <View style={styles.focusIcon}><Ionicons color={colors.primary} name="compass-outline" size={22} /></View>
          <View style={styles.focusCopy}>
            <Text style={styles.focusTitle}>{plan.focus}</Text>
            <Text style={styles.focusBody}>Practising for {plan.contextLabel.toLowerCase()}</Text>
          </View>
          <Ionicons color={colors.muted} name="chevron-forward" size={19} />
        </View>

        <Text style={styles.sectionTitle}>Quick practice</Text>
        <Pressable style={({ pressed }) => [styles.quickCard, pressed && styles.pressed]}>
          <View style={styles.quickIcon}><Ionicons color="#81520A" name="flash" size={20} /></View>
          <View style={styles.focusCopy}>
            <Text style={styles.focusTitle}>Warm-up prompt</Text>
            <Text style={styles.focusBody}>Turn a routine meeting update into one playful line.</Text>
          </View>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingHorizontal: 20, paddingBottom: 28 },
  streakRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  streakIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#FCE8B7', alignItems: 'center', justifyContent: 'center' },
  streakText: { color: colors.muted, fontSize: 14, marginLeft: 9 },
  streakStrong: { color: colors.ink, fontWeight: '800' },
  streakHint: { marginLeft: 'auto', color: colors.muted, fontSize: 12 },
  heroCard: { backgroundColor: colors.primary, borderRadius: radius.large, padding: 22, minHeight: 280 },
  pressed: { opacity: 0.88 },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  lessonPill: { borderRadius: radius.pill, backgroundColor: colors.accent, paddingHorizontal: 11, paddingVertical: 6 },
  lessonPillText: { color: colors.ink, fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },
  heroArrow: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  heroTechnique: { color: '#C9E1D1', fontSize: 13, fontWeight: '700', marginTop: 30 },
  heroTitle: { color: colors.white, fontSize: 28, lineHeight: 34, fontWeight: '800', letterSpacing: -0.7, marginTop: 5 },
  heroBody: { color: '#D9E9DE', fontSize: 14, lineHeight: 21, marginTop: 11, maxWidth: 350 },
  progressTrack: { height: 5, borderRadius: 3, backgroundColor: '#4F8369', marginTop: 27 },
  progressFill: { width: '12%', height: 5, borderRadius: 3, backgroundColor: colors.accent },
  progressLabel: { color: '#C9E1D1', fontSize: 11, marginTop: 7 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 27, marginBottom: 12 },
  sectionTitle: { color: colors.ink, fontSize: 19, fontWeight: '800', letterSpacing: -0.3, marginTop: 25, marginBottom: 12 },
  link: { color: colors.primary, fontSize: 13, fontWeight: '700' },
  focusCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radius.medium, backgroundColor: colors.surface, padding: 16, gap: 13 },
  focusIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  focusCopy: { flex: 1 },
  focusTitle: { color: colors.ink, fontSize: 15, fontWeight: '700' },
  focusBody: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 4 },
  quickCard: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.medium, backgroundColor: '#FFF4D8', padding: 16, gap: 13 },
  quickIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#F7D78C', alignItems: 'center', justifyContent: 'center' },
});
