/**
 * Centralized Lesson Plan Template Configuration
 * Future-proof: add new formats and custom templates here.
 * Admin can modify default structure via this file.
 */

export type PeriodType = 'yearly' | 'monthly' | 'weekly' | 'daily';

/** Daily template: 5E stages with editable teacher/student actions and assessment */
export interface DailyStageConfig {
  stage: string;
  method: string;
  teacherActionsPlaceholder: string;
  studentActionsPlaceholder: string;
  assessmentPlaceholder: string;
}

/** Weekly template: Day | Focus | Language Target | Assessment */
export interface WeeklyRowConfig {
  day: string;
  focus: string;
  languageTarget: string;
  assessment: string;
}

/** Monthly template: Phase | Focus | Language Target | Assessment (no Day) */
export interface MonthlyRowConfig {
  phase: string;
  focus: string;
  languageTarget: string;
  assessment: string;
}

/** Yearly template: Section | Focus | Language Target | Assessment (no Day) */
export interface YearlyRowConfig {
  section: string;
  focus: string;
  languageTarget: string;
  assessment: string;
}

// ============ DAILY TEMPLATE ============
export const DAILY_STAGES: DailyStageConfig[] = [
  { stage: 'Engage', method: '5E', teacherActionsPlaceholder: 'Model sentence structure: She has a sister.', studentActionsPlaceholder: 'Repeat sentence and practice in pairs.', assessmentPlaceholder: 'Collect exit sentence writing.' },
  { stage: 'Explore', method: '5E', teacherActionsPlaceholder: 'Guide discovery of pattern through examples.', studentActionsPlaceholder: 'Identify patterns in sample sentences.', assessmentPlaceholder: 'Quick verbal check: Can students explain the rule?' },
  { stage: 'Explain', method: 'Presentation', teacherActionsPlaceholder: 'Present grammar rule with visuals.', studentActionsPlaceholder: 'Take notes and ask clarification questions.', assessmentPlaceholder: 'Concept check questions.' },
  { stage: 'Elaborate', method: 'Practice → Production', teacherActionsPlaceholder: 'Facilitate pair/group practice activities.', studentActionsPlaceholder: 'Produce sentences in context (role play, writing).', assessmentPlaceholder: 'Monitor and note errors for feedback.' },
  { stage: 'Evaluate', method: 'Production Check', teacherActionsPlaceholder: 'Administer exit ticket or mini-quiz.', studentActionsPlaceholder: 'Complete assessment task independently.', assessmentPlaceholder: 'Collect exit sentence writing.' }
];

// ============ WEEKLY TEMPLATE (Day | Focus | Language Target | Assessment) ============
export const WEEKLY_DAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// ============ MONTHLY TEMPLATE (Phase | Focus | Language Target | Assessment) ============
export const MONTHLY_PHASE_LABELS = ['Engage', 'Explore', 'Explain', 'Elaborate', 'Evaluate'];

// ============ YEARLY TEMPLATE (Section | Focus | Language Target | Assessment) ============
export const YEARLY_SECTION_LABELS = ['Desired Results', 'Assessment Evidence', 'Unit Overview'];

// Legacy exports for backward compatibility with Daily and export
export const WEEKLY_DAYS = WEEKLY_DAY_LABELS.map((day) => ({ day, stage: '' }));
export const MONTHLY_PHASES = MONTHLY_PHASE_LABELS.map((phase) => ({ phase }));
export const YEARLY_SECTIONS = YEARLY_SECTION_LABELS.map((label, i) => ({
  key: ['desiredResults', 'assessmentEvidence', 'unitOverviewTable'][i],
  label,
  placeholder: ''
}));

// ============ PLACEHOLDERS ============
export const PLACEHOLDERS = {
  daily: {
    objective: 'Students will be able to use [target structure] in context.',
    materials: 'Textbook p.42, flashcards, handouts',
    notes: 'Optional notes for this lesson.'
  },
  weekly: {
    focus: 'Unit theme and main objectives',
    languageTarget: 'Grammar/vocabulary focus for the week',
    assessment: 'End-of-week assessment description',
    notes: 'Weekly notes'
  },
  monthly: {
    focus: 'Monthly learning focus',
    teacherRole: 'Facilitator, modeler, assessor',
    studentOutcome: 'Expected student outcomes',
    assessment: 'Monthly assessment plan',
    skillMap: 'Vocabulary, grammar, phonics, etc.',
    notes: 'Monthly notes'
  },
  yearly: {
    desiredResults: 'Year-long learning goals',
    assessmentEvidence: 'Key assessments and evidence',
    unitOverviewTable: 'Units and topics overview',
    notes: 'Yearly notes'
  }
} as const;
