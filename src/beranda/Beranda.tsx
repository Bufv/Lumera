import { useMemo } from 'react';
import { Icon } from '../design/Icon';
import { Lumo } from '../design/Lumo';
import { MODULE_META } from '../modules';
import { pilihUsulan } from '../progress/suggestions';
import { CincinProgres } from '../courses/Progres';
import { labelMenit, susunKatalog, type KursusTampil } from '../courses/katalog';
import {
  TARGET_AKTIVITAS_HARIAN,
  TITIK_KEKUATAN,
  aktivitasHariIni,
  aktivitasTerakhir,
  sapaanWaktu,
  stripStreak,
  tingkatKekuatan,
} from './harian';
import type { Siswa } from '../progress/store';
import './Beranda.css';

/**
 * Beranda mengikuti susunan halaman Home di `docs/sample/brilliant/`: kolom
 * utama berisi kartu "lanjutkan" per kursus, rail kanan berisi streak dan target
 * harian. Liga dan leaderboard tidak diambil — PRD §7.5 melarangnya.
 */
export function Beranda({
  siswa,
  onMulai,
  onBukaBelajar,
}: {
  siswa: Siswa;
  onMulai: (moduleId: string) => void;
  onBukaBelajar: () => void;
}) {
  // US11 spec 002 (T061): metadata ringan (bukan modul penuh) — lihat catatan di Atlas.tsx.
  const modulLengkap = MODULE_META;
  const terdaftar = useMemo(() => new Set(modulLengkap.map((m) => m.id)), [modulLengkap]);
  const katalog = useMemo(() => susunKatalog(siswa, terdaftar), [siswa, terdaftar]);

  /** Kursus yang punya pelajaran siap, diurut: yang sedang digarap dulu. */
  const lanjutkan = katalog
    .flatMap((jalur) => jalur.kursus.map((kursus) => ({ kursus, hue: jalur.hue })))
    .filter(({ kursus }) => kursus.jumlahTersedia > 0)
    .sort((a, b) => nilaiUrut(b.kursus) - nilaiUrut(a.kursus))
    .slice(0, 3);

  const usulan = pilihUsulan(
    modulLengkap.map((m) => ({ id: m.id, judul: m.judul, subjectWorldId: m.subjectWorldId })),
    siswa,
    4,
  );
  const terlemah = usulan.find((u) => u.alasan === 'ulang') ?? usulan[0] ?? null;

  const judulModul = useMemo(
    () => new Map(modulLengkap.map((m) => [m.id, m.judul])),
    [modulLengkap],
  );
  const riwayat = aktivitasTerakhir(siswa, judulModul);
  const selesaiHariIni = aktivitasHariIni(siswa);
  const strip = stripStreak(siswa);
  const jam = new Date().getHours();

  return (
    <div className="beranda">
      <div className="wadah beranda__wadah">
        <main className="beranda__utama">
          <header className="beranda__sapaan">
            <div>
              <h1 className="t-display-2xl">{sapaanWaktu(jam)}</h1>
              <p className="t-body-lg">
                {lanjutkan.length > 0
                  ? 'Mau lanjut dari yang kemarin, atau menyegarkan ingatan dulu?'
                  : 'Pilih jalur belajar untuk mulai.'}
              </p>
            </div>
            <Lumo size={64} ekspresi="senang" title="Lumo" />
          </header>

          {lanjutkan.length > 0 ? (
            <section className="seksi-beranda">
              <div className="seksi-beranda__kepala">
                <h2 className="t-heading-lg">Lanjutkan belajar</h2>
                <button type="button" className="btn-flat" onClick={onBukaBelajar}>
                  Semua jalur
                  <Icon name="chevron" width={16} height={16} />
                </button>
              </div>

              <div className="lanjut-grid">
                {lanjutkan.map(({ kursus, hue }) => (
                  <KartuLanjut key={kursus.id} kursus={kursus} hue={hue} onMulai={onMulai} />
                ))}
              </div>
            </section>
          ) : (
            <div className="kosong">
              <Icon name="book" width={28} height={28} />
              <div>
                <b className="t-heading-sm">Belum ada pelajaran siap</b>
                <p className="t-body-base">Daftarkan modul ke registry untuk mulai belajar.</p>
              </div>
            </div>
          )}

          <section className="seksi-beranda">
            <div className="seksi-beranda__kepala">
              <div>
                <h2 className="t-heading-lg">Refresh harian</h2>
                <p className="t-body-base seksi-beranda__sub">
                  Urutannya dari konsep yang paling perlu dilatih.
                </p>
              </div>
              {/* Spec 004 (defer-lumera-atlas) US1/T009: Lumera Atlas ditunda ke
                  pengembangan berikutnya — tombol ini MUST NOT diam-diam
                  diarahkan ke layar lain (mis. Belajar). Pola disabled/"segera
                  hadir" ini sengaja disamakan dengan tombol Peta Ilmu yang
                  sudah ada di nav bar (StudentShell.tsx), bukan pola baru. */}
              <button
                type="button"
                className="btn-flat"
                disabled
                aria-disabled="true"
                aria-label="Peta Ilmu, segera hadir"
                title="Peta Ilmu · Segera hadir"
              >
                Peta Ilmu
                <Icon name="chevron" width={16} height={16} />
              </button>
            </div>

            <div className="refresh">
              {usulan.map((item) => {
                const kekuatan = tingkatKekuatan(item.masteryPersen);
                return (
                  <button
                    key={item.moduleId}
                    type="button"
                    className="refresh__baris"
                    onClick={() => onMulai(item.moduleId)}
                  >
                    <span className="refresh__teks">
                      <strong className="t-heading-sm">{item.judul}</strong>
                      <small className="t-body-sm">{item.subjectWorldNama}</small>
                    </span>
                    <span className="refresh__kekuatan">
                      <small className="t-body-xs">{kekuatan.label}</small>
                      <span
                        className="titik"
                        role="img"
                        aria-label={`${kekuatan.terisi} dari ${TITIK_KEKUATAN}`}
                      >
                        {Array.from({ length: TITIK_KEKUATAN }, (_, i) => (
                          <i
                            key={i}
                            style={i < kekuatan.terisi ? { background: kekuatan.warna } : undefined}
                          />
                        ))}
                      </span>
                    </span>
                    <Icon name="arrow" width={18} height={18} />
                  </button>
                );
              })}
            </div>
          </section>
        </main>

        <aside className="beranda__rail">
          <section className="kartu-rail" data-hue="amber">
            <div className="streak-blok">
              <Icon name="flame" width={30} height={30} />
              <div>
                <b className="t-heading-md">{siswa.streakCount} hari</b>
                <small className="t-body-sm">berturut-turut</small>
              </div>
            </div>

            <div className="strip">
              {strip.map((hari) => (
                <span
                  key={hari.tanggal}
                  className={`strip__hari${hari.hariIni ? ' strip__hari--kini' : ''}`}
                  title={hari.tanggal}
                >
                  <small className="t-body-xs">{hari.label.slice(0, 1)}</small>
                  <i className={hari.terisi ? 'is-terisi' : ''}>
                    {hari.terisi && <Icon name="check" width={12} height={12} />}
                  </i>
                </span>
              ))}
            </div>
          </section>

          <section className="kartu-rail">
            <h2 className="t-heading-sm">Target hari ini</h2>
            <div className="target">
              <CincinProgres
                persen={(selesaiHariIni / TARGET_AKTIVITAS_HARIAN) * 100}
                ukuran={52}
                tebal={7}
                label={`${selesaiHariIni} dari ${TARGET_AKTIVITAS_HARIAN} pelajaran`}
              />
              <div>
                <b className="t-heading-md">
                  {selesaiHariIni} / {TARGET_AKTIVITAS_HARIAN}
                </b>
                <small className="t-body-sm">pelajaran hari ini</small>
              </div>
            </div>
            <div className="target__lumens">
              <Icon name="sparkles" width={18} height={18} />
              <span className="t-body-sm">{siswa.lumens.toLocaleString('id-ID')} Lumens</span>
            </div>
          </section>

          {terlemah && (
            <section className="kartu-rail kartu-rail--lumo">
              <Lumo size={48} ekspresi="berpikir" />
              <div>
                <b className="t-heading-sm">Saran Lumo</b>
                <p className="t-body-sm">
                  Mulai dari <strong>{terlemah.judul}</strong>
                  {terlemah.masteryPersen !== null
                    ? ` — penguasaanmu di sini baru ${terlemah.masteryPersen}%.`
                    : ' — kamu belum pernah mencobanya.'}
                </p>
                <button
                  type="button"
                  className="btn3d btn3d--sm"
                  onClick={() => onMulai(terlemah.moduleId)}
                >
                  Coba sekarang
                  <Icon name="arrow" width={16} height={16} />
                </button>
              </div>
            </section>
          )}

          <section className="kartu-rail">
            <h2 className="t-heading-sm">Aktivitas terakhir</h2>
            {riwayat.length > 0 ? (
              <ul className="riwayat">
                {riwayat.map((item) => (
                  <li key={item.moduleId}>
                    <button type="button" onClick={() => onMulai(item.moduleId)}>
                      <span>
                        <strong className="t-body-base">{item.judul}</strong>
                        <small className="t-body-xs">{item.masteryPersen}% dikuasai</small>
                      </span>
                      <time className="t-body-xs">{item.labelWaktu}</time>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="t-body-sm kartu-rail__kosong">
                Selesaikan satu pelajaran, dan jejakmu muncul di sini.
              </p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}

/** Kursus yang sedang digarap paling atas, lalu yang belum dimulai. */
function nilaiUrut(kursus: KursusTampil): number {
  if (kursus.persen > 0 && kursus.persen < 100) return 2;
  if (kursus.persen === 0) return 1;
  return 0;
}

function KartuLanjut({
  kursus,
  hue,
  onMulai,
}: {
  kursus: KursusTampil;
  hue: string;
  onMulai: (moduleId: string) => void;
}) {
  const berikutnya = kursus.berikutnya;
  const level = kursus.level.find((lv) => lv.pelajaran.some((p) => p.id === berikutnya?.id));

  return (
    <article className="lanjut card3d card3d--hue" data-hue={hue}>
      <span className="ubin-ikon">
        <Icon name={kursus.ikon} width={26} height={26} />
      </span>

      <h3 className="t-heading-md">{kursus.judul}</h3>
      {level && <span className="t-action-sm lanjut__level">Level {level.urutan}</span>}

      {berikutnya && (
        <p className="t-body-sm lanjut__berikutnya">
          {berikutnya.judul} · {labelMenit(berikutnya.menit)}
        </p>
      )}

      <div className="lanjut__kaki">
        <CincinProgres
          persen={kursus.persen}
          ukuran={36}
          tebal={5}
          label={`${kursus.persen} persen dikuasai`}
        />
        {berikutnya?.moduleId ? (
          <button
            type="button"
            className="btn3d btn3d--sm"
            onClick={() => onMulai(berikutnya.moduleId as string)}
          >
            {berikutnya.status === 'terbuka' ? 'Mulai' : 'Lanjutkan'}
            <Icon name="arrow" width={16} height={16} />
          </button>
        ) : null}
      </div>
    </article>
  );
}
