import { Icon } from '../design/Icon';
import { CincinProgres } from '../courses/Progres';
import { MODULE_META } from '../modules';
import { TITIK_KEKUATAN, tingkatKekuatan } from '../beranda/harian';
import type { Siswa } from './store';
import './ProgressSummary.css';

/**
 * Ringkasan progres (US8). Nada sengaja tenang — Prinsip V melarang perayaan
 * meledak-ledak, jadi angka disajikan apa adanya tanpa konfeti.
 */
export function ProgressSummary({ siswa }: { siswa: Siswa }) {
  // US11 spec 002 (T061): metadata ringan (bukan modul penuh) — lihat catatan di Atlas.tsx.
  const modul = MODULE_META;
  const dinilai = modul
    .map((m) => ({
      id: m.id,
      judul: m.judul,
      catatan: siswa.mastery.find((x) => x.moduleId === m.id) ?? null,
    }))
    .map((m) => ({ ...m, persen: m.catatan?.masteryPersen ?? null }));

  const rata = dinilai.filter((m) => m.persen !== null);
  const rataRata =
    rata.length > 0
      ? Math.round(rata.reduce((total, m) => total + (m.persen ?? 0), 0) / rata.length)
      : 0;

  return (
    <section className="progres">
      <header className="progres__kepala">
        <div>
          <h2 className="t-display-xl">Progres kamu</h2>
          <p className="t-body-base">
            {rata.length > 0
              ? `Rata-rata penguasaan dari ${rata.length} pelajaran yang sudah kamu kerjakan.`
              : 'Selesaikan satu pelajaran untuk mulai melihat penguasaanmu di sini.'}
          </p>
        </div>
        <CincinProgres
          persen={rataRata}
          ukuran={72}
          tebal={9}
          label={`${rataRata} persen rata-rata penguasaan`}
        />
      </header>

      <div className="progres__angka">
        <Angka ikon="sparkles" nilai={siswa.lumens.toLocaleString('id-ID')} label="Lumens" />
        <Angka ikon="flame" nilai={`${siswa.streakCount}`} label="Hari berturut-turut" />
        <Angka
          ikon="check"
          nilai={`${siswa.modulSelesai.length}`}
          label="Pelajaran selesai"
        />
      </div>

      <h3 className="t-heading-sm progres__subjudul">Penguasaan per pelajaran</h3>

      {modul.length === 0 ? (
        <p className="t-body-base progres__kosong">Belum ada modul terdaftar.</p>
      ) : (
        <ul className="progres__daftar">
          {dinilai.map((m) => {
            const kekuatan = tingkatKekuatan(m.persen);
            return (
              <li key={m.id}>
                <div className="progres__baris">
                  <span className="t-body-base">{m.judul}</span>
                  <span className="t-body-sm progres__nilai">
                    {m.persen === null ? 'Belum dimulai' : `${m.persen}% · ${kekuatan.label}`}
                  </span>
                </div>
                <span
                  className="titik"
                  role="img"
                  aria-label={`${kekuatan.terisi} dari ${TITIK_KEKUATAN} tingkat kekuatan`}
                >
                  {Array.from({ length: TITIK_KEKUATAN }, (_, i) => (
                    <i key={i} style={i < kekuatan.terisi ? { background: kekuatan.warna } : undefined} />
                  ))}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function Angka({
  ikon,
  nilai,
  label,
}: {
  ikon: 'sparkles' | 'flame' | 'check';
  nilai: string;
  label: string;
}) {
  return (
    <div className="angka">
      <Icon name={ikon} width={22} height={22} />
      <b className="t-display-lg">{nilai}</b>
      <small className="t-body-sm">{label}</small>
    </div>
  );
}
