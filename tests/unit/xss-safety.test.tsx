import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { App } from '../../src/App';
import { createDefaultLearnerProfile, saveLearnerProfile } from '../../src/profile';

/**
 * US5 spec 002 (T024, FR-011): input bebas siswa (nama tampilan) yang
 * ditampilkan kembali ke UI MUST tidak dapat mengeksekusi skrip. React
 * meng-escape teks secara default TANPA dangerouslySetInnerHTML di manapun
 * (diverifikasi lewat grep, lihat catatan implementasi) — test ini mengunci
 * jaminan itu sebagai regresi eksplisit, bukan kebetulan.
 */

const PAYLOAD = '<img src=x onerror="window.__xssFired = true">';

async function setHash(hash: string) {
  await act(async () => {
    window.location.hash = hash;
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  });
}

beforeEach(() => {
  localStorage.clear();
  (window as unknown as { __xssFired?: boolean }).__xssFired = false;
});

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe('nama tampilan siswa tidak dapat mengeksekusi skrip (US5 spec 002)', () => {
  it('menampilkan payload sebagai teks literal di menu profil, bukan HTML/skrip', async () => {
    saveLearnerProfile({
      ...createDefaultLearnerProfile(),
      displayName: PAYLOAD,
      onboardingStep: 'complete',
      onboardingComplete: true,
    });
    await setHash('#/beranda');
    render(<App />);

    // Spec 004 (defer-lumera-atlas): sejak Beranda (generasi-2) dipasang
    // (T008), sapaan di beranda tidak lagi menyertakan nama tampilan sama
    // sekali (`sapaanWaktu` murni jam, lihat src/beranda/harian.ts) — nama
    // lengkap sekarang tampil di menu profil StudentShell (tidak disentuh
    // spec 004), jadi payload diverifikasi di sana.
    fireEvent.click(screen.getByRole('button', { name: 'Buka menu profil' }));

    // Payload tampil sebagai teks apa adanya di suatu tempat pada halaman ...
    expect(screen.getByText(PAYLOAD, { exact: false })).toBeTruthy();
    // ... dan TIDAK PERNAH menjadi elemen <img> nyata yang bisa memicu onerror.
    expect(document.querySelector('img[src="x"]')).toBeNull();
    expect((window as unknown as { __xssFired?: boolean }).__xssFired).toBe(false);
  });

  it('menampilkan payload sebagai teks literal di judul halaman Progres, bukan HTML/skrip', async () => {
    saveLearnerProfile({
      ...createDefaultLearnerProfile(),
      displayName: PAYLOAD,
      onboardingStep: 'complete',
      onboardingComplete: true,
    });
    await setHash('#/progres');
    render(<App />);

    expect(screen.getByRole('heading', { name: PAYLOAD })).toBeTruthy();
    expect(document.querySelector('img[src="x"]')).toBeNull();
    expect((window as unknown as { __xssFired?: boolean }).__xssFired).toBe(false);
  });
});
