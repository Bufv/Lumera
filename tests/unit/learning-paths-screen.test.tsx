import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LearningPathsScreen } from '../../src/student/LearningPathsScreen';

describe('LearningPathsScreen', () => {
  it('renders both curriculum paths and exposes only available courses as actions', () => {
    const onOpenCourse = vi.fn();
    render(
      <LearningPathsScreen
        onOpenCourse={onOpenCourse}
        progressByCourse={{ aljabar: 50, kalkulus: 25 }}
        demo
      />,
    );

    expect(screen.getByRole('heading', { name: 'Matematika · Fase D' })).toBeTruthy();
    expect(
      screen.getByRole('heading', { name: 'Matematika Tingkat Lanjut · Fase F' }),
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Buka jalur kursus Aljabar' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Buka jalur kursus Kalkulus' })).toBeTruthy();
    expect(screen.getByLabelText('Geometri, segera hadir').tagName).toBe('ARTICLE');
    expect(screen.queryByRole('button', { name: /Geometri, segera hadir/i })).toBeNull();
    expect(screen.getByText('2 jalur belajar · progres demo')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Buka jalur kursus Aljabar' }));
    expect(onOpenCourse).toHaveBeenCalledWith('aljabar');
  });

  it('searches available and upcoming courses without making future content navigable', () => {
    render(<LearningPathsScreen onOpenCourse={vi.fn()} />);

    const searchbox = screen.getByRole('searchbox', { name: 'Cari jalur atau kursus' });
    fireEvent.change(searchbox, { target: { value: 'geometri analitik' } });

    expect(screen.getByText('1 kursus ditemukan')).toBeTruthy();
    expect(screen.getByLabelText('Geometri Analitik, segera hadir')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Geometri Analitik/i })).toBeNull();
    expect(screen.queryByText('Aljabar')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Hapus pencarian' }));
    const phaseD = screen.getByRole('region', { name: 'Urutan kursus Matematika · Fase D' });
    expect(within(phaseD).getByText('Aljabar')).toBeTruthy();
  });

  it('provides a directed empty state for an unmatched query', () => {
    render(<LearningPathsScreen onOpenCourse={vi.fn()} />);

    fireEvent.change(screen.getByRole('searchbox', { name: 'Cari jalur atau kursus' }), {
      target: { value: 'astronomi' },
    });

    expect(screen.getByRole('heading', { name: 'Belum ada yang cocok' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Lihat semua jalur' }));
    expect(screen.getByRole('heading', { name: 'Matematika · Fase D' })).toBeTruthy();
  });
});
