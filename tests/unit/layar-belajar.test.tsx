import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { Belajar } from '../../src/courses/Belajar';
import { KursusDetail } from '../../src/courses/KursusDetail';
import { ambilKursus, jalurUntukKursus } from '../../src/courses/katalog';
import { daftarkanSemuaModul } from '../../src/modules';
import type { CatatanMastery, Siswa } from '../../src/progress/store';

/**
 * Layar Belajar menampilkan pelajaran yang naskahnya belum ditulis sebagai
 * rencana. Tes ini menjaga janji terpenting produk: yang belum ada TIDAK BOLEH
 * pernah muncul sebagai kontrol yang bisa ditekan (anti-goal PRD §14).
 */

beforeAll(() => {
  daftarkanSemuaModul();
});

afterEach(cleanup);

function siswa(patch: Partial<Siswa> = {}): Siswa {
  return {
    id: 'uji',
    lumens: 0,
    streakCount: 0,
    streakLastDate: null,
    mastery: [],
    modulSelesai: [],
    ...patch,
  };
}

function rec(moduleId: string, persen: number): CatatanMastery {
  return { moduleId, masteryPersen: persen, skorTerakhir: [persen], diperbaruiPada: '2026-08-08' };
}

describe('layar Belajar', () => {
  it('merender jalur beserta ubin kursusnya', () => {
    render(<Belajar siswa={siswa()} onBukaKursus={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'Jalur belajar' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Buka kursus Kemiringan dan Garis Lurus' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Buka kursus Pasar dan Harga' })).toBeTruthy();
  });

  it('membuka kursus yang diklik', () => {
    const onBukaKursus = vi.fn();
    render(<Belajar siswa={siswa()} onBukaKursus={onBukaKursus} />);

    fireEvent.click(screen.getByRole('button', { name: 'Buka kursus Gerak dan Perubahannya' }));
    expect(onBukaKursus).toHaveBeenCalledWith('gerak-benda');
  });

  it('menyaring jalur lewat kotak pencarian', () => {
    render(<Belajar siswa={siswa()} onBukaKursus={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/Cari jalur/i), { target: { value: 'gerak' } });

    expect(screen.getByRole('button', { name: 'Buka kursus Gerak dan Perubahannya' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Buka kursus Pasar dan Harga' })).toBeNull();
  });

  it('menyaring menurut jenjang', () => {
    render(<Belajar siswa={siswa()} onBukaKursus={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'SMA' }));

    expect(screen.getByRole('button', { name: 'Buka kursus Pasar dan Harga' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Kemiringan dan Garis Lurus/ })).toBeNull();
  });

  it('memberi tahu saat tidak ada yang cocok, bukan menampilkan daftar kosong', () => {
    render(<Belajar siswa={siswa()} onBukaKursus={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/Cari jalur/i), { target: { value: 'zzzz' } });
    expect(screen.getByText('Belum ada yang cocok')).toBeTruthy();
  });
});

describe('layar Kursus', () => {
  const kursus = ambilKursus('kemiringan-garis')!;
  const jalur = jalurUntukKursus('kemiringan-garis');

  function renderKursus(patch: Partial<Siswa> = {}, onMulai = vi.fn()) {
    render(
      <KursusDetail
        kursus={kursus}
        jalur={jalur}
        siswa={siswa(patch)}
        onMulaiPelajaran={onMulai}
        onKembali={vi.fn()}
      />,
    );
    return onMulai;
  }

  it('merender setiap level beserta pelajarannya', () => {
    renderKursus();

    expect(screen.getByRole('heading', { name: 'Kemiringan dan Garis Lurus' })).toBeTruthy();
    expect(screen.getByText('Membaca Garis')).toBeTruthy();
    expect(screen.getByText('Persamaan Garis')).toBeTruthy();
    expect(screen.getByText('Membaca Kemiringan Grafik')).toBeTruthy();
  });

  it('hanya menjadikan pelajaran yang modulnya terdaftar sebagai tombol', () => {
    renderKursus();

    // math-slope terdaftar → bisa ditekan.
    expect(screen.getByRole('button', { name: /Membaca Kemiringan Grafik/ })).toBeTruthy();

    // Sisanya belum ditulis → tidak boleh jadi tombol sama sekali.
    for (const judul of ['Gradien dari Dua Titik', 'Naik, Turun, dan Datar']) {
      expect(screen.queryByRole('button', { name: new RegExp(judul) })).toBeNull();
      expect(screen.getByText(judul)).toBeTruthy();
    }
  });

  it('menandai pelajaran yang belum ditulis sebagai "Sedang disiapkan"', () => {
    renderKursus();
    expect(screen.getAllByText('Sedang disiapkan').length).toBeGreaterThan(0);
  });

  it('membuka pelajaran saat simpulnya diklik', () => {
    const onMulai = renderKursus();

    fireEvent.click(screen.getByRole('button', { name: /Membaca Kemiringan Grafik/ }));
    expect(onMulai).toHaveBeenCalledWith('math-slope');
  });

  it('menghitung penguasaan hanya dari pelajaran yang tersedia', () => {
    renderKursus({ mastery: [rec('math-slope', 60)] });

    const progres = screen.getByRole('img', { name: /60 persen dikuasai/ });
    expect(progres).toBeTruthy();
    // 60 dari satu pelajaran yang ada — bukan 60 dibagi tujuh pelajaran katalog.
    expect(screen.getByText('60%')).toBeTruthy();
  });

  it('menawarkan CTA lanjutkan yang menunjuk pelajaran nyata', () => {
    const onMulai = renderKursus({ mastery: [rec('math-slope', 40)] });

    const ringkas = screen.getByRole('heading', { name: 'Kemiringan dan Garis Lurus' })
      .parentElement as HTMLElement;
    fireEvent.click(within(ringkas).getByRole('button', { name: /Lanjutkan/ }));
    expect(onMulai).toHaveBeenCalledWith('math-slope');
  });
});
