export const goals = [
  { id: 'conversations', label: 'Everyday conversations' },
  { id: 'messaging', label: 'Work messages' },
  { id: 'presentations', label: 'Presentations' },
  { id: 'networking', label: 'Networking' },
  { id: 'custom', label: 'Something else' },
] as const;

export const contexts = [
  { id: 'meetings', label: 'Meetings & stand-ups' },
  { id: 'slack', label: 'Slack & chat' },
  { id: 'presenting', label: 'Presenting' },
  { id: 'social', label: 'Informal work socials' },
  { id: 'custom', label: 'Something else' },
] as const;

export const styles = [
  { id: 'playful', label: 'Playful' },
  { id: 'dry', label: 'Dry' },
  { id: 'observational', label: 'Observational' },
  { id: 'unsure', label: 'Not sure yet' },
  { id: 'custom', label: 'Something else' },
] as const;

export type GoalId = (typeof goals)[number]['id'];
export type ContextId = (typeof contexts)[number]['id'];
export type StyleId = (typeof styles)[number]['id'];

export type ScreeningAnswers = {
  goal: GoalId;
  customGoal?: string;
  context: ContextId;
  customContext?: string;
  style: StyleId;
  customStyle?: string;
  ease: number;
  additionalDetails?: string;
  diagnostic: string;
};

export type LearningPlan = {
  title: string;
  focus: string;
  startingTechnique: 'Misdirection' | 'Rule of Three' | 'Exaggeration';
  contextLabel: string;
  pace: string;
  reason: string;
  firstLesson: string;
};

const labelFor = <T extends readonly { id: string; label: string }[]>(
  options: T,
  id: string,
) => options.find((option) => option.id === id)?.label ?? id;

export function createLearningPlan(answers: ScreeningAnswers): LearningPlan {
  const isLowEase = answers.ease <= 2;
  const isLongAnswer = answers.diagnostic.trim().split(/\s+/).length > 22;
  const contextLabel = answers.context === 'custom'
    ? answers.customContext?.trim() || 'Your chosen setting'
    : labelFor(contexts, answers.context);

  if (answers.goal === 'presentations' || answers.context === 'presenting') {
    return {
      title: 'Confident presenter',
      focus: 'Clear setups and memorable turns',
      startingTechnique: 'Rule of Three',
      contextLabel,
      pace: '5 minutes a day',
      reason: isLowEase
        ? 'You want to present with more ease, so we will begin with a reliable structure before adding bigger surprises.'
        : 'Your presentation goal benefits from a repeatable structure that builds rhythm and confidence.',
      firstLesson: 'Build rhythm with three beats',
    };
  }

  if (answers.goal === 'messaging' || answers.context === 'slack' || isLongAnswer) {
    return {
      title: 'Quick workplace wit',
      focus: 'Brevity and light surprise',
      startingTechnique: 'Exaggeration',
      contextLabel,
      pace: 'One short drill a day',
      reason: isLongAnswer
        ? 'Your idea has personality. We will practise reaching the funny turn with fewer words.'
        : 'You chose workplace messaging, where concise, low-risk humour usually works best.',
      firstLesson: 'Make a small thing comically big',
    };
  }

  return {
    title: 'Easy conversational humour',
    focus: isLowEase ? 'Comfort and low-risk practice' : 'Surprise and conversational timing',
    startingTechnique: 'Misdirection',
    contextLabel,
    pace: '5 minutes a day',
    reason: answers.goal === 'custom' && answers.customGoal?.trim()
      ? `You want humour to help with ${answers.customGoal.trim().toLowerCase()}, so we will begin with flexible exercises and adapt from your attempts.`
      : isLowEase
        ? 'We will start with gentle, repeatable prompts so using humour feels comfortable before it feels clever.'
        : 'Your goals suit short conversational exercises that turn an expected thought in a fresh direction.',
    firstLesson: 'Set an expectation, then turn it',
  };
}
