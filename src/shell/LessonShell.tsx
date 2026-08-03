import { useCallback, useMemo, useRef, useState } from 'react';
import { LessonChrome } from './LessonChrome';
import { Step1_Prompt } from './steps/Step1_Prompt';
import { Step4_InstantFeedback } from './steps/Step4_InstantFeedback';
import { Step5_WhyExplanation } from './steps/Step5_WhyExplanation';
import { Step6_Reflection } from './steps/Step6_Reflection';
import { Step7_Continue } from './steps/Step7_Continue';
import type { AttemptResult, LessonModule, LessonStep } from './types';
import { color, radius, spacing, typography } from '../design/tokens';
import { selesaikanPelajaran } from '../progress/award';
import { bacaSiswa } from '../progress/store';
import { telemetry } from '../telemetry/adapter';
import { buatEventId, type MistakeEntry } from '../telemetry/events';

/**
 * LessonShell — pemilik alur 7 langkah (Prinsip II).
 *
 * Modul hanya mengisi slot langkah 2 dan 3. Transisi antar langkah sepenuhnya di sini;
 * modul tidak punya cara untuk melompati langkah manapun. Inilah yang membuat Prinsip II
 * ditegakkan oleh struktur, bukan oleh disiplin manual.
 */

export interface LessonShellProps<TState, TJawaban> {
  modul: LessonModule<TState, TJawaban>;
  onKeluar: () => void;
  onSelesai: () => void;
}

