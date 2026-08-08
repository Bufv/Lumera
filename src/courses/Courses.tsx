import { useMemo, useState } from 'react';
import { Icon, type IconName } from '../design/Icon';
import { semuaModul } from '../shell/registry';
import { SUBJECT_WORLDS } from '../atlas/subject-worlds';
import type { Siswa } from '../progress/store';
import './Courses.css';

const DEFAULT_WORLD_META: {
  icon: IconName;
  accent: string;
  soft: string;
  jenjang: 'SMP' | 'SMA';
  deskripsi: string;
} = {
  icon: 'math',
  accent: '#6C4FF8',
  soft: '#EEE9FF',
  jenjang: 'SMP',
  deskripsi: 'Memahami pola, grafik, dan hubungan antarnilai.',
};

const WORLD_META: Record<string, typeof DEFAULT_WORLD_META> = {
  matematika: DEFAULT_WORLD_META,
  sains: {
    icon: 'science',
    accent: '#25A964',
    soft: '#E3F8EC',
    jenjang: 'SMP',
    deskripsi: 'Mengamati gerak dan gejala alam melalui simulasi.',
  },
  ekonomi: {
    icon: 'bar-chart',
    accent: '#F39A16',
    soft: '#FFF2D7',
    jenjang: 'SMA',
    deskripsi: 'Membaca keputusan pasar dengan model interaktif.',
  },
  sejarah: {
    icon: 'globe',
    accent: '#3B82F6',
    soft: '#E8F1FF',
    jenjang: 'SMA',
    deskripsi: 'Menelusuri hubungan sebab-akibat dalam peristiwa.',
  },
};

const SEGERA_HADIR: {
  nama: string;
  icon: IconName;
  status: string;
  deskripsi: string;
  tone: string;
}[] = [
  {
    nama: 'Bahasa Indonesia',
    icon: 'book',
    status: 'Dalam pengembangan',
    deskripsi: 'Mengembangkan nalar membaca dan menulis.',
    tone: 'pink',
  },
  {
    nama: 'Bahasa Inggris',
    icon: 'globe',
    status: 'Segera hadir',
    deskripsi: 'Meningkatkan kemampuan berkomunikasi global.',
    tone: 'blue',
  },
  {
    nama: 'Informatika',
    icon: 'code',
    status: 'Dalam pengembangan',
    deskripsi: 'Memahami data, algoritma, dan cara kerja teknologi.',
    tone: 'cyan',
  },
  {
    nama: 'Literasi Finansial',
    icon: 'target',
    status: 'Segera hadir',
    deskripsi: 'Mengelola uang dan mengambil keputusan dengan bijak.',
    tone: 'gold',
  },
];

