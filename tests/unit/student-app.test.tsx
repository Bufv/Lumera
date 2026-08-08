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
    expect(document.querySelector('.student-streak')).toHaveTextContent('Mulai');
    expect(document.querySelector('.student-streak')).not.toHaveTextContent('0 hari');
  });

  it('shows the Ardi fixture only with a persistent disclosure', async () => {
    await setHash('#/beranda?mode=demo');
    render(<App />);

    expect(screen.getByRole('status')).toHaveTextContent('Mode demo · Data ilustratif');
    expect(screen.getByRole('heading', { name: 'Selamat malam, Ardi' })).toBeTruthy();
    expect(screen.getAllByText('45%').length).toBeGreaterThan(0);
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
