import Ionicons from '@expo/vector-icons/Ionicons';
import { useState, type ComponentProps } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/PrimaryButton';
import { safeBack } from '@/navigation/safeBack';
import { useAuthState } from '@/state/AuthState';
import { colors, radius } from '@/theme';

export default function AuthScreen() {
  const { configured, signIn, signUp } = useAuthState();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setMessage(null);
    const result = mode === 'signin'
      ? await signIn(email, password)
      : await signUp(email, password, displayName);
    setBusy(false);
    if (result.error) setMessage(result.error);
    else if (result.needsEmailConfirmation) setMessage('Check your email to confirm your account, then sign in.');
    else safeBack('/profile');
  };

  const valid = configured && email.includes('@') && password.length >= 6 && (mode === 'signin' || displayName.trim().length >= 2);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Pressable accessibilityLabel="Go back" accessibilityRole="button" onPress={() => safeBack('/profile')} style={styles.backButton}>
              <Ionicons color={colors.ink} name="arrow-back" size={22} />
            </Pressable>
          </View>
          <View style={styles.icon}><Ionicons color={colors.primary} name="person-circle-outline" size={31} /></View>
          <Text style={styles.title}>{mode === 'signin' ? 'Welcome back' : 'Create your account'}</Text>
          <Text style={styles.subtitle}>Sign in to save your course, attempts, and progress across devices.</Text>
          {!configured ? (
            <View style={styles.notice}>
              <Ionicons color={colors.primary} name="information-circle-outline" size={20} />
              <Text style={styles.noticeText}>Supabase is not configured yet. Follow SUPABASE_SETUP.md first.</Text>
            </View>
          ) : null}
          {mode === 'signup' ? <Field label="Name" value={displayName} onChangeText={setDisplayName} placeholder="Your name" /> : null}
          <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" />
          <Field label="Password" value={password} onChangeText={setPassword} placeholder="At least 6 characters" secureTextEntry />
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <View style={styles.action}><PrimaryButton disabled={!valid || busy} label={busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'} onPress={submit} /></View>
          <Pressable onPress={() => { setMode((current) => current === 'signin' ? 'signup' : 'signin'); setMessage(null); }}>
            <Text style={styles.switchText}>{mode === 'signin' ? 'New to Sponto? Create an account' : 'Already have an account? Sign in'}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, ...props }: { label: string } & ComponentProps<typeof TextInput>) {
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput autoCapitalize="none" autoCorrect={false} placeholderTextColor="#8A918C" style={styles.input} {...props} /></View>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 }, safeArea: { flex: 1, backgroundColor: colors.canvas }, content: { padding: 24, paddingBottom: 40 },
  header: { height: 48, marginBottom: 25 }, backButton: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  icon: { width: 56, height: 56, borderRadius: 18, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  title: { color: colors.ink, fontSize: 32, lineHeight: 39, fontWeight: '800', marginTop: 17 }, subtitle: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 7, marginBottom: 20 },
  notice: { flexDirection: 'row', gap: 9, borderRadius: radius.medium, backgroundColor: colors.primarySoft, padding: 14, marginBottom: 8 }, noticeText: { flex: 1, color: colors.muted, fontSize: 12, lineHeight: 18 },
  field: { marginTop: 15 }, label: { color: colors.ink, fontSize: 13, fontWeight: '700', marginBottom: 7 }, input: { minHeight: 52, borderWidth: 1, borderColor: colors.border, borderRadius: radius.small, backgroundColor: colors.surface, color: colors.ink, fontSize: 16, paddingHorizontal: 14 },
  message: { color: colors.danger, fontSize: 12, lineHeight: 18, marginTop: 12 }, action: { marginTop: 23 }, switchText: { color: colors.primary, fontSize: 13, fontWeight: '700', textAlign: 'center', marginTop: 19 },
});
