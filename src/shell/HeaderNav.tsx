import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon, type IconName } from '../design/Icon';
import { Lumo } from '../design/Lumo';
import { MODULE_META } from '../modules';
import type { Siswa } from '../progress/store';
import './HeaderNav.css';

export type TabLayar = 'beranda' | 'belajar' | 'petailmu' | 'progres';

const TABS: { id: TabLayar | 'ulangi' | 'simpanan'; label: string; ikon: IconName; tersedia: boolean }[] =
  [
    { id: 'beranda', label: 'Beranda', ikon: 'home', tersedia: true },
    { id: 'belajar', label: 'Belajar', ikon: 'book', tersedia: true },
    { id: 'petailmu', label: 'Peta Ilmu', ikon: 'route', tersedia: true },
    { id: 'ulangi', label: 'Ulangi', ikon: 'clock', tersedia: false },
    { id: 'simpanan', label: 'Simpanan', ikon: 'bookmark', tersedia: false },
  ];

export function HeaderNav({
  tabAktif,
  siswa,
  onPilihTab,
  onBukaProgres,
  onPilihModul,
}: {
  tabAktif: TabLayar;
  siswa: Siswa;
  onPilihTab: (tab: TabLayar) => void;
  onBukaProgres: () => void;
  onPilihModul: (moduleId: string) => void;
}) {
  const [kueri, setKueri] = useState('');
  const inputCariRef = useRef<HTMLInputElement>(null);
  // US11 spec 002 (T061): metadata ringan (bukan modul penuh) — lihat catatan di Atlas.tsx.
  const modul = useMemo(() => MODULE_META.map((m) => ({ id: m.id, judul: m.judul })), []);
  const hasilCari = useMemo(() => {
    const q = kueri.trim().toLocaleLowerCase('id-ID');
    return q ? modul.filter((m) => m.judul.toLocaleLowerCase('id-ID').includes(q)).slice(0, 5) : [];
  }, [kueri, modul]);

  useEffect(() => {
    const tanganiPintasan = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        inputCariRef.current?.focus();
      }
    };
    window.addEventListener('keydown', tanganiPintasan);
    return () => window.removeEventListener('keydown', tanganiPintasan);
  }, []);

  return (
    <header className="header">
      <div className="header__baris">
        <button
          type="button"
          className="merek"
          onClick={() => onPilihTab('beranda')}
          aria-label="Lumera — ke Beranda"
        >
          <Lumo size={30} />
          <span>Lumera</span>
        </button>

        <nav className="nav" aria-label="Navigasi utama">
          {TABS.map((tab) => {
            const aktif = tabAktif === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className="nav__tab"
                data-selected={aktif}
                data-tersedia={tab.tersedia}
                onClick={() => tab.tersedia && onPilihTab(tab.id as TabLayar)}
                aria-current={aktif ? 'page' : undefined}
                aria-disabled={!tab.tersedia}
                title={tab.tersedia ? undefined : 'Belum tersedia'}
              >
                <Icon name={tab.ikon} width={18} height={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="header__aksi">
          <div className="cari">
            <label className="cari__kolom">
              <Icon name="search" width={18} height={18} />
              <input
                ref={inputCariRef}
                type="search"
                value={kueri}
                onChange={(event) => setKueri(event.target.value)}
                placeholder="Cari pelajaran"
                aria-label="Cari pelajaran"
              />
              <kbd>Ctrl K</kbd>
            </label>

            {kueri.trim() !== '' && (
              <div className="cari__hasil">
                {hasilCari.length === 0 ? (
                  <p className="t-body-sm">Tidak ada pelajaran yang cocok.</p>
                ) : (
                  hasilCari.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setKueri('');
                        onPilihModul(m.id);
                      }}
                    >
                      <span>{m.judul}</span>
                      <Icon name="arrow" width={17} height={17} />
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="streak" title={`Streak ${siswa.streakCount} hari`}>
            <Icon name="flame" width={20} height={20} />
            <span>{siswa.streakCount}</span>
          </div>

          <button
            type="button"
            className="avatar"
            onClick={onBukaProgres}
            aria-label="Buka progres belajar"
          >
            A
          </button>
        </div>
      </div>
    </header>
  );
}