export function Courses({
  siswa,
  onMulaiModul,
  onBukaAtlas,
}: {
  siswa: Siswa;
  onMulaiModul: (moduleId: string) => void;
  onBukaAtlas: () => void;
}) {
  const [kueri, setKueri] = useState('');
  const [jenjang, setJenjang] = useState<'semua' | 'SMP' | 'SMA'>('semua');
  const mastery = useMemo(
    () => new Map(siswa.mastery.map((item) => [item.moduleId, item.masteryPersen])),
    [siswa.mastery],
  );
  const duniaById = useMemo(() => new Map(SUBJECT_WORLDS.map((world) => [world.id, world])), []);

  const pelajaran = useMemo(
    () =>
      semuaModul().map((modul) => {
        const dunia = duniaById.get(modul.subjectWorldId);
        const meta = WORLD_META[modul.subjectWorldId] ?? DEFAULT_WORLD_META;
        return {
          id: modul.id,
          judul: modul.judul,
          dunia: dunia?.nama ?? modul.subjectWorldId,
          mastery: mastery.get(modul.id) ?? 0,
          selesai: siswa.modulSelesai.includes(modul.id),
          ...meta,
        };
      }),
    [duniaById, mastery, siswa.modulSelesai],
  );

  const tersaring = pelajaran.filter((item) => {
    const q = kueri.trim().toLocaleLowerCase('id-ID');
    const cocokKueri = !q || `${item.judul} ${item.dunia}`.toLocaleLowerCase('id-ID').includes(q);
    return cocokKueri && (jenjang === 'semua' || item.jenjang === jenjang);
  });
  const rataRata =
    pelajaran.length > 0
      ? Math.round(pelajaran.reduce((total, item) => total + item.mastery, 0) / pelajaran.length)
      : 0;
  const aktif = pelajaran.find((item) => item.mastery > 0 && item.mastery < 100) ?? pelajaran[0];

  return (
    <div className="courses-page">
      <main className="courses-shell">
        <div className="courses-hero">
          <div>
            <span className="page-kicker">PERPUSTAKAAN JALUR</span>
            <h1>Jelajahi pelajaran</h1>
            <p>Pilih jalur belajar dan kuasai setiap konsep secara bertahap.</p>
          </div>
          <div className="course-filters">
            <label className="select-field">
              <Icon name="book" width={20} height={20} />
              <select
                value={jenjang}
                onChange={(event) => setJenjang(event.target.value as 'semua' | 'SMP' | 'SMA')}
                aria-label="Pilih jenjang"
              >
                <option value="semua">Semua jenjang</option>
                <option value="SMP">SMP</option>
                <option value="SMA">SMA</option>
              </select>
              <span>⌄</span>
            </label>
            <label className="course-search">
              <Icon name="search" width={19} height={19} />
              <input
                type="search"
                value={kueri}
                onChange={(event) => setKueri(event.target.value)}
                placeholder="Cari topik atau pelajaran"
              />
            </label>
          </div>
        </div>

        {aktif && (
          <section className="active-path-section">
            <div className="section-title-row">
              <div>
                <h2>Sedang kamu pelajari</h2>
                <p>Semua pelajaran yang tersedia berasal dari registry aplikasi.</p>
              </div>
              <button type="button" className="outline-action" onClick={onBukaAtlas}>
                <Icon name="route" width={18} height={18} /> Lihat Peta Ilmu
              </button>
            </div>

            <div className="active-path">
              <div className="active-path__art">
                <img src="/assets/math_banner.png" alt="Ilustrasi pembelajaran matematika visual" />
              </div>
              <div className="active-path__content">
                <div className="active-path__heading">
                  <div>
                    <span>JALUR VISUAL · SMP &amp; SMA</span>
                    <h3>Belajar dengan mencoba</h3>
                    <p>
                      Empat pengalaman interaktif lintas Matematika, Sains, Ekonomi, dan Sejarah.
                    </p>
                  </div>
                  <ProgressRing value={rataRata} />
                </div>

                <div className="active-modules">
                  {pelajaran.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      className="active-module"
                      onClick={() => onMulaiModul(item.id)}
                    >
                      <span className="active-module__number">{index + 1}</span>
                      <span className="active-module__copy">
                        <b>{item.judul}</b>
                        <small>{item.dunia}</small>
                      </span>
                      <span
                        className={`status-chip ${item.selesai ? 'status-chip--done' : item.mastery > 0 ? 'status-chip--active' : ''}`}
                      >
                        {item.selesai
                          ? 'Selesai'
                          : item.mastery > 0
                            ? 'Sedang dipelajari'
                            : 'Belum dimulai'}
                      </span>
                      <span className="active-module__bottom">
                        <b>{item.mastery}%</b>
                        <span>
                          <i style={{ width: `${item.mastery}%`, background: item.accent }} />
                        </span>
                        <Icon name="chevron" width={17} height={17} />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="available-lessons">
          <div className="section-title-row">
            <div>
              <h2>Pelajaran tersedia</h2>
              <p>{tersaring.length} pelajaran sesuai pilihanmu.</p>
            </div>
          </div>
          {tersaring.length > 0 ? (
            <div className="lesson-catalog">
              {tersaring.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="lesson-catalog__card"
                  onClick={() => onMulaiModul(item.id)}
                >
                  <span
                    className="lesson-catalog__icon"
                    style={{ background: item.soft, color: item.accent }}
                  >
                    <Icon name={item.icon} width={27} height={27} />
                  </span>
                  <span>
                    <b>{item.dunia}</b>
                    <strong>{item.judul}</strong>
                    <small>
                      {item.jenjang} · {item.deskripsi}
                    </small>
                  </span>
                  <span className="lesson-catalog__progress">
                    <i style={{ width: `${item.mastery}%`, background: item.accent }} />
                  </span>
                  <Icon className="lesson-catalog__arrow" name="arrow" width={19} height={19} />
                </button>
              ))}
            </div>
          ) : (
            <div className="courses-empty">
              <Icon name="search" width={25} height={25} />
              <div>
                <b>Tidak ada pelajaran yang cocok</b>
                <p>Ubah kata pencarian atau pilih jenjang lain.</p>
              </div>
            </div>
          )}
        </section>

        <section className="future-subjects">
          <div className="section-title-row">
            <div>
              <h2>Pelajaran lainnya</h2>
              <p>Jalur berikut ada di sample, tetapi kontennya belum terdaftar di codebase.</p>
            </div>
          </div>
          <div className="future-grid">
            {SEGERA_HADIR.map((item) => (
              <article key={item.nama} className="future-card">
                <span className={`future-card__icon future-card__icon--${item.tone}`}>
                  <Icon name={item.icon} width={25} height={25} />
                </span>
                <span>
                  <b>{item.nama}</b>
                  <p>{item.deskripsi}</p>
                  <small>{item.status}</small>
                </span>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function ProgressRing({ value }: { value: number }) {
  const safe = Math.max(0, Math.min(100, value));
  return (
    <span
      className="course-progress-ring"
      style={{ background: `conic-gradient(#6C4FF8 ${safe * 3.6}deg, #E7E4F5 0deg)` }}
      role="progressbar"
      aria-label={`${safe}% selesai`}
      aria-valuenow={safe}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <i>
        <b>{safe}%</b>
        <small>selesai</small>
      </i>
    </span>
  );
}