export function LessonShell<TState, TJawaban>({
  modul,
  onKeluar,
  onSelesai,
}: LessonShellProps<TState, TJawaban>) {
  const [langkah, setLangkah] = useState<LessonStep>('prompt');
  const [state, setState] = useState<TState>(modul.initialState);
  const [hasil, setHasil] = useState<AttemptResult | null>(null);
  const [mistakes, setMistakes] = useState<MistakeEntry[]>([]);
  const [lumensDidapat, setLumensDidapat] = useState(0);
  const [lumens, setLumens] = useState(() => bacaSiswa().lumens);

  const percobaanRef = useRef(0);
  // Mulai menghitung durasi sejak langkah 1 dirender (FR-015: waktu pengerjaan).
  const mulaiRef = useRef<number>(Date.now());

  const { VisualModel, UserAction } = modul;

  const handleSubmit = useCallback(
    (jawaban: TJawaban) => {
      percobaanRef.current += 1;
      const penilaian = modul.nilai(jawaban, state);

      const attempt: AttemptResult = {
        benar: penilaian.benar,
        mistakeType: penilaian.mistakeType,
        nomorPercobaan: percobaanRef.current,
      };

      if (!penilaian.benar) {
        // mistakeType wajib terisi saat salah — tanpa ini event log cacat (FR-015).
        const tipe = penilaian.mistakeType ?? 'tidak_terklasifikasi';
        setMistakes((m) => [
          ...m,
          {
            conceptId: modul.conceptIds[0] ?? modul.id,
            mistakeType: tipe,
            nomorPercobaan: attempt.nomorPercobaan,
          },
        ]);
      }

      setHasil(attempt);
      setLangkah('feedback');
    },
    [modul, state],
  );

  /** Percobaan ulang: kembali ke langkah aksi tanpa mengunci siswa keluar (kontrak aturan 3). */
  const cobaLagi = useCallback(() => {
    setHasil(null);
    setLangkah('action');
  }, []);

  const keDepan = useCallback(() => {
    setLangkah((s) => {
      switch (s) {
        case 'prompt':
          return 'visual';
        case 'visual':
          return 'action';
        case 'feedback':
          return 'why';
        case 'why':
          return 'reflection';
        case 'reflection':
          return 'continue';
        default:
          return s;
      }
    });
  }, []);

  /**
   * Masuk ke langkah 7: pelajaran ditandai selesai.
   * Ini SATU-SATUNYA jalur yang memberikan Lumens dan menerbitkan event.
   */
  const masukLangkahSelesai = useCallback(() => {
    const durasiMs = Math.max(1, Date.now() - mulaiRef.current);
    const hasilProgres = selesaikanPelajaran(modul.id, mistakes.length);
    setLumens(hasilProgres.siswa.lumens);
    setLumensDidapat(hasilProgres.lumensDidapat);

    void telemetry
      .record({
        type: 'lesson_completed',
        eventId: buatEventId(),
        siswaId: hasilProgres.siswa.id,
        moduleId: modul.id,
        conceptIds: modul.conceptIds,
        mistakes,
        durasiMs,
        selesaiPada: new Date().toISOString(),
        schemaVersion: 1,
      })
      // Gagal diam-diam dilarang (kontrak aturan 3) — munculkan errornya.
      .catch((err: unknown) => {
        console.error('[lumera/telemetry] event lesson_completed GAGAL ditulis:', err);
      });

    setLangkah('continue');
  }, [modul.conceptIds, modul.id, mistakes]);

  const teksKenapa = useMemo(
    () => (hasil ? modul.penjelasanKenapa(hasil) : ''),
    [hasil, modul],
  );

  const tombolLanjut = (label: string, aksi: () => void) => (
    <button
      type="button"
      onClick={aksi}
      style={{
        width: '100%',
        background: color.teal,
        color: color.ivory,
        border: 'none',
        borderRadius: radius.pill,
        padding: spacing.md,
        fontFamily: typography.fontFamilyUI,
        fontSize: typography.size.base,
        fontWeight: typography.weight.semibold,
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );

  let isi = null;
  let kontrol = null;
  const bilah = hasil && langkah === 'feedback' ? <Step4_InstantFeedback hasil={hasil} /> : null;

  switch (langkah) {
    case 'prompt':
      isi = <Step1_Prompt prompt={modul.prompt} judul={modul.judul} />;
      kontrol = tombolLanjut('Mulai', keDepan);
      break;

    case 'visual':
      isi = <VisualModel state={state} onStateChange={setState} />;
      kontrol = tombolLanjut('Saya siap menjawab', keDepan);
      break;

    case 'action':
      isi = (
        <>
          <VisualModel state={state} onStateChange={setState} />
          <UserAction state={state} onSubmit={handleSubmit} disabled={false} />
        </>
      );
      break;

    case 'feedback':
      isi = (
        <>
          <VisualModel state={state} onStateChange={setState} />
          <UserAction state={state} onSubmit={handleSubmit} disabled />
        </>
      );
      kontrol = tombolLanjut('Kenapa begitu?', keDepan);
      break;

    case 'why':
      isi = <Step5_WhyExplanation teks={teksKenapa} />;
      kontrol = (
        <div style={{ display: 'flex', gap: spacing.sm }}>
          {hasil && !hasil.benar ? (
            <button
              type="button"
              onClick={cobaLagi}
              style={{
                flex: 1,
                background: 'transparent',
                color: color.teal,
                border: `1px solid ${color.teal}`,
                borderRadius: radius.pill,
                padding: spacing.md,
                fontFamily: typography.fontFamilyUI,
                fontSize: typography.size.base,
                cursor: 'pointer',
              }}
            >
              Coba lagi
            </button>
          ) : null}
          <div style={{ flex: 1 }}>{tombolLanjut('Lanjut', keDepan)}</div>
        </div>
      );
      break;

    case 'reflection':
      isi = <Step6_Reflection pertanyaan={modul.pertanyaanRefleksi} />;
      kontrol = tombolLanjut('Selesai', masukLangkahSelesai);
      break;

    case 'continue':
      isi = <Step7_Continue onLanjutkan={onSelesai} lumensDidapat={lumensDidapat} />;
      break;
  }

  return (
    <LessonChrome
      langkahAktif={langkah}
      lumens={lumens}
      onTutup={onKeluar}
      bilahUmpanBalik={bilah}
      kontrolJawaban={kontrol}
    >
      {isi}
    </LessonChrome>
  );
}
