import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChoiceChip } from '@/components/ChoiceChip';
import { PrimaryButton } from '@/components/PrimaryButton';
import {
  contexts,
  goals,
  styles as humourStyles,
  type ContextId,
  type GoalId,
  type StyleId,
} from '@/domain/personalization';
import { colors, radius } from '@/theme';
import { useAppState } from '@/state/AppState';
import { safeBack } from '@/navigation/safeBack';
import { saveScreeningResponse } from '@/services/spontoApi';

const TOTAL_STEPS = 6;

export default function ScreeningScreen() {
  const { saveScreening } = useAppState();
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState<GoalId | null>(null);
  const [customGoal, setCustomGoal] = useState('');
  const [context, setContext] = useState<ContextId | null>(null);
  const [customContext, setCustomContext] = useState('');
  const [style, setStyle] = useState<StyleId | null>(null);
  const [customStyle, setCustomStyle] = useState('');
  const [ease, setEase] = useState<number | null>(null);
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [diagnostic, setDiagnostic] = useState('');

  const canContinue = useMemo(() => {
    if (step === 1) return goal !== null && (goal !== 'custom' || customGoal.trim().length >= 2);
    if (step === 2) return context !== null && (context !== 'custom' || customContext.trim().length >= 2);
    if (step === 3) return style !== null && (style !== 'custom' || customStyle.trim().length >= 2);
    if (step === 4) return ease !== null;
    if (step === 5) return true;
    return diagnostic.trim().length >= 8;
  }, [context, customContext, customGoal, customStyle, diagnostic, ease, goal, step, style]);

  const continueFlow = () => {
    if (!canContinue) return;
    if (step < TOTAL_STEPS) {
      setStep((current) => current + 1);
      return;
    }

    if (!goal || !context || !style || ease === null) return;
    const answers = {
      goal,
      customGoal: goal === 'custom' ? customGoal.trim() : undefined,
      context,
      customContext: context === 'custom' ? customContext.trim() : undefined,
      style,
      customStyle: style === 'custom' ? customStyle.trim() : undefined,
      ease,
      additionalDetails: additionalDetails.trim() || undefined,
      diagnostic: diagnostic.trim(),
    };
    saveScreening(answers);
    saveScreeningResponse(answers).catch(() => {
      // Keep the generated local plan available when the network is offline.
    });
    router.push('/plan');
  };

  const goBack = () => {
    if (step === 1) safeBack('/');
    else setStep((current) => current - 1);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={styles.header}>
          <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={goBack} style={styles.backButton}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${(step / TOTAL_STEPS) * 100}%` }]} />
          </View>
          <Text style={styles.stepText}>{step}/{TOTAL_STEPS}</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {step === 1 && (
            <Question title="Where would humour help you most?" hint="Choose the goal that matters right now.">
              <ChoiceList options={goals} selected={goal} onSelect={(id) => setGoal(id as GoalId)} />
              {goal === 'custom' ? (
                <CustomAnswerInput
                  label="Describe where humour would help"
                  onChangeText={setCustomGoal}
                  placeholder="For example, making clients feel comfortable"
                  value={customGoal}
                />
              ) : null}
            </Question>
          )}

          {step === 2 && (
            <Question title="Where do you want to practise?" hint="We will shape your examples around this context.">
              <ChoiceList options={contexts} selected={context} onSelect={(id) => setContext(id as ContextId)} />
              {context === 'custom' ? (
                <CustomAnswerInput
                  label="Describe where you want to practise"
                  onChangeText={setCustomContext}
                  placeholder="For example, client workshops"
                  value={customContext}
                />
              ) : null}
            </Question>
          )}

          {step === 3 && (
            <Question title="What feels closest to your style?" hint="There is no wrong answer—and ‘not sure’ is useful too.">
              <ChoiceList options={humourStyles} selected={style} onSelect={(id) => setStyle(id as StyleId)} />
              {style === 'custom' ? (
                <CustomAnswerInput
                  label="Describe the style that feels like you"
                  onChangeText={setCustomStyle}
                  placeholder="For example, warm storytelling"
                  value={customStyle}
                />
              ) : null}
            </Question>
          )}

          {step === 4 && (
            <Question title="How easy does humour feel today?" hint="1 is uncomfortable. 5 is very natural.">
              <View accessibilityRole="radiogroup" style={styles.easeRow}>
                {[1, 2, 3, 4, 5].map((value) => (
                  <Pressable
                    accessibilityRole="radio"
                    accessibilityLabel={`${value} out of 5`}
                    accessibilityState={{ checked: ease === value }}
                    key={value}
                    onPress={() => setEase(value)}
                    style={[styles.easeButton, ease === value && styles.easeButtonSelected]}
                  >
                    <Text style={[styles.easeText, ease === value && styles.easeTextSelected]}>{value}</Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.scaleLabels}>
                <Text style={styles.scaleLabel}>Uncomfortable</Text>
                <Text style={styles.scaleLabel}>Natural</Text>
              </View>
            </Question>
          )}

          {step === 5 && (
            <Question
              title="Anything else you want us to know?"
              hint="Add any situations, preferences, boundaries, or goals you want your course to consider. This is optional."
            >
              <TextInput
                accessibilityLabel="Additional details"
                maxLength={400}
                multiline
                onChangeText={setAdditionalDetails}
                placeholder="For example, I want to be more relaxed with clients, but I prefer not to use sarcasm…"
                placeholderTextColor="#8A918C"
                style={styles.input}
                textAlignVertical="top"
                value={additionalDetails}
              />
              <Text style={styles.detailCount}>{additionalDetails.length}/400</Text>
              <Text style={styles.inputNote}>You can leave this blank and update your preferences later.</Text>
            </Question>
          )}

          {step === 6 && (
            <Question title="One tiny warm-up" hint="A teammate says, ‘That meeting could have been an email.’ Write a light reply.">
              <TextInput
                accessibilityLabel="Your warm-up reply"
                multiline
                onChangeText={setDiagnostic}
                placeholder="Type the first thing that comes to mind…"
                placeholderTextColor="#8A918C"
                style={styles.input}
                textAlignVertical="top"
                value={diagnostic}
              />
              <Text style={styles.inputNote}>We assess the craft—not whether you are already “funny.”</Text>
            </Question>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton
            disabled={!canContinue}
            label={step === TOTAL_STEPS ? 'Create my path' : step === 5 && !additionalDetails.trim() ? 'Skip for now' : 'Continue'}
            onPress={continueFlow}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type QuestionProps = { title: string; hint: string; children: React.ReactNode };

function Question({ title, hint, children }: QuestionProps) {
  return (
    <View>
      <Text style={styles.kicker}>YOUR STARTING POINT</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.hint}>{hint}</Text>
      <View style={styles.answers}>{children}</View>
    </View>
  );
}

type ChoiceListProps = {
  options: readonly { id: string; label: string }[];
  selected: string | null;
  onSelect: (id: string) => void;
};

function ChoiceList({ options, selected, onSelect }: ChoiceListProps) {
  return (
    <View accessibilityRole="radiogroup" style={styles.choiceList}>
      {options.map((option) => (
        <ChoiceChip
          key={option.id}
          label={option.label}
          onPress={() => onSelect(option.id)}
          selected={selected === option.id}
        />
      ))}
    </View>
  );
}

type CustomAnswerInputProps = {
  label: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
};

function CustomAnswerInput({ label, onChangeText, placeholder, value }: CustomAnswerInputProps) {
  return (
    <View style={styles.customAnswer}>
      <Text style={styles.customLabel}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        autoFocus
        maxLength={100}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#8A918C"
        returnKeyType="done"
        style={styles.customInput}
        value={value}
      />
      <Text style={styles.customCount}>{value.length}/100</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: colors.canvas },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, gap: 14 },
  backButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  backText: { color: colors.ink, fontSize: 36, lineHeight: 38, fontWeight: '300' },
  progressTrack: { flex: 1, height: 5, borderRadius: 3, backgroundColor: colors.border, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3, backgroundColor: colors.primary },
  stepText: { width: 30, color: colors.muted, fontSize: 13, fontWeight: '700' },
  content: { paddingHorizontal: 24, paddingTop: 52, paddingBottom: 36 },
  kicker: { color: colors.primary, fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  title: { color: colors.ink, fontSize: 34, lineHeight: 40, fontWeight: '800', letterSpacing: -1, marginTop: 10 },
  hint: { color: colors.muted, fontSize: 16, lineHeight: 24, marginTop: 12 },
  answers: { marginTop: 30 },
  choiceList: { alignItems: 'flex-start', gap: 12 },
  customAnswer: { marginTop: 18 },
  customLabel: { color: colors.ink, fontSize: 13, fontWeight: '700', marginBottom: 8 },
  customInput: { minHeight: 54, borderWidth: 1, borderColor: colors.primary, borderRadius: radius.small, backgroundColor: colors.surface, color: colors.ink, fontSize: 16, paddingHorizontal: 15, paddingVertical: 12 },
  customCount: { color: colors.muted, fontSize: 10, textAlign: 'right', marginTop: 5 },
  easeRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  easeButton: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: 62,
    borderRadius: 31,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  easeButtonSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  easeText: { color: colors.ink, fontSize: 18, fontWeight: '700' },
  easeTextSelected: { color: colors.white },
  scaleLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  scaleLabel: { color: colors.muted, fontSize: 12 },
  input: {
    minHeight: 150,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.medium,
    backgroundColor: colors.surface,
    color: colors.ink,
    fontSize: 17,
    lineHeight: 25,
    padding: 18,
  },
  detailCount: { color: colors.muted, fontSize: 10, textAlign: 'right', marginTop: 6 },
  inputNote: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 10 },
  footer: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 12 },
});
