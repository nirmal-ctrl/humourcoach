import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { createLearningPlan, type LearningPlan, type ScreeningAnswers } from '@/domain/personalization';
import { DEFAULT_AI_MODEL, DEFAULT_AI_PROVIDER, getAIProvider, type AIProviderId } from '@/domain/aiModels';
import { saveAISelection } from '@/services/spontoApi';

type AppStateValue = {
  answers: ScreeningAnswers | null;
  aiModel: string;
  aiProvider: AIProviderId;
  plan: LearningPlan;
  resetApp: () => void;
  saveScreening: (nextAnswers: ScreeningAnswers) => void;
  selectAIModel: (modelId: string) => void;
  selectAIProvider: (providerId: AIProviderId) => void;
};

const defaultAnswers: ScreeningAnswers = {
  goal: 'conversations',
  context: 'meetings',
  style: 'unsure',
  ease: 3,
  diagnostic: '',
};

const AppStateContext = createContext<AppStateValue | null>(null);
const APP_STATE_KEY = 'sponto.app-state.v1';

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [answers, setAnswers] = useState<ScreeningAnswers | null>(null);
  const [aiProvider, setAIProvider] = useState<AIProviderId>(DEFAULT_AI_PROVIDER);
  const [aiModel, setAIModel] = useState(DEFAULT_AI_MODEL);
  const plan = useMemo(() => createLearningPlan(answers ?? defaultAnswers), [answers]);

  useEffect(() => {
    AsyncStorage.getItem(APP_STATE_KEY).then((stored) => {
      if (!stored) return;
      try {
        const value = JSON.parse(stored) as { answers?: ScreeningAnswers; aiProvider?: AIProviderId; aiModel?: string };
        if (value.answers) setAnswers(value.answers);
        if (value.aiProvider && value.aiModel && getAIProvider(value.aiProvider).models.some((model) => model.id === value.aiModel)) {
          setAIProvider(value.aiProvider);
          setAIModel(value.aiModel);
        }
      } catch {
        void AsyncStorage.removeItem(APP_STATE_KEY);
      }
    });
  }, []);

  const persist = (next: { answers: ScreeningAnswers | null; aiProvider: AIProviderId; aiModel: string }) => {
    void AsyncStorage.setItem(APP_STATE_KEY, JSON.stringify(next));
  };

  const selectAIProvider = (providerId: AIProviderId) => {
    const nextModel = getAIProvider(providerId).models[0].id;
    setAIProvider(providerId);
    setAIModel(nextModel);
    persist({ answers, aiProvider: providerId, aiModel: nextModel });
    void saveAISelection(providerId, nextModel);
  };

  const selectAIModel = (modelId: string) => {
    setAIModel(modelId);
    persist({ answers, aiProvider, aiModel: modelId });
    void saveAISelection(aiProvider, modelId);
  };

  const saveScreening = (nextAnswers: ScreeningAnswers) => {
    setAnswers(nextAnswers);
    persist({ answers: nextAnswers, aiProvider, aiModel });
  };

  const resetApp = () => {
    setAnswers(null);
    persist({ answers: null, aiProvider, aiModel });
  };

  return (
    <AppStateContext.Provider
      value={{
        answers,
        aiModel,
        aiProvider,
        plan,
        resetApp,
        saveScreening,
        selectAIModel,
        selectAIProvider,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const value = useContext(AppStateContext);
  if (!value) throw new Error('useAppState must be used inside AppStateProvider');
  return value;
}
