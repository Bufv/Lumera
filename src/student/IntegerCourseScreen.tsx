import { useState, useEffect, type CSSProperties } from 'react';
import { Icon } from '../design/Icon';
import { RiveGameboardNode } from '../design/RiveGameboardNode';
import { Tactile } from '../design/Tactile';
import { INTEGER_COURSE } from './catalog';
import type { CourseView, RouteName } from './routes';
import type { StudentModuleSummary } from './types';
import type { RiveNodeStatus } from '../design/RiveGameboardNode.types';
import './IntegerCourseScreen.css';

/* ------------------------------------------------------------------ model */

export type StatusSimpul = 'selesai' | 'berjalan' | 'terkunci' | 'rencana';

export interface SimpulJalur {
  id: string;
  nomorUrut: string;
  judul: string;
  deskripsi: string;
  status: StatusSimpul;
  modul: StudentModuleSummary | null;
}

export interface LevelJalur {
  id: string;
  nomor: number;
  judul: string;
  simpul: SimpulJalur[];
}

const NODE_COORDINATES = [
  { left: 42, top: 40 },  // Node 1: Center-Right
  { left: 16, top: 220 }, // Node 2: Far Left
  { left: 41, top: 400 }, // Node 3: Center
  { left: 65, top: 580 }, // Node 4: Far Right
] as const;

const DESKRIPSI_MODUL: Record<string, string> = {
  'bilangan-di-bawah-nol': 'Mengenali bilangan negatif melalui suhu, posisi, dan garis bilangan.',
  'operasi-bilangan-bulat': 'Memahami perubahan nilai saat bilangan bulat dijumlahkan atau dikurangkan.',
  'garis-bilangan-dan-urutan': 'Membandingkan dan mengurutkan bilangan bulat pada garis bilangan.',
  'nilai-mutlak': 'Menjelaskan jarak dari nol dan makna nilai mutlak dalam konteks nyata.',
  'perkalian-dan-pembagian': 'Menemukan pola tanda pada perkalian dan pembagian bilangan bulat.',
  'sifat-operasi-hitung': 'Memanfaatkan sifat komutatif, asosiatif, dan distributif.',
  'soal-kontekstual': 'Memecahkan masalah kontekstual menggunakan bilangan bulat.',
};

function statusModul(index: number, progres: number): StatusSimpul {
  if (progres >= 100) return 'selesai';
  if (progres > 0) return 'berjalan';
  return index === 0 ? 'berjalan' : 'terkunci';
}

