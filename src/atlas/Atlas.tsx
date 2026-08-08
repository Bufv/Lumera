import { useMemo, useState } from 'react';
import { Icon, type IconName } from '../design/Icon';
import { Lumo } from '../design/Lumo';
import { semuaModul } from '../shell/registry';
import { SUBJECT_WORLDS } from './subject-worlds';
import type { Siswa } from '../progress/store';
import './Atlas.css';

const DEFAULT_WORLD_META: { icon: IconName; description: string; accent: string; soft: string } = {
  icon: 'math',
  description: 'Pola, grafik, dan hubungan antarnilai.',
  accent: '#6C4FF8',
  soft: '#EEE9FF',
};

const WORLD_META: Record<string, typeof DEFAULT_WORLD_META> = {
  matematika: DEFAULT_WORLD_META,
  sains: {
    icon: 'science',
    description: 'Gerak dan gejala alam melalui simulasi.',
    accent: '#28B873',
    soft: '#E3F8EC',
  },
  ekonomi: {
    icon: 'bar-chart',
    description: 'Keputusan pasar lewat model visual.',
    accent: '#F39A16',
    soft: '#FFF2D7',
  },
  sejarah: {
    icon: 'globe',
    description: 'Rantai sebab-akibat dalam peristiwa.',
    accent: '#3B82F6',
    soft: '#E8F1FF',
  },
};

