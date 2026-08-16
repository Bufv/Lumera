import type { ReactiveNumber } from './types';

const VALID_NUMBER = /^[+-]?(?:\d+(?:[.,]\d+)?|[.,]\d+)$/;
const INCOMPLETE_DECIMAL = /^[+-]?\d+[.,]$/;

export function parseReactiveNumber(raw: string, min = -Infinity, max = Infinity): ReactiveNumber {
  const trimmed = raw.trim();
  if (trimmed === '') return { raw, value: null, validity: 'empty' };

  if (
    trimmed === '+' ||
    trimmed === '-' ||
    trimmed === '.' ||
    trimmed === ',' ||
    trimmed === '+.' ||
    trimmed === '+,' ||
    trimmed === '-.' ||
    trimmed === '-,' ||
    INCOMPLETE_DECIMAL.test(trimmed) ||
    !VALID_NUMBER.test(trimmed)
  ) {
    return { raw, value: null, validity: 'partial' };
  }

  const value = Number(trimmed.replace(',', '.'));
  if (!Number.isFinite(value)) return { raw, value: null, validity: 'partial' };
  if (value < min || value > max) return { raw, value, validity: 'outOfRange' };
  return { raw, value, validity: 'valid' };
}

export function reactiveNumberMessage(value: ReactiveNumber, min: number, max: number): string {
  switch (value.validity) {
    case 'empty':
      return 'Ketik sebuah angka untuk mengubah model.';
    case 'partial':
      return 'Angkanya belum lengkap. Model mempertahankan nilai terakhir.';
    case 'outOfRange':
      return `Gunakan nilai antara ${min} dan ${max}.`;
    case 'valid':
      return `Model memakai nilai ${formatNumber(value.value ?? 0)}.`;
  }
}

export function formatNumber(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return '—';
  const rounded = Math.abs(value) < 1e-10 ? 0 : value;
  return new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  }).format(rounded);
}

export function isCorrectNumber(
  value: ReactiveNumber,
  expected: number,
  tolerance = 0.001,
): boolean {
  return (
    value.validity === 'valid' &&
    value.value !== null &&
    Math.abs(value.value - expected) <= tolerance
  );
}
