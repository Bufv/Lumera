import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OnboardingFlow } from '../../src/student/OnboardingFlow';
import { createDefaultLearnerProfile } from '../../src/profile';

/**
 * Regression guard untuk FR-006/FR-007 (specs/003-drop-utbk-snbt): layar
 * pemilihan jenjang onboarding — permukaan pertama yang dilihat siswa baru
 * sebelum login — MUST NOT lagi menawarkan jenjang "UTBK / SNBT".
 */

function pasang() {
  render(
    <OnboardingFlow
      route="onboarding-profile"
      profile={createDefaultLearnerProfile()}
      onChange={vi.fn()}
      onNavigate={vi.fn()}
      onEnterDemo={vi.fn()}
      onComplete={vi.fn()}
    />,
  );
}

describe('OnboardingFlow — langkah pilih jenjang', () => {
  it('tidak menawarkan kartu "UTBK / SNBT" (FR-006, FR-007)', () => {
    pasang();
    expect(screen.queryAllByText(/UTBK|SNBT/i)).toHaveLength(0);
  });

  it('tetap menawarkan jenjang SMP dan SMA yang dalam cakupan', () => {
    pasang();
    expect(screen.getByText('SMP Kelas VII')).toBeInTheDocument();
    expect(screen.getByText('SMP Kelas VIII–IX')).toBeInTheDocument();
    expect(screen.getByText('SMA')).toBeInTheDocument();
  });
});
