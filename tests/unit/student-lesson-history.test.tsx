import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '../../src/App';
import { getMicroLesson } from '../../src/microlearning';
import { createDefaultLearnerProfile, saveLearnerProfile } from '../../src/profile';
import { DEMO_PROGRESS_STORAGE_KEY } from '../../src/progress/demoStore';

const ALGEBRA_LIST_HASH = '#/belajar/matematika/aljabar?mode=demo&view=list';
const ALGEBRA_COURSE_HASH = '#/belajar/matematika/aljabar?mode=demo';
const FIRST_LESSON_HASH = '#/belajar/matematika/aljabar/pola-yang-tumbuh?mode=demo';
const REAL_PROGRESS_STORAGE_KEY = 'lumera.progress.v1';

async function replaceHash(hash: string) {
  await act(async () => {
    window.history.replaceState(null, '', hash);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  });
}

function completedProfile() {
  return {
    ...createDefaultLearnerProfile(),
    displayName: 'Nadia',
    onboardingStep: 'complete' as const,
    onboardingComplete: true,
  };
}

async function openFirstLesson() {
  fireEvent.click(screen.getByRole('button', { name: /1\.1 Pola yang Tumbuh/i }));
  const dialog = screen.getByRole('dialog', { name: 'Pola yang Tumbuh' });
  fireEvent.click(within(dialog).getByRole('button', { name: 'Mulai pelajaran' }));
  await waitFor(() => expect(window.location.hash).toBe(FIRST_LESSON_HASH));
  expect(screen.getByRole('button', { name: 'Tutup pelajaran' })).toBeTruthy();
}

function finishFirstLesson() {
  const lesson = getMicroLesson('aljabar-pola-yang-tumbuh')!;
  const values = Object.fromEntries(
    lesson.controls.map((control) => [control.key, control.defaultValue]),
  );
  const model = lesson.buildModel(values);

  fireEvent.click(screen.getByRole('button', { name: 'Mulai bereksperimen' }));
  fireEvent.click(screen.getByRole('button', { name: 'Buat prediksi' }));
  fireEvent.change(screen.getByLabelText('Prediksimu'), {
    target: { value: String(lesson.predictionDefault) },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Kunci prediksi' }));
  fireEvent.click(screen.getByRole('button', { name: 'Saya siap memeriksa' }));
  fireEvent.change(screen.getByLabelText('Jawabanmu'), {
    target: { value: String(lesson.expectedAnswer(model)) },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Periksa' }));
  fireEvent.click(screen.getByRole('button', { name: 'Kenapa begitu?' }));
  fireEvent.click(screen.getByRole('button', { name: 'Coba pada situasi baru' }));
  fireEvent.change(screen.getByLabelText('Jawaban baru'), {
    target: { value: String(lesson.expectedTransfer(model)) },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Periksa' }));
  fireEvent.click(screen.getByRole('button', { name: 'Selesaikan pelajaran' }));
  fireEvent.click(screen.getByRole('button', { name: 'Lanjutkan' }));
}

beforeEach(async () => {
  localStorage.clear();
  saveLearnerProfile(completedProfile());
  await replaceHash(ALGEBRA_LIST_HASH);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  localStorage.clear();
});

describe('student lesson history', () => {
  it('closes an unfinished lesson through browser back to the exact list/demo origin', async () => {
    render(<App />);
    await openFirstLesson();

    expect(window.history.state).toMatchObject({
      lumeraLessonReturnHash: ALGEBRA_LIST_HASH,
    });
    const progressBeforeExit = localStorage.getItem(DEMO_PROGRESS_STORAGE_KEY);
    const back = vi.spyOn(window.history, 'back').mockImplementation(() => {
      window.history.replaceState(null, '', ALGEBRA_LIST_HASH);
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });

    fireEvent.click(screen.getByRole('button', { name: 'Tutup pelajaran' }));

    await waitFor(() => expect(window.location.hash).toBe(ALGEBRA_LIST_HASH));
    expect(back).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: 'Daftar' })).toHaveAttribute('aria-pressed', 'true');
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /1\.1 Pola yang Tumbuh/i })).toHaveFocus(),
    );
    expect(localStorage.getItem(DEMO_PROGRESS_STORAGE_KEY)).toBe(progressBeforeExit);
  });

  it('replaces a direct lesson deep link with its course fallback', async () => {
    await replaceHash(FIRST_LESSON_HASH);
    const replaceState = vi.spyOn(window.history, 'replaceState');
    const back = vi.spyOn(window.history, 'back');
    render(<App />);
    const progressBeforeExit = localStorage.getItem(DEMO_PROGRESS_STORAGE_KEY);

    fireEvent.click(screen.getByRole('button', { name: 'Tutup pelajaran' }));

    await waitFor(() => expect(window.location.hash).toBe(ALGEBRA_COURSE_HASH));
    expect(back).not.toHaveBeenCalled();
    expect(replaceState).toHaveBeenCalledWith(expect.any(Object), '', ALGEBRA_COURSE_HASH);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /1\.1 Pola yang Tumbuh/i })).toHaveFocus(),
    );
    expect(localStorage.getItem(DEMO_PROGRESS_STORAGE_KEY)).toBe(progressBeforeExit);
  });

  it('replaces the completed lesson entry and focuses the newly unlocked node', async () => {
    render(<App />);
    await openFirstLesson();
    const replaceState = vi.spyOn(window.history, 'replaceState');
    replaceState.mockClear();
    const realProgressBefore = localStorage.getItem(REAL_PROGRESS_STORAGE_KEY);

    finishFirstLesson();

    await waitFor(() => expect(window.location.hash).toBe(ALGEBRA_COURSE_HASH));
    expect(replaceState).toHaveBeenCalledWith(expect.any(Object), '', ALGEBRA_COURSE_HASH);
    expect(window.history.state).not.toHaveProperty('lumeraLessonReturnHash');
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /1\.2 Aturan di Balik Pola/i })).toHaveFocus(),
    );
    const demoProgress = JSON.parse(localStorage.getItem(DEMO_PROGRESS_STORAGE_KEY) ?? '{}') as {
      modulSelesai?: string[];
    };
    expect(demoProgress.modulSelesai).toContain('aljabar-pola-yang-tumbuh');
    expect(localStorage.getItem(REAL_PROGRESS_STORAGE_KEY)).toBe(realProgressBefore);
    expect(screen.getByRole('progressbar', { name: '25% kursus Aljabar selesai' })).toHaveAttribute(
      'aria-valuenow',
      '25',
    );
    expect(window.location.hash).not.toContain('/pola-yang-tumbuh');
  });
});
