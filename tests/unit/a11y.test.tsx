import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import type { Result } from 'axe-core';
import { Atlas } from '../../src/atlas/Atlas';
import { LessonShell } from '../../src/shell/LessonShell';
import { dummyModule } from '../../src/modules/_dummy';
import { daftarkanSemuaModul } from '../../src/modules/eager';
import { ProgressSummary } from '../../src/progress/ProgressSummary';
import { HomeScreen, ProgressScreen } from '../../src/student/StudentScreens';
import { createDefaultLearnerProfile } from '../../src/profile/store';
import type { LessonModule } from '../../src/shell/types';
import type { Siswa } from '../../src/progress/store';

/**
 * US9 spec 002 (T050, R-007): axe check pada layar inti — Atlas, Lesson
 * (LessonShell), ringkasan progres, home Batch 1. Melengkapi (bukan
 * menggantikan) audit manual keyboard/screen-reader di quickstart.md V-9.
 *
 * Assert langsung pada `results.violations` (bukan matcher `toHaveNoViolations`
 * dari `vitest-axe/extend-expect`) — versi `vitest-axe` (0.1.x) saat ini
 * menargetkan namespace tipe Vitest yang tidak lagi cocok dengan Vitest 3.x,
 * jadi augmentasi tipenya gagal di-`tsc -b`. Semantiknya identik: gagal jika
 * ada satu saja pelanggaran.
 */

function ringkasPelanggaran(violations: Result[]): string {
  return violations.map((v) => `${v.id}: ${v.help}`).join('; ');
}

function siswa(patch: Partial<Siswa> = {}): Siswa {
  return {
    schemaVersion: 1,
    id: 'uji-a11y',
    lumens: 40,
    streakCount: 2,
    streakLastDate: '2026-08-08',
    mastery: [{ moduleId: 'math-slope', masteryPersen: 60, skorTerakhir: [60], diperbaruiPada: '2026-08-08' }],
    modulSelesai: ['math-slope'],
    ...patch,
  };
}

describe('aksesibilitas (axe) — layar inti', () => {
  beforeAll(() => {
    daftarkanSemuaModul();
  });

  afterEach(cleanup);

  it('Atlas tidak punya pelanggaran axe', async () => {
    const { container } = render(
      <Atlas siswa={siswa()} onPilihModul={vi.fn()} onKembali={vi.fn()} />,
    );
    const { violations } = await axe(container);
    expect(violations, ringkasPelanggaran(violations)).toEqual([]);
  });

  it('LessonShell (langkah prompt) tidak punya pelanggaran axe', async () => {
    const modul = dummyModule as unknown as LessonModule<unknown, unknown>;
    const { container } = render(
      <LessonShell modul={modul} onKeluar={vi.fn()} onSelesai={vi.fn()} />,
    );
    const { violations } = await axe(container);
    expect(violations, ringkasPelanggaran(violations)).toEqual([]);
  });

  it('ringkasan progres (ProgressSummary) tidak punya pelanggaran axe', async () => {
    const { container } = render(<ProgressSummary siswa={siswa()} />);
    const { violations } = await axe(container);
    expect(violations, ringkasPelanggaran(violations)).toEqual([]);
  });

  it('home Batch 1 (HomeScreen) tidak punya pelanggaran axe', async () => {
    const { container } = render(
      <HomeScreen profile={createDefaultLearnerProfile()} demoData={null} onNavigate={vi.fn()} />,
    );
    const { violations } = await axe(container);
    expect(violations, ringkasPelanggaran(violations)).toEqual([]);
  });

  it('ringkasan progres Batch 1 (ProgressScreen) tidak punya pelanggaran axe', async () => {
    const { container } = render(
      <ProgressScreen profile={createDefaultLearnerProfile()} demoData={null} onNavigate={vi.fn()} />,
    );
    const { violations } = await axe(container);
    expect(violations, ringkasPelanggaran(violations)).toEqual([]);
  });
});
