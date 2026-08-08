import { useMemo, useState } from 'react';
import { Icon } from '../design/Icon';
import { semuaModul } from '../shell/registry';
import { CincinProgres } from './Progres';
import {
  MAPEL_MENYUSUL,
  type JalurTampil,
  type KursusTampil,
  bagiJalur,
  susunKatalog,
} from './katalog';
import type { Siswa } from '../progress/store';
import './Belajar.css';

type Jenjang = 'semua' | 'SMP' | 'SMA';

export function Belajar({
  siswa,
  onBukaKursus,
}: {
  siswa: Siswa;
  onBukaKursus: (kursusId: string) => void;
}) {
  const [kueri, setKueri] = useState('');
  const [jenjang, setJenjang] = useState<Jenjang>('semua');

  const terdaftar = useMemo(() => new Set(semuaModul().map((m) => m.id)), []);
  const katalog = useMemo(() => susunKatalog(siswa, terdaftar), [siswa, terdaftar]);

  const q = kueri.trim().toLocaleLowerCase('id-ID');
  const menyaring = q !== '' || jenjang !== 'semua';

  const tersaring = katalog.filter((jalur) => {
    if (jenjang !== 'semua' && jalur.jenjangKelompok !== jenjang) return false;
    if (!q) return true;
    const teks = [
      jalur.judul,
      jalur.ringkas,
      ...jalur.kursus.flatMap((k) => [
        k.judul,
        k.ringkas,
        ...k.level.flatMap((lv) => [lv.judul, ...lv.pelajaran.map((p) => p.judul)]),
      ]),
    ]
      .join(' ')
      .toLocaleLowerCase('id-ID');
    return teks.includes(q);
  });

  const { milikmu, lainnya } = bagiJalur(tersaring);

  return (
    <div className="belajar">
      <div className="belajar__kepala">
        <div className="wadah">
          <h1 className="t-display-2xl">Jalur belajar</h1>
          <p className="t-body-lg belajar__sub">Langkah demi langkah sampai kamu benar-benar paham.</p>

          <div className="belajar__cari">
            <label className="cari-kolom">
              <Icon name="search" width={20} height={20} />
              <input
                type="search"
                value={kueri}
                onChange={(event) => setKueri(event.target.value)}
                placeholder="Apa yang ingin kamu pelajari?"
                aria-label="Cari jalur, kursus, atau pelajaran"
              />
            </label>

            <div className="segmen" role="group" aria-label="Saring menurut jenjang">
              {(['semua', 'SMP', 'SMA'] as const).map((nilai) => (
                <button
                  key={nilai}
                  type="button"
                  className={jenjang === nilai ? 'is-active' : undefined}
                  aria-pressed={jenjang === nilai}
                  onClick={() => setJenjang(nilai)}
                >
                  {nilai === 'semua' ? 'Semua' : nilai}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="wadah belajar__isi">
        {tersaring.length === 0 && (
          <div className="kosong">
            <Icon name="search" width={28} height={28} />
            <div>
              <b className="t-heading-sm">Belum ada yang cocok</b>
              <p className="t-body-base">Coba kata lain, atau pilih jenjang yang berbeda.</p>
            </div>
          </div>
        )}

        {milikmu.length > 0 && (
          <section className="seksi">
            <h2 className="t-heading-lg">{menyaring ? 'Hasil pencarian' : 'Jalur belajarmu'}</h2>
            <div className="seksi__isi">
              {milikmu.map((jalur) => (
                <BarisJalur key={jalur.id} jalur={jalur} onBukaKursus={onBukaKursus} />
              ))}
            </div>
          </section>
        )}

        {lainnya.length > 0 && (
          <section className="seksi">
            <h2 className="t-heading-lg">Jalur lainnya</h2>
            <div className="seksi__isi">
              {lainnya.map((jalur) => (
                <BarisJalur key={jalur.id} jalur={jalur} onBukaKursus={onBukaKursus} />
              ))}
            </div>
          </section>
        )}

        <section className="seksi">
          <h2 className="t-heading-lg">Mata pelajaran menyusul</h2>
          <p className="t-body-base seksi__catatan">
            Jalur berikut belum bisa dibuka karena naskahnya masih kami siapkan.
          </p>
          <div className="menyusul">
            {MAPEL_MENYUSUL.map((mapel) => (
              <article key={mapel.nama} className="menyusul__kartu" data-hue={mapel.hue}>
                <span className="ubin-ikon">
                  <Icon name={mapel.ikon} width={24} height={24} />
                </span>
                <div>
                  <b className="t-heading-sm">{mapel.nama}</b>
                  <p className="t-body-sm">{mapel.ringkas}</p>
                  <span className="badge badge--hue">{mapel.status}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- baris jalur */

function BarisJalur({
  jalur,
  onBukaKursus,
}: {
  jalur: JalurTampil;
  onBukaKursus: (kursusId: string) => void;
}) {
  return (
    <section className="jalur" data-hue={jalur.hue}>
      <header className="jalur__kepala">
        <span className="ubin-ikon ubin-ikon--besar">
          <Icon name={jalur.ikon} width={38} height={38} />
        </span>

        <div className="jalur__teks">
          <span className="badge badge--minimal">{jalur.jenjang}</span>
          <h3 className="t-heading-md">{jalur.judul}</h3>
          <p className="t-body-base">{jalur.ringkas}</p>
        </div>

        {jalur.jumlahTersedia > 0 ? (
          <span className="pil-progres" title={`${jalur.persen}% penguasaan rata-rata`}>
            <CincinProgres persen={jalur.persen} ukuran={20} tebal={3.33} />
            {jalur.persen}% dikuasai
          </span>
        ) : (
          <span className="badge">Belum tersedia</span>
        )}
      </header>

      {/* Deret ubin kursus, dirantai garis 2px di tengah ubin. */}
      <div className="rel">
        <div className="rel__isi">
          {jalur.kursus.map((kursus, i) => (
            <UbinKursus
              key={kursus.id}
              kursus={kursus}
              terakhir={i === jalur.kursus.length - 1}
              onBuka={onBukaKursus}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function UbinKursus({
  kursus,
  terakhir,
  onBuka,
}: {
  kursus: KursusTampil;
  terakhir: boolean;
  onBuka: (kursusId: string) => void;
}) {
  const siap = kursus.jumlahTersedia > 0;
  const selesai = siap && kursus.persen >= 100;

  return (
    <div className={`ubin${terakhir ? '' : ' ubin--berantai'}`}>
      <button
        type="button"
        className={`ubin__kartu card3d${siap ? ' card3d--hue' : ''}`}
        onClick={() => onBuka(kursus.id)}
        aria-label={`Buka kursus ${kursus.judul}`}
      >
        <span className="badge badge--minimal ubin__kelas">{kursus.kelas}</span>

        {selesai ? (
          <span className="ubin__tanda ubin__tanda--selesai">
            <Icon name="check" width={13} height={13} />
          </span>
        ) : siap ? null : (
          <span className="ubin__tanda">
            <Icon name="lock" width={13} height={13} />
          </span>
        )}

        <Icon className="ubin__ikon" name={kursus.ikon} width={54} height={54} />

        {siap && kursus.persen > 0 && (
          <span className="ubin__bar" aria-hidden>
            <i style={{ width: `${Math.min(100, kursus.persen)}%` }} />
          </span>
        )}
      </button>

      <span className="ubin__label t-body-base">{kursus.judul}</span>
    </div>
  );
}
