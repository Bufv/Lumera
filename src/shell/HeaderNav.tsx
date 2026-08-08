import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '../design/Icon';
import { Lumo } from '../design/Lumo';
import { semuaModul } from './registry';
import type { Siswa } from '../progress/store';
import './HeaderNav.css';

export type TabLayar = 'beranda' | 'belajar' | 'petailmu' | 'progres';

const TABS_NAV: { id: TabLayar | 'ulangi' | 'simpanan'; label: string; tersedia: boolean }[] = [
  { id: 'beranda', label: 'Beranda', tersedia: true },
  { id: 'belajar', label: 'Belajar', tersedia: true },
  { id: 'ulangi', label: 'Ulangi', tersedia: false },
  { id: 'simpanan', label: 'Simpanan', tersedia: false },
  { id: 'petailmu', label: 'Peta Ilmu', tersedia: true },
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
  const modul = useMemo(() => semuaModul().map((m) => ({ id: m.id, judul: m.judul })), []);
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
    <header className="app-header">
      <div className="app-header__row">
        <button
          type="button"
          className="brand"
          onClick={() => onPilihTab('beranda')}
          aria-label="Lumera — ke Beranda"
        >
          <Lumo size={34} />
          <span>Lumera</span>
        </button>

        <nav className="main-nav" aria-label="Navigasi utama">
          {TABS_NAV.map((tab) => {
            const aktif = tabAktif === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`main-nav__item${aktif ? ' main-nav__item--active' : ''}`}
                onClick={() => tab.tersedia && onPilihTab(tab.id as TabLayar)}
                aria-current={aktif ? 'page' : undefined}
                aria-disabled={!tab.tersedia}
                title={tab.tersedia ? undefined : 'Fitur ini belum tersedia'}
              >
                {tab.label}
                {!tab.tersedia && <span className="main-nav__soon" aria-label="Segera hadir" />}
              </button>
            );
          })}
        </nav>

        <div className="header-actions">
          <div className="header-search">
            <div className="header-search__field">
              <Icon name="search" width={18} height={18} />
              <input
                ref={inputCariRef}
                type="search"
                value={kueri}
                onChange={(event) => setKueri(event.target.value)}
                placeholder="Cari topik atau pelajaran"
                aria-label="Cari topik atau pelajaran"
              />
              <kbd>Ctrl K</kbd>
            </div>

            {kueri.trim() !== '' && (
              <div className="header-search__results">
                {hasilCari.length === 0 ? (
                  <p>Tidak ada pelajaran yang cocok.</p>
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

          <div className="header-streak" title={`Streak ${siswa.streakCount} hari`}>
            <Icon name="flame" width={24} height={24} />
            <span className="header-streak__number">{siswa.streakCount}</span>
            <span className="header-streak__label">Hari berturut-turut</span>
          </div>

          <button
            type="button"
            className="profile-button"
            onClick={onBukaProgres}
            aria-label="Buka profil dan progres"
          >
            A
          </button>
        </div>
      </div>
    </header>
  );
}
