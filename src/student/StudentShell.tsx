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

function BellIcon({ size = 21 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z" />
      <path d="M10 21h4" />
    </svg>
  );
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
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationSeen, setNotificationSeen] = useState(false);
  const [query, setQuery] = useState('');
  const searchInput = useRef<HTMLInputElement>(null);
  const results = useMemo(() => searchStudentContent(query), [query]);
  const initial = (displayName.trim()[0] || 'L').toLocaleUpperCase('id-ID');

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setProfileOpen(false);
        setNotificationOpen(false);
        setSearchOpen(true);
      }
      if (event.key === 'Escape') {
        setSearchOpen(false);
        setProfileOpen(false);
        setNotificationOpen(false);
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
    setNotificationOpen(false);
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
              aria-label="Peta Ilmu, segera hadir"
              title="Peta Ilmu · Segera hadir"
              disabled
            >
              Peta Ilmu
            </button>
          </nav>

          <div className="student-header__actions">
            <button
              type="button"
              className="search-trigger"
              onClick={() => {
                setProfileOpen(false);
                setNotificationOpen(false);
                setSearchOpen(true);
              }}
              aria-label="Buka pencarian"
            >
              <Icon name="search" width={18} height={18} />
              <span>Cari apa pun...</span>
              <kbd>Ctrl K</kbd>
            </button>

            <div
              className="student-streak"
              aria-label={
                streakDays > 0 ? `${streakDays} hari berturut-turut` : 'Mulai rangkaian belajarmu'
              }
            >
              <Icon name="flame" width={23} height={23} />
              <span>
                <strong>{streakDays > 0 ? streakDays : 'Mulai'}</strong>
                <small>{streakDays > 0 ? 'Hari berturut-turut' : 'Rangkaian belajar'}</small>
              </span>
            </div>

            <div className="notification-control">
              <button
                type="button"
                className="notification-trigger"
                aria-label="Buka pemberitahuan"
                aria-expanded={notificationOpen}
                onClick={() => {
                  setProfileOpen(false);
                  setNotificationSeen(true);
                  setNotificationOpen((open) => !open);
                }}
              >
                <BellIcon />
                {!notificationSeen && <i aria-hidden="true" />}
              </button>

              {notificationOpen && (
                <section className="notification-menu" role="dialog" aria-label="Pemberitahuan">
                  <header>
                    <strong>Pemberitahuan</strong>
                    <button
                      type="button"
                      aria-label="Tutup pemberitahuan"
                      onClick={() => setNotificationOpen(false)}
                    >
                      <Icon name="close" width={17} height={17} />
                    </button>
                  </header>
                  <div className="notification-menu__item">
                    <span>
                      <Icon name="check" width={17} height={17} />
                    </span>
                    <p>
                      <strong>Rencana belajarmu sudah siap</strong>
                      <small>Mulai dari Matematika · Bilangan Bulat.</small>
                    </p>
                  </div>
                </section>
              )}
            </div>

            <div className="profile-control">
              <button
                type="button"
                className="student-profile-trigger"
                aria-label="Buka menu profil"
                aria-expanded={profileOpen}
                data-open={profileOpen}
                onClick={() => {
                  setNotificationOpen(false);
                  setProfileOpen((open) => !open);
                }}
              >
                <span className="student-avatar">{initial}</span>
                <Icon name="chevron" width={15} height={15} />
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
                    title="Peta Ilmu · Segera hadir"
                    disabled
                  >
                    Peta Ilmu
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

      {demo && route === 'home' && (
        <span className="home-demo-status" role="status">
          Mode demo · Data ilustratif
        </span>
      )}

      {demo && route !== 'home' && (
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
