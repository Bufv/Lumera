import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { CourseRoadmapScreen } from '../../src/student/CourseRoadmapScreen';
import {
  ALGEBRA_COURSE,
  ALGEBRA_MODULE_IDS,
  CALCULUS_COURSE,
} from '../../src/student/learningCatalog';

afterEach(cleanup);

describe('CourseRoadmapScreen', () => {
  it('renders the full winding roadmap while keeping future nodes non-interactive', () => {
    render(<CourseRoadmapScreen course={ALGEBRA_COURSE} demo onOpenLesson={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'Aljabar', level: 1 })).toBeTruthy();
    expect(screen.getByText('6 level · 24 pelajaran')).toBeTruthy();
    expect(screen.getAllByText('Segera hadir')).toHaveLength(20);
    expect(screen.getByLabelText('2.1 Suku yang Bisa Digabung, segera hadir').tagName).toBe(
      'ARTICLE',
    );
    expect(screen.queryByRole('button', { name: /2\.1 Suku yang Bisa Digabung/i })).toBeNull();
  });

  it('opens a focused node popover and starts an available lesson', () => {
    const onOpenLesson = vi.fn();
    render(<CourseRoadmapScreen course={ALGEBRA_COURSE} demo onOpenLesson={onOpenLesson} />);

    fireEvent.click(screen.getByRole('button', { name: /1\.1 Pola yang Tumbuh/i }));
    const dialog = screen.getByRole('dialog', { name: 'Pola yang Tumbuh' });
    expect(
      within(dialog).getByRole('button', { name: 'Tutup rincian Pola yang Tumbuh' }),
    ).toHaveFocus();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Mulai pelajaran' }));
    expect(onOpenLesson).toHaveBeenCalledWith(
      expect.objectContaining({ moduleId: ALGEBRA_MODULE_IDS.lesson1 }),
      ALGEBRA_COURSE,
    );
  });

  it('explains prerequisite locks without offering a false lesson action', () => {
    render(<CourseRoadmapScreen course={ALGEBRA_COURSE} demo onOpenLesson={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /1\.2 Aturan di Balik Pola/i }));
    const dialog = screen.getByRole('dialog', { name: 'Aturan di Balik Pola' });
    expect(dialog).toHaveTextContent('Selesaikan “Pola yang Tumbuh” terlebih dahulu');
    expect(within(dialog).queryByRole('button', { name: /pelajaran/i })).toBeNull();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByRole('button', { name: /1\.2 Aturan di Balik Pola/i })).toHaveFocus();
  });

  it('supports arrow-key movement between interactive roadmap nodes', () => {
    render(<CourseRoadmapScreen course={ALGEBRA_COURSE} demo onOpenLesson={vi.fn()} />);

    const first = screen.getByRole('button', { name: /1\.1 Pola yang Tumbuh/i });
    const second = screen.getByRole('button', { name: /1\.2 Aturan di Balik Pola/i });
    first.focus();
    fireEvent.keyDown(first, { key: 'ArrowDown' });
    expect(second).toHaveFocus();
    fireEvent.keyDown(second, { key: 'Home' });
    expect(first).toHaveFocus();
  });

  it('preserves the same catalog data in list view', () => {
    const onChangeView = vi.fn();
    render(
      <CourseRoadmapScreen
        course={CALCULUS_COURSE}
        demo
        defaultView="list"
        onChangeView={onChangeView}
        onOpenLesson={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: /1\.1 Seberapa Cepat Berubah/i })).toBeTruthy();
    expect(screen.getByLabelText('6.4 Tantangan Koneksi, segera hadir')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Jalur' }));
    expect(onChangeView).toHaveBeenCalledWith('roadmap');
    expect(screen.getByRole('heading', { name: 'Dari Perubahan ke Turunan' })).toBeTruthy();
  });

  it('surfaces the curriculum gate outside demo and passes an axe audit', async () => {
    const { container } = render(
      <CourseRoadmapScreen course={ALGEBRA_COURSE} onOpenLesson={vi.fn()} />,
    );

    fireEvent.click(
      screen.getByRole('button', { name: /1\.1 Pola yang Tumbuh, menunggu tinjauan/i }),
    );
    const dialog = screen.getByRole('dialog', { name: 'Pola yang Tumbuh' });
    expect(dialog).toHaveTextContent('belum tersedia di luar mode demo');
    expect(within(dialog).queryByRole('button', { name: /Mulai|Lanjutkan|Ulangi/i })).toBeNull();

    // jsdom has no canvas implementation, so axe cannot calculate color contrast here.
    // Contrast remains part of the real-browser visual QA; all structural rules run below.
    const results = await axe(container, { rules: { 'color-contrast': { enabled: false } } });
    expect(results.violations).toEqual([]);
  });
});
