import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import {
  MICRO_LESSONS,
  MicroLessonPlayer,
  type MicroLessonCompletion,
  type MicroLessonId,
} from '../../src/microlearning';

const BALANCE_LESSON_ID = 'aljabar-dari-kotak-ke-x';

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
  lessonId: MicroLessonId = 'aljabar-pola-yang-tumbuh',
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

function chooseRightAndContinue() {
  fireEvent.click(screen.getByRole('button', { name: 'Kanan' }));
  fireEvent.click(screen.getByRole('button', { name: 'Lanjut' }));
}

function reachOneSidedRemoval() {
  chooseRightAndContinue();
  const input = screen.getByLabelText('Nilai x pada neraca');
  fireEvent.change(input, { target: { value: '3' } });
  fireEvent.change(input, { target: { value: '4' } });
  fireEvent.click(screen.getByRole('button', { name: 'Lanjut' }));
  fireEvent.change(screen.getByLabelText('Nilai x pada neraca'), { target: { value: '5' } });
  fireEvent.click(screen.getByRole('button', { name: 'Kunci prediksi' }));
}

function reachAssessment() {
  reachOneSidedRemoval();
  fireEvent.click(screen.getByRole('button', { name: 'Singkirkan 1 dari sisi kiri' }));
  fireEvent.click(screen.getByRole('button', { name: 'Pulihkan dan lanjut' }));
  const removePair = screen.getByRole('button', { name: 'Kurangi 1 dari kedua sisi' });
  fireEvent.click(removePair);
  fireEvent.click(removePair);
  fireEvent.click(removePair);
  fireEvent.click(screen.getByRole('button', { name: 'Lanjut' }));
}

