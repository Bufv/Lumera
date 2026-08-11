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

  it('keeps the wordmark text-only and header controls honest', async () => {
    saveLearnerProfile(completedProfile());
    await setHash('#/beranda');
    render(<App />);

    const wordmark = screen.getByRole('button', { name: 'Lumera — ke Beranda' });
    expect(wordmark.querySelector('img, svg')).toBeNull();
    const knowledgeMap = screen.getByRole('button', { name: /Peta Ilmu/i });
    expect(knowledgeMap).toHaveAttribute('aria-disabled', 'true');
    expect(knowledgeMap).toBeDisabled();
    expect(document.querySelector('.student-streak')).toHaveTextContent('Mulai');

    const beforeMapClick = window.location.hash;
    fireEvent.click(knowledgeMap);
    expect(window.location.hash).toBe(beforeMapClick);
    expect(screen.queryByText(/Langkah 1 dari 7/i)).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Buka pemberitahuan' }));
    expect(screen.getByRole('dialog', { name: 'Pemberitahuan' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Tutup pemberitahuan' }));
    expect(screen.queryByRole('dialog', { name: 'Pemberitahuan' })).toBeNull();
  });

  it('wires every screenshot metric and section to the explicit Ardi demo', async () => {
    await setHash('#/beranda?mode=demo');
    render(<App />);

    expect(screen.getByRole('status')).toHaveTextContent('Mode demo · Data ilustratif');
    expect(screen.getByRole('heading', { name: 'Selamat malam, Ardi' })).toBeTruthy();
    expect(screen.getAllByText('45%').length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: 'Target hari ini' })).toBeTruthy();
    const targetPanel = document.querySelector('.today-panel');
    expect(targetPanel).toHaveTextContent(/20\s*menit/i);
    expect(targetPanel).toHaveTextContent(/3\s*\/\s*5/);
    expect(screen.getByRole('heading', { name: 'Daily Refresh' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Rekomendasi Lumo' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Baru disimpan' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Jalur belajarmu' })).toBeTruthy();

    const streak = document.querySelector('.student-streak');
    expect(streak).toHaveTextContent('7');
    expect(streak).toHaveTextContent('Hari berturut-turut');

    expect(screen.getByText('Cara Membaca Garis Bilangan')).toBeTruthy();
    expect(screen.getByText('Aturan Membandingkan Bilangan Negatif')).toBeTruthy();
    expect(screen.getByText('Contoh Perubahan Suhu')).toBeTruthy();
    expect(screen.getByText('Positif, Negatif, dan Nol')).toBeTruthy();
    expect(screen.getByText('Garis Bilangan')).toBeTruthy();
    expect(screen.getByText('Nilai Mutlak')).toBeTruthy();
    expect(screen.getByText('Penjumlahan Bilangan Bulat')).toBeTruthy();
    expect(screen.queryByText(/Langkah 1 dari 7/i)).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /Mulai Refresh/i }));
    await waitFor(() => expect(window.location.hash).toBe('#/ulangi?mode=demo'));
    expect(screen.getByText('Membandingkan Bilangan Negatif')).toBeTruthy();
    expect(screen.getByText('Pengurangan Bilangan Bulat')).toBeTruthy();
    expect(screen.queryByText(/Langkah 1 dari 7/i)).toBeNull();
  });

  it('keeps fresh Home values honest and excludes every illustrative concept', async () => {
    saveLearnerProfile(completedProfile());
    await setHash('#/beranda');
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Selamat malam, Nadia' })).toBeTruthy();
    expect(screen.getAllByText('Siap dimulai').length).toBeGreaterThan(0);
    expect(document.querySelector('.today-panel')).toHaveTextContent(/0\s*\/\s*5/);
    expect(document.querySelector('.student-streak')).toHaveTextContent('Mulai');
    expect(screen.queryByText('45%')).toBeNull();
    expect(screen.queryByText('Cara Membaca Garis Bilangan')).toBeNull();
    expect(screen.queryByText('Aturan Membandingkan Bilangan Negatif')).toBeNull();
    expect(screen.queryByText('Contoh Perubahan Suhu')).toBeNull();
    expect(screen.queryByText('Pengurangan Bilangan Bulat')).toBeNull();
  });

  it('presents one active Mathematics course and keeps future courses flat', async () => {
    saveLearnerProfile(completedProfile());
    await setHash('#/belajar');
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Satu jalur, langkah demi langkah.' })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Lihat jalur kursus Bilangan Bulat/ })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Pecahan dan Desimal/i })).toBeNull();
    expect(screen.getByLabelText('Pecahan dan Desimal, segera hadir')).toBeTruthy();
    expect(screen.getAllByText('Segera hadir')).toHaveLength(10);

    fireEvent.click(screen.getByRole('button', { name: /Lihat jalur kursus Bilangan Bulat/ }));
    await waitFor(() => expect(window.location.hash).toBe('#/belajar/matematika/bilangan-bulat'));
  });

  it('filters learning paths and subjects with the local Belajar search', async () => {
    saveLearnerProfile(completedProfile());
    await setHash('#/belajar');
    render(<App />);

    const search = screen.getByRole('searchbox', {
      name: 'Cari jalur, kursus, atau mata pelajaran',
    });
    fireEvent.change(search, { target: { value: 'IPA' } });

    expect(screen.getByText('1 hasil ditemukan')).toBeTruthy();
    expect(screen.getByText('IPA')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Lihat jalur kursus Bilangan Bulat/ })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Hapus pencarian' }));
    expect(screen.getByRole('button', { name: /Lihat jalur kursus Bilangan Bulat/ })).toBeTruthy();
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
    expect(document.querySelectorAll('.course-node')).toHaveLength(7);

    fireEvent.click(screen.getByRole('button', { name: 'Daftar' }));
    await waitFor(() =>
      expect(window.location.hash).toBe('#/belajar/matematika/bilangan-bulat?view=list'),
    );
    expect(screen.getByRole('button', { name: 'Daftar' })).toHaveAttribute('aria-pressed', 'true');
    expect(document.querySelector('[data-view="list"]')).not.toBeNull();
    expect(document.querySelectorAll('.course-row')).toHaveLength(7);

    await setHash('#/belajar/matematika/bilangan-bulat');
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Jalur' })).toHaveAttribute('aria-pressed', 'true'),
    );
  });

  it('shows deterministic module progress only in the illustrative demo', async () => {
    await setHash('#/belajar/matematika/bilangan-bulat?mode=demo&view=list');
    render(<App />);

    const rows = document.querySelectorAll('.course-row');
    expect(rows).toHaveLength(7);
    expect(within(rows[0] as HTMLElement).getByText('Sedang berjalan')).toBeTruthy();
    expect(within(rows[1] as HTMLElement).getByText('Terkunci')).toBeTruthy();
    expect(screen.getAllByText('Segera hadir').length).toBeGreaterThan(0);
    expect(screen.queryByText('Selesai')).toBeNull();
    expect(screen.queryByRole('button', { name: /^(Mulai|Start|Pelajaran)$/i })).toBeNull();
    expect(screen.queryByText(/\bXP\b|\bkunci\b|latihan soal/i)).toBeNull();
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
      screen.getByRole('button', { name: 'Bilangan di Bawah Nol, sedang berjalan' }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Lanjutkan' }));
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
      screen.getByRole('button', { name: 'Bilangan di Bawah Nol, sedang berjalan' }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Lanjutkan' }));
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

  /**
   * FR-020 spec 002: peringatan sebelum penghapusan permanen MUST menyebut
   * bahwa aksi tidak dapat dibatalkan *kecuali progres sudah diekspor* — jalan
   * keluarnya, bukan hanya kengeriannya. Teksnya sudah benar saat test ini
   * ditulis; assertion ini ada supaya tidak diam-diam hilang saat copy diedit.
   */
  it('warns that deleting all data is irreversible unless progress was exported', async () => {
    saveLearnerProfile(completedProfile());
    await setHash('#/pengaturan');
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Hapus semua data saya' }));

    const dialog = screen.getByRole('alertdialog', { name: 'Hapus semua data saya?' });
    expect(dialog.textContent).toMatch(/tidak dapat dibatalkan/i);
    expect(dialog.textContent).toMatch(/ekspor/i);
  });
});
