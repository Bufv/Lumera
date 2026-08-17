import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import {
  MicroLessonPlayer,
  type MicroLessonCompletion,
} from '../../src/microlearning';

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

function mountFromBoxToX(onComplete = vi.fn<(payload: MicroLessonCompletion) => void>()) {
  const onExit = vi.fn();
  const rendered = render(
    <MicroLessonPlayer
      lessonId="aljabar-dari-kotak-ke-x"
      lumens={25}
      reducedMotion
      onExit={onExit}
      onComplete={onComplete}
    />,
  );
  return { ...rendered, onComplete, onExit };
}

describe('Aljabar 1.3 Dari Kotak ke x Focus Mode', () => {
  it('renders Step 1 (Unknown Context) with stepper and minimal top chrome', () => {
    const { onExit } = mountFromBoxToX();

    // Top Chrome
    expect(screen.getByLabelText('Tutup dan kembali ke kurikulum Aljabar')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
    expect(screen.getByText('1 / 9')).toBeInTheDocument();

    // Step 1 Heading
    expect(screen.getByRole('heading', { name: 'Ada nilai yang belum kita tahu' })).toBeInTheDocument();
    expect(screen.getByText(/Berapa harga buku tulis/)).toBeInTheDocument();

    // Stepper controls
    const addBtn = screen.getByRole('button', { name: 'Tambah harga buku' });
    expect(addBtn).toBeInTheDocument();

    // Test Exit button
    fireEvent.click(screen.getByLabelText('Tutup dan kembali ke kurikulum Aljabar'));
    expect(onExit).toHaveBeenCalledOnce();
  });

  it('completes the entire 9-step pedagogical flow to completion state', () => {
    const { onComplete } = mountFromBoxToX();

    // -------------------------------- Step 1: Scrubber to 5
    const addBtn = screen.getByRole('button', { name: 'Tambah harga buku' });
    for (let i = 0; i < 5; i++) {
      fireEvent.click(addBtn);
    }
    expect(screen.getByText(/Harga buku tulis adalah/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Lanjut →' }));

    // -------------------------------- Step 2: Conceptual Box Choice
    expect(screen.getByRole('heading', { name: 'Kita butuh pengganti nilai' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Nilai yang belum diketahui/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Lanjut →' }));

    // -------------------------------- Step 3: From Box to x
    expect(screen.getByRole('heading', { name: 'Dari kotak ke huruf x' })).toBeInTheDocument();
    expect(screen.getByText(/Pada persamaan ini,/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Lanjut →' }));

    // -------------------------------- Step 4: Variable Slider
    expect(screen.getByRole('heading', { name: 'x bisa bernilai berbeda' })).toBeInTheDocument();
    const slider4 = screen.getByLabelText('Pilih nilai x');
    fireEvent.change(slider4, { target: { value: '4' } });
    expect(screen.getByText(/4 \+ 3 =/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Lanjut →' }));

    // -------------------------------- Step 5: Repeated Copies (3x)
    expect(screen.getByRole('heading', { name: 'Beberapa x yang sama' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /x \+ x \+ x/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Lanjut →' }));

    // -------------------------------- Step 6: Variable Part + Fixed Part
    expect(screen.getByRole('heading', { name: 'Variabel dan bagian tetap' })).toBeInTheDocument();
    const slider6 = screen.getByLabelText('Pilih nilai x pada 3x + 2');
    fireEvent.change(slider6, { target: { value: '4' } });
    expect(screen.getByText('14')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Lanjut →' }));

    // -------------------------------- Step 7: Inspect Expression (3x + 2)
    expect(screen.getByRole('heading', { name: 'Kenali nama bagian-bagiannya' })).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Koefisien: 3'));
    fireEvent.click(screen.getByLabelText('Variabel: x'));
    fireEvent.click(screen.getByLabelText('Konstanta: 2'));
    fireEvent.click(screen.getByRole('button', { name: 'Lanjut →' }));

    // -------------------------------- Step 8: Reconstruction
    expect(screen.getByRole('heading', { name: 'Bangun bentuk aljabar' })).toBeInTheDocument();
    const addNb = screen.getByRole('button', { name: '+ Tambah Buku (x)' });
    const addUnit = screen.getByRole('button', { name: '+ Tambah Koin (1)' });
    // Add 4 notebooks and 3 units for 4x + 3
    fireEvent.click(addNb);
    fireEvent.click(addNb);
    fireEvent.click(addNb);
    fireEvent.click(addNb);
    fireEvent.click(addUnit);
    fireEvent.click(addUnit);
    fireEvent.click(addUnit);

    // Phase 2: Identify structure [x][x] + 5 units
    expect(screen.getByRole('heading', { name: 'Tulis bentuk aljabarnya' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /2x \+ 5/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Lanjut →' }));

    // -------------------------------- Step 9: Transfer (5p + 4)
    expect(screen.getByRole('heading', { name: 'Hurufnya bisa berbeda' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /p \+ p \+ p \+ p \+ p/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Lanjut →' }));

    // -------------------------------- Step 10: Completion
    expect(screen.getByRole('heading', { name: 'Luar Biasa! Kamu Menguasai Bentuk Aljabar' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Lanjut ke Tantangan →' }));
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it('supports progressive hints drawer', () => {
    mountFromBoxToX();

    const hintBtn = screen.getByRole('button', { name: 'Buka petunjuk bantuan' });
    fireEvent.click(hintBtn);

    expect(screen.getByRole('complementary', { name: 'Petunjuk pelajaran' })).toBeInTheDocument();
    expect(screen.getByText(/Petunjuk \(1\/3\)/)).toBeInTheDocument();

    fireEvent.click(hintBtn);
    expect(screen.getByText(/Petunjuk \(2\/3\)/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Tutup petunjuk' }));
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
  });

  it('handles misconceptions gracefully with pedagogical guidance', () => {
    mountFromBoxToX();

    // Move to Step 2
    const addBtn = screen.getByRole('button', { name: 'Tambah harga buku' });
    for (let i = 0; i < 5; i++) fireEvent.click(addBtn);
    fireEvent.click(screen.getByRole('button', { name: 'Lanjut →' }));

    // Choose wrong option in Step 2
    fireEvent.click(screen.getByRole('button', { name: 'Angka nol' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Bukan nol, karena 0 + 3 = 3, bukan 8.');

    // Correct the option
    fireEvent.click(screen.getByRole('button', { name: /Nilai yang belum diketahui/ }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('supports item subtraction and resetting in Step 8 action tray', () => {
    mountFromBoxToX();

    // Fast forward to Step 8
    // Step 1
    const addBtn = screen.getByRole('button', { name: 'Tambah harga buku' });
    for (let i = 0; i < 5; i++) fireEvent.click(addBtn);
    fireEvent.click(screen.getByRole('button', { name: 'Lanjut →' }));
    // Step 2
    fireEvent.click(screen.getByRole('button', { name: /Nilai yang belum diketahui/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Lanjut →' }));
    // Step 3
    fireEvent.click(screen.getByRole('button', { name: 'Lanjut →' }));
    // Step 4
    fireEvent.change(screen.getByLabelText('Pilih nilai x'), { target: { value: '3' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lanjut →' }));
    // Step 5
    fireEvent.click(screen.getByRole('button', { name: /x \+ x \+ x/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Lanjut →' }));
    // Step 6
    fireEvent.change(screen.getByLabelText('Pilih nilai x pada 3x + 2'), { target: { value: '4' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lanjut →' }));
    // Step 7
    fireEvent.click(screen.getByLabelText('Koefisien: 3'));
    fireEvent.click(screen.getByLabelText('Variabel: x'));
    fireEvent.click(screen.getByLabelText('Konstanta: 2'));
    fireEvent.click(screen.getByRole('button', { name: 'Lanjut →' }));

    // Step 8: Test Add, Subtract, and Reset
    expect(screen.getByRole('heading', { name: 'Bangun bentuk aljabar' })).toBeInTheDocument();
    const addNb = screen.getByRole('button', { name: '+ Tambah Buku (x)' });
    const addUnit = screen.getByRole('button', { name: '+ Tambah Koin (1)' });

    // Add 2 notebooks and 2 coins
    fireEvent.click(addNb);
    fireEvent.click(addNb);
    fireEvent.click(addUnit);
    fireEvent.click(addUnit);

    expect(screen.getByRole('button', { name: 'Kurangi 1 buku tulis' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Kurangi 1 koin unit' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset baki benda' })).toBeInTheDocument();

    // Subtract 1 notebook
    fireEvent.click(screen.getByRole('button', { name: 'Kurangi 1 buku tulis' }));
    // Reset all
    fireEvent.click(screen.getByRole('button', { name: 'Reset baki benda' }));
    expect(screen.getByText('Ketuk tombol di bawah untuk menambah benda')).toBeInTheDocument();
  });

  it('passes accessibility audit', async () => {
    const { container } = mountFromBoxToX();
    const results = await axe(container, { rules: { 'color-contrast': { enabled: false } } });
    expect(results.violations).toEqual([]);
  });
});
