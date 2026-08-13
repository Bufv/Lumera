import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  langgananStorageGagal,
  resetSafeStorageStatusUntukTes,
  safeGetItem,
  safeRemoveItem,
  safeSetItem,
  storageGagal,
} from '../../src/storage/safeStorage';

/**
 * US8 spec 002 (T046, FR-026): localStorage penuh/diblokir MUST NOT gagal
 * diam-diam — safeStorage adalah satu-satunya titik yang menyentuh
 * localStorage untuk progress/store.ts dan profile/store.ts.
 */

describe('safeStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    resetSafeStorageStatusUntukTes();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    resetSafeStorageStatusUntukTes();
  });

  it('safeSetItem/safeGetItem berperilaku normal saat storage sehat', () => {
    expect(safeSetItem('k', 'v')).toBe(true);
    expect(safeGetItem('k')).toBe('v');
    expect(storageGagal()).toBe(false);
  });

  it('safeSetItem mengembalikan false (bukan melempar) saat kuota penuh', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('kuota penuh', 'QuotaExceededError');
    });

    expect(() => safeSetItem('k', 'v')).not.toThrow();
    expect(safeSetItem('k', 'v')).toBe(false);
    expect(storageGagal()).toBe(true);
  });

  it('safeGetItem mengembalikan null (bukan melempar) saat storage diblokir total', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('diblokir', 'SecurityError');
    });

    expect(() => safeGetItem('k')).not.toThrow();
    expect(safeGetItem('k')).toBeNull();
    expect(storageGagal()).toBe(true);
  });

  it('safeRemoveItem tidak melempar saat storage diblokir', () => {
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new DOMException('diblokir', 'SecurityError');
    });

    expect(() => safeRemoveItem('k')).not.toThrow();
  });

  it('status kembali ke tidak-gagal setelah tulis sukses lagi', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
      throw new DOMException('kuota penuh', 'QuotaExceededError');
    });

    expect(safeSetItem('k', 'v')).toBe(false);
    expect(storageGagal()).toBe(true);

    setItemSpy.mockRestore();
    expect(safeSetItem('k', 'v2')).toBe(true);
    expect(storageGagal()).toBe(false);
  });

  it('langgananStorageGagal memberi tahu listener saat status berubah, dan memanggil sekali di awal dengan status saat ini', () => {
    const events: boolean[] = [];
    const unsubscribe = langgananStorageGagal((gagal) => events.push(gagal));

    expect(events).toEqual([false]);

    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('kuota penuh', 'QuotaExceededError');
    });
    safeSetItem('k', 'v');

    expect(events).toEqual([false, true]);

    unsubscribe();
    vi.restoreAllMocks();
    safeSetItem('k', 'v');
    // Setelah unsubscribe, listener tidak lagi menerima event baru.
    expect(events).toEqual([false, true]);
  });
});