describe('MicroLessonPlayer compatibility', () => {
  it('mempertahankan chrome dan jalur tujuh pelajaran lama', () => {
    const { onExit } = mount();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '8');
    expect(screen.getByLabelText('42 Lumens')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Tutup pelajaran' }));
    expect(onExit).toHaveBeenCalledOnce();
  });

  it.each(
    MICRO_LESSONS.filter((lesson) => lesson.id !== BALANCE_LESSON_ID).map(
      (lesson) => [lesson.id, lesson.controls[0]!.label] as const,
    ),
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

describe('Aljabar 1.3 prototype', () => {
  it('memakai stage berbatas dengan tutor luar yang benar-benar bisa diciutkan', () => {
    const { container, onExit } = mountBalance();
    const main = screen.getByRole('main');
    expect(main).toHaveAttribute('data-lesson-id', BALANCE_LESSON_ID);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
    expect(container.querySelector('.micro-stage')).toBeInTheDocument();
    expect(container.querySelector('.micro-lesson__workspace')).not.toHaveClass(
      'micro-lesson__workspace--tutor-open',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Buka Jejak Nalar' }));
    expect(container.querySelector('.micro-lesson__workspace')).toHaveClass(
      'micro-lesson__workspace--tutor-open',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Tutup Jejak Nalar' }));
    expect(container.querySelector('.micro-lesson__workspace')).not.toHaveClass(
      'micro-lesson__workspace--tutor-open',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Tutup pelajaran' }));
    expect(onExit).toHaveBeenCalledOnce();
  });

  it('menjaga langkah observasi dan prediksi tidak tercatat sebagai percobaan', () => {
    mountBalance();
    fireEvent.click(screen.getByRole('button', { name: 'Kiri' }));
    expect(screen.getByRole('main')).toHaveAttribute('data-stage-tone', 'wrong');
    expect(screen.getByRole('button', { name: 'Lanjut' })).toBeDisabled();
    chooseRightAndContinue();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '2');
    expect(
      screen.getByRole('heading', { name: 'Ubah nilai x langsung pada balok.' }),
    ).toHaveFocus();
  });

  it('memperbarui berat dan sudut setiap angka valid serta mempertahankan geometri untuk draft parsial', () => {
    mountBalance();
    chooseRightAndContinue();
    const instrument = screen.getByTestId('balance-instrument');
    const input = screen.getByLabelText('Nilai x pada neraca');

    fireEvent.change(input, { target: { value: '3' } });
    expect(instrument).toHaveAttribute('data-left-weight', '6');
    expect(instrument).toHaveAttribute('data-beam-angle', '4.4');
    fireEvent.change(input, { target: { value: '4' } });
    expect(instrument).toHaveAttribute('data-left-weight', '7');
    expect(instrument).toHaveAttribute('data-beam-angle', '2.2');
    expect(screen.getByRole('button', { name: 'Lanjut' })).toBeEnabled();

    fireEvent.change(input, { target: { value: '-' } });
    expect(instrument).toHaveAttribute('data-left-weight', '7');
    expect(screen.getByText(/Angka “-” belum lengkap/)).toBeInTheDocument();
    expect(instrument.outerHTML).not.toMatch(/NaN|Infinity/);
  });

  it('mendukung drag, tap, dan keyboard untuk menyingkirkan unit', () => {
    mountBalance();
    reachOneSidedRemoval();
    const draggable = screen.getAllByRole('button', {
      name: 'Singkirkan satu unit dari sisi kiri',
    })[0]!;
    fireEvent.pointerDown(draggable, { pointerId: 1, clientX: 100, clientY: 100 });
    fireEvent.pointerMove(draggable, { pointerId: 1, clientX: 100, clientY: 180 });
    fireEvent.pointerUp(window, { pointerId: 1, clientX: 100, clientY: 180 });
    expect(screen.getByText('x + 2 ≠ 8')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Pulihkan dan lanjut' }));
    fireEvent.click(screen.getByRole('button', { name: 'Kurangi 1 dari kedua sisi' }));
    const keyboardUnit = screen.getAllByRole('button', {
      name: 'Kurangi satu unit dari kedua sisi',
    })[0]!;
    fireEvent.keyDown(keyboardUnit, { key: 'ArrowDown' });
    const typedAlternative = screen.getByLabelText('Jumlah pasangan yang disingkirkan');
    fireEvent.change(typedAlternative, { target: { value: '-' } });
    expect(screen.getByTestId('balance-instrument')).toHaveAttribute('data-paired-removed', '2');
    fireEvent.change(typedAlternative, {
      target: { value: '3' },
    });
    expect(screen.getByTestId('balance-instrument')).toHaveAttribute('data-paired-removed', '3');
    expect(screen.getByText(/x = 5/)).toBeInTheDocument();
  });

  it('hanya menilai lewat Periksa, menaikkan hint, menjaga Why di tempat, dan complete tepat sekali', () => {
    const { onComplete } = mountBalance();
    reachAssessment();
    const answer = screen.getByLabelText('Nilai x pada neraca');

    fireEvent.change(answer, { target: { value: '4' } });
    expect(screen.getByRole('main')).toHaveAttribute('data-stage-tone', 'neutral');
    fireEvent.click(screen.getByRole('button', { name: 'Periksa' }));
    expect(screen.getByText(/petunjuk 1 dari 3/)).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveAttribute('data-stage-tone', 'wrong');

    fireEvent.change(answer, { target: { value: '5' } });
    fireEvent.click(screen.getByRole('button', { name: 'Periksa' }));
    expect(screen.getByRole('main')).toHaveAttribute('data-stage-tone', 'correct');
    fireEvent.click(screen.getByRole('button', { name: 'Why?' }));
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '6');
    expect(screen.getByText(/x \+ 3 − 3 = 8 − 3/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Lanjut' }));

    const transfer = screen.getByLabelText('Nilai x pada neraca');
    fireEvent.change(transfer, { target: { value: '5' } });
    fireEvent.click(screen.getByRole('button', { name: 'Periksa' }));
    expect(screen.getByRole('main')).toHaveAttribute('data-stage-tone', 'wrong');
    fireEvent.change(transfer, { target: { value: '6' } });
    fireEvent.click(screen.getByRole('button', { name: 'Periksa' }));
    fireEvent.click(screen.getByRole('button', { name: 'Lanjut' }));
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '8');
    expect(onComplete).not.toHaveBeenCalled();

    const finish = screen.getByRole('button', { name: 'Lanjut' });
    fireEvent.click(finish);
    fireEvent.click(finish);
    expect(onComplete).toHaveBeenCalledOnce();
    expect(onComplete).toHaveBeenCalledWith({
      lessonId: BALANCE_LESSON_ID,
      mistakes: 2,
      attempts: 4,
    });
  });

  it('menjebak fokus drawer mobile, menutup lewat Escape, dan memulihkan trigger', () => {
    vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    mountBalance();
    const trigger = screen.getByRole('button', { name: 'Jejak Nalar' });
    fireEvent.click(trigger);
    const dialog = screen.getByRole('dialog', { name: 'Jejak Nalar' });
    const close = within(dialog).getByRole('button', { name: 'Tutup Jejak Nalar' });
    expect(close).toHaveFocus();
    fireEvent.keyDown(close, { key: 'Tab' });
    expect(close).toHaveFocus();
    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('lulus audit aksesibilitas pada stage, tutor, feedback, dan penjelasan Why', async () => {
    const { container } = mountBalance();
    const audit = () => axe(container, { rules: { 'color-contrast': { enabled: false } } });

    expect((await audit()).violations).toEqual([]);

    fireEvent.click(screen.getByRole('button', { name: 'Buka Jejak Nalar' }));
    expect((await audit()).violations).toEqual([]);
    fireEvent.click(screen.getByRole('button', { name: 'Tutup Jejak Nalar' }));

    reachAssessment();
    const answer = screen.getByLabelText('Nilai x pada neraca');
    fireEvent.change(answer, { target: { value: '4' } });
    fireEvent.click(screen.getByRole('button', { name: 'Periksa' }));
    expect((await audit()).violations).toEqual([]);

    fireEvent.change(answer, { target: { value: '5' } });
    fireEvent.click(screen.getByRole('button', { name: 'Periksa' }));
    fireEvent.click(screen.getByRole('button', { name: 'Why?' }));
    expect((await audit()).violations).toEqual([]);
  });
});
