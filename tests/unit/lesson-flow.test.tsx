import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LessonShell } from '../../src/shell/LessonShell';
import { dummyModule } from '../../src/modules/_dummy';
import { telemetry } from '../../src/telemetry/adapter';
import { bacaSiswa, resetProgres } from '../../src/progress/store';
import type { LessonModule } from '../../src/shell/types';

const modul = dummyModule as unknown as LessonModule<unknown, unknown>;

function pasang(onSelesai = vi.fn(), onKeluar = vi.fn()) {
  render(<LessonShell modul={modul} onKeluar={onKeluar} onSelesai={onSelesai} />);
  return { onSelesai, onKeluar };
}

/** Menggeser slider modul dummy ke nilai tertentu. */
function geserKe(n: number) {
  fireEvent.change(screen.getByLabelText('Nilai uji'), { target: { value: String(n) } });
}

describe('alur 7 langkah LessonShell (Prinsip II)', () => {
  beforeEach(async () => {
    localStorage.clear();
    resetProgres();
    await telemetry.clear();
  });

  it('melewati ketujuh langkah berurutan pada jawaban benar', async () => {
    const { onSelesai } = pasang();

    // 1. Prompt
    expect(screen.getByText(dummyModule.prompt)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Mulai' }));

    // 2. Model visual
    geserKe(5);
    fireEvent.click(screen.getByRole('button', { name: 'Saya siap menjawab' }));

    // 3. Aksi pengguna
    fireEvent.click(screen.getByRole('button', { name: /Kirim/ }));

    // 4. Umpan balik instan
    expect(screen.getByRole('status')).toHaveTextContent('Tepat.');
    fireEvent.click(screen.getByRole('button', { name: 'Kenapa begitu?' }));

    // 5. Penjelasan "Kenapa?" — WAJIB muncul walau jawaban BENAR
    expect(screen.getByRole('heading', { name: 'Kenapa begitu?' })).toBeInTheDocument();
    expect(screen.getByText(/Nilai state modul memang berubah nyata/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Lanjut' }));

    // 6. Refleksi
    expect(screen.getByText(dummyModule.pertanyaanRefleksi)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Selesai' }));

    // 7. Lanjutkan
    expect(screen.getByText('Pelajaran selesai.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Lanjutkan' }));
    expect(onSelesai).toHaveBeenCalledOnce();
  });

  it('menampilkan penjelasan "Kenapa?" juga pada jawaban SALAH, lalu mengizinkan coba lagi', () => {
    pasang();
    fireEvent.click(screen.getByRole('button', { name: 'Mulai' }));
    geserKe(3); // salah
    fireEvent.click(screen.getByRole('button', { name: 'Saya siap menjawab' }));
    fireEvent.click(screen.getByRole('button', { name: /Kirim/ }));

    expect(screen.getByRole('status')).toHaveTextContent('Belum tepat.');
    fireEvent.click(screen.getByRole('button', { name: 'Kenapa begitu?' }));
    expect(screen.getByText(/belum 5/)).toBeInTheDocument();

    // Siswa tidak dikunci keluar (kontrak aturan 3)
    fireEvent.click(screen.getByRole('button', { name: 'Coba lagi' }));
    geserKe(5);
    fireEvent.click(screen.getByRole('button', { name: /Kirim/ }));
    expect(screen.getByRole('status')).toHaveTextContent('Tepat.');
  });

  it('menaikkan nomor percobaan tiap kali menjawab', () => {
    pasang();
    fireEvent.click(screen.getByRole('button', { name: 'Mulai' }));
    fireEvent.click(screen.getByRole('button', { name: 'Saya siap menjawab' }));

    fireEvent.click(screen.getByRole('button', { name: /Kirim/ }));
    expect(screen.getByRole('status')).toHaveTextContent('Percobaan ke-1');

    fireEvent.click(screen.getByRole('button', { name: 'Kenapa begitu?' }));
    fireEvent.click(screen.getByRole('button', { name: 'Coba lagi' }));
    fireEvent.click(screen.getByRole('button', { name: /Kirim/ }));
    expect(screen.getByRole('status')).toHaveTextContent('Percobaan ke-2');
  });
});

describe('instrumentasi & progres (Prinsip VI, FR-007, FR-014)', () => {
  beforeEach(async () => {
    localStorage.clear();
    resetProgres();
    await telemetry.clear();
  });

  it('menerbitkan tepat satu event lesson_completed dengan data minimal lengkap', async () => {
    pasang();
    fireEvent.click(screen.getByRole('button', { name: 'Mulai' }));
    geserKe(5);
    fireEvent.click(screen.getByRole('button', { name: 'Saya siap menjawab' }));
    fireEvent.click(screen.getByRole('button', { name: /Kirim/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Kenapa begitu?' }));
    fireEvent.click(screen.getByRole('button', { name: 'Lanjut' }));
    fireEvent.click(screen.getByRole('button', { name: 'Selesai' }));

    await waitFor(async () => {
      const semua = await telemetry.readAll();
      expect(semua).toHaveLength(1);
    });

    const [e] = await telemetry.readAll();
    expect(e?.moduleId).toBe('_dummy');
    expect(e?.conceptIds.length).toBeGreaterThan(0);
    expect(e?.durasiMs).toBeGreaterThan(0);
    expect(e?.mistakes).toHaveLength(0);
  });

  it('mencatat mistakeType pada event saat siswa sempat salah', async () => {
    pasang();
    fireEvent.click(screen.getByRole('button', { name: 'Mulai' }));
    fireEvent.click(screen.getByRole('button', { name: 'Saya siap menjawab' }));
    fireEvent.click(screen.getByRole('button', { name: /Kirim/ })); // salah (nilai 0)
    fireEvent.click(screen.getByRole('button', { name: 'Kenapa begitu?' }));
    fireEvent.click(screen.getByRole('button', { name: 'Coba lagi' }));
    geserKe(5);
    fireEvent.click(screen.getByRole('button', { name: /Kirim/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Kenapa begitu?' }));
    fireEvent.click(screen.getByRole('button', { name: 'Lanjut' }));
    fireEvent.click(screen.getByRole('button', { name: 'Selesai' }));

    await waitFor(async () => {
      expect(await telemetry.readAll()).toHaveLength(1);
    });

    const [e] = await telemetry.readAll();
    expect(e?.mistakes).toHaveLength(1);
    expect(e?.mistakes[0]?.mistakeType).toBe('nilai_salah');
    expect(e?.mistakes[0]?.nomorPercobaan).toBe(1);
  });

  it('FR-014: meninggalkan pelajaran sebelum langkah 7 TIDAK memberi Lumens maupun event', async () => {
    const lumensAwal = bacaSiswa().lumens;
    const { onKeluar } = pasang();

    fireEvent.click(screen.getByRole('button', { name: 'Mulai' }));
    geserKe(5);
    fireEvent.click(screen.getByRole('button', { name: 'Saya siap menjawab' }));
    fireEvent.click(screen.getByRole('button', { name: /Kirim/ }));

    // Tutup di tengah pelajaran
    fireEvent.click(screen.getByRole('button', { name: 'Tutup pelajaran' }));

    expect(onKeluar).toHaveBeenCalledOnce();
    expect(bacaSiswa().lumens).toBe(lumensAwal);
    expect(await telemetry.readAll()).toHaveLength(0);
  });

  it('memberi Lumens dan menaikkan streak saat pelajaran selesai', () => {
    pasang();
    fireEvent.click(screen.getByRole('button', { name: 'Mulai' }));
    geserKe(5);
    fireEvent.click(screen.getByRole('button', { name: 'Saya siap menjawab' }));
    fireEvent.click(screen.getByRole('button', { name: /Kirim/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Kenapa begitu?' }));
    fireEvent.click(screen.getByRole('button', { name: 'Lanjut' }));
    fireEvent.click(screen.getByRole('button', { name: 'Selesai' }));

    const siswa = bacaSiswa();
    expect(siswa.lumens).toBe(25); // 20 + 5 bonus tanpa kesalahan
    expect(siswa.streakCount).toBe(1);
    expect(siswa.modulSelesai).toContain('_dummy');
  });
});

describe('layout pelajaran (FR-011)', () => {
  beforeEach(() => {
    localStorage.clear();
    resetProgres();
  });

  it('menampilkan tombol tutup, progress dots, dan saldo Lumens', () => {
    pasang();
    expect(screen.getByRole('button', { name: 'Tutup pelajaran' })).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '7');
    expect(screen.getByText(/Lumens/)).toBeInTheDocument();
  });

  it('progress dots maju seiring langkah', () => {
    pasang();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
    fireEvent.click(screen.getByRole('button', { name: 'Mulai' }));
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '2');
  });
});
