import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { App } from '../../src/App';
import {
  createDefaultLearnerProfile,
  saveLearnerProfile,
  type LearnerProfile,
} from '../../src/profile';
import { bacaSiswa } from '../../src/progress/store';

/**
 * Spec 004 (defer-lumera-atlas) US1: loop inti (Beranda → Belajar → KursusDetail →
 * LessonShell → progres nyata) HARUS bisa dicapai dan diselesaikan tanpa Lumera
 * Atlas. Sebelum T006-T011, route 'home'/'learn' non-demo masih merender
 * HomeScreen/LearnScreen fixture lama, dan modul diklik hanya memunculkan
 * InfoDrawer "coming soon" — seluruh test di bawah ini harus FAIL pada kondisi itu.
 */

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

describe('Loop inti tanpa Atlas (spec 004, US1)', () => {
  it('menampilkan Beranda (generasi-2) untuk siswa non-demo, bukan HomeScreen fixture lama', async () => {
    saveLearnerProfile(completedProfile());
    await setHash('#/beranda');
    render(<App />);

    expect(await screen.findByRole('heading', { name: 'Refresh harian' })).toBeTruthy();
  });

  it('mode demo tetap memakai HomeScreen lama — tidak ikut disentuh fitur ini', async () => {
    saveLearnerProfile(completedProfile());
    await setHash('#/beranda?mode=demo');
    render(<App />);

    await screen.findByText(/Ardi/i);
    expect(screen.queryByRole('heading', { name: 'Refresh harian' })).toBeNull();
  });

  it('setiap tombol Peta Ilmu (nav + Beranda) nonaktif ("segera hadir") — tidak diam-diam diarahkan ke layar lain', async () => {
    saveLearnerProfile(completedProfile());
    await setHash('#/beranda');
    render(<App />);

    // Nav bar SUDAH punya satu tombol Peta Ilmu disabled sejak sebelum spec 004
    // (StudentShell.tsx). Setelah Beranda dipasang, ekspektasinya BUKAN satu
    // tombol lagi — melainkan seluruh tombol "Peta Ilmu" di layar (nav + Beranda)
    // konsisten nonaktif, tidak ada satu pun yang jadi jalan pintas ke layar lain.
    await screen.findByRole('heading', { name: 'Refresh harian' });
    const petaIlmuButtons = screen.getAllByRole('button', { name: /Peta Ilmu/i });
    expect(petaIlmuButtons.length).toBeGreaterThanOrEqual(1);
    for (const tombol of petaIlmuButtons) {
      expect(tombol).toHaveAttribute('aria-disabled', 'true');
    }
  });

  it('navigasi Beranda -> Belajar -> KursusDetail -> kembali tersambung nyata', async () => {
    saveLearnerProfile(completedProfile());
    await setHash('#/beranda');
    render(<App />);

    fireEvent.click(await screen.findByRole('button', { name: 'Semua jalur' }));
    expect(await screen.findByRole('heading', { name: 'Jalur belajar' })).toBeTruthy();

    fireEvent.click(
      await screen.findByRole('button', { name: /Buka kursus Kemiringan dan Garis Lurus/i }),
    );
    expect(await screen.findByRole('heading', { name: 'Kemiringan dan Garis Lurus' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /Matematika Dasar|Jalur belajar/i }));
    expect(await screen.findByRole('heading', { name: 'Jalur belajar' })).toBeTruthy();
  });

  it('menyelesaikan satu pelajaran penuh dari Beranda memperbarui Lumens nyata (bukan fixture)', async () => {
    saveLearnerProfile(completedProfile());
    await setHash('#/beranda');
    render(<App />);

    const lumensAwal = bacaSiswa().lumens;

    fireEvent.click(await screen.findByRole('button', { name: /Membaca Kemiringan Grafik/i }));

    // Langkah 1: Prompt — LessonShell tampil, BUKAN InfoDrawer "coming soon".
    expect(
      await screen.findByRole('progressbar', { name: /Langkah 1 dari 7/i }),
    ).toBeTruthy();
    expect(screen.queryByText(/hadir pada batch berikutnya/i)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Mulai' }));

    // Langkah 2: Model visual
    fireEvent.click(await screen.findByRole('button', { name: 'Saya siap menjawab' }));

    // Langkah 3: Aksi pengguna
    fireEvent.change(await screen.findByLabelText(/Berapa kemiringan garis ini/i), {
      target: { value: '2' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Periksa' }));

    // Langkah 4 (umpan balik instan) -> Langkah 5 ("Kenapa?")
    fireEvent.click(await screen.findByRole('button', { name: 'Kenapa begitu?' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Lanjut' }));

    // Langkah 6 (Refleksi) -> Langkah 7 (Lanjutkan)
    fireEvent.click(await screen.findByRole('button', { name: 'Selesai' }));
    expect(await screen.findByText('Pelajaran selesai.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Lanjutkan' }));

    // Kembali ke Beranda, progres nyata (bukan state komponen) sudah bertambah.
    await waitFor(() => expect(bacaSiswa().lumens).toBeGreaterThan(lumensAwal));
    expect(await screen.findByRole('heading', { name: 'Refresh harian' })).toBeTruthy();
  });
});
