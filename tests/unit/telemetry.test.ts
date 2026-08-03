import { beforeEach, describe, expect, it } from 'vitest';
import { buatLocalStorageTelemetry } from '../../src/telemetry/adapter';
import { buatEventId, type LessonCompletedEvent } from '../../src/telemetry/events';
import { InvalidLearningEventError, validasiEvent } from '../../src/telemetry/validate';

function eventValid(over: Partial<LessonCompletedEvent> = {}): LessonCompletedEvent {
  return {
    type: 'lesson_completed',
    eventId: buatEventId(),
    siswaId: 'siswa-1',
    moduleId: 'math-slope',
    conceptIds: ['kemiringan-garis'],
    mistakes: [],
    durasiMs: 42_000,
    selesaiPada: new Date().toISOString(),
    schemaVersion: 1,
    ...over,
  };
}

describe('validasi event (Prinsip VI — data minimal)', () => {
  it('meloloskan event lengkap', () => {
    expect(validasiEvent(eventValid())).toEqual([]);
  });

  it('menolak conceptIds kosong', () => {
    const p = validasiEvent(eventValid({ conceptIds: [] }));
    expect(p.join(' ')).toContain('conceptIds kosong');
  });

  it('menolak durasiMs nol atau negatif', () => {
    expect(validasiEvent(eventValid({ durasiMs: 0 })).join(' ')).toContain('durasiMs');
    expect(validasiEvent(eventValid({ durasiMs: -5 })).join(' ')).toContain('durasiMs');
  });

  it('menolak mistake tanpa mistakeType', () => {
    const p = validasiEvent(
      eventValid({ mistakes: [{ conceptId: 'c', mistakeType: '', nomorPercobaan: 1 }] }),
    );
    expect(p.join(' ')).toContain('mistakeType kosong');
  });

  it('menolak schemaVersion yang salah', () => {
    const p = validasiEvent(eventValid({ schemaVersion: 2 as unknown as 1 }));
    expect(p.join(' ')).toContain('schemaVersion');
  });
});

describe('adapter telemetry', () => {
  beforeEach(() => localStorage.clear());

  it('menulis lalu membaca kembali event (round-trip)', async () => {
    const t = buatLocalStorageTelemetry();
    const e = eventValid();
    await t.record(e);
    const semua = await t.readAll();
    expect(semua).toHaveLength(1);
    expect(semua[0]?.eventId).toBe(e.eventId);
  });

  it('MELEMPAR pada event tidak valid — tidak boleh gagal diam-diam', async () => {
    const t = buatLocalStorageTelemetry();
    await expect(t.record(eventValid({ conceptIds: [] }))).rejects.toBeInstanceOf(
      InvalidLearningEventError,
    );
    expect(await t.readAll()).toHaveLength(0);
  });

  it('menolak eventId duplikat (tepat sekali per pelajaran selesai)', async () => {
    const t = buatLocalStorageTelemetry();
    const e = eventValid();
    await t.record(e);
    await expect(t.record(e)).rejects.toThrow(/duplikat/);
    expect(await t.readAll()).toHaveLength(1);
  });

  it('mempertahankan event antar instance adapter (persisten antar sesi)', async () => {
    await buatLocalStorageTelemetry().record(eventValid());
    const lain = buatLocalStorageTelemetry();
    expect(await lain.readAll()).toHaveLength(1);
  });
});
