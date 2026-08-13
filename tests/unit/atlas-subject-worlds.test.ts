import { describe, expect, it } from 'vitest';
import { SUBJECT_WORLDS } from '../../src/atlas/subject-worlds';

/**
 * Regression guard untuk FR-001 (specs/003-drop-utbk-snbt): Lumera Atlas
 * MUST NOT menampilkan node/label "UTBK/SNBT". research.md R-002
 * mengonfirmasi kode saat ini sudah patuh (SUBJECT_WORLDS hanya berisi
 * subject world dengan modul terbangun) — tes ini memastikan itu tidak
 * diam-diam berubah di masa depan.
 */

describe('SUBJECT_WORLDS', () => {
  it('tidak berisi entri UTBK/SNBT (FR-001)', () => {
    for (const world of SUBJECT_WORLDS) {
      expect(world.id.toLowerCase()).not.toMatch(/utbk|snbt/);
      expect(world.nama.toLowerCase()).not.toMatch(/utbk|snbt/);
    }
  });

  it('berisi tepat 4 subject world saat ini — perubahan jumlah wajib review eksplisit', () => {
    expect(SUBJECT_WORLDS).toHaveLength(4);
  });
});
