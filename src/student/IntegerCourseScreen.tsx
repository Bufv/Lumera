import { useState } from 'react';
import { ArtworkFrame } from '../design/ArtworkFrame';
import { Icon } from '../design/Icon';
import { RiveGameboardNode } from '../design/RiveGameboardNode';
import { INTEGER_COURSE } from './catalog';
import type { CourseView, RouteName } from './routes';
import { Breadcrumbs } from './StudentScreens';
import type { StudentModuleSummary } from './types';
import './IntegerCourseScreen.css';

/* ------------------------------------------------------------------ model */

type StatusSimpul = 'selesai' | 'berjalan' | 'terkunci' | 'rencana';

interface SimpulJalur {
  id: string;
  judul: string;
  status: StatusSimpul;
  /** Modul nyata dari katalog; null untuk modul yang naskahnya belum ada. */
  modul: StudentModuleSummary | null;
}

interface LevelJalur {
  id: string;
  nomor: number;
  judul: string;
  simpul: SimpulJalur[];
}

/**
 * Katalog baru punya dua modul; sisanya rencana kurikulum. Modul rencana tetap
 * ditampilkan sebagai simpul agar bentuk jalurnya terbaca, tetapi statusnya
 * 'rencana' sehingga tidak pernah bisa dibuka (aturan comingSoon di README).
 */
const MODUL_RENCANA: Readonly<Record<string, string[]>> = {
  'level-1': ['Garis Bilangan dan Urutan', 'Nilai Mutlak'],
  'level-2': ['Perkalian dan Pembagian', 'Sifat Operasi Hitung', 'Soal Kontekstual'],
};

function statusModul(index: number, progres: number): StatusSimpul {
  if (progres >= 100) return 'selesai';
  if (progres > 0) return 'berjalan';
  return index === 0 ? 'berjalan' : 'terkunci';
}

function susunLevel(moduleProgress: Readonly<Record<string, number>>): LevelJalur[] {
  const nyata: SimpulJalur[] = INTEGER_COURSE.modules.map((modul, index) => ({
    id: modul.id,
    judul: modul.title,
    status: statusModul(index, moduleProgress[modul.id] ?? 0),
    modul,
  }));

  const rencana = (levelId: string): SimpulJalur[] =>
    (MODUL_RENCANA[levelId] ?? []).map((judul) => ({
      id: `${levelId}-${judul}`,
      judul,
      status: 'rencana' as const,
      modul: null,
    }));

  return [
    { id: 'level-1', nomor: 1, judul: 'Fondasi Bilangan', simpul: [...nyata, ...rencana('level-1')] },
    { id: 'level-2', nomor: 2, judul: 'Operasi Lanjutan', simpul: rencana('level-2') },
  ];
}

const LABEL_STATUS: Record<StatusSimpul, string> = {
  selesai: 'Selesai',
  berjalan: 'Sedang berjalan',
  terkunci: 'Terkunci',
  rencana: 'Segera hadir',
};

const AKSI_STATUS: Record<StatusSimpul, string> = {
  selesai: 'Ulangi modul',
  berjalan: 'Lanjutkan',
  terkunci: 'Terkunci',
  rencana: 'Segera hadir',
};

const KETERANGAN_STATUS: Record<StatusSimpul, string> = {
  selesai: 'Semua capaian modul ini sudah dikuasai.',
  berjalan: 'Lanjutkan dari capaian terakhir yang kamu kerjakan.',
  terkunci: 'Terbuka setelah modul sebelumnya selesai.',
  rencana: 'Naskah modul ini masih kami siapkan.',
};

/** Pola zig-zag baris peron: tengah, kiri, tengah, kanan, berulang. */
const POSISI_BARIS = ['tengah', 'kiri', 'tengah', 'kanan'] as const;

/* ------------------------------------------------------------------ simpul */

