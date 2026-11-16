import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { aiProviders, getAIProvider, type AIProviderId } from '@/domain/aiModels';
import { safeBack } from '@/navigation/safeBack';
import { deleteProviderAPIKey, getProviderAPIKey, saveProviderAPIKey } from '@/services/apiKeyStorage';
import { useAppState } from '@/state/AppState';
import { colors, radius } from '@/theme';

export default function AISettingsScreen() {
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const { aiModel, aiProvider, selectAIModel, selectAIProvider } = useAppState();
  const provider = getAIProvider(aiProvider);
  const [apiKey, setAPIKey] = useState('');
  const [keySuffix, setKeySuffix] = useState<string | null>(null);
  const [keyVisible, setKeyVisible] = useState(false);
  const [keyMessage, setKeyMessage] = useState<string | null>(null);
  const [savingKey, setSavingKey] = useState(false);

  useEffect(() => {
    let active = true;

    getProviderAPIKey(aiProvider)
      .then((storedKey) => {
        if (active) setKeySuffix(storedKey ? storedKey.slice(-4) : null);
      })
      .catch(() => {
        if (active) setKeySuffix(null);
      });

    return () => {
      active = false;
    };
  }, [aiProvider]);

  const chooseProvider = (providerId: AIProviderId) => {
    setAPIKey('');
    setKeyMessage(null);
    setKeyVisible(false);
    setKeySuffix(null);
    selectAIProvider(providerId);
  };

  const saveAPIKey = async () => {
    const trimmedKey = apiKey.trim();
    if (trimmedKey.length < 12) {
      setKeyMessage('Enter a valid API key with at least 12 characters.');
      return;
    }

    setSavingKey(true);
    setKeyMessage(null);
    try {
      await saveProviderAPIKey(aiProvider, trimmedKey);
      setKeySuffix(trimmedKey.slice(-4));
      setAPIKey('');
      setKeyVisible(false);
      setKeyMessage(Platform.OS === 'web' ? 'Saved for this browser session only.' : 'Saved securely on this device.');
    } catch (error) {
      setKeyMessage(error instanceof Error ? error.message : 'The API key could not be saved.');
    } finally {
      setSavingKey(false);
    }
  };

  const removeAPIKey = async () => {
    setSavingKey(true);
    setKeyMessage(null);
    try {
      await deleteProviderAPIKey(aiProvider);
      setKeySuffix(null);
      setAPIKey('');
      setKeyMessage('API key removed.');
    } catch {
      setKeyMessage('The API key could not be removed.');
    } finally {
      setSavingKey(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Go back" accessibilityRole="button" onPress={() => safeBack(returnTo === 'voice-onboarding' ? '/voice-onboarding' : '/profile')} style={styles.backButton}>
          <Ionicons color={colors.ink} name="arrow-back" size={22} />
        </Pressable>
        <Text style={styles.headerTitle}>AI settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.introCard}>
          <View style={styles.introIcon}>
            <Ionicons color={colors.primary} name="sparkles" size={22} />
          </View>
          <View style={styles.introCopy}>
            <Text style={styles.introTitle}>Choose your coaching engine</Text>
            <Text style={styles.introText}>This selection is used for live, personalized drill feedback through the secure Supabase coaching function.</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>PROVIDER</Text>
        <View style={styles.providerRow} accessibilityRole="radiogroup">
          {aiProviders.map((item) => (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: aiProvider === item.id }}
              key={item.id}
              onPress={() => chooseProvider(item.id as AIProviderId)}
              style={({ pressed }) => [
                styles.providerButton,
                aiProvider === item.id && styles.providerButtonSelected,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.providerText, aiProvider === item.id && styles.providerTextSelected]}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.modelHeading}>
          <Text style={styles.sectionLabel}>MODEL</Text>
          <Text style={styles.modelProvider}>{provider.label}</Text>
        </View>
        <View style={styles.modelList} accessibilityRole="radiogroup">
          {provider.models.map((model) => {
            const selected = aiModel === model.id;
            return (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                key={model.id}
                onPress={() => selectAIModel(model.id)}
                style={({ pressed }) => [styles.modelCard, selected && styles.modelCardSelected, pressed && styles.pressed]}
              >
                <View style={styles.radioOuter}>
                  {selected ? <View style={styles.radioInner} /> : null}
                </View>
                <View style={styles.modelCopy}>
                  <View style={styles.modelTitleRow}>
                    <Text style={styles.modelTitle}>{model.label}</Text>
                    {model.recommended ? <View style={styles.recommendedPill}><Text style={styles.recommendedText}>DEFAULT</Text></View> : null}
                  </View>
                  <Text style={styles.modelDescription}>{model.description}</Text>
                  <Text style={styles.modelId}>{model.id}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.keyHeading}>
          <View>
            <Text style={styles.sectionLabel}>BRING YOUR OWN KEY</Text>
            <Text style={styles.keyProvider}>{provider.label}</Text>
          </View>
          {keySuffix ? (
            <View style={styles.savedPill}>
              <Ionicons color={colors.primary} name="checkmark-circle" size={14} />
              <Text style={styles.savedText}>Saved ····{keySuffix}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.keyCard}>
          <Text style={styles.keyTitle}>{keySuffix ? 'Replace API key' : 'Paste API key'}</Text>
          <Text style={styles.keyDescription}>
            {Platform.OS === 'web'
              ? 'Web preview keys stay in memory and disappear when this browser session ends.'
              : 'Your key is encrypted by the device and is never displayed again after saving.'}
          </Text>
          <View style={styles.keyInputRow}>
            <TextInput
              accessibilityLabel={`${provider.label} API key`}
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={(value) => {
                setAPIKey(value);
                setKeyMessage(null);
              }}
              placeholder={keyPlaceholder(aiProvider)}
              placeholderTextColor="#8A918C"
              secureTextEntry={!keyVisible}
              style={styles.keyInput}
              value={apiKey}
            />
            <Pressable
              accessibilityLabel={keyVisible ? 'Hide API key' : 'Show API key'}
              accessibilityRole="button"
              onPress={() => setKeyVisible((visible) => !visible)}
              style={styles.visibilityButton}
            >
              <Ionicons color={colors.muted} name={keyVisible ? 'eye-off-outline' : 'eye-outline'} size={21} />
            </Pressable>
          </View>
          {keyMessage ? <Text style={[styles.keyMessage, keyMessage.includes('could not') || keyMessage.includes('valid') ? styles.keyError : null]}>{keyMessage}</Text> : null}
          <View style={styles.keyActions}>
            <Pressable
              accessibilityRole="button"
              disabled={savingKey || apiKey.trim().length === 0}
              onPress={saveAPIKey}
              style={({ pressed }) => [styles.saveKeyButton, (savingKey || apiKey.trim().length === 0) && styles.disabled, pressed && styles.pressed]}
            >
              <Ionicons color={colors.white} name="lock-closed" size={16} />
              <Text style={styles.saveKeyText}>{savingKey ? 'Saving…' : 'Save key'}</Text>
            </Pressable>
            {keySuffix ? (
              <Pressable accessibilityRole="button" disabled={savingKey} onPress={removeAPIKey} style={styles.removeButton}>
                <Text style={styles.removeText}>Remove</Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        <View style={styles.securityNote}>
          <Ionicons color={colors.primary} name="lock-closed-outline" size={19} />
          <Text style={styles.securityText}>Managed app keys remain on the server. A key you provide is stored only on your device and is never sent to analytics.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function keyPlaceholder(providerId: AIProviderId) {
  if (providerId === 'google') return 'AIza…';
  if (providerId === 'openai') return 'sk-…';
  return 'sk-ant-…';
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.canvas },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14 },
  backButton: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: colors.ink, fontSize: 16, fontWeight: '800' },
  headerSpacer: { width: 42 },
  content: { paddingHorizontal: 20, paddingBottom: 36 },
  introCard: { flexDirection: 'row', gap: 13, borderRadius: radius.large, backgroundColor: colors.primarySoft, padding: 18 },
  introIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  introCopy: { flex: 1 },
  introTitle: { color: colors.ink, fontSize: 16, fontWeight: '800' },
  introText: { color: colors.muted, fontSize: 13, lineHeight: 20, marginTop: 5 },
  sectionLabel: { color: colors.muted, fontSize: 10, fontWeight: '900', letterSpacing: 1.1, marginTop: 26, marginBottom: 10 },
  providerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  providerButton: { minHeight: 44, justifyContent: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, backgroundColor: colors.surface, paddingHorizontal: 15 },
  providerButtonSelected: { borderColor: colors.primary, backgroundColor: colors.primary },
  providerText: { color: colors.ink, fontSize: 13, fontWeight: '700' },
  providerTextSelected: { color: colors.white },
  pressed: { opacity: 0.75 },
  modelHeading: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  modelProvider: { color: colors.primary, fontSize: 12, fontWeight: '700' },
  modelList: { gap: 10 },
  modelCard: { flexDirection: 'row', gap: 13, borderWidth: 1, borderColor: colors.border, borderRadius: radius.medium, backgroundColor: colors.surface, padding: 16 },
  modelCardSelected: { borderWidth: 2, borderColor: colors.primary, padding: 15 },
  radioOuter: { width: 21, height: 21, borderRadius: 11, borderWidth: 2, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  radioInner: { width: 11, height: 11, borderRadius: 6, backgroundColor: colors.primary },
  modelCopy: { flex: 1 },
  modelTitleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  modelTitle: { color: colors.ink, fontSize: 15, fontWeight: '800' },
  recommendedPill: { borderRadius: radius.pill, backgroundColor: colors.accent, paddingHorizontal: 7, paddingVertical: 3 },
  recommendedText: { color: colors.ink, fontSize: 8, fontWeight: '900', letterSpacing: 0.5 },
  modelDescription: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 5 },
  modelId: { color: colors.primary, fontSize: 10, fontWeight: '600', marginTop: 7 },
  keyHeading: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 },
  keyProvider: { color: colors.ink, fontSize: 15, fontWeight: '800', marginTop: -5, marginBottom: 2 },
  savedPill: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: radius.pill, backgroundColor: colors.primarySoft, paddingHorizontal: 9, paddingVertical: 6 },
  savedText: { color: colors.primary, fontSize: 10, fontWeight: '800' },
  keyCard: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.medium, backgroundColor: colors.surface, padding: 16, marginTop: 10 },
  keyTitle: { color: colors.ink, fontSize: 15, fontWeight: '800' },
  keyDescription: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 5 },
  keyInputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radius.small, backgroundColor: colors.canvas, marginTop: 14 },
  keyInput: { flex: 1, minHeight: 50, color: colors.ink, fontSize: 15, paddingHorizontal: 14, paddingVertical: 11 },
  visibilityButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  keyMessage: { color: colors.primary, fontSize: 11, lineHeight: 16, marginTop: 8 },
  keyError: { color: colors.danger },
  keyActions: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 14 },
  saveKeyButton: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderRadius: radius.pill, backgroundColor: colors.primary, paddingHorizontal: 18 },
  disabled: { opacity: 0.4 },
  saveKeyText: { color: colors.white, fontSize: 13, fontWeight: '800' },
  removeButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 10 },
  removeText: { color: colors.danger, fontSize: 13, fontWeight: '700' },
  securityNote: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: radius.medium, backgroundColor: colors.surface, padding: 15, marginTop: 20 },
  securityText: { flex: 1, color: colors.muted, fontSize: 12, lineHeight: 18 },
});
