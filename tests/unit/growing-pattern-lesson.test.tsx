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

function mountGrowingPattern(
  onComplete = vi.fn<(payload: MicroLessonCompletion) => void>(),
  onExit = vi.fn(),
) {
  const rendered = render(
    <MicroLessonPlayer
      lessonId="aljabar-pola-yang-tumbuh"
      lumens={10}
      reducedMotion
      onExit={onExit}
      onComplete={onComplete}
    />,
  );
  return { ...rendered, onComplete, onExit };
}

describe('Aljabar 1.1 Pola yang Tumbuh Focus Mode', () => {
  it('renders Step 1 (Observe) with 3 groups of 2.5D cubes and minimal top chrome', () => {
    const { onExit } = mountGrowingPattern();

    // Top chrome
    expect(screen.getByRole('progressbar', { name: 'Langkah 1 dari 9' })).toBeInTheDocument();
    expect(screen.getByText('1 / 9')).toBeInTheDocument();

    // Step 1 Heading
    expect(screen.getByRole('heading', { name: 'Apa yang berubah?', level: 2 })).toBeInTheDocument();
    expect(screen.getByText('Langkah 1')).toBeInTheDocument();
    expect(screen.getByText('Langkah 2')).toBeInTheDocument();
    expect(screen.getByText('Langkah 3')).toBeInTheDocument();

    // Exit button
    fireEvent.click(screen.getByRole('button', { name: 'Tutup pelajaran' }));
    expect(onExit).toHaveBeenCalledOnce();
  });

  it('completes the entire 9-step pedagogical flow to completion state', async () => {
    const onComplete = vi.fn();
    mountGrowingPattern(onComplete);

    // ---------------- STEP 1: OBSERVE
    fireEvent.click(screen.getByRole('button', { name: 'Lanjut →' }));

    // ---------------- STEP 2: SHAPE -> QUANTITY
    expect(screen.getByRole('heading', { name: 'Berapa banyak di setiap langkah?', level: 2 })).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Langkah 2 dari 9' })).toBeInTheDocument();

    // Reveal counts by clicking each group
    fireEvent.click(screen.getByRole('button', { name: 'Kelompok 1, ketuk untuk melihat jumlah' }));
    fireEvent.click(screen.getByRole('button', { name: 'Kelompok 2, ketuk untuk melihat jumlah' }));
    fireEvent.click(screen.getByRole('button', { name: 'Kelompok 3, ketuk untuk melihat jumlah' }));

    expect(screen.getByText('1 → 3 → 5')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Lanjut →' }));

    // ---------------- STEP 3: FIND WHAT WAS ADDED
    expect(screen.getByRole('heading', { name: 'Bagian mana yang baru?', level: 2 })).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Langkah 3 dari 9' })).toBeInTheDocument();

    // Discover the two +2 growth transitions
    fireEvent.click(screen.getByRole('button', { name: 'Pilih 2 balok tambahan pada Langkah 2' }));
    fireEvent.click(screen.getByRole('button', { name: 'Pilih 2 balok tambahan pada Langkah 3' }));

    expect(screen.getByText(/Setiap langkah selalu menambah/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Lanjut →' }));

    // ---------------- STEP 4: DESCRIBE THE CHANGE
    expect(screen.getByRole('heading', { name: 'Bagaimana perubahan setiap langkah?', level: 2 })).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Langkah 4 dari 9' })).toBeInTheDocument();

    // Place chips into both slots (+2 and +2)
    const chipPlus2 = screen.getByRole('button', { name: '+2' });
    fireEvent.click(chipPlus2); // fills slot 1
    fireEvent.click(chipPlus2); // fills slot 2

    fireEvent.click(screen.getByRole('button', { name: 'Periksa' }));
    expect(screen.getByText(/Perubahannya sama setiap langkah/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Lanjut →' }));

    // ---------------- STEP 5: PREDICT BY BUILDING
    expect(screen.getByRole('heading', { name: 'Bangun langkah berikutnya.', level: 2 })).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Langkah 5 dari 9' })).toBeInTheDocument();

    // Add 2 cubes to reach 7
    const addCubeBtn = screen.getByRole('button', { name: 'Tambah 1 balok ke pola' });
    fireEvent.click(addCubeBtn);
    fireEvent.click(addCubeBtn);

    fireEvent.click(screen.getByRole('button', { name: 'Periksa' }));
    expect(screen.getByText('5 + 2 = 7')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Lanjut →' }));

    // ---------------- STEP 6: CONCRETE -> ABSTRACT
    expect(screen.getByRole('heading', { name: 'Dari gambar ke bilangan.', level: 2 })).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Langkah 6 dari 9' })).toBeInTheDocument();
    expect(screen.getByText('Gambar dan bilangan menunjukkan perubahan yang sama.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Lanjut →' }));

    // ---------------- STEP 7: RULE VS COINCIDENCE
    expect(screen.getByRole('heading', { name: 'Apa yang menjelaskan bagaimana pola ini tumbuh?', level: 2 })).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Langkah 7 dari 9' })).toBeInTheDocument();

    // Select correct rule choice: "Setiap langkah bertambah 2."
    fireEvent.click(screen.getByRole('radio', { name: 'Setiap langkah bertambah 2.' }));
    fireEvent.click(screen.getByRole('button', { name: 'Periksa' }));
    fireEvent.click(screen.getByRole('button', { name: 'Lanjut →' }));

    // ---------------- STEP 8: TRANSFER TO NEW PATTERN (GOLD DIAMONDS)
    expect(screen.getByRole('heading', { name: 'Pola baru. Bangun langkah berikutnya.', level: 2 })).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Langkah 8 dari 9' })).toBeInTheDocument();

    // Add 3 gold diamonds to reach 11
    const addDiamondBtn = screen.getByRole('button', { name: /\+ Tambah wajik emas/i });
    fireEvent.click(addDiamondBtn);
    fireEvent.click(addDiamondBtn);
    fireEvent.click(addDiamondBtn);

    fireEvent.click(screen.getByRole('button', { name: 'Periksa' }));
    expect(screen.getByText(/Aturannya berbeda, tetapi caramu menemukannya sama/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Lanjut →' }));

    // ---------------- STEP 9: INDEPENDENT MASTERY (EMERALD CIRCLES)
    expect(screen.getByRole('heading', { name: 'Lengkapi pola berikut.', level: 2 })).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Langkah 9 dari 9' })).toBeInTheDocument();

    // Add 3 emerald circles to reach 13
    const addCircleBtn = screen.getByRole('button', { name: /\+ Tambah lingkaran/i });
    fireEvent.click(addCircleBtn);
    fireEvent.click(addCircleBtn);
    fireEvent.click(addCircleBtn);

    fireEvent.click(screen.getByRole('button', { name: 'Periksa' }));
    expect(screen.getByText(/Hebat! Kamu menguasai cara menemukan aturan pertumbuhan pola!/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Lanjut →' }));

    // ---------------- STEP 10: COMPLETION
    expect(screen.getByRole('heading', { name: 'Bagus sekali!', level: 2 })).toBeInTheDocument();
    expect(screen.getByText('Lihat Perubahan')).toBeInTheDocument();
    expect(screen.getByText('Buat Prediksi')).toBeInTheDocument();
    expect(screen.getByText('Buktikan Pola')).toBeInTheDocument();

    // Complete CTA
    fireEvent.click(screen.getByRole('button', { name: 'Lanjut ke 1.2 →' }));
    expect(onComplete).toHaveBeenCalledOnce();
    expect(onComplete.mock.calls[0]?.[0]?.lessonId).toBe('aljabar-pola-yang-tumbuh');
  });

  it('provides progressive hints without blocking the learner', () => {
    mountGrowingPattern();

    // Open hint drawer
    fireEvent.click(screen.getByRole('button', { name: 'Buka petunjuk' }));
    expect(screen.getByRole('complementary', { name: 'Petunjuk pelajaran' })).toBeInTheDocument();

    // Close hint drawer
    fireEvent.click(screen.getByRole('button', { name: 'Tutup petunjuk' }));
    expect(screen.queryByRole('complementary', { name: 'Petunjuk pelajaran' })).not.toBeInTheDocument();
  });

  it('passes accessibility audit', async () => {
    const { container } = mountGrowingPattern();
    const results = await axe(container, { rules: { 'color-contrast': { enabled: false } } });
    expect(results.violations).toEqual([]);
  });
});