function susunLevel(moduleProgress: Readonly<Record<string, number>>): LevelJalur[] {
  const level1Simpul: SimpulJalur[] = [
    {
      id: 'bilangan-di-bawah-nol',
      nomorUrut: '1.1',
      judul: 'Bilangan di Bawah Nol',
      deskripsi: DESKRIPSI_MODUL['bilangan-di-bawah-nol'] ?? '',
      status: statusModul(0, moduleProgress['bilangan-di-bawah-nol'] ?? 0),
      modul: INTEGER_COURSE.modules[0] ?? null,
    },
    {
      id: 'operasi-bilangan-bulat',
      nomorUrut: '1.2',
      judul: 'Operasi Bilangan Bulat',
      deskripsi: DESKRIPSI_MODUL['operasi-bilangan-bulat'] ?? '',
      status:
        (moduleProgress['bilangan-di-bawah-nol'] ?? 0) > 0
          ? statusModul(1, moduleProgress['operasi-bilangan-bulat'] ?? 0)
          : 'terkunci',
      modul: INTEGER_COURSE.modules[1] ?? null,
    },
    {
      id: 'level-1-Garis Bilangan dan Urutan',
      nomorUrut: '1.3',
      judul: 'Garis Bilangan dan Urutan',
      deskripsi: DESKRIPSI_MODUL['garis-bilangan-dan-urutan'] ?? '',
      status: 'rencana',
      modul: null,
    },
    {
      id: 'level-1-Nilai Mutlak',
      nomorUrut: '1.4',
      judul: 'Nilai Mutlak',
      deskripsi: DESKRIPSI_MODUL['nilai-mutlak'] ?? '',
      status: 'rencana',
      modul: null,
    },
  ];

  const level2Simpul: SimpulJalur[] = [
    {
      id: 'level-2-Perkalian dan Pembagian',
      nomorUrut: '2.1',
      judul: 'Perkalian dan Pembagian',
      deskripsi: DESKRIPSI_MODUL['perkalian-dan-pembagian'] ?? '',
      status: 'rencana',
      modul: null,
    },
    {
      id: 'level-2-Sifat Operasi Hitung',
      nomorUrut: '2.2',
      judul: 'Sifat Operasi Hitung',
      deskripsi: DESKRIPSI_MODUL['sifat-operasi-hitung'] ?? '',
      status: 'rencana',
      modul: null,
    },
    {
      id: 'level-2-Soal Kontekstual',
      nomorUrut: '2.3',
      judul: 'Soal Kontekstual',
      deskripsi: DESKRIPSI_MODUL['soal-kontekstual'] ?? '',
      status: 'rencana',
      modul: null,
    },
  ];

  return [
    {
      id: 'level-1',
      nomor: 1,
      judul: 'Fondasi Bilangan',
      simpul: level1Simpul,
    },
    {
      id: 'level-2',
      nomor: 2,
      judul: 'Operasi Lanjutan',
      simpul: level2Simpul,
    },
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
  selesai: 'Semua capaian modul ini sudah dikuasai. Kamu dapat mengulanginya kapan saja.',
  berjalan: 'Modul ini terbuka dan siap dipelajari.',
  terkunci: 'Selesaikan modul sebelumnya untuk membuka modul ini.',
  rencana: 'Materi modul ini sedang dipersiapkan dalam kurikulum.',
};

function mapStatusToRive(status: StatusSimpul): RiveNodeStatus {
  if (status === 'selesai') return 'selesai';
  if (status === 'berjalan') return 'berjalan';
  return 'terkunci';
}

/* ------------------------------------------------------------------ layar */

export interface IntegerCourseScreenProps {
  percent?: number;
  view?: CourseView;
  onChangeView?: (view: CourseView) => void;
  moduleProgress?: Readonly<Record<string, number>>;
  onNavigate: (route: RouteName) => void;
  onOpenModule?: (module: StudentModuleSummary) => void;
}

export function IntegerCourseScreen({
  view = 'roadmap',
  onChangeView,
  moduleProgress = {},
  onNavigate,
  onOpenModule,
}: IntegerCourseScreenProps) {
  const [simpulTerbuka, setSimpulTerbuka] = useState<string | null>(null);
  const levels = susunLevel(moduleProgress);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSimpulTerbuka(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const bukaModul = (simpul: SimpulJalur) => {
    const dapatDibuka = simpul.status === 'selesai' || simpul.status === 'berjalan';
    if (simpul.modul && dapatDibuka) {
      setSimpulTerbuka(null);
      onOpenModule?.(simpul.modul);
    }
  };

  return (
    <main className="student-page course-roadmap-canvas-screen course-page" data-view={view}>
      <div className="course-roadmap-canvas-container">
        {/* Minimal Toolbar */}
        <div className="course-roadmap-top-bar">
          <button
            type="button"
            className="learning-roadmap__back-btn"
            onClick={() => onNavigate('learn')}
            aria-label="Kembali ke Belajar"
          >
            <Icon name="arrow" width={16} height={16} />
            Kembali ke Belajar
          </button>

          {onChangeView && (
            <div className="course-view-switch" role="group" aria-label="Pilih tampilan kursus">
              <button
                type="button"
                data-active={view === 'roadmap'}
                aria-pressed={view === 'roadmap'}
                onClick={() => onChangeView('roadmap')}
              >
                <Icon name="route" width={15} height={15} />
                Jalur
              </button>
              <button
                type="button"
                data-active={view === 'list'}
                aria-pressed={view === 'list'}
                onClick={() => onChangeView('list')}
              >
                <Icon name="list" width={15} height={15} />
                Daftar
              </button>
            </div>
          )}
        </div>

        {view === 'roadmap' ? (
          <div className="course-roadmap-flow course-path" data-view="roadmap">
            {levels.map((lvl) => (
              <section key={lvl.id} className="course-roadmap-level-section course-path__level">
                {/* Top Level Pill matching exact screenshot */}
                <header className="course-level-pill course-level" data-aktif={lvl.nomor === 1}>
                  <span>LEVEL {lvl.nomor}</span>
                  <strong>{lvl.judul}</strong>
                </header>

                {/* Staggered Canvas Nodes */}
                <div
                  className="course-roadmap-staggered-canvas"
                  style={{ minHeight: `${lvl.simpul.length * 180 + 80}px` }}
                >
                  {lvl.simpul.map((simpul, index) => {
                    const coord = NODE_COORDINATES[index % NODE_COORDINATES.length] ?? {
                      left: 42,
                      top: index * 180 + 40,
                    };
                    const riveStatus = mapStatusToRive(simpul.status);
                    const dapatDibuka =
                      simpul.status === 'selesai' || simpul.status === 'berjalan';
                    const terbuka = simpulTerbuka === simpul.id;

                    const nodeStyle: CSSProperties = {
                      position: 'absolute',
                      left: `${coord.left}%`,
                      top: `${coord.top}px`,
                      zIndex: terbuka ? 60 : 1,
                    };

                    return (
                      <div
                        key={simpul.id}
                        className="course-roadmap-staggered-node course-node"
                        data-status={simpul.status}
                        style={nodeStyle}
                      >
                        <button
                          type="button"
                          className="course-roadmap-node__peron course-node__peron"
                          onClick={() =>
                            setSimpulTerbuka((curr) => (curr === simpul.id ? null : simpul.id))
                          }
                          aria-expanded={terbuka}
                          aria-label={`${simpul.judul}, ${LABEL_STATUS[simpul.status].toLowerCase()}`}
                        >
                          <RiveGameboardNode status={riveStatus} selected={terbuka} />
                        </button>

                        <div className="course-roadmap-node__label">
                          <strong className="course-roadmap-node__title course-node__judul">
                            {simpul.judul}
                          </strong>
                        </div>

                        {terbuka && (
                          <div
                            className="course-node__kartu"
                            role="dialog"
                            aria-label={simpul.judul}
                          >
                            <button
                              type="button"
                              className="course-node__kartu-close"
                              aria-label="Tutup"
                              onClick={() => setSimpulTerbuka(null)}
                            >
                              ×
                            </button>
                            <strong>{simpul.judul}</strong>
                            <p>{KETERANGAN_STATUS[simpul.status]}</p>
                            <Tactile
                              tone={simpul.status === 'berjalan' ? 'purple' : 'neutral'}
                              className="course-node__aksi"
                              data-status={simpul.status}
                              disabled={!dapatDibuka}
                              aria-disabled={!dapatDibuka}
                              onClick={() => bukaModul(simpul)}
                            >
                              {AKSI_STATUS[simpul.status]}
                              {dapatDibuka && (
                                <Icon name="arrow" width={15} height={15} />
                              )}
                            </Tactile>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="course-roadmap-list-view course-rows" data-view="list">
            {levels.map((lvl) => {
              const selesaiLevel = lvl.simpul.filter((s) => s.status === 'selesai').length;
              return (
                <section key={lvl.id} className="course-roadmap-list-level course-rows__level">
                  <header>
                    <strong>
                      Level {lvl.nomor} · {lvl.judul}
                    </strong>
                    <small>
                      {lvl.simpul.some((s) => s.status !== 'rencana')
                        ? `${selesaiLevel} / ${lvl.simpul.length} selesai`
                        : 'Belum terbuka'}
                    </small>
                  </header>
                  <ul>
                    {lvl.simpul.map((simpul, index) => {
                      const dapatDibuka =
                        simpul.status === 'selesai' || simpul.status === 'berjalan';
                      return (
                        <li key={simpul.id}>
                          <button
                            type="button"
                            className="course-roadmap-list-row course-row"
                            data-status={simpul.status}
                            disabled={!dapatDibuka}
                            aria-disabled={!dapatDibuka}
                            onClick={() => {
                              if (simpul.modul && dapatDibuka) onOpenModule?.(simpul.modul);
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
          </div>
        )}
      </div>
    </main>
  );
}
