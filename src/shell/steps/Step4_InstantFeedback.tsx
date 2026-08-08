import type { AttemptResult } from '../types';

/**
 * Umpan balik instan (langkah 4, FR-005). Milik Shell — modul tidak bisa mengubahnya.
 * Nadanya sengaja tenang: Prinsip V melarang perayaan meledak-ledak.
 */
export function Step4_InstantFeedback({ hasil }: { hasil: AttemptResult }) {
  const benar = hasil.benar;
  return (
    <div role="status" aria-live="polite" className={benar ? 'umpan' : 'umpan umpan--salah'}>
      <strong>{benar ? 'Tepat.' : 'Belum tepat.'}</strong>{' '}
      {benar
        ? 'Perhatikan alasannya di langkah berikutnya.'
        : `Percobaan ke-${hasil.nomorPercobaan}. Lihat penjelasannya, lalu coba lagi.`}
    </div>
  );
}
