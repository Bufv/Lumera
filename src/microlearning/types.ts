import type { ReactNode } from 'react';

export const MICRO_LESSON_IDS = [
  'aljabar-pola-yang-tumbuh',
  'aljabar-aturan-di-balik-pola',
  'aljabar-dari-kotak-ke-x',
  'aljabar-cerita-menjadi-aljabar',
  'kalkulus-seberapa-cepat-berubah',
  'kalkulus-semakin-dekat',
  'kalkulus-kecepatan-pada-satu-saat',
  'kalkulus-turunan-adalah-fungsi',
] as const;

export type MicroLessonId = (typeof MICRO_LESSON_IDS)[number];

export const MICRO_LESSON_BEATS = [
  'encounter',
  'explore',
  'predict',
  'manipulate',
  'assess',
  'why',
  'reflect',
  'complete',
] as const;

export type MicroLessonBeat = (typeof MICRO_LESSON_BEATS)[number];

export interface ReactiveNumber {
  raw: string;
  value: number | null;
  validity: 'empty' | 'partial' | 'valid' | 'outOfRange';
}

export interface NumericControlDefinition {
  key: string;
  label: string;
  shortLabel: string;
  defaultValue: number;
  min: number;
  max: number;
  step: number;
  helper?: string;
}

export type MicroVisualKind =
  | 'growing-pattern'
  | 'linear-rule'
  | 'balance'
  | 'expression-machine'
  | 'average-rate'
  | 'secant-limit'
  | 'instant-speed'
  | 'quadratic-derivative';

export interface MicroModel {
  kind: MicroVisualKind;
  /** Stable, human-readable fingerprint used by tests and assistive diagnostics. */
  signature: string;
  values: Readonly<Record<string, number>>;
  metrics: Readonly<Record<string, number | string | boolean>>;
}

export interface MicroLessonDefinition {
  id: MicroLessonId;
  number: `1.${1 | 2 | 3 | 4}`;
  course: 'Aljabar' | 'Kalkulus';
  phase: 'Fase D' | 'Fase F';
  title: string;
  eyebrow: string;
  prompt: string;
  invitation: string;
  exploreInstruction: string;
  predictPrompt: string;
  manipulateInstruction: string;
  assessmentPrompt: string;
  whyTitle: string;
  why: string;
  reflectionPrompt: string;
  completionCopy: string;
  controls: readonly NumericControlDefinition[];
  predictionDefault: number;
  answerDefault: number;
  transferDefault: number;
  buildModel: (values: Readonly<Record<string, number>>) => MicroModel;
  expectedAnswer: (model: MicroModel) => number;
  expectedTransfer: (model: MicroModel) => number;
  hints: readonly [string, string, string];
  transferHint: string;
  tolerance?: number;
}

export interface MicroLessonPlayerProps {
  lessonId: MicroLessonId | string;
  lumens: number;
  reducedMotion: boolean;
  onExit: () => void;
  onComplete: (payload: MicroLessonCompletion) => void;
}

export interface MicroLessonCompletion {
  lessonId: MicroLessonId;
  mistakes: number;
  attempts: number;
}

export interface MicroSceneProps {
  lesson: MicroLessonDefinition;
  model: MicroModel;
  prediction: ReactiveNumber;
  answer: ReactiveNumber;
  hintLevel: number;
  reducedMotion: boolean;
  annotation?: ReactNode;
}
