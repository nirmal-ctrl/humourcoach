export type AIProviderId = 'google' | 'openai' | 'anthropic';

export type AIModel = {
  id: string;
  label: string;
  description: string;
  recommended?: boolean;
};

export type AIProvider = {
  id: AIProviderId;
  label: string;
  models: readonly AIModel[];
};

export const aiProviders: readonly AIProvider[] = [
  {
    id: 'google',
    label: 'Google Gemini',
    models: [
      { id: 'gemini-3.8-flash', label: 'Gemini 3.8 Flash', description: 'Fast, capable, and recommended for coaching feedback.', recommended: true },
      { id: 'gemini-3.7-flash', label: 'Gemini 3.7 Flash', description: 'Previous-generation Flash model.' },
      { id: 'gemini-3.5-flash-lite', label: 'Gemini 3.5 Flash-Lite', description: 'Lower-cost option for lightweight requests.' },
    ],
  },
  {
    id: 'openai',
    label: 'OpenAI',
    models: [
      { id: 'gpt-6-luna', label: 'GPT-6 Luna', description: 'Fast and economical for frequent critiques.' },
      { id: 'gpt-6.1-sol', label: 'GPT-6.1 Sol', description: 'Stronger reasoning for detailed coaching.' },
      { id: 'gpt-6-astra', label: 'GPT-6 Astra', description: 'Highest-capability option for complex analysis.' },
    ],
  },
  {
    id: 'anthropic',
    label: 'Anthropic',
    models: [
      { id: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5', description: 'Fast model for concise coaching.' },
      { id: 'claude-sonnet-5', label: 'Claude Sonnet 5', description: 'Balanced model for nuanced feedback.' },
      { id: 'claude-opus-5', label: 'Claude Opus 5', description: 'Advanced model for demanding evaluations.' },
    ],
  },
] as const;

export const DEFAULT_AI_PROVIDER: AIProviderId = 'google';
export const DEFAULT_AI_MODEL = 'gemini-3.8-flash';

export function getAIProvider(providerId: AIProviderId) {
  return aiProviders.find((provider) => provider.id === providerId) ?? aiProviders[0];
}

export function getAIModel(providerId: AIProviderId, modelId: string) {
  const provider = getAIProvider(providerId);
  return provider.models.find((model) => model.id === modelId) ?? provider.models[0];
}
