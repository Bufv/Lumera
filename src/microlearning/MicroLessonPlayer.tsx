import { useMemo, useRef, useState } from 'react';
import { AlgebraBalanceLesson } from './AlgebraBalanceLesson';
import { getMicroLesson } from './lessons';
import {
  formatNumber,
  isCorrectNumber,
  parseReactiveNumber,
  reactiveNumberMessage,
} from './numeric';
import { MicroScene } from './MicroScenes';
import {
  MICRO_LESSON_BEATS,
  type MicroLessonDefinition,
  type MicroLessonPlayerProps,
  type NumericControlDefinition,
  type ReactiveNumber,
} from './types';
import './microlearning.css';

const EMPTY_NUMBER: ReactiveNumber = { raw: '', value: null, validity: 'empty' };

function NumericControl({
  definition,
  draft,
  modelValue,
  onChange,
}: {
  definition: NumericControlDefinition;
  draft: ReactiveNumber;
  modelValue: number;
  onChange: (raw: string) => void;
}) {
  const messageId = `micro-control-${definition.key}-message`;
  const invalid = draft.validity === 'outOfRange';
  const nudge = (direction: -1 | 1) => {
    const next = Math.min(
      definition.max,
      Math.max(definition.min, modelValue + direction * definition.step),
    );
    onChange(formatNumber(Number(next.toFixed(10)), 10));
  };
  return (
    <div className="micro-control">
      <div className="micro-control__heading">
        <label htmlFor={`micro-control-${definition.key}`}>{definition.label}</label>
        <span aria-hidden="true">{definition.shortLabel}</span>
      </div>
      <div className="micro-control__inputs">
        <input
          id={`micro-control-${definition.key}`}
          className="micro-control__number"
          type="text"
          inputMode="decimal"
          value={draft.raw}
          aria-describedby={messageId}
          aria-invalid={invalid}
          onChange={(event) => onChange(event.target.value)}
        />
        <div className="micro-control__scrubber">
          <button
            type="button"
            onClick={() => nudge(-1)}
            disabled={modelValue <= definition.min}
            aria-label={`Kurangi ${definition.label}`}
          >
            −
          </button>
          <input
            className="micro-control__range"
            type="range"
            min={definition.min}
            max={definition.max}
            step={definition.step}
            value={modelValue}
            aria-label={`Geser ${definition.label}`}
            onChange={(event) => onChange(event.target.value)}
          />
          <button
            type="button"
            onClick={() => nudge(1)}
            disabled={modelValue >= definition.max}
            aria-label={`Tambah ${definition.label}`}
          >
            +
          </button>
        </div>
      </div>
      <p
        id={messageId}
        className={`micro-control__message micro-control__message--${draft.validity}`}
      >
        {reactiveNumberMessage(draft, definition.min, definition.max)}
      </p>
    </div>
  );
}

function NumberEntry({
  id,
  label,
  prompt,
  value,
  placeholder,
  onChange,
  onSubmit,
  submitLabel = 'Periksa',
  disabled = false,
}: {
  id: string;
  label: string;
  prompt: string;
  value: ReactiveNumber;
  placeholder: number;
  onChange: (next: ReactiveNumber) => void;
  onSubmit: () => void;
  submitLabel?: string;
  disabled?: boolean;
}) {
  const message =
    value.validity === 'valid'
      ? `Model kini membaca ${formatNumber(value.value ?? 0)}.`
      : value.validity === 'outOfRange'
        ? 'Angka berada di luar rentang yang dapat ditampilkan.'
        : value.validity === 'partial'
          ? 'Teruskan mengetik. Model menandai angka ini sebagai belum lengkap.'
          : 'Model akan merespons begitu kamu mulai mengetik.';
  return (
    <form
      className="micro-entry"
      onSubmit={(event) => {
        event.preventDefault();
        if (!disabled && value.validity === 'valid') onSubmit();
      }}
    >
      <div className="micro-entry__copy">
        <label htmlFor={id}>{label}</label>
        <p>{prompt}</p>
      </div>
      <div className="micro-entry__row">
        <div className="micro-entry__field-wrap">
          <input
            id={id}
            className="micro-entry__field"
            type="text"
            inputMode="decimal"
            value={value.raw}
            placeholder={`mis. ${formatNumber(placeholder)}`}
            disabled={disabled}
            aria-describedby={`${id}-message`}
            aria-invalid={value.validity === 'outOfRange'}
            onChange={(event) => onChange(parseReactiveNumber(event.target.value, -9999, 9999))}
          />
          <span aria-hidden="true">↗</span>
        </div>
        <button
          className="micro-button micro-button--primary"
          type="submit"
          disabled={disabled || value.validity !== 'valid'}
        >
          {submitLabel}
        </button>
      </div>
      <p
        id={`${id}-message`}
        className={`micro-entry__message micro-entry__message--${value.validity}`}
        aria-live="polite"
      >
        {message}
      </p>
    </form>
  );
}

