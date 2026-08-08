import { Icon } from '../../design/Icon';

/**
 * Lanjutkan (langkah 7). Milik Shell.
 * Penekanan tombol inilah SATU-SATUNYA titik di mana pelajaran ditandai selesai:
 * Lumens diberikan, streak diperbarui, dan event lesson_completed terbit (FR-014).
 */
export function Step7_Continue({
  onLanjutkan,
  lumensDidapat,
}: {
  onLanjutkan: () => void;
  lumensDidapat: number;
}) {
  return (
    <section className="selesai">
      <p className="selesai__judul">Pelajaran selesai.</p>
      <p className="selesai__lumens">
        <Icon name="sparkles" width={17} height={17} />+{lumensDidapat} Lumens
      </p>
      <div>
        <button type="button" className="btn3d" onClick={onLanjutkan}>
          Lanjutkan
          <Icon name="arrow" width={20} height={20} />
        </button>
      </div>
    </section>
  );
}
