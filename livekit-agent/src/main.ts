import { Modality } from '@google/genai';
import { Agent, ServerOptions, cli, dedent, defineAgent, tool, voice } from '@livekit/agents';
import * as google from '@livekit/agents-plugin-google';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

dotenv.config({ path: '.env.local' });

const answersSchema = z.object({
  goal: z.enum(['conversations', 'messaging', 'presentations', 'networking', 'custom']),
  customGoal: z.string().max(100).optional(),
  context: z.enum(['meetings', 'slack', 'presenting', 'social', 'custom']),
  customContext: z.string().max(100).optional(),
  style: z.enum(['playful', 'dry', 'observational', 'unsure', 'custom']),
  customStyle: z.string().max(100).optional(),
  ease: z.number().int().min(1).max(5),
  additionalDetails: z.string().max(400).optional(),
  diagnostic: z.string().min(1).max(400),
});

export default defineAgent({
  entry: async (ctx) => {
    await ctx.connect();
    const participant = await ctx.waitForParticipant();
    let metadata: { googleApiKey?: string } = {};
    try { metadata = JSON.parse(participant.metadata || '{}'); } catch {}
    if (!metadata.googleApiKey) throw new Error('The participant did not provide a Google API key.');

    const completeOnboarding = tool({
      name: 'complete_onboarding',
      description: 'Finish onboarding after all six answers are collected, summarized, and confirmed by the learner.',
      parameters: answersSchema,
      execute: async (answers) => {
        const payload = new TextEncoder().encode(JSON.stringify({ type: 'onboarding_complete', answers }));
        await ctx.room.localParticipant?.publishData(payload, { reliable: true, topic: 'sponto.onboarding' });
        return 'The onboarding answers were saved. Tell the learner their personalized path is being created.';
      },
    });

    const session = new voice.AgentSession({
      llm: new google.beta.realtime.RealtimeModel({
        apiKey: metadata.googleApiKey,
        model: 'gemini-3.8-live',
        voice: 'Puck',
        modalities: [Modality.AUDIO],
        inputAudioTranscription: {},
        outputAudioTranscription: {},
      }),
    });

    await session.start({
      room: ctx.room,
      agent: Agent.create({
        instructions: dedent`
          You are Sponto, a warm and concise workplace-humour onboarding coach. Laughter brings people together.
          Conduct a natural voice screening and ask only one question at a time.
          Ask these six things in order:
          one, where humour would help most, mapped to conversations, messaging, presentations, networking, or custom;
          two, practice context, mapped to meetings, slack, presenting, social, or custom;
          three, humour style, mapped to playful, dry, observational, unsure, or custom;
          four, ease from one to five;
          five, optional additional situations, preferences, or boundaries;
          six, a warm-up reply to “That meeting could have been an email.”
          Accept answers in the learner's own words. Ask a brief clarification only when mapping is unclear.
          Never judge whether the learner is already funny. Keep every spoken response brief and natural.
          After question six, summarize the answers, ask for confirmation, then call complete_onboarding.
          Never call complete_onboarding before the learner confirms.
        `,
        tools: [completeOnboarding],
      }),
    });

    session.generateReply({ instructions: 'Welcome the learner warmly and ask the first screening question.' });
  },
});

cli.runApp(new ServerOptions({ agent: fileURLToPath(import.meta.url) }));
