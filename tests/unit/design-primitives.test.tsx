import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ArtworkFrame } from '../../src/design/ArtworkFrame';
import { Tactile } from '../../src/design/Tactile';

afterEach(cleanup);

describe('ArtworkFrame', () => {
  it('uses an accessible icon placeholder until approved artwork exists', () => {
    render(
      <ArtworkFrame
        assetKey="matematika-hero"
        placeholderIcon="math"
        alt="Ilustrasi Matematika"
        ratio="wide"
        variant="violet"
      />,
    );

    const frame = screen.getByRole('img', { name: 'Ilustrasi Matematika' });
    expect(frame).toHaveAttribute('data-asset-key', 'matematika-hero');
    expect(frame).toHaveClass('lumera-artwork--wide', 'lumera-artwork--violet');
    expect(frame.querySelector('svg')).toBeTruthy();
  });

  it('loads a manifest image and falls back safely when it fails', () => {
    render(
      <ArtworkFrame
        assetKey="course-cover"
        placeholderIcon="book"
        alt="Sampul Bilangan Bulat"
        manifest={{ 'course-cover': '/assets/course-cover.png' }}
      />,
    );

    const image = screen.getByRole('img', { name: 'Sampul Bilangan Bulat' });
    expect(image).toHaveAttribute('src', '/assets/course-cover.png');

    fireEvent.error(image);
    const fallback = screen.getByRole('img', { name: 'Sampul Bilangan Bulat' });
    expect(fallback.querySelector('svg')).toBeTruthy();
  });

  it('removes decorative artwork from the accessibility tree', () => {
    const { container } = render(
      <ArtworkFrame assetKey="decoration" placeholderIcon="sparkles" decorative />,
    );
    expect(container.querySelector('[aria-hidden="true"]')).toBeTruthy();
    expect(screen.queryByRole('img')).toBeNull();
  });
});

describe('Tactile', () => {
  it('renders a non-submitting semantic button by default', () => {
    const onClick = vi.fn();
    render(<Tactile onClick={onClick}>Lanjutkan</Tactile>);

    const button = screen.getByRole('button', { name: 'Lanjutkan' });
    expect(button).toHaveAttribute('type', 'button');
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders navigation as an anchor and makes disabled links inert', () => {
    const onClick = vi.fn();
    const { rerender } = render(
      <Tactile as="a" href="#/belajar" onClick={onClick} variant="card">
        Buka Matematika
      </Tactile>,
    );

    expect(screen.getByRole('link', { name: 'Buka Matematika' })).toHaveAttribute(
      'href',
      '#/belajar',
    );

    rerender(
      <Tactile as="a" href="#/atlas" onClick={onClick} disabled>
        Lumera Atlas
      </Tactile>,
    );
    const disabledLink = screen.getByRole('link', { name: 'Lumera Atlas' });
    expect(disabledLink).not.toHaveAttribute('href');
    expect(disabledLink).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(disabledLink);
    expect(onClick).not.toHaveBeenCalled();
  });
});
