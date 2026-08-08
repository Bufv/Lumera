import type { ReactNode } from 'react';
import { Icon } from '../design/Icon';
import { LESSON_STEPS, type LessonStep } from './types';
import './LessonChrome.css';

/**
 * Layout UI pelajaran sesuai FR-011:
 * tombol tutup kiri atas, progress dots tengah atas, Lumens kanan atas,
 * area interaksi tengah, bilah umpan balik paling bawah.
 */
export function LessonChrome({
  langkahAktif,
  lumens,
  onTutup,
  children,
  bilahUmpanBalik,
  kontrolJawaban,
}: {
  langkahAktif: LessonStep;
  lumens: number;
  onTutup: () => void;
  children: ReactNode;
  bilahUmpanBalik?: ReactNode;
  kontrolJawaban?: ReactNode;
}) {
  const indeksAktif = LESSON_STEPS.indexOf(langkahAktif);

  return (
    <div className="pelajaran">
      <header className="pelajaran__atas">
        <button
          type="button"
          className="pelajaran__tutup"
          onClick={onTutup}
          aria-label="Tutup pelajaran"
        >
          <Icon name="close" width={20} height={20} />
        </button>

        <div
          className="pelajaran__titik"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={LESSON_STEPS.length}
          aria-valuenow={indeksAktif + 1}
          aria-label={`Langkah ${indeksAktif + 1} dari ${LESSON_STEPS.length}`}
        >
          {LESSON_STEPS.map((s, i) => (
            <i
              key={s}
              className={i === indeksAktif ? 'is-aktif' : i < indeksAktif ? 'is-lewat' : undefined}
            />
          ))}
        </div>

        <div className="pelajaran__lumens">
          <Icon name="sparkles" width={16} height={16} />
          {lumens} <span>Lumens</span>
        </div>
      </header>

      <main className="pelajaran__isi">
        <div>{children}</div>
      </main>

      {kontrolJawaban ? <div className="pelajaran__kontrol">{kontrolJawaban}</div> : null}

      {bilahUmpanBalik ? (
        <div className="pelajaran__bilah">
          <div>{bilahUmpanBalik}</div>
        </div>
      ) : null}
    </div>
  );
}
