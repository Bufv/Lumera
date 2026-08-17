import { useEffect, useState } from 'react';
import { loadLearnerProfile } from '../profile';

/**
 * useReducedMotion:
 * Hook aksesibilitas terpadu yang memadukan:
 * 1. Prop eksplisit override dari pemanggil (jika disediakan).
 * 2. Pengaturan preferensi motion pada profil siswa Lumera aktif.
 * 3. Media query peramban/OS `(prefers-reduced-motion: reduce)`.
 */
export function useReducedMotion(overrideProp?: boolean): boolean {
  const [systemReducedMotion, setSystemReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return false;
    }
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  const [profileReducedMotion, setProfileReducedMotion] = useState<boolean>(() => {
    try {
      const profile = loadLearnerProfile();
      return Boolean(profile?.reduceMotion);
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const listener = (event: MediaQueryListEvent) => {
      setSystemReducedMotion(event.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    } else if ('addListener' in mediaQuery) {
      // Fallback untuk browser lawas
      (mediaQuery as { addListener: (cb: (e: MediaQueryListEvent) => void) => void }).addListener(listener);
      return () => {
        (mediaQuery as { removeListener: (cb: (e: MediaQueryListEvent) => void) => void }).removeListener(listener);
      };
    }
  }, []);

  // Update profil preferensi bila ada perubahan
  useEffect(() => {
    try {
      const profile = loadLearnerProfile();
      setProfileReducedMotion(Boolean(profile?.reduceMotion));
    } catch {
      setProfileReducedMotion(false);
    }
  }, []);

  if (typeof overrideProp === 'boolean') {
    return overrideProp;
  }

  return systemReducedMotion || profileReducedMotion;
}
