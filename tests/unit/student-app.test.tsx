import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { App } from '../../src/App';
import {
  createDefaultLearnerProfile,
  saveLearnerProfile,
  type LearnerProfile,
} from '../../src/profile';

function completedProfile(): LearnerProfile {
  return {
    ...createDefaultLearnerProfile(),
    displayName: 'Nadia',
    goal: 'support-school' as const,
    studyDays: ['monday', 'wednesday', 'friday'],
    onboardingStep: 'complete' as const,
    onboardingComplete: true,
  };
}

async function setHash(hash: string) {
  await act(async () => {
    window.location.hash = hash;
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  });
}

beforeEach(() => {
  localStorage.clear();
  window.location.hash = '#/mulai';
});

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe('Lumera Batch 1 student shell', () => {
  it.each([
    ['#/mulai', 'Mulai dari yang penting. Pahami sampai masuk akal.'],
    ['#/mulai/profil', 'Kami boleh memanggilmu siapa?'],
    ['#/mulai/tujuan', 'Apa yang paling ingin kamu capai?'],
    ['#/mulai/pelajaran', 'Mulai dengan Matematika'],
    ['#/mulai/ritme', 'Buat target yang masuk akal'],
    ['#/mulai/rencana', 'langkah pertamamu sudah jelas.'],
  ])('renders onboarding route %s', async (hash, heading) => {
    await setHash(hash);
    render(<App />);
    expect(screen.getByRole('heading', { name: new RegExp(heading, 'i') })).toBeTruthy();
  });

  it('keeps the wordmark text-only and Atlas locked', async () => {
    saveLearnerProfile(completedProfile());
    await setHash('#/beranda');
    render(<App />);

    const wordmark = screen.getByRole('button', { name: 'Lumera — ke Beranda' });
    expect(wordmark.querySelector('img, svg')).toBeNull();
    expect(screen.getByRole('button', { name: /Atlas/i })).toHaveAttribute('aria-disabled', 'true');
    expect(screen.queryByLabelText(/notifikasi/i)).toBeNull();
    expect(document.querySelector('.student-streak')).toBeNull();
  });

  it('shows the Ardi fixture only with a persistent disclosure', async () => {
    await setHash('#/beranda?mode=demo');
    render(<App />);

    expect(screen.getByRole('status')).toHaveTextContent('Mode demo · Data ilustratif');
    expect(screen.getByRole('heading', { name: 'Selamat malam, Ardi' })).toBeTruthy();
    expect(screen.getAllByText('45%').length).toBeGreaterThan(0);
  });

  it('keeps Home focused on exactly one next action and one honest rhythm panel', async () => {
    saveLearnerProfile(completedProfile());
    await setHash('#/beranda');
    render(<App />);

    const overview = document.querySelector('.home-overview');
    expect(overview?.children).toHaveLength(2);
    expect(screen.getByRole('heading', { name: 'Menjelajahi Bilangan Negatif' })).toBeTruthy();
    expect(screen.getByText('Membandingkan Bilangan Negatif').querySelector('i')).toBeNull();
    expect(screen.getByText('Siap dimulai')).toBeTruthy();
    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(document.querySelector('.refresh-panel')).toBeNull();
    expect(document.querySelector('.recommendation-panel')).toBeNull();
    expect(document.querySelector('.week-streak')).toBeNull();
    expect(document.querySelector('.student-streak')).toBeNull();
    expect(document.querySelector('[data-icon="flame"]')).toBeNull();
    expect(screen.queryByText(/\/\s*5/)).toBeNull();
  });

  it('presents one active Mathematics course and keeps future courses flat', async () => {
    saveLearnerProfile(completedProfile());
    await setHash('#/belajar');
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Satu jalur, langkah demi langkah.' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Lihat jalur kursus Bilangan Bulat' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Pecahan dan Desimal/i })).toBeNull();
    expect(screen.getByLabelText('Pecahan dan Desimal, segera hadir')).toBeTruthy();
    expect(screen.getAllByText('Segera hadir')).toHaveLength(10);

    fireEvent.click(screen.getByRole('button', { name: 'Lihat jalur kursus Bilangan Bulat' }));
    await waitFor(() => expect(window.location.hash).toBe('#/belajar/matematika/bilangan-bulat'));
  });

  it('renders the Mathematics legacy URL as the same focused Belajar page', async () => {
    saveLearnerProfile(completedProfile());
    await setHash('#/belajar/matematika');
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Satu jalur, langkah demi langkah.' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Matematika', level: 1 })).toBeNull();
  });

  it('switches course views through the hash while preserving identical content', async () => {
    saveLearnerProfile(completedProfile());
    await setHash('#/belajar/matematika/bilangan-bulat');
    render(<App />);

    expect(screen.getByRole('button', { name: 'Jalur' })).toHaveAttribute('aria-pressed', 'true');
    expect(document.querySelector('[data-view="roadmap"]')).not.toBeNull();
    expect(document.querySelectorAll('.course-module-outcomes li')).toHaveLength(6);

    fireEvent.click(screen.getByRole('button', { name: 'Daftar' }));
    await waitFor(() =>
      expect(window.location.hash).toBe('#/belajar/matematika/bilangan-bulat?view=list'),
    );
    expect(screen.getByRole('button', { name: 'Daftar' })).toHaveAttribute('aria-pressed', 'true');
    expect(document.querySelector('[data-view="list"]')).not.toBeNull();
    expect(document.querySelectorAll('.course-module-outcomes li')).toHaveLength(6);

    await setHash('#/belajar/matematika/bilangan-bulat');
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Jalur' })).toHaveAttribute('aria-pressed', 'true'),
    );
  });

  it('shows deterministic module progress only in the illustrative demo', async () => {
    await setHash('#/belajar/matematika/bilangan-bulat?mode=demo');
    render(<App />);

    expect(screen.getByText('90% selesai')).toBeTruthy();
    expect(screen.getAllByText('Belum dimulai').length).toBeGreaterThan(0);
    expect(screen.queryByRole('button', { name: /^(Mulai|Start|Pelajaran)$/i })).toBeNull();
    expect(screen.queryByText(/XP|kunci|latihan soal/i)).toBeNull();
  });

  it('searches the student catalog without opening unavailable content', async () => {
    saveLearnerProfile(completedProfile());
    await setHash('#/beranda');
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Buka pencarian' }));
    const input = screen.getByRole('searchbox', { name: /Cari mata pelajaran/i });
    fireEvent.change(input, { target: { value: 'IPA' } });
    expect(screen.getByRole('button', { name: /IPA/i })).toBeDisabled();

    fireEvent.change(input, { target: { value: 'Bilangan Bulat' } });
    const dialog = screen.getByRole('dialog', { name: 'Cari di Lumera' });
    const result = within(dialog).getByText('Bilangan Bulat').closest('button')!;
    expect(result).not.toBeDisabled();
    fireEvent.click(result);
    await waitFor(() =>
      expect(window.location.hash).toContain('/belajar/matematika/bilangan-bulat'),
    );
  });

  it('opens module information but never a lesson player', async () => {
    saveLearnerProfile(completedProfile());
    await setHash('#/belajar/matematika/bilangan-bulat');
    render(<App />);

    fireEvent.click(
      screen.getByRole('button', { name: 'Lihat ringkasan modul Bilangan di Bawah Nol' }),
    );
    expect(screen.getByRole('dialog', { name: /Bilangan di Bawah Nol/i })).toBeTruthy();
    expect(screen.getByText(/Pelajaran interaktif untuk modul ini hadir/)).toBeTruthy();
    expect(screen.queryByText(/Langkah 1 dari 7/i)).toBeNull();

    fireEvent.keyDown(window, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('closes transient drawers when browser history changes the route', async () => {
    saveLearnerProfile(completedProfile());
    await setHash('#/belajar/matematika/bilangan-bulat');
    render(<App />);

    fireEvent.click(
      screen.getByRole('button', { name: 'Lihat ringkasan modul Bilangan di Bawah Nol' }),
    );
    expect(screen.getByRole('dialog', { name: /Bilangan di Bawah Nol/i })).toBeTruthy();

    await setHash('#/pengaturan');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.getByRole('heading', { name: 'Atur Lumera sesuai ritmemu.' })).toBeTruthy();
  });

  it('confirms destructive onboarding reset', async () => {
    saveLearnerProfile(completedProfile());
    await setHash('#/pengaturan');
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Ulangi onboarding' }));
    expect(screen.getByRole('alertdialog', { name: 'Ulangi onboarding?' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Ya, ulangi onboarding' }));
    await waitFor(() => expect(window.location.hash).toBe('#/mulai'));
  });
});
