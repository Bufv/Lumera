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

function mountPatternRule(onComplete = vi.fn<(payload: MicroLessonCompletion) => void>()) {
  const onExit = vi.fn();
  const rendered = render(
    <MicroLessonPlayer
      lessonId="aljabar-aturan-di-balik-pola"
      lumens={25}
      reducedMotion
      onExit={onExit}
      onComplete={onComplete}
    />,
  );
  return { ...rendered, onComplete, onExit };
}

describe('Aljabar 1.2 Aturan di Balik Pola Focus Mode', () => {
  it('renders Step 1 (Need for Rule) with friction stepping and minimal top chrome', () => {
    const { onExit } = mountPatternRule();

    // Top Chrome
    expect(screen.getByLabelText('Tutup dan kembali ke kurikulum Aljabar')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
    expect(screen.getByText('1 / 9')).toBeInTheDocument();

    // Step 1 Content
    expect(screen.getByRole('heading', { name: 'Masalahnya terlalu jauh' })).toBeInTheDocument();
    expect(screen.getByText(/Kalau ini Langkah 20/)).toBeInTheDocument();

    // Friction button
    const iterateBtn = screen.getByRole('button', { name: /Lanjutkan satu-satu/ });
    expect(iterateBtn).toBeInTheDocument();

    // Test Exit button
    fireEvent.click(screen.getByLabelText('Tutup dan kembali ke kurikulum Aljabar'));
    expect(onExit).toHaveBeenCalledOnce();
  });

  it('completes the entire 9-step pedagogical flow to completion state', () => {
    const { onComplete } = mountPatternRule();

    // -------------------------------- Step 1: Need for a rule
    // Click friction button until shortcut callout appears
    const iterateBtn = screen.getByRole('button', { name: /Lanjutkan satu-satu/ });
    for (let i = 0; i < 6; i++) {
      fireEvent.click(iterateBtn);
    }
    expect(screen.getByText(/Bisa. Tapi ada cara yang lebih cepat/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Lanjut →' }));

    // -------------------------------- Step 2: Step number & value
    expect(screen.getByRole('heading', { name: 'Nomor langkah dan jumlah' })).toBeInTheDocument();
    const slider = screen.getByLabelText('Pilih nomor langkah');
    fireEvent.change(slider, { target: { value: '5' } });
    expect(screen.getByText('Jumlah: 9 balok')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Lanjut →' }));

    // -------------------------------- Step 3: Table relationship
    expect(screen.getByRole('heading', { name: 'Apa yang terjadi selanjutnya?' })).toBeInTheDocument();
    const step3Input = screen.getByLabelText('Jumlah untuk Langkah 5');
    fireEvent.change(step3Input, { target: { value: '9' } });
    fireEvent.click(screen.getByRole('button', { name: 'Periksa' }));
    expect(screen.getByText(/Bisakah jumlah diketahui langsung dari nomor langkahnya?/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Lanjut →' }));

    // -------------------------------- Step 4: Decompose visual structure
    expect(screen.getByRole('heading', { name: 'Pisahkan polanya' })).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Pisahkan Langkah 2: 3 balok'));
    fireEvent.click(screen.getByLabelText('Pisahkan Langkah 3: 5 balok'));
    fireEvent.click(screen.getByLabelText('Pisahkan Langkah 4: 7 balok'));
    expect(screen.getByText('Bagian pertama = nomor langkah')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Lanjut →' }));

    // -------------------------------- Step 5: Build rule in words
    expect(screen.getByRole('heading', { name: 'Tulis aturan dalam kata-kata' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'nomor langkah' }));
    fireEvent.click(screen.getByRole('button', { name: 'satu kurang dari nomor langkah' }));
    fireEvent.click(screen.getByRole('button', { name: 'Periksa' }));
    expect(screen.getByText(/Kita bisa memakai/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Lanjut →' }));

    // -------------------------------- Step 6: Compress the rule
    expect(screen.getByRole('heading', { name: 'Dari kata ke bentuk matematika' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Sederhanakan n \+ n − 1/ }));
    expect(screen.getByText('2n − 1')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Lanjut →' }));

    // -------------------------------- Step 7: Test the rule
    expect(screen.getByRole('heading', { name: 'Uji aturan' })).toBeInTheDocument();
    const testInput = screen.getByLabelText('Prediksi hasil untuk n=6');
    fireEvent.change(testInput, { target: { value: '11' } });
    fireEvent.click(screen.getByRole('button', { name: 'Periksa' }));
    expect(screen.getByText('✓ Terbukti benar!')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Lanjut →' }));

    // -------------------------------- Step 8: Payoff Step 20 & 50
    expect(screen.getByRole('heading', { name: 'Gunakan untuk langkah jauh' })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Jumlah balok:', { selector: '#input-step-20' }), {
      target: { value: '39' },
    });
    fireEvent.change(screen.getByLabelText('Jumlah balok:', { selector: '#input-step-50' }), {
      target: { value: '99' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Periksa' }));
    expect(screen.getByText(/Kita melompat langsung ke Langkah 20/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Lanjut →' }));

    // -------------------------------- Step 9: Transfer to 3n + 1
    expect(screen.getByRole('heading', { name: 'Terapkan pada pola baru' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', { name: '3n + 1' }));
    fireEvent.change(screen.getByLabelText('Hasil untuk Langkah 10'), { target: { value: '31' } });
    fireEvent.change(screen.getByLabelText('Hasil untuk Langkah 20'), { target: { value: '61' } });
    fireEvent.click(screen.getByRole('button', { name: 'Periksa' }));
    fireEvent.click(screen.getByRole('button', { name: 'Lanjut →' }));

    // -------------------------------- Step 10: Completion
    expect(screen.getByRole('heading', { name: 'Hebat!' })).toBeInTheDocument();
    expect(screen.getByText('Kamu sudah menguasai Aturan di Balik Pola.')).toBeInTheDocument();
    expect(screen.getByText('+25 Lumens')).toBeInTheDocument();
    expect(screen.getByText(/Sekarang kamu tidak perlu menggambar/)).toBeInTheDocument();

    // Complete CTA
    fireEvent.click(screen.getByRole('button', { name: 'Lanjut ke 1.3 — Dari Kotak ke x →' }));
    expect(onComplete).toHaveBeenCalledOnce();
    expect(onComplete.mock.calls[0]?.[0]?.lessonId).toBe('aljabar-aturan-di-balik-pola');
  });

  it('provides progressive hints without blocking the learner', () => {
    mountPatternRule();

    // Open hint drawer
    fireEvent.click(screen.getByRole('button', { name: 'Buka petunjuk' }));
    expect(screen.getByText(/Petunjuk \(1\/2\)/)).toBeInTheDocument();

    // Tier 2
    fireEvent.click(screen.getByRole('button', { name: 'Buka petunjuk berikutnya →' }));
    expect(screen.getByText(/Petunjuk \(2\/2\)/)).toBeInTheDocument();

    // Close hint drawer
    fireEvent.click(screen.getByRole('button', { name: 'Tutup petunjuk' }));
    expect(screen.queryByText(/Petunjuk \(2\/2\)/)).not.toBeInTheDocument();
  });

  it('handles mistakes gracefully and guides the learner', () => {
    mountPatternRule();

    // Fast-forward to Step 3
    const iterateBtn = screen.getByRole('button', { name: /Lanjutkan satu-satu/ });
    for (let i = 0; i < 6; i++) fireEvent.click(iterateBtn);
    fireEvent.click(screen.getByRole('button', { name: 'Lanjut →' })); // to Step 2
    fireEvent.click(screen.getByRole('button', { name: 'Lanjut →' })); // to Step 3

    // Enter wrong value for Step 5
    const step3Input = screen.getByLabelText('Jumlah untuk Langkah 5');
    fireEvent.change(step3Input, { target: { value: '8' } });
    fireEvent.click(screen.getByRole('button', { name: 'Periksa' }));

    // Error banner appears with guidance
    expect(screen.getByRole('alert')).toHaveTextContent('Setiap langkah bertambah 2');

    // Fix error
    fireEvent.change(step3Input, { target: { value: '9' } });
    fireEvent.click(screen.getByRole('button', { name: 'Periksa' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('passes accessibility audit', async () => {
    const { container } = mountPatternRule();
    const results = await axe(container, { rules: { 'color-contrast': { enabled: false } } });
    expect(results.violations).toEqual([]);
  });
});
