import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type { AIProviderId } from '@/domain/aiModels';

const webSessionKeys = new Map<AIProviderId, string>();

const storageKey = (providerId: AIProviderId) => `sponto.ai-key.${providerId}`;

export async function getProviderAPIKey(providerId: AIProviderId) {
  if (Platform.OS === 'web') return webSessionKeys.get(providerId) ?? null;
  if (!(await SecureStore.isAvailableAsync())) return null;
  return SecureStore.getItemAsync(storageKey(providerId));
}

export async function saveProviderAPIKey(providerId: AIProviderId, apiKey: string) {
  if (Platform.OS === 'web') {
    webSessionKeys.set(providerId, apiKey);
    return;
  }

  if (!(await SecureStore.isAvailableAsync())) {
    throw new Error('Secure storage is unavailable on this device.');
  }

  await SecureStore.setItemAsync(storageKey(providerId), apiKey, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

export async function deleteProviderAPIKey(providerId: AIProviderId) {
  if (Platform.OS === 'web') {
    webSessionKeys.delete(providerId);
    return;
  }

  if (await SecureStore.isAvailableAsync()) {
    await SecureStore.deleteItemAsync(storageKey(providerId));
  }
}
