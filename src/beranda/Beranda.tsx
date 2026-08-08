import { Icon, type IconName } from '../design/Icon';
import { Lumo } from '../design/Lumo';
import { SUBJECT_WORLDS } from '../atlas/subject-worlds';
import { semuaModul } from '../shell/registry';
import { pilihUsulan } from '../progress/suggestions';
import {
  TARGET_AKTIVITAS_HARIAN,
  aktivitasHariIni,
  aktivitasTerakhir,
  sapaanWaktu,
  stripStreak,
  tingkatKekuatan,
} from './harian';
import type { Siswa } from '../progress/store';
import './Beranda.css';

const IKON_REFRESH: IconName[] = ['book', 'target', 'bar-chart', 'sparkles'];
const IKON_DUNIA: Record<string, IconName> = {
  matematika: 'math',
  sains: 'science',
  ekonomi: 'bar-chart',
  sejarah: 'globe',
};

export function Beranda({
  siswa,
  onMulai,
  onBukaPetaIlmu,
  onBukaBelajar,
}: {
  siswa: Siswa;
  onMulai: (moduleId: string) => void;
  onBukaPetaIlmu: () => void;
  onBukaBelajar: () => void;
}) {
  const modulLengkap = semuaModul();
  const modulRingkas = modulLengkap.map((m) => ({
    id: m.id,
    judul: m.judul,
    subjectWorldId: m.subjectWorldId,
  }));
  const usulan = pilihUsulan(modulRingkas, siswa, 5);
  const utama = usulan[0];
  const rekomendasi = usulan.find((item) => item.alasan === 'ulang') ?? utama;
  const jumlahHariIni = aktivitasHariIni(siswa);
  const hariStreak = stripStreak(siswa);
  const judulModul = new Map(modulLengkap.map((m) => [m.id, m.judul]));
  const riwayat = aktivitasTerakhir(siswa, judulModul);
  const mastery = new Map(siswa.mastery.map((item) => [item.moduleId, item.masteryPersen]));
  const jam = new Date().getHours();

  const jalur = SUBJECT_WORLDS.map((dunia) => {
    const nilai = dunia.moduleIds
      .map((id) => mastery.get(id))
      .filter((x): x is number => x !== undefined);
    const persen =
      nilai.length > 0 ? Math.round(nilai.reduce((a, b) => a + b, 0) / nilai.length) : 0;
    return { ...dunia, persen };
  });

  return (
    <div className="home-page">
      <div className="home-page__intro">
        <h1>
          {sapaanWaktu(jam)}, Ardi <span aria-hidden>👋</span>
        </h1>
        <p>
          {utama
            ? 'Mau lanjut belajar atau menyegarkan ingatanmu?'
            : 'Pilih jalur untuk mulai belajar.'}
        </p>
      </div>

      <main className="home-layout">
        <div className="home-main">
          {utama ? (
            <section className="continue-card">
              <div className="continue-card__art" aria-hidden>
                <img src="/assets/math_banner.png" alt="" />
              </div>
              <div className="continue-card__content">
                <div className="continue-card__lumo" aria-hidden>
                  <Lumo size={76} />
                  <span>Kamu bisa hari ini.</span>
                </div>
                <span className="eyebrow">
                  {utama.masteryPersen === null ? 'MULAI JALUR BELAJAR' : 'LANJUTKAN BELAJAR'}
                </span>
                <h2>{utama.judul}</h2>
                <p className="continue-card__subject">
                  <span />
                  {utama.subjectWorldNama}
                </p>
                <div className="continue-card__footer">
                  <div className="continue-card__progress">
                    <span>{utama.masteryPersen ?? 0}% selesai</span>
                    <ProgressBar value={utama.masteryPersen ?? 0} />
                  </div>
                  <button
                    type="button"
                    className="button button--primary"
                    onClick={() => onMulai(utama.moduleId)}
                  >
                    {utama.masteryPersen === null ? 'Mulai belajar' : 'Lanjutkan'}
                    <Icon name="arrow" width={20} height={20} />
                  </button>
                </div>
              </div>
            </section>
          ) : (
            <section className="empty-card">
              <Icon name="book" width={28} height={28} />
              <div>
                <h2>Belum ada pelajaran</h2>
                <p>Tambahkan modul ke registry untuk mulai belajar.</p>
              </div>
            </section>
          )}

          <section className="panel refresh-panel">
            <div className="section-heading">
              <div>
                <div className="section-heading__title-row">
                  <h2>Refresh Harian</h2>
                  <span
                    className="info-dot"
                    title="Urutan diambil dari konsep yang paling perlu dilatih"
                  >
                    <Icon name="info" width={14} height={14} />
                  </span>
                </div>
                <p>Segarkan konsep sebelum mulai terlupakan.</p>
              </div>
              {rekomendasi && (
                <button
                  type="button"
                  className="button button--soft"
                  onClick={() => onMulai(rekomendasi.moduleId)}
                >
                  <Icon name="play" width={17} height={17} /> Latih yang terlemah
                </button>
              )}
            </div>

            <div className="refresh-grid">
              {usulan.slice(0, 4).map((item, index) => {
                const kekuatan = tingkatKekuatan(item.masteryPersen);
                return (
                  <button
                    key={item.moduleId}
                    type="button"
                    className="refresh-card"
                    onClick={() => onMulai(item.moduleId)}
                  >
                    <span className={`icon-tile icon-tile--${index % 4}`}>
                      <Icon name={IKON_REFRESH[index] ?? 'book'} width={23} height={23} />
                    </span>
                    <strong>{item.judul}</strong>
                    <span className="refresh-card__status">
                      <span>{kekuatan.label}</span>
                      <StrengthPills filled={kekuatan.terisi} color={kekuatan.warna} />
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="panel paths-panel">
            <div className="section-heading section-heading--compact">
              <h2>Jalur belajarmu</h2>
              <button type="button" className="text-button" onClick={onBukaBelajar}>
                Lihat semua <Icon name="chevron" width={16} height={16} />
              </button>
            </div>
            <div className="path-grid">
              {jalur.map((dunia, index) => (
                <button key={dunia.id} type="button" className="path-key" onClick={onBukaPetaIlmu}>
                  <span className={`icon-tile path-key__icon path-key__icon--${index % 4}`}>
                    <Icon name={IKON_DUNIA[dunia.id] ?? 'book'} width={27} height={27} />
                  </span>
                  <span className="path-key__copy">
                    <strong>{dunia.nama}</strong>
                    <small>{dunia.moduleIds.length} pelajaran visual</small>
                  </span>
                  <Icon className="path-key__chevron" name="chevron" width={18} height={18} />
                  <span className="path-key__progress">
                    <b>{dunia.persen}%</b>
                    <ProgressBar value={dunia.persen} />
                  </span>
                </button>
              ))}
            </div>
          </section>
        </div>

        <aside className="home-rail">
          <section className="panel target-card">
            <h2>Target hari ini</h2>
            <div className="target-card__metrics">
              <Metric
                icon="sparkles"
                value={siswa.lumens.toLocaleString('id-ID')}
                label="Lumens terkumpul"
                tone="violet"
              />
              <Metric
                icon="check"
                value={`${jumlahHariIni} / ${TARGET_AKTIVITAS_HARIAN}`}
                label="Aktivitas selesai"
                tone="green"
              />
            </div>
            <div className="streak-card">
              <div className="streak-card__summary">
                <Icon name="flame" width={32} height={32} />
                <span>
                  <b>{siswa.streakCount} hari</b>
                  <small>berturut-turut</small>
                </span>
              </div>
              <div className="streak-days">
                {hariStreak.map((hari) => (
                  <span
                    key={hari.tanggal}
                    className={hari.hariIni ? 'streak-day streak-day--today' : 'streak-day'}
                    title={hari.tanggal}
                  >
                    <small>{hari.label.slice(0, 1)}</small>
                    <i className={hari.terisi ? 'is-filled' : ''}>
                      {hari.terisi && <Icon name="check" width={11} height={11} />}
                    </i>
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section className="lumo-card">
            <h2>Rekomendasi Lumo</h2>
            <div className="lumo-card__message">
              <Lumo size={64} />
              <p>
                {rekomendasi ? (
                  <>
                    Fokus berikutnya: <strong>{rekomendasi.judul}</strong>.{' '}
                    {rekomendasi.alasan === 'ulang'
                      ? 'Penguasaanmu di sini paling perlu diperkuat.'
                      : 'Pelajaran ini siap kamu mulai.'}
                  </>
                ) : (
                  'Tambahkan pelajaran untuk mendapat rekomendasi.'
                )}
              </p>
            </div>
            {rekomendasi && (
              <button
                type="button"
                className="button button--amber"
                onClick={() => onMulai(rekomendasi.moduleId)}
              >
                Coba sekarang <Icon name="arrow" width={19} height={19} />
              </button>
            )}
          </section>

          <section className="panel activity-card">
            <div className="section-heading section-heading--compact">
              <h2>Aktivitas terakhir</h2>
              <button type="button" className="text-button" onClick={onBukaBelajar}>
                Lihat jalur <Icon name="chevron" width={16} height={16} />
              </button>
            </div>
            {riwayat.length > 0 ? (
              <div className="activity-list">
                {riwayat.map((item, index) => (
                  <button key={item.moduleId} type="button" onClick={() => onMulai(item.moduleId)}>
                    <span className={`activity-list__icon activity-list__icon--${index % 3}`}>
                      <Icon name={IKON_REFRESH[index] ?? 'book'} width={20} height={20} />
                    </span>
                    <span>
                      <strong>{item.judul}</strong>
                      <small>{item.masteryPersen}% dikuasai</small>
                    </span>
                    <time>{item.labelWaktu}</time>
                  </button>
                ))}
              </div>
            ) : (
              <div className="activity-empty">
                <Icon name="book" width={24} height={24} />
                <p>Aktivitasmu akan muncul setelah satu pelajaran selesai.</p>
              </div>
            )}
          </section>
        </aside>
      </main>
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  const aman = Math.max(0, Math.min(100, value));
  return (
    <span
      className="progress-bar"
      role="progressbar"
      aria-valuenow={aman}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <i style={{ width: `${aman}%` }} />
    </span>
  );
}

function StrengthPills({ filled, color }: { filled: number; color: string }) {
  return (
    <span className="strength-pills" aria-label={`${filled} dari 5 tingkat kekuatan`}>
      {[0, 1, 2, 3, 4].map((n) => (
        <i key={n} style={{ background: n < filled ? color : undefined }} />
      ))}
    </span>
  );
}

function Metric({
  icon,
  value,
  label,
  tone,
}: {
  icon: IconName;
  value: string;
  label: string;
  tone: 'violet' | 'green';
}) {
  return (
    <div className="metric">
      <span className={`metric__icon metric__icon--${tone}`}>
        <Icon name={icon} width={25} height={25} />
      </span>
      <span>
        <b>{value}</b>
        <small>{label}</small>
      </span>
    </div>
  );
}