export function Atlas({
  siswa,
  onPilihModul,
  onKembali,
}: {
  siswa: Siswa;
  onPilihModul: (moduleId: string) => void;
  onKembali?: () => void;
}) {
  const modul = useMemo(() => semuaModul(), []);
  const mastery = useMemo(
    () => new Map(siswa.mastery.map((item) => [item.moduleId, item.masteryPersen])),
    [siswa.mastery],
  );
  const modulById = useMemo(() => new Map(modul.map((item) => [item.id, item])), [modul]);
  const awal =
    modul.find((item) => (mastery.get(item.id) ?? 0) > 0 && (mastery.get(item.id) ?? 0) < 100)
      ?.id ??
    modul[0]?.id ??
    '';
  const [moduleIdAktif, setModuleIdAktif] = useState(awal);
  const [mode, setMode] = useState<'peta' | 'daftar'>('peta');

  const moduleAktif = modulById.get(moduleIdAktif) ?? modul[0];
  const duniaAktif =
    SUBJECT_WORLDS.find((world) => world.id === moduleAktif?.subjectWorldId) ?? SUBJECT_WORLDS[0];
  const metaAktif = WORLD_META[duniaAktif?.id ?? 'matematika'] ?? DEFAULT_WORLD_META;
  const persenAktif = moduleAktif ? (mastery.get(moduleAktif.id) ?? 0) : 0;
  const totalProgress =
    modul.length > 0
      ? Math.round(modul.reduce((sum, item) => sum + (mastery.get(item.id) ?? 0), 0) / modul.length)
      : 0;

  const connections = SUBJECT_WORLDS.flatMap((world) =>
    world.connections
      .filter((targetId) => world.id < targetId)
      .map((targetId) => ({
        from: world,
        to: SUBJECT_WORLDS.find((item) => item.id === targetId),
      })),
  ).filter(
    (
      edge,
    ): edge is { from: (typeof SUBJECT_WORLDS)[number]; to: (typeof SUBJECT_WORLDS)[number] } =>
      Boolean(edge.to),
  );

  const pilihDunia = (worldId: string) => {
    const world = SUBJECT_WORLDS.find((item) => item.id === worldId);
    const firstModule = world?.moduleIds.find((id) => modulById.has(id));
    if (firstModule) setModuleIdAktif(firstModule);
  };

  return (
    <div className="atlas-page">
      <main className="atlas-shell">
        <nav className="atlas-breadcrumb" aria-label="Breadcrumb">
          <button type="button" onClick={onKembali}>
            <Icon name="home" width={16} height={16} />
            <span>Beranda</span>
          </button>
          <Icon name="chevron" width={14} height={14} />
          <span>Peta Ilmu</span>
        </nav>

        <section className="atlas-hero">
          <div className="atlas-hero__title">
            <span
              className="atlas-hero__icon"
              style={{ color: metaAktif.accent, background: metaAktif.soft }}
            >
              <Icon name={metaAktif.icon} width={39} height={39} />
            </span>
            <div>
              <span className="atlas-eyebrow">LUMERA ATLAS</span>
              <h1>Peta Ilmu</h1>
              <p>Jelajahi hubungan antardunia ilmu dan lanjutkan dari titikmu sekarang.</p>
            </div>
          </div>
          <div className="atlas-hero__stats">
            <span>
              <Icon name="route" width={19} height={19} />
              <b>{SUBJECT_WORLDS.length}</b>
              <small>Dunia ilmu</small>
            </span>
            <span>
              <Icon name="book" width={19} height={19} />
              <b>{modul.length}</b>
              <small>Pelajaran</small>
            </span>
            <AtlasRing value={totalProgress} />
          </div>
          <div className="view-toggle" aria-label="Pilih tampilan">
            <button
              type="button"
              className={mode === 'peta' ? 'is-active' : ''}
              onClick={() => setMode('peta')}
              aria-pressed={mode === 'peta'}
            >
              <Icon name="route" width={17} height={17} /> Jalur
            </button>
            <button
              type="button"
              className={mode === 'daftar' ? 'is-active' : ''}
              onClick={() => setMode('daftar')}
              aria-pressed={mode === 'daftar'}
            >
              <Icon name="list" width={17} height={17} /> Daftar
            </button>
          </div>
        </section>

        <div className="atlas-layout">
          <section className="atlas-map-card">
            <div className="atlas-map-card__heading">
              <div>
                <span>JALUR BELAJAR</span>
                <h2>Hubungkan cara berpikirmu</h2>
              </div>
              <p>Setiap node membuka pelajaran yang benar-benar tersedia.</p>
            </div>
            {mode === 'peta' ? (
              <div className="knowledge-map">
                <svg
                  className="knowledge-map__lines"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  {connections.map((edge) => (
                    <line
                      key={`${edge.from.id}-${edge.to.id}`}
                      x1={edge.from.x}
                      y1={edge.from.y}
                      x2={edge.to.x}
                      y2={edge.to.y}
                    />
                  ))}
                </svg>
                <div className="knowledge-map__glow" aria-hidden />
                {SUBJECT_WORLDS.map((world) => {
                  const worldModule = world.moduleIds.map((id) => modulById.get(id)).find(Boolean);
                  const progress = worldModule ? (mastery.get(worldModule.id) ?? 0) : 0;
                  const selesai = worldModule ? siswa.modulSelesai.includes(worldModule.id) : false;
                  const aktif = world.id === duniaAktif?.id;
                  const meta = WORLD_META[world.id] ?? DEFAULT_WORLD_META;
                  return (
                    <button
                      key={world.id}
                      type="button"
                      className={`world-node${aktif ? ' world-node--active' : ''}${selesai ? ' world-node--done' : ''}`}
                      style={
                        {
                          left: `${world.x}%`,
                          top: `${world.y}%`,
                          '--node-accent': meta.accent,
                          '--node-soft': meta.soft,
                        } as React.CSSProperties
                      }
                      onClick={() => pilihDunia(world.id)}
                    >
                      <span className="world-node__platform">
                        <span>
                          <Icon name={selesai ? 'check' : meta.icon} width={28} height={28} />
                        </span>
                      </span>
                      <span className="world-node__label">
                        <b>{world.nama}</b>
                        <small>{worldModule?.judul ?? 'Belum tersedia'}</small>
                        <i>{progress}%</i>
                      </span>
                      {aktif && <span className="world-node__marker">Kamu di sini</span>}
                    </button>
                  );
                })}
                <div className="knowledge-map__lumo" aria-hidden>
                  <Lumo size={64} />
                  <span>Pilih satu dunia ilmu.</span>
                </div>
              </div>
            ) : (
              <div className="atlas-list">
                {SUBJECT_WORLDS.map((world, worldIndex) => {
                  const meta = WORLD_META[world.id] ?? DEFAULT_WORLD_META;
                  const moduleWorld = world.moduleIds
                    .map((id) => modulById.get(id))
                    .filter((item): item is NonNullable<typeof item> => Boolean(item));
                  const progress =
                    moduleWorld.length > 0
                      ? Math.round(
                          moduleWorld.reduce((sum, item) => sum + (mastery.get(item.id) ?? 0), 0) /
                            moduleWorld.length,
                        )
                      : 0;
                  return (
                    <article key={world.id} className="atlas-list__world">
                      <div className="atlas-list__world-heading">
                        <span style={{ color: meta.accent, background: meta.soft }}>
                          <Icon name={meta.icon} width={22} height={22} />
                        </span>
                        <div>
                          <small>DUNIA {worldIndex + 1}</small>
                          <h3>{world.nama}</h3>
                        </div>
                        <b>{progress}%</b>
                      </div>
                      {moduleWorld.map((item, index) => {
                        const itemProgress = mastery.get(item.id) ?? 0;
                        const done = siswa.modulSelesai.includes(item.id);
                        return (
                          <button
                            key={item.id}
                            type="button"
                            className={item.id === moduleAktif?.id ? 'is-current' : ''}
                            onClick={() => setModuleIdAktif(item.id)}
                          >
                            <span>{String(index + 1).padStart(2, '0')}</span>
                            <span>
                              <b>{item.judul}</b>
                              <small>{item.conceptIds.length} konsep terhubung</small>
                            </span>
                            <span
                              className={done ? 'atlas-state atlas-state--done' : 'atlas-state'}
                            >
                              {done
                                ? 'Selesai'
                                : itemProgress > 0
                                  ? 'Sedang dipelajari'
                                  : 'Siap dimulai'}
                            </span>
                            <Icon name="chevron" width={17} height={17} />
                          </button>
                        );
                      })}
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <aside className="atlas-sidebar">
            {moduleAktif && (
              <section className="current-lesson-card">
                <span
                  className="current-lesson-card__icon"
                  style={{ color: metaAktif.accent, background: metaAktif.soft }}
                >
                  <Icon name="bar-chart" width={24} height={24} />
                </span>
                <span className="current-lesson-card__kicker">PELAJARAN TERPILIH</span>
                <h2>{moduleAktif.judul}</h2>
                <p>{metaAktif.description}</p>
                <div className="current-lesson-card__progress">
                  <span>
                    <b>{persenAktif}%</b>
                    <small>penguasaan modul</small>
                  </span>
                  <span>
                    <i style={{ width: `${persenAktif}%`, background: metaAktif.accent }} />
                  </span>
                </div>
                <button type="button" onClick={() => onPilihModul(moduleAktif.id)}>
                  {persenAktif > 0 ? 'Lanjutkan belajar' : 'Mulai belajar'}
                  <Icon name="play" width={18} height={18} />
                </button>
              </section>
            )}

            {moduleAktif && (
              <section className="concept-card">
                <h2>Konsep dalam pelajaran</h2>
                <p>Codebase saat ini menyimpan mastery di tingkat modul, belum per konsep.</p>
                <ul>
                  {moduleAktif.conceptIds.map((concept) => (
                    <li key={concept}>
                      <span
                        className={siswa.modulSelesai.includes(moduleAktif.id) ? 'is-done' : ''}
                      >
                        {siswa.modulSelesai.includes(moduleAktif.id) ? (
                          <Icon name="check" width={12} height={12} />
                        ) : null}
                      </span>
                      <b>{formatConcept(concept)}</b>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="atlas-note">
              <Icon name="bookmark" width={23} height={23} />
              <div>
                <b>Progresmu tersimpan</b>
                <p>Kamu bisa melanjutkan dari pelajaran terakhir pada perangkat ini.</p>
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}

function AtlasRing({ value }: { value: number }) {
  const safe = Math.max(0, Math.min(100, value));
  return (
    <span
      className="atlas-ring"
      style={{ background: `conic-gradient(#6C4FF8 ${safe * 3.6}deg, #E8E5F5 0deg)` }}
      role="progressbar"
      aria-label={`Progres keseluruhan ${safe}%`}
      aria-valuenow={safe}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <i>{safe}%</i>
    </span>
  );
}

function formatConcept(value: string) {
  return value
    .split('-')
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}
