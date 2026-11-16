import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/AppHeader';
import { getAIModel } from '@/domain/aiModels';
import { useAppState } from '@/state/AppState';
import { useAuthState } from '@/state/AuthState';
import { colors, radius } from '@/theme';

export default function ProfileScreen() {
  const { aiModel, aiProvider, plan, resetApp } = useAppState();
  const { configured, signOut, user } = useAuthState();
  const selectedModel = getAIModel(aiProvider, aiModel);
  const settings = [
    { icon: 'hardware-chip-outline' as const, title: 'AI provider and model', subtitle: selectedModel.label, onPress: () => router.push('/ai-settings') },
    { icon: 'options-outline' as const, title: 'Learning preferences', subtitle: 'Goals, style and contexts', onPress: undefined },
    { icon: 'notifications-outline' as const, title: 'Practice reminders', subtitle: 'Off', onPress: undefined },
    { icon: 'shield-checkmark-outline' as const, title: 'Privacy and safety', subtitle: 'Data and content controls', onPress: undefined },
    { icon: 'help-circle-outline' as const, title: 'Help and feedback', subtitle: 'Tell us what could be better', onPress: undefined },
  ];

  const restartOnboarding = () => {
    resetApp();
    router.replace('/');
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <AppHeader title="Profile" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.accountCard}>
          <View style={styles.accountIcon}><Ionicons color={colors.primary} name={user ? 'cloud-done-outline' : 'cloud-offline-outline'} size={22} /></View>
          <View style={styles.accountCopy}>
            <Text style={styles.accountTitle}>{user ? 'Progress sync is on' : 'Save your progress'}</Text>
            <Text style={styles.accountText}>{user?.email ?? (configured ? 'Sign in to sync your course and AI coaching.' : 'Connect Supabase to enable accounts and syncing.')}</Text>
          </View>
          <Pressable accessibilityRole="button" onPress={() => user ? void signOut() : router.push('/auth')} style={styles.accountButton}>
            <Text style={styles.accountButtonText}>{user ? 'Sign out' : 'Sign in'}</Text>
          </Pressable>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatar}><Text style={styles.avatarText}>Y</Text></View>
          <View style={styles.profileCopy}>
            <Text style={styles.name}>Your profile</Text>
            <Text style={styles.track}>{plan.title}</Text>
          </View>
          <Pressable accessibilityLabel="Edit profile" style={styles.editButton}>
            <Ionicons color={colors.primary} name="pencil" size={17} />
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.settingsCard}>
          {settings.map((item, index) => (
            <View key={item.title}>
              <Pressable onPress={item.onPress} style={({ pressed }) => [styles.settingRow, pressed && styles.pressed]}>
                <View style={styles.settingIcon}><Ionicons color={colors.primary} name={item.icon} size={20} /></View>
                <View style={styles.settingCopy}>
                  <Text style={styles.settingTitle}>{item.title}</Text>
                  <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                </View>
                <Ionicons color={colors.muted} name="chevron-forward" size={18} />
              </Pressable>
              {index < settings.length - 1 ? <View style={styles.divider} /> : null}
            </View>
          ))}
        </View>

        <View style={styles.planCard}>
          <View style={styles.planCopy}>
            <Text style={styles.planLabel}>CURRENT PLAN</Text>
            <Text style={styles.planTitle}>Free starter</Text>
            <Text style={styles.planDetail}>Three coached attempts per day</Text>
          </View>
          <Pressable style={styles.upgradeButton}><Text style={styles.upgradeText}>View plans</Text></Pressable>
        </View>

        {__DEV__ ? (
          <View style={styles.developerCard}>
            <View style={styles.developerHeading}>
              <View style={styles.developerIcon}>
                <Ionicons color={colors.primary} name="code-slash" size={19} />
              </View>
              <View style={styles.developerCopy}>
                <Text style={styles.developerTitle}>Developer mode</Text>
                <Text style={styles.developerText}>Preview the experience as a brand-new user.</Text>
              </View>
            </View>
            <Pressable
              accessibilityHint="Clears temporary onboarding answers and opens the welcome screen"
              accessibilityRole="button"
              onPress={restartOnboarding}
              style={({ pressed }) => [styles.restartButton, pressed && styles.restartPressed]}
            >
              <Ionicons color={colors.primary} name="refresh" size={18} />
              <Text style={styles.restartText}>Restart new-user onboarding</Text>
            </Pressable>
          </View>
        ) : null}

        <Text style={styles.version}>Sponto · Early preview</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingHorizontal: 20, paddingBottom: 30 },
  accountCard: { flexDirection: 'row', alignItems: 'center', gap: 11, borderRadius: radius.medium, backgroundColor: colors.primarySoft, padding: 14, marginBottom: 14 },
  accountIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  accountCopy: { flex: 1 },
  accountTitle: { color: colors.ink, fontSize: 13, fontWeight: '800' },
  accountText: { color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 2 },
  accountButton: { borderRadius: radius.pill, backgroundColor: colors.primary, paddingHorizontal: 13, paddingVertical: 9 },
  accountButtonText: { color: colors.white, fontSize: 11, fontWeight: '800' },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 13, borderWidth: 1, borderColor: colors.border, borderRadius: radius.large, backgroundColor: colors.surface, padding: 18 },
  avatar: { width: 54, height: 54, borderRadius: 27, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.white, fontSize: 22, fontWeight: '800' },
  profileCopy: { flex: 1 },
  name: { color: colors.ink, fontSize: 17, fontWeight: '800' },
  track: { color: colors.muted, fontSize: 13, marginTop: 4 },
  editButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { color: colors.ink, fontSize: 18, fontWeight: '800', marginTop: 27, marginBottom: 11 },
  settingsCard: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.medium, backgroundColor: colors.surface, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 15 },
  pressed: { backgroundColor: colors.primarySoft },
  settingIcon: { width: 39, height: 39, borderRadius: 12, backgroundColor: colors.canvas, alignItems: 'center', justifyContent: 'center' },
  settingCopy: { flex: 1 },
  settingTitle: { color: colors.ink, fontSize: 14, fontWeight: '700' },
  settingSubtitle: { color: colors.muted, fontSize: 12, marginTop: 3 },
  divider: { height: 1, backgroundColor: colors.border, marginLeft: 66 },
  planCard: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: radius.medium, backgroundColor: colors.primary, padding: 18, marginTop: 20 },
  planCopy: { flex: 1 },
  planLabel: { color: '#C9E1D1', fontSize: 9, fontWeight: '900', letterSpacing: 0.8 },
  planTitle: { color: colors.white, fontSize: 17, fontWeight: '800', marginTop: 5 },
  planDetail: { color: '#C9E1D1', fontSize: 11, marginTop: 3 },
  upgradeButton: { borderRadius: radius.pill, backgroundColor: colors.white, paddingHorizontal: 14, paddingVertical: 10 },
  upgradeText: { color: colors.primary, fontSize: 12, fontWeight: '800' },
  developerCard: { borderWidth: 1, borderStyle: 'dashed', borderColor: colors.primary, borderRadius: radius.medium, backgroundColor: colors.primarySoft, padding: 16, marginTop: 20 },
  developerHeading: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  developerIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  developerCopy: { flex: 1 },
  developerTitle: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  developerText: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 2 },
  restartButton: { minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: radius.pill, backgroundColor: colors.surface, marginTop: 14 },
  restartPressed: { opacity: 0.72 },
  restartText: { color: colors.primary, fontSize: 13, fontWeight: '800' },
  version: { color: colors.muted, fontSize: 11, textAlign: 'center', marginTop: 24 },
});
