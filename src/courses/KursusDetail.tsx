import { useMemo } from 'react';
import { Icon } from '../design/Icon';
import { MODULE_META } from '../modules';
import { CincinProgres } from './Progres';
import { jalurSimpul } from './simpul';
import {
  type JalurKatalog,
  type KursusKatalog,
  type LevelTampil,
  type PelajaranTampil,
  labelMenit,
  susunKursus,
} from './katalog';
import type { Siswa } from '../progress/store';
import './KursusDetail.css';

/**
 * Halaman kursus mengikuti anatomi halaman course di `docs/sample/brilliant/`:
 * ringkasan di kiri (lengket), kolom pelajaran sempit di kanan dengan kepala
 * level yang ikut lengket saat digulir — jadi siswa selalu tahu sedang di level
 * mana tanpa harus menggulir balik.
 */
export function KursusDetail({
  kursus,
  jalur,
  siswa,
  onMulaiPelajaran,
  onKembali,
}: {
  kursus: KursusKatalog;
  jalur: JalurKatalog | null;
  siswa: Siswa;
  onMulaiPelajaran: (moduleId: string) => void;
  onKembali: () => void;
}) {
  // US11 spec 002 (T061): metadata ringan (bukan modul penuh) — lihat catatan di Atlas.tsx.
  const terdaftar = useMemo(() => new Set(MODULE_META.map((m) => m.id)), []);
  const data = useMemo(() => susunKursus(kursus, siswa, terdaftar), [kursus, siswa, terdaftar]);

  return (
    <div className="kursus" data-hue={jalur?.hue ?? 'violet'}>
      <div className="wadah kursus__wadah">
        <aside className="kursus__ringkas">
          <button type="button" className="btn-flat kursus__balik" onClick={onKembali}>
            <Icon name="chevron" className="kursus__balik-ikon" width={18} height={18} />
            {jalur ? jalur.judul : 'Jalur belajar'}
          </button>

          <span className="ubin-ikon ubin-ikon--besar">
            <Icon name={kursus.ikon} width={48} height={48} />
          </span>

          <h1 className="t-heading-lg">{kursus.judul}</h1>
          <p className="t-body-base kursus__ringkas-teks">{kursus.ringkas}</p>

          <div className="kursus__meta">
            <span className="t-body-sm">
              <Icon name="pages" width={16} height={16} />
              {data.totalPelajaran} pelajaran
            </span>
            <span className="t-body-sm">
              <Icon name="brain" width={16} height={16} />
              {data.totalKonsep} konsep
            </span>
            <span className="t-body-sm">
              <Icon name="clock" width={16} height={16} />
              {labelMenit(data.totalMenit)}
            </span>
          </div>

          <div className="kursus__progres">
            <CincinProgres
              persen={data.persen}
              ukuran={56}
              tebal={7}
              label={`${data.persen} persen dikuasai`}
            />
            <div>
              <b className="t-heading-md">{data.persen}%</b>
              <small className="t-body-sm">
                {data.jumlahSelesai} dari {data.jumlahTersedia} pelajaran yang tersedia selesai
              </small>
            </div>
          </div>

          {data.berikutnya?.moduleId ? (
            <button
              type="button"
              className="btn3d kursus__mulai"
              onClick={() => onMulaiPelajaran(data.berikutnya!.moduleId as string)}
            >
              {data.berikutnya.status === 'terbuka' ? 'Mulai' : 'Lanjutkan'}
              <Icon name="arrow" width={20} height={20} />
            </button>
          ) : (
            <p className="kursus__belum t-body-sm">
              Belum ada pelajaran di kursus ini yang naskahnya selesai ditulis.
            </p>
          )}

          {data.jumlahDisiapkan > 0 && (
            <p className="kursus__catatan t-body-sm">
              {data.jumlahDisiapkan} pelajaran lain masih kami siapkan.
            </p>
          )}
        </aside>

        <div className="kursus__kolom">
          {data.level.map((level) => (
            <KolomLevel key={level.id} level={level} onBuka={onMulaiPelajaran} />
          ))}
        </div>
      </div>
    </div>
  );
}

