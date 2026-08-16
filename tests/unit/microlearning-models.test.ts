import { describe, expect, it } from 'vitest';
import {
  MICRO_LESSON_BEATS,
  MICRO_LESSON_IDS,
  MICRO_LESSONS,
  getMicroLesson,
  parseReactiveNumber,
} from '../../src/microlearning';

describe('katalog micro-learning', () => {
  it('mendaftarkan tepat delapan pelajaran dengan delapan beat yang tetap', () => {
    expect(MICRO_LESSON_IDS).toEqual([
      'aljabar-pola-yang-tumbuh',
      'aljabar-aturan-di-balik-pola',
      'aljabar-dari-kotak-ke-x',
      'aljabar-cerita-menjadi-aljabar',
      'kalkulus-seberapa-cepat-berubah',
      'kalkulus-semakin-dekat',
      'kalkulus-kecepatan-pada-satu-saat',
      'kalkulus-turunan-adalah-fungsi',
    ]);
    expect(MICRO_LESSONS).toHaveLength(8);
    expect(MICRO_LESSON_BEATS).toEqual([
      'encounter',
      'explore',
      'predict',
      'manipulate',
      'assess',
      'why',
      'reflect',
      'complete',
    ]);
    expect(new Set(MICRO_LESSONS.map((lesson) => lesson.id)).size).toBe(8);
  });

  it('menghasilkan model awal finite untuk seluruh pelajaran', () => {
    for (const lesson of MICRO_LESSONS) {
      const values = Object.fromEntries(
        lesson.controls.map((control) => [control.key, control.defaultValue]),
      );
      const model = lesson.buildModel(values);
      expect(model.signature).not.toMatch(/NaN|Infinity/);
      expect(Number.isFinite(lesson.expectedAnswer(model))).toBe(true);
      expect(Number.isFinite(lesson.expectedTransfer(model))).toBe(true);
      expect(Object.values(model.metrics).some((entry) => typeof entry === 'number')).toBe(true);
    }
  });

  it('memberi keadaan limit yang bermakna ketika h = 0', () => {
    const lesson = getMicroLesson('kalkulus-semakin-dekat');
    expect(lesson).toBeDefined();
    const model = lesson!.buildModel({ x: 2, h: 0 });
    expect(model.metrics.limitState).toBe(true);
    expect(model.metrics.slope).toBe(4);
    expect(model.signature).not.toMatch(/NaN|Infinity/);
  });

  it('tidak membagi dengan nol saat interval waktu menyusut', () => {
    const lesson = getMicroLesson('kalkulus-seberapa-cepat-berubah');
    const model = lesson!.buildModel({ t1: 3, t2: 3 });
    expect(model.metrics.collapsed).toBe(true);
    expect(model.metrics.rate).toBe(6);
    expect(lesson!.expectedAnswer(model)).toBe(6);
  });

  it('mempertahankan matematika inti kedelapan model', () => {
    expect(
      getMicroLesson('aljabar-pola-yang-tumbuh')!.expectedAnswer(
        getMicroLesson('aljabar-pola-yang-tumbuh')!.buildModel({ n: 5 }),
      ),
    ).toBe(11);
    expect(
      getMicroLesson('aljabar-aturan-di-balik-pola')!.expectedAnswer(
        getMicroLesson('aljabar-aturan-di-balik-pola')!.buildModel({ a: 3, n: 4, b: 2 }),
      ),
    ).toBe(14);
    expect(
      getMicroLesson('aljabar-dari-kotak-ke-x')!.expectedAnswer(
        getMicroLesson('aljabar-dari-kotak-ke-x')!.buildModel({ x: -4 }),
      ),
    ).toBe(5);
    expect(
      getMicroLesson('aljabar-cerita-menjadi-aljabar')!.expectedAnswer(
        getMicroLesson('aljabar-cerita-menjadi-aljabar')!.buildModel({ a: 3, x: 4, b: 2 }),
      ),
    ).toBe(14);
    expect(
      getMicroLesson('kalkulus-seberapa-cepat-berubah')!.expectedAnswer(
        getMicroLesson('kalkulus-seberapa-cepat-berubah')!.buildModel({ t1: 1, t2: 5 }),
      ),
    ).toBe(6);
    expect(
      getMicroLesson('kalkulus-semakin-dekat')!.expectedAnswer(
        getMicroLesson('kalkulus-semakin-dekat')!.buildModel({ x: 2, h: -0.5 }),
      ),
    ).toBe(3.5);
    expect(
      getMicroLesson('kalkulus-kecepatan-pada-satu-saat')!.expectedAnswer(
        getMicroLesson('kalkulus-kecepatan-pada-satu-saat')!.buildModel({ t: 2.5 }),
      ),
    ).toBe(5);
    expect(
      getMicroLesson('kalkulus-turunan-adalah-fungsi')!.expectedAnswer(
        getMicroLesson('kalkulus-turunan-adalah-fungsi')!.buildModel({ a: 2, b: -1, c: 8, x: 3 }),
      ),
    ).toBe(11);
  });
});

describe('parser angka reaktif', () => {
  it.each(['-', '+', '.', ',', '-.', '0,', '12.', 'abc', '1..2'])(
    'menandai %s sebagai draft parsial tanpa NaN',
    (raw) => {
      const result = parseReactiveNumber(raw, -20, 20);
      expect(result.validity).toBe('partial');
      expect(result.value).toBeNull();
    },
  );

  it('menerima koma desimal dan bilangan negatif', () => {
    expect(parseReactiveNumber('-2,75', -3, 3)).toEqual({
      raw: '-2,75',
      value: -2.75,
      validity: 'valid',
    });
  });

  it('membedakan angka valid dan angka di luar rentang', () => {
    expect(parseReactiveNumber('12', 1, 12).validity).toBe('valid');
    expect(parseReactiveNumber('12.01', 1, 12)).toMatchObject({
      value: 12.01,
      validity: 'outOfRange',
    });
  });
});