function SimpulPeron({
  simpul,
  posisi,
  terbuka,
  onPilih,
  onBuka,
}: {
  simpul: SimpulJalur;
  posisi: 'kiri' | 'tengah' | 'kanan';
  terbuka: boolean;
  onPilih: () => void;
  onBuka: (module: StudentModuleSummary) => void;
}) {
  const dapatDibuka = simpul.status === 'selesai' || simpul.status === 'berjalan';

  return (
    <div className="course-path__baris" data-posisi={posisi}>
      <div className="course-node" data-status={simpul.status}>
        <button
          type="button"
          className="course-node__peron"
          onClick={onPilih}
          aria-expanded={terbuka}
          aria-label={`${simpul.judul}, ${LABEL_STATUS[simpul.status].toLowerCase()}`}
        >
          <RiveGameboardNode status={simpul.status} selected={terbuka} />
        </button>

        <p className="course-node__judul">{simpul.judul}</p>

        {terbuka && (
          <div className="course-node__kartu" role="dialog" aria-label={simpul.judul}>
            <strong>{simpul.judul}</strong>
            <small>{KETERANGAN_STATUS[simpul.status]}</small>
            <button
              type="button"
              className="course-node__aksi"
              data-status={simpul.status}
              aria-disabled={!dapatDibuka}
              disabled={!dapatDibuka}
              onClick={() => {
                if (simpul.modul && dapatDibuka) onBuka(simpul.modul);
              }}
            >
              {AKSI_STATUS[simpul.status]}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ layar */

export function IntegerCourseScreen({
  percent,
  view,
  onChangeView,
  moduleProgress,
  onNavigate,
  onOpenModule,
}: {
  percent: number;
  view: CourseView;
  onChangeView: (view: CourseView) => void;
  moduleProgress: Readonly<Record<string, number>>;
  onNavigate: (route: RouteName) => void;
  onOpenModule: (module: StudentModuleSummary) => void;
}) {
  const [simpulTerbuka, setSimpulTerbuka] = useState<string | null>(null);
  const level = susunLevel(moduleProgress);
  const jumlahModul = level.reduce((total, l) => total + l.simpul.length, 0);
  const selesai = level.reduce(
    (total, l) => total + l.simpul.filter((s) => s.status === 'selesai').length,
    0,
  );
  const safePercent = Math.max(0, Math.min(100, percent));

  const gantiTampilan = (berikutnya: CourseView) => {
    setSimpulTerbuka(null);
    onChangeView(berikutnya);
  };

  const bukaModul = (module: StudentModuleSummary) => {
    setSimpulTerbuka(null);
    onOpenModule(module);
  };

  let urutan = 0;

  return (
    <main className="student-page course-page">
      <div className="student-container">
        <Breadcrumbs
          items={[
            { label: 'Belajar', onClick: () => onNavigate('learn') },
            { label: 'Matematika', onClick: () => onNavigate('math') },
            { label: 'Bilangan Bulat' },
          ]}
        />

        <div className="course-layout">
          <aside className="course-aside">
            <section className="course-card">
              <ArtworkFrame
                assetKey={INTEGER_COURSE.artworkKey}
                placeholderIcon="math"
                alt="Ilustrasi Bilangan Bulat"
                ratio="wide"
                variant="violet"
              />
              <span className="page-kicker">Kursus · SMP Kelas VII</span>
              <h1>{INTEGER_COURSE.title}</h1>
              <p>{INTEGER_COURSE.description}</p>
              <div className="course-card__meta">
                <span>{jumlahModul} modul</span>
                <i aria-hidden="true" />
                <span>{level.length} level</span>
              </div>
              <div className="course-card__progres">
                <div>
                  <strong>{safePercent}%</strong>
                  <small>
                    {selesai} dari {jumlahModul} modul
                  </small>
                </div>
                <span
                  className="course-card__bar"
                  role="progressbar"
                  aria-valuenow={safePercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${safePercent}% kursus Bilangan Bulat selesai`}
                >
                  <i style={{ width: `${safePercent}%` }} />
                </span>
              </div>
            </section>

            <div className="course-view-switch" role="group" aria-label="Pilih tampilan kursus">
              <button
                type="button"
                data-active={view === 'roadmap'}
                aria-pressed={view === 'roadmap'}
                onClick={() => gantiTampilan('roadmap')}
              >
                <Icon name="route" width={17} height={17} />
                Jalur
              </button>
              <button
                type="button"
                data-active={view === 'list'}
                aria-pressed={view === 'list'}
                onClick={() => gantiTampilan('list')}
              >
                <Icon name="list" width={17} height={17} />
                Daftar
              </button>
            </div>
          </aside>

          <div className="course-kolom">
            {view === 'roadmap' ? (
              <div className="course-path" data-view="roadmap">
                {level.map((l) => (
                  <section key={l.id} className="course-path__level">
                    <header className="course-level" data-aktif={l.nomor === 1}>
                      <span>Level {l.nomor}</span>
                      <strong>{l.judul}</strong>
                    </header>
                    {l.simpul.map((simpul) => {
                      const posisi = POSISI_BARIS[urutan++ % 4] ?? 'tengah';
                      return (
                        <SimpulPeron
                          key={simpul.id}
                          simpul={simpul}
                          posisi={posisi}
                          terbuka={simpulTerbuka === simpul.id}
                          onPilih={() =>
                            setSimpulTerbuka((kini) => (kini === simpul.id ? null : simpul.id))
                          }
                          onBuka={bukaModul}
                        />
                      );
                    })}
                  </section>
                ))}
                <p className="course-path__catatan">
                  Modul di luar dua modul pertama masih berupa rencana kurikulum.
                </p>
              </div>
            ) : (
              <div className="course-rows" data-view="list">
                {level.map((l) => {
                  const selesaiLevel = l.simpul.filter((s) => s.status === 'selesai').length;
                  return (
                    <section key={l.id} className="course-rows__level">
                      <header>
                        <strong>
                          Level {l.nomor} · {l.judul}
                        </strong>
                        <small>
                          {l.simpul.some((s) => s.status !== 'rencana')
                            ? `${selesaiLevel} / ${l.simpul.length} selesai`
                            : 'Belum terbuka'}
                        </small>
                      </header>
                      <ul>
                        {l.simpul.map((simpul, index) => {
                          const dapatDibuka =
                            simpul.status === 'selesai' || simpul.status === 'berjalan';
                          return (
                            <li key={simpul.id}>
                              <button
                                type="button"
                                className="course-row"
                                data-status={simpul.status}
                                disabled={!dapatDibuka}
                                aria-disabled={!dapatDibuka}
                                onClick={() => {
                                  if (simpul.modul && dapatDibuka) onOpenModule(simpul.modul);
                                }}
                              >
                                <span className="course-row__nomor">
                                  {String(index + 1).padStart(2, '0')}
                                </span>
                                <span className="course-row__ikon" aria-hidden="true">
                                  {simpul.status === 'selesai' && (
                                    <Icon name="check" width={14} height={14} />
                                  )}
                                  {simpul.status === 'berjalan' && (
                                    <Icon name="play" width={13} height={13} />
                                  )}
                                  {(simpul.status === 'terkunci' || simpul.status === 'rencana') && (
                                    <Icon name="lock" width={13} height={13} />
                                  )}
                                </span>
                                <span className="course-row__judul">{simpul.judul}</span>
                                <span className="course-row__status">
                                  {LABEL_STATUS[simpul.status]}
                                </span>
                                {dapatDibuka ? (
                                  <Icon name="chevron" width={16} height={16} />
                                ) : (
                                  <span />
                                )}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </section>
                  );
                })}
                <p className="course-rows__catatan">
                  Modul di luar dua modul pertama masih berupa rencana kurikulum.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