function KolomLevel({
  level,
  onBuka,
}: {
  level: LevelTampil;
  onBuka: (moduleId: string) => void;
}) {
  const { simpul, d, lebar, tinggi } = jalurSimpul(level.pelajaran.length);
  const kosong = level.jumlahTersedia === 0;

  return (
    <section className="level">
      {/* Kepala keycap: bagian yang lengket saat kolom digulir. */}
      <header className="level__kepala">
        <div className={`level__papan${kosong ? ' level__papan--mati' : ''}`}>
          <span className="t-action-sm level__nomor">Level {level.urutan}</span>
          <span className="t-body-base level__judul">{level.judul}</span>
        </div>
      </header>

      <div
        className="level__peta"
        style={{ aspectRatio: `${lebar} / ${tinggi}` }}
      >
        <svg viewBox={`0 0 ${lebar} ${tinggi}`} role="presentation" aria-hidden>
          <path
            d={d}
            fill="none"
            stroke="var(--border-solid)"
            strokeWidth={4}
            strokeLinecap="round"
          />
        </svg>

        {simpul.map((s, i) => {
          const pelajaran = level.pelajaran[i]!;
          /*
           * Kartunya yang harus tepat di atas titik jalur, bukan seluruh baris —
           * lebar labelnya berbeda-beda. Jadi sisi yang dipatok mengikuti arah
           * label: kartu di kiri dipatok dengan `left`, kartu di kanan dengan
           * `right`, lalu digeser setengah kartu lewat margin.
           */
          const gaya = s.labelDiKanan
            ? { left: `${(s.x / lebar) * 100}%`, top: `${(s.y / tinggi) * 100}%` }
            : { right: `${100 - (s.x / lebar) * 100}%`, top: `${(s.y / tinggi) * 100}%` };

          return (
            <SimpulPelajaran
              key={pelajaran.id}
              pelajaran={pelajaran}
              gaya={gaya}
              labelDiKanan={s.labelDiKanan}
              onBuka={onBuka}
            />
          );
        })}
      </div>

      <ul className="level__konsep">
        {level.konsep.map((konsep) => (
          <li key={konsep} className="t-body-sm">
            {konsep}
          </li>
        ))}
      </ul>
    </section>
  );
}

function SimpulPelajaran({
  pelajaran,
  gaya,
  labelDiKanan,
  onBuka,
}: {
  pelajaran: PelajaranTampil;
  gaya: { left?: string; right?: string; top: string };
  labelDiKanan: boolean;
  onBuka: (moduleId: string) => void;
}) {
  const cek = pelajaran.jenis === 'cek-level';
  const kelas = [
    'simpul',
    labelDiKanan ? 'simpul--kanan' : 'simpul--kiri',
    `simpul--${pelajaran.status}`,
    cek ? 'simpul--cek' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const isi = (
    <>
      <span className={`simpul__kartu${pelajaran.bisaDibuka ? ' card3d card3d--hue' : ''}`}>
        {pelajaran.status === 'selesai' ? (
          <Icon name="check" width={34} height={34} />
        ) : pelajaran.status === 'disiapkan' ? (
          <Icon name="lock" width={26} height={26} />
        ) : cek ? (
          <Icon name="target" width={32} height={32} />
        ) : (
          <span className="simpul__no">{pelajaran.no}</span>
        )}
      </span>

      <span className="simpul__teks">
        <span className="t-body-base simpul__judul">{pelajaran.judul}</span>
        <span className="t-body-xs simpul__menit">
          {pelajaran.status === 'disiapkan' ? 'Sedang disiapkan' : labelMenit(pelajaran.menit)}
        </span>
      </span>
    </>
  );

  if (!pelajaran.bisaDibuka || !pelajaran.moduleId) {
    return (
      <div className={`${kelas} simpul--mati`} style={gaya}>
        {isi}
      </div>
    );
  }

  return (
    <button
      type="button"
      className={kelas}
      style={gaya}
      onClick={() => onBuka(pelajaran.moduleId as string)}
      title={pelajaran.ringkas}
    >
      {isi}
    </button>
  );
}
