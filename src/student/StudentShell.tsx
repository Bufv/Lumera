import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Icon, type IconName } from '../design/Icon';
import { searchStudentContent } from './catalog';
import type { StudentSearchRecord } from './types';
import type { RouteName } from './routes';
import './StudentShell.css';

interface NavItem {
  route: RouteName;
  label: string;
  icon: IconName;
}

const PRIMARY_NAV: NavItem[] = [
  { route: 'home', label: 'Beranda', icon: 'home' },
  { route: 'learn', label: 'Belajar', icon: 'book' },
  { route: 'review', label: 'Ulangi', icon: 'clock' },
  { route: 'saved', label: 'Simpanan', icon: 'bookmark' },
];

const MOBILE_NAV: NavItem[] = [
  ...PRIMARY_NAV,
  { route: 'progress', label: 'Profil', icon: 'target' },
];

function routeIsActive(current: RouteName, target: RouteName): boolean {
  if (target === 'learn')
    return current === 'learn' || current === 'math' || current === 'integers';
  return current === target;
}

export function StudentShell({
  route,
  displayName,
  streakDays,
  demo,
  children,
  onNavigate,
  onExitDemo,
  onSearchSelect,
}: {
  route: RouteName;
  displayName: string;
  streakDays: number;
  demo: boolean;
  children: ReactNode;
  onNavigate: (route: RouteName) => void;
  onExitDemo: () => void;
  onSearchSelect: (record: StudentSearchRecord) => void;
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const searchInput = useRef<HTMLInputElement>(null);
  const results = useMemo(() => searchStudentContent(query), [query]);
  const initial = (displayName.trim()[0] || 'L').toLocaleUpperCase('id-ID');

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === 'Escape') {
        setSearchOpen(false);
        setProfileOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (!searchOpen) return;
    const id = window.setTimeout(() => searchInput.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [searchOpen]);

  const navigate = (next: RouteName) => {
    setProfileOpen(false);
    onNavigate(next);
  };

  return (
    <div className="student-shell">
      <header className="student-header">
        <div className="student-header__inner">
          <button
            type="button"
            className="student-brand"
            onClick={() => navigate('home')}
            aria-label="Lumera — ke Beranda"
          >
            Lumera
          </button>

          <nav className="student-nav" aria-label="Navigasi utama">
            {PRIMARY_NAV.map((item) => (
              <button
                type="button"
                key={item.route}
                className="student-nav__item"
                data-active={routeIsActive(route, item.route)}
                aria-current={routeIsActive(route, item.route) ? 'page' : undefined}
                onClick={() => navigate(item.route)}
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              className="student-nav__item student-nav__item--locked"
              aria-disabled="true"
              title="Lumera Atlas · Segera hadir"
            >
              Atlas
              <Icon name="lock" width={14} height={14} />
            </button>
          </nav>

          <div className="student-header__actions">
            <button
              type="button"
              className="search-trigger"
              onClick={() => setSearchOpen(true)}
              aria-label="Buka pencarian"
            >
              <Icon name="search" width={18} height={18} />
              <span>Cari apa pun...</span>
              <kbd>Ctrl K</kbd>
            </button>

            <div
              className="student-streak"
              data-active={streakDays > 0}
              title={
                streakDays > 0 ? `${streakDays} hari berturut-turut` : 'Mulai streak belajarmu'
              }
            >
              <span className="student-streak__icon">
                <Icon name="flame" width={21} height={21} />
              </span>
              <span className="student-streak__copy">
                <strong>{streakDays > 0 ? streakDays : 'Mulai'}</strong>
                <small>{streakDays > 0 ? 'hari beruntun' : 'streak belajar'}</small>
              </span>
            </div>

            <div className="profile-control">
              <button
                type="button"
                className="student-avatar"
                aria-label="Buka menu profil"
                aria-expanded={profileOpen}
                onClick={() => setProfileOpen((open) => !open)}
              >
                {initial}
              </button>

              {profileOpen && (
                <div className="profile-menu" role="menu">
                  <div className="profile-menu__identity">
                    <strong>{displayName || 'Pelajar Lumera'}</strong>
                    <span>SMP Kelas VII</span>
                  </div>
                  <button type="button" role="menuitem" onClick={() => navigate('progress')}>
                    <Icon name="target" width={18} height={18} />
                    Progres dan profil
                  </button>
                  <button type="button" role="menuitem" onClick={() => navigate('settings')}>
                    <Icon name="grid" width={18} height={18} />
                    Pengaturan
                  </button>
                  <button
                    type="button"
                    className="profile-menu__locked"
                    role="menuitem"
                    aria-disabled="true"
                    title="Lumera Atlas · Segera hadir"
                  >
                    <Icon name="lock" width={18} height={18} />
                    Atlas
                    <small>Segera hadir</small>
                  </button>
                  {demo && (
                    <button type="button" role="menuitem" onClick={onExitDemo}>
                      Keluar dari mode demo
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {demo && (
        <div className="demo-disclosure" role="status">
          <span>
            <strong>Mode demo</strong> · Data ilustratif
          </span>
          <button type="button" onClick={onExitDemo}>
            Kembali ke akun baru
          </button>
        </div>
      )}

      <div className="student-shell__content">{children}</div>

      <nav className="mobile-nav" aria-label="Navigasi seluler">
        {MOBILE_NAV.map((item) => (
          <button
            type="button"
            key={item.route}
            data-active={routeIsActive(route, item.route)}
            aria-current={routeIsActive(route, item.route) ? 'page' : undefined}
            onClick={() => navigate(item.route)}
          >
            <Icon name={item.icon} width={20} height={20} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {searchOpen && (
        <div className="search-dialog" role="dialog" aria-modal="true" aria-label="Cari di Lumera">
          <button
            type="button"
            className="search-dialog__backdrop"
            onClick={() => setSearchOpen(false)}
            aria-label="Tutup pencarian"
          />
          <section className="search-dialog__panel">
            <div className="search-dialog__input">
              <Icon name="search" width={21} height={21} />
              <input
                ref={searchInput}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari mata pelajaran, kursus, atau modul"
                aria-label="Cari mata pelajaran, kursus, atau modul"
              />
              <button type="button" onClick={() => setSearchOpen(false)} aria-label="Tutup">
                <Icon name="close" width={18} height={18} />
              </button>
            </div>

            <div className="search-dialog__results" aria-live="polite">
              {query.trim() === '' ? (
                <p className="search-dialog__hint">
                  Coba “Matematika”, “Bilangan Bulat”, atau “garis bilangan”.
                </p>
              ) : results.length === 0 ? (
                <div className="search-dialog__empty">
                  <strong>Belum ada yang cocok</strong>
                  <span>Periksa ejaan atau gunakan istilah yang lebih singkat.</span>
                </div>
              ) : (
                results.map((record) => (
                  <button
                    type="button"
                    key={record.id}
                    className="search-result"
                    disabled={record.status === 'comingSoon'}
                    onClick={() => {
                      setSearchOpen(false);
                      setQuery('');
                      onSearchSelect(record);
                    }}
                  >
                    <span className="search-result__icon">
                      <Icon
                        name={
                          record.kind === 'module'
                            ? 'pages'
                            : record.kind === 'course'
                              ? 'book'
                              : 'grid'
                        }
                        width={20}
                        height={20}
                      />
                    </span>
                    <span className="search-result__copy">
                      <strong>{record.title}</strong>
                      <small>{record.breadcrumbs.join(' · ')}</small>
                    </span>
                    {record.status === 'comingSoon' ? (
                      <span className="status-chip">Segera hadir</span>
                    ) : (
                      <Icon name="arrow" width={18} height={18} />
                    )}
                  </button>
                ))
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
