/**
 * Wrapper `localStorage` bersama dengan deteksi kuota-penuh dan mode-diblokir
 * (US8 spec 002, FR-026, R-012 research.md).
 *
 * `progress/store.ts` dan `profile/store.ts` sebelumnya masing-masing punya
 * try/catch independen untuk kondisi ini — salah satunya (progress/store.ts)
 * bahkan mengembalikan `siswaBaru()` diam-diam saat gagal parse, tanpa
 * memberi tahu siswa sama sekali (pelanggaran FR-026 yang ditutup di sini).
 * Modul ini adalah SATU-SATUNYA titik yang menyentuh `localStorage` langsung
 * untuk kedua store tersebut, dan satu-satunya sumber sinyal bagi
 * `StorageWarningBanner`.
 */

export type StorageFailureListener = (gagal: boolean) => void;

let statusGagal = false;
const listeners = new Set<StorageFailureListener>();

function setStatus(gagal: boolean): void {
  if (statusGagal === gagal) return;
  statusGagal = gagal;
  for (const listener of listeners) listener(statusGagal);
}

/** Status kegagalan storage saat ini (true = penulisan terakhir gagal/diblokir). */
export function storageGagal(): boolean {
  return statusGagal;
}

/**
 * Berlangganan perubahan status kegagalan storage — dipakai
 * `StorageWarningBanner` (T042) agar tampil begitu penulisan gagal, dan
 * hilang lagi jika storage kembali berfungsi (mis. siswa menghapus data lain
 * yang bikin kuota penuh, lalu mencoba lagi).
 */
export function langgananStorageGagal(listener: StorageFailureListener): () => void {
  listeners.add(listener);
  listener(statusGagal);
  return () => listeners.delete(listener);
}

function storageBrowser(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    // Beberapa browser melempar saat MENGAKSES localStorage sama sekali
    // (mis. mode privasi ketat), bukan hanya saat menulis.
    return null;
  }
}

/**
 * Baca satu key. Mengembalikan `null` baik saat key tidak ada MAUPUN saat
 * storage diblokir total — pemanggil (mis. `bacaSiswa`) tetap harus punya
 * default masuk akal untuk `null`, seperti sebelumnya.
 */
export function safeGetItem(key: string): string | null {
  const storage = storageBrowser();
  if (!storage) {
    setStatus(true);
    return null;
  }
  try {
    const value = storage.getItem(key);
    // Baca sukses tidak otomatis membuktikan tulis akan sukses (kuota bisa
    // penuh tepat di ambang), jadi status kegagalan TIDAK direset di sini —
    // hanya safeSetItem yang boleh menyatakan "sudah berfungsi lagi".
    return value;
  } catch {
    setStatus(true);
    return null;
  }
}

/**
 * Tulis satu key. Mengembalikan `false` (bukan melempar) saat kuota penuh
 * atau storage diblokir — pemanggil MUST menampilkan/mewariskan kegagalan
 * ini ke siswa (FR-026), tidak boleh menelannya diam-diam.
 */
export function safeSetItem(key: string, value: string): boolean {
  const storage = storageBrowser();
  if (!storage) {
    setStatus(true);
    return false;
  }
  try {
    storage.setItem(key, value);
    setStatus(false);
    return true;
  } catch {
    // DOMException QuotaExceededError (kuota penuh) atau SecurityError
    // (diblokir kebijakan browser) — keduanya diperlakukan sama: siswa tetap
    // bisa memakai aplikasi pada sesi ini, hanya progres tidak tersimpan.
    setStatus(true);
    return false;
  }
}

export function safeRemoveItem(key: string): void {
  const storage = storageBrowser();
  if (!storage) return;
  try {
    storage.removeItem(key);
  } catch {
    // Hapus yang gagal pada storage yang sudah diblokir bukan kegagalan baru
    // yang perlu dilaporkan — keadaan storage tidak berubah.
  }
}

/** Hanya untuk test: kembalikan modul ke keadaan awal antar kasus uji. */
export function resetSafeStorageStatusUntukTes(): void {
  statusGagal = false;
  listeners.clear();
}
