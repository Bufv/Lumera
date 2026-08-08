import { useState } from 'react';

/**
 * Refleksi (langkah 6). Milik Shell.
 * Jawaban refleksi tidak dinilai — tujuannya memaksa siswa berhenti sejenak dan
 * mengartikulasikan pemahamannya, bukan menambah satu ronde penilaian lagi.
 */
export function Step6_Reflection({ pertanyaan }: { pertanyaan: string }) {
  const [jawaban, setJawaban] = useState('');

  return (
    <section className="langkah refleksi">
      <h2 className="t-action-sm langkah__label">Refleksi</h2>
      <label htmlFor="refleksi">{pertanyaan}</label>
      <textarea
        id="refleksi"
        value={jawaban}
        onChange={(e) => setJawaban(e.target.value)}
        rows={3}
        placeholder="Tulis dengan kalimatmu sendiri…"
      />
    </section>
  );
}
