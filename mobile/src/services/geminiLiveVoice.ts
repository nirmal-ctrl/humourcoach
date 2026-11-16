import { AudioSession } from '@livekit/react-native';
import { Room, RoomEvent } from 'livekit-client';

import type { ScreeningAnswers } from '@/domain/personalization';
import { supabase } from '@/lib/supabase';
import { getProviderAPIKey } from '@/services/apiKeyStorage';

type LiveKitCredentials = { serverUrl: string; token: string; roomName: string };
export type VoiceStatus = 'connecting' | 'listening' | 'speaking' | 'finished';
export type TranscriptLine = { id: string; role: 'user' | 'assistant'; text: string };

type SessionCallbacks = {
  onStatus: (status: VoiceStatus) => void;
  onTranscript: (line: TranscriptLine) => void;
  onComplete: (answers: ScreeningAnswers) => void;
  onError: (error: Error) => void;
};

export class GeminiLiveOnboardingSession {
  private room: Room | null = null;
  private stopped = false;

  constructor(private callbacks: SessionCallbacks) {}

  async start() {
    try {
      this.callbacks.onStatus('connecting');
      const credentials = await requestLiveKitCredentials();
      if (this.stopped) return;

      await AudioSession.startAudioSession();
      const room = new Room({ adaptiveStream: true, dynacast: true });
      this.room = room;

      room.on(RoomEvent.TranscriptionReceived, (segments, participant) => {
        for (const segment of segments) {
          const text = segment.text?.trim();
          if (!text || !segment.final) continue;
          const role = participant?.identity === room.localParticipant.identity ? 'user' : 'assistant';
          this.callbacks.onTranscript({ id: segment.id || uniqueId(), role, text });
        }
      });
      room.on(RoomEvent.DataReceived, (payload, participant, _kind, topic) => {
        if (topic !== 'sponto.onboarding' || participant?.identity === room.localParticipant.identity) return;
        try {
          const message = JSON.parse(new TextDecoder().decode(payload));
          if (message.type === 'onboarding_complete') {
            this.callbacks.onStatus('finished');
            this.callbacks.onComplete(validateAnswers(message.answers));
          }
        } catch (error) {
          this.fail(error instanceof Error ? error : new Error('The onboarding result was invalid.'));
        }
      });
      room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
        const agentSpeaking = speakers.some((participant) => participant.identity !== room.localParticipant.identity);
        this.callbacks.onStatus(agentSpeaking ? 'speaking' : 'listening');
      });
      room.on(RoomEvent.Disconnected, () => {
        if (!this.stopped) this.fail(new Error('The LiveKit conversation ended unexpectedly. Please try again.'));
      });

      await room.connect(credentials.serverUrl, credentials.token);
      await room.localParticipant.setMicrophoneEnabled(true);
      this.callbacks.onStatus('listening');
    } catch (error) {
      this.fail(error instanceof Error ? error : new Error('LiveKit voice onboarding is temporarily unavailable.'));
    }
  }

  async stop() {
    if (this.stopped) return;
    this.stopped = true;
    await this.room?.localParticipant.setMicrophoneEnabled(false).catch(() => undefined);
    await this.room?.disconnect();
    await AudioSession.stopAudioSession();
    this.room = null;
  }

  private fail(error: Error) {
    if (this.stopped) return;
    this.callbacks.onError(error);
    void this.stop();
  }
}

async function requestLiveKitCredentials(): Promise<LiveKitCredentials> {
  if (!supabase) throw new Error('Connect Supabase before using LiveKit voice onboarding.');
  const providerApiKey = await getProviderAPIKey('google');
  const { data, error } = await supabase.functions.invoke<LiveKitCredentials>('livekit-token', {
    body: { providerApiKey: providerApiKey || undefined },
  });
  if (error) {
    const context = await error.context?.json?.().catch(() => null);
    throw new Error(context?.error ?? error.message ?? 'LiveKit voice onboarding is temporarily unavailable.');
  }
  if (!data?.serverUrl || !data.token) throw new Error('The LiveKit service returned incomplete connection details.');
  return data;
}

function validateAnswers(value: Record<string, unknown>): ScreeningAnswers {
  const goals = ['conversations', 'messaging', 'presentations', 'networking', 'custom'];
  const contexts = ['meetings', 'slack', 'presenting', 'social', 'custom'];
  const styles = ['playful', 'dry', 'observational', 'unsure', 'custom'];
  const goal = String(value?.goal);
  const context = String(value?.context);
  const style = String(value?.style);
  const ease = Math.max(1, Math.min(5, Math.round(Number(value?.ease))));
  if (!goals.includes(goal) || !contexts.includes(context) || !styles.includes(style) || !Number.isFinite(ease)) {
    throw new Error('Some onboarding answers are missing.');
  }
  const optional = (key: string, max: number) => typeof value[key] === 'string' ? String(value[key]).trim().slice(0, max) || undefined : undefined;
  const diagnostic = optional('diagnostic', 400);
  if (!diagnostic) throw new Error('The warm-up answer is missing.');
  return {
    goal: goal as ScreeningAnswers['goal'], customGoal: optional('customGoal', 100),
    context: context as ScreeningAnswers['context'], customContext: optional('customContext', 100),
    style: style as ScreeningAnswers['style'], customStyle: optional('customStyle', 100),
    ease, additionalDetails: optional('additionalDetails', 400), diagnostic,
  };
}

const uniqueId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;
