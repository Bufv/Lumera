import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import {
  MICRO_LESSONS,
  MicroLessonPlayer,
  type MicroLessonCompletion,
  type MicroLessonId,
} from '../../src/microlearning';

const BALANCE_LESSON_ID = 'aljabar-dari-kotak-ke-x';
const GROWING_PATTERN_LESSON_ID = 'aljabar-pola-yang-tumbuh';
const PATTERN_RULE_LESSON_ID = 'aljabar-aturan-di-balik-pola';

beforeEach(() => {
  Object.defineProperty(window, 'PointerEvent', {
    configurable: true,
    value: MouseEvent,
  });
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function mount(
  lessonId: MicroLessonId = 'aljabar-cerita-menjadi-aljabar',
  onComplete = vi.fn<(payload: MicroLessonCompletion) => void>(),
) {
  const onExit = vi.fn();
  const rendered = render(
    <MicroLessonPlayer
      lessonId={lessonId}
      lumens={42}
      reducedMotion
      onExit={onExit}
      onComplete={onComplete}
    />,
  );
  return { ...rendered, onComplete, onExit };
}

function mountBalance(onComplete = vi.fn<(payload: MicroLessonCompletion) => void>()) {
  return mount(BALANCE_LESSON_ID, onComplete);
}

describe('MicroLessonPlayer compatibility', () => {
  it('mempertahankan chrome dan jalur tujuh pelajaran lama', () => {
    const { onExit } = mount('aljabar-cerita-menjadi-aljabar');
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '8');
    expect(screen.getByLabelText('42 Lumens')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Tutup pelajaran' }));
    expect(onExit).toHaveBeenCalledOnce();
  });

  it.each(
    MICRO_LESSONS.filter(
      (lesson) =>
        lesson.id !== BALANCE_LESSON_ID &&
        lesson.id !== GROWING_PATTERN_LESSON_ID &&
        lesson.id !== PATTERN_RULE_LESSON_ID,
    ).map((lesson) => [lesson.id, lesson.controls[0]!.label] as const),
  )('%s tetap memiliki model SVG reaktif yang finite', (lessonId, firstControlLabel) => {
    mount(lessonId);
    fireEvent.click(screen.getByRole('button', { name: 'Mulai bereksperimen' }));
    const scene = screen.getByTestId('micro-scene');
    const before = scene.getAttribute('data-model-signature');
    const control = screen.getByLabelText(firstControlLabel);
    const definition = MICRO_LESSONS.find((lesson) => lesson.id === lessonId)!.controls[0]!;
    fireEvent.change(control, {
      target: { value: String(definition.defaultValue + definition.step) },
    });
    expect(scene.getAttribute('data-model-signature')).not.toBe(before);
    expect(scene.outerHTML).not.toMatch(/NaN|Infinity/);
  });

  it('menangani ID yang tidak terdaftar tanpa crash', () => {
    const onExit = vi.fn();
    render(
      <MicroLessonPlayer
        lessonId="tidak-ada"
        lumens={0}
        reducedMotion={false}
        onExit={onExit}
        onComplete={vi.fn()}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Pelajaran belum tersedia' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Kembali' }));
    expect(onExit).toHaveBeenCalledOnce();
  });
});

describe('Aljabar 1.3 FromBoxToX integration', () => {
  it('merender mode fokus Aljabar 1.3 dengan stepper dan progress bar', () => {
    const { onExit } = mountBalance();
    const main = screen.getByRole('main');
    expect(main).toHaveAttribute('data-lesson-id', BALANCE_LESSON_ID);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
    expect(screen.getByRole('heading', { name: 'Ada nilai yang belum kita tahu' })).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Tutup dan kembali ke kurikulum Aljabar'));
    expect(onExit).toHaveBeenCalledOnce();
  });

  it('lulus audit aksesibilitas pada layar utama', async () => {
    const { container } = mountBalance();
    const results = await axe(container, { rules: { 'color-contrast': { enabled: false } } });
    expect(results.violations).toEqual([]);
  });
});