function Controls({
  lesson,
  drafts,
  values,
  onChange,
}: {
  lesson: MicroLessonDefinition;
  drafts: Readonly<Record<string, ReactiveNumber>>;
  values: Readonly<Record<string, number>>;
  onChange: (definition: NumericControlDefinition, raw: string) => void;
}) {
  return (
    <section className="micro-controls" aria-label="Kendali model">
      {lesson.controls.map((definition) => (
        <NumericControl
          key={definition.key}
          definition={definition}
          draft={drafts[definition.key] ?? EMPTY_NUMBER}
          modelValue={values[definition.key] ?? definition.defaultValue}
          onChange={(raw) => onChange(definition, raw)}
        />
      ))}
    </section>
  );
}

function UnknownLesson({ onExit }: Pick<MicroLessonPlayerProps, 'onExit'>) {
  return (
    <main className="micro-lesson micro-lesson--unknown">
      <div className="micro-unknown">
        <span aria-hidden="true">◇</span>
        <h1>Pelajaran belum tersedia</h1>
        <p>ID pelajaran ini tidak terdaftar pada mesin micro-learning Lumera.</p>
        <button className="micro-button micro-button--primary" type="button" onClick={onExit}>
          Kembali
        </button>
      </div>
    </main>
  );
}

function MicroLessonSession({
  lesson,
  lumens,
  reducedMotion,
  onExit,
  onComplete,
}: Omit<MicroLessonPlayerProps, 'lessonId'> & { lesson: MicroLessonDefinition }) {
  const initialValues = useMemo(
    () => Object.fromEntries(lesson.controls.map((control) => [control.key, control.defaultValue])),
    [lesson],
  );
  const [modelValues, setModelValues] = useState<Readonly<Record<string, number>>>(initialValues);
  const [drafts, setDrafts] = useState<Readonly<Record<string, ReactiveNumber>>>(() =>
    Object.fromEntries(
      lesson.controls.map((control) => [
        control.key,
        parseReactiveNumber(String(control.defaultValue), control.min, control.max),
      ]),
    ),
  );
  const [beatIndex, setBeatIndex] = useState(0);
  const [prediction, setPrediction] = useState<ReactiveNumber>(EMPTY_NUMBER);
  const [answer, setAnswer] = useState<ReactiveNumber>(EMPTY_NUMBER);
  const [transfer, setTransfer] = useState<ReactiveNumber>(EMPTY_NUMBER);
  const [assessmentState, setAssessmentState] = useState<'idle' | 'wrong' | 'correct'>('idle');
  const [transferState, setTransferState] = useState<'idle' | 'wrong' | 'correct'>('idle');
  const [hintLevel, setHintLevel] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const completedRef = useRef(false);

  const beat = MICRO_LESSON_BEATS[beatIndex] ?? 'encounter';
  const model = useMemo(() => lesson.buildModel(modelValues), [lesson, modelValues]);
  const progress = ((beatIndex + 1) / MICRO_LESSON_BEATS.length) * 100;

  const updateControl = (definition: NumericControlDefinition, raw: string) => {
    const parsed = parseReactiveNumber(raw, definition.min, definition.max);
    setDrafts((current) => ({ ...current, [definition.key]: parsed }));
    if (parsed.validity === 'valid' && parsed.value !== null) {
      setModelValues((current) => ({ ...current, [definition.key]: parsed.value as number }));
      setAssessmentState('idle');
      setTransferState('idle');
    }
  };

  const goTo = (next: number) => setBeatIndex(clampIndex(next));

  const checkAssessment = () => {
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    if (isCorrectNumber(answer, lesson.expectedAnswer(model), lesson.tolerance)) {
      setAssessmentState('correct');
      return;
    }
    setAssessmentState('wrong');
    setMistakes((current) => current + 1);
    setHintLevel((current) => Math.min(3, current + 1));
  };

  const checkTransfer = () => {
    setAttempts((current) => current + 1);
    if (isCorrectNumber(transfer, lesson.expectedTransfer(model), lesson.tolerance)) {
      setTransferState('correct');
      return;
    }
    setTransferState('wrong');
    setMistakes((current) => current + 1);
  };

  const finish = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete({ lessonId: lesson.id, mistakes, attempts });
  };

  const sceneAnswer = beat === 'reflect' ? transfer : answer;
  const scene = (
    <MicroScene
      lesson={lesson}
      model={model}
      prediction={prediction}
      answer={sceneAnswer}
      hintLevel={hintLevel}
      reducedMotion={reducedMotion}
    />
  );

  let content: React.ReactNode;
  let footer: React.ReactNode = null;

  switch (beat) {
    case 'encounter':
      content = (
        <div className="micro-encounter">
          <div className="micro-encounter__copy">
            <span className="micro-kicker">{lesson.eyebrow}</span>
            <h1>{lesson.prompt}</h1>
            <p>{lesson.invitation}</p>
          </div>
          <div className="micro-encounter__scene" aria-hidden="true">
            {scene}
          </div>
        </div>
      );
      footer = (
        <button
          className="micro-button micro-button--primary"
          type="button"
          onClick={() => goTo(1)}
        >
          Mulai bereksperimen
        </button>
      );
      break;
    case 'explore':
      content = (
        <div className="micro-workspace">
          <div className="micro-workspace__heading">
            <span>Eksplorasi</span>
            <h1>{lesson.exploreInstruction}</h1>
          </div>
          <div className="micro-workspace__grid">
            <div>{scene}</div>
            <Controls
              lesson={lesson}
              drafts={drafts}
              values={modelValues}
              onChange={updateControl}
            />
          </div>
        </div>
      );
      footer = (
        <button
          className="micro-button micro-button--primary"
          type="button"
          onClick={() => goTo(2)}
        >
          Buat prediksi
        </button>
      );
      break;
    case 'predict':
      content = (
        <div className="micro-workspace">
          <div className="micro-workspace__heading">
            <span>Prediksi</span>
            <h1>{lesson.predictPrompt}</h1>
          </div>
          {scene}
          <NumberEntry
            id="micro-prediction"
            label="Prediksimu"
            prompt="Tidak dinilai. Gunakan intuisi sebelum menghitung."
            value={prediction}
            placeholder={lesson.predictionDefault}
            onChange={setPrediction}
            onSubmit={() => goTo(3)}
            submitLabel="Kunci prediksi"
          />
        </div>
      );
      break;
    case 'manipulate':
      content = (
        <div className="micro-workspace">
          <div className="micro-workspace__heading">
            <span>Manipulasi</span>
            <h1>{lesson.manipulateInstruction}</h1>
          </div>
          <div className="micro-workspace__grid">
            <div>{scene}</div>
            <Controls
              lesson={lesson}
              drafts={drafts}
              values={modelValues}
              onChange={updateControl}
            />
          </div>
        </div>
      );
      footer = (
        <button
          className="micro-button micro-button--primary"
          type="button"
          onClick={() => goTo(4)}
        >
          Saya siap memeriksa
        </button>
      );
      break;
    case 'assess':
      content = (
        <div className="micro-workspace">
          <div className="micro-workspace__heading">
            <span>Uji pemahaman</span>
            <h1>{lesson.assessmentPrompt}</h1>
          </div>
          {scene}
          <NumberEntry
            id="micro-answer"
            label="Jawabanmu"
            prompt="Mengetik mengubah penanda pada model; percobaan baru dihitung saat Periksa ditekan."
            value={answer}
            placeholder={lesson.answerDefault}
            onChange={(next) => {
              setAnswer(next);
              if (assessmentState !== 'correct') setAssessmentState('idle');
            }}
            onSubmit={checkAssessment}
            disabled={assessmentState === 'correct'}
          />
          {assessmentState === 'wrong' ? (
            <div className="micro-feedback micro-feedback--wrong" role="status">
              <strong>Belum tepat—model tetap terbuka.</strong>
              <p>{lesson.hints[Math.max(0, hintLevel - 1)]}</p>
              <span>Petunjuk {hintLevel} dari 3 · percobaan tidak dibatasi</span>
            </div>
          ) : null}
          {assessmentState === 'correct' ? (
            <div className="micro-feedback micro-feedback--correct" role="status">
              <strong>Tepat.</strong>
              <p>Nilaimu konsisten dengan seluruh representasi pada layar.</p>
            </div>
          ) : null}
        </div>
      );
      footer =
        assessmentState === 'correct' ? (
          <button
            className="micro-button micro-button--primary"
            type="button"
            onClick={() => goTo(5)}
          >
            Kenapa begitu?
          </button>
        ) : null;
      break;
    case 'why':
      content = (
        <div className="micro-why">
          <div className="micro-workspace__heading">
            <span>Kenapa?</span>
            <h1>{lesson.whyTitle}</h1>
          </div>
          <div className="micro-why__grid">
            {scene}
            <article>
              <span aria-hidden="true">✦</span>
              <p>{lesson.why}</p>
              <div className="micro-why__formula">
                Jawaban model: {formatNumber(lesson.expectedAnswer(model))}
              </div>
            </article>
          </div>
        </div>
      );
      footer = (
        <button
          className="micro-button micro-button--primary"
          type="button"
          onClick={() => goTo(6)}
        >
          Coba pada situasi baru
        </button>
      );
      break;
    case 'reflect':
      content = (
        <div className="micro-workspace">
          <div className="micro-workspace__heading">
            <span>Transfer</span>
            <h1>{lesson.reflectionPrompt}</h1>
          </div>
          {scene}
          <NumberEntry
            id="micro-transfer"
            label="Jawaban baru"
            prompt="Gunakan hubungan yang kamu temukan, bukan sekadar mengingat angka sebelumnya."
            value={transfer}
            placeholder={lesson.transferDefault}
            onChange={(next) => {
              setTransfer(next);
              if (transferState !== 'correct') setTransferState('idle');
            }}
            onSubmit={checkTransfer}
            disabled={transferState === 'correct'}
          />
          {transferState === 'wrong' ? (
            <div className="micro-feedback micro-feedback--wrong" role="status">
              <strong>Hubungannya sudah dekat.</strong>
              <p>{lesson.transferHint}</p>
            </div>
          ) : null}
          {transferState === 'correct' ? (
            <div className="micro-feedback micro-feedback--correct" role="status">
              <strong>Berhasil ditransfer.</strong>
              <p>Kamu memakai ide yang sama pada kondisi yang berbeda.</p>
            </div>
          ) : null}
        </div>
      );
      footer =
        transferState === 'correct' ? (
          <button
            className="micro-button micro-button--primary"
            type="button"
            onClick={() => goTo(7)}
          >
            Selesaikan pelajaran
          </button>
        ) : null;
      break;
    case 'complete':
      content = (
        <div className="micro-complete">
          <div className="micro-complete__orbit" aria-hidden="true">
            <i />
            <i />
            <i />
            <span>✓</span>
          </div>
          <span className="micro-kicker">Pelajaran {lesson.number} selesai</span>
          <h1>{lesson.title}</h1>
          <p>{lesson.completionCopy}</p>
          <div className="micro-complete__stats">
            <div>
              <strong>{attempts}</strong>
              <span>percobaan</span>
            </div>
            <div>
              <strong>{mistakes}</strong>
              <span>kesalahan</span>
            </div>
            <div>
              <strong>{lumens}</strong>
              <span>Lumens saat ini</span>
            </div>
          </div>
        </div>
      );
      footer = (
        <button className="micro-button micro-button--primary" type="button" onClick={finish}>
          Lanjutkan
        </button>
      );
      break;
  }

  return (
    <main
      className="micro-lesson"
      data-beat={beat}
      data-lesson-id={lesson.id}
      data-reduced-motion={reducedMotion ? 'true' : 'false'}
    >
      <header className="micro-lesson__header">
        <button
          className="micro-icon-button"
          type="button"
          onClick={onExit}
          aria-label="Tutup pelajaran"
        >
          ×
        </button>
        <div
          className="micro-progress"
          role="progressbar"
          aria-label={`Bagian ${beatIndex + 1} dari 8`}
          aria-valuemin={1}
          aria-valuemax={8}
          aria-valuenow={beatIndex + 1}
        >
          <div className="micro-progress__track">
            <span style={{ width: `${progress}%` }} />
          </div>
          <span>{beatIndex + 1}/8</span>
        </div>
        <div className="micro-lumens" aria-label={`${lumens} Lumens`}>
          <span aria-hidden="true">✦</span>
          {lumens}
        </div>
      </header>
      <section className="micro-lesson__content">{content}</section>
      {footer ? (
        <footer className="micro-lesson__footer">
          <div>{footer}</div>
        </footer>
      ) : null}
    </main>
  );
}

function clampIndex(index: number): number {
  return Math.min(MICRO_LESSON_BEATS.length - 1, Math.max(0, index));
}

export function MicroLessonPlayer(props: MicroLessonPlayerProps) {
  const lesson = getMicroLesson(props.lessonId);
  if (!lesson) return <UnknownLesson onExit={props.onExit} />;
  if (lesson.id === 'aljabar-dari-kotak-ke-x') {
    return (
      <AlgebraBalanceLesson
        key={lesson.id}
        lesson={lesson}
        lumens={props.lumens}
        reducedMotion={props.reducedMotion}
        onExit={props.onExit}
        onComplete={props.onComplete}
      />
    );
  }
  return (
    <MicroLessonSession
      key={lesson.id}
      lesson={lesson}
      lumens={props.lumens}
      reducedMotion={props.reducedMotion}
      onExit={props.onExit}
      onComplete={props.onComplete}
    />
  );
}
