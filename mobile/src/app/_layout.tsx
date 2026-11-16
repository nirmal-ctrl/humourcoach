import { registerGlobals } from '@livekit/react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { colors } from '@/theme';
import { AppStateProvider } from '@/state/AppState';
import { AuthStateProvider } from '@/state/AuthState';

registerGlobals();

export default function RootLayout() {
  return (
    <AuthStateProvider>
      <AppStateProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.canvas },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="screening" />
          <Stack.Screen name="voice-onboarding" />
          <Stack.Screen name="plan" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="lesson" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="drill" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="ai-settings" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="auth" options={{ animation: 'slide_from_bottom' }} />
        </Stack>
      </AppStateProvider>
    </AuthStateProvider>
  );
}
