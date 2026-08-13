/**
 * Penjelasan "Kenapa?" (langkah 5). Milik Shell.
 *
 * Ditampilkan pada jawaban BENAR maupun SALAH — Prinsip II. Registry sudah menolak modul
 * yang mengembalikan teks kosong, jadi komponen ini selalu punya isi.
 */
export function Step5_WhyExplanation({ teks }: { teks: string }) {
  return (
    <section className="kenapa">
      <h2 className="t-action-sm">Kenapa begitu?</h2>
      <p>{teks}</p>
    </section>
  );
}
