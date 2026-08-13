import { useEffect, useRef, useState } from 'react';
import { color, radius, spacing, typography } from '../../design/tokens';
import type { VisualModelProps } from '../../shell/types';
import { jarakTempuh, kecepatanPada, type MotionState } from './scoring';

const W = 640;
const H = 200;
const SKALA_PX_PER_M = 6;

/**
 * Slot langkah 2 — simulasi gerak lurus di canvas.
 *
 * Integrasi berbasis DELTA-TIME, bukan per-frame konstan (R-004): kalau posisi dihitung
 * per frame, simulasi akan berjalan lebih cepat di layar 120 Hz daripada 60 Hz. Itu bukan
 * cacat visual — itu fisika yang salah, dan Prinsip IV memperlakukannya sebagai kesalahan konten.
 */
export function MotionVisualModel({ state, onStateChange }: VisualModelProps<MotionState>) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [berjalan, setBerjalan] = useState(false);
  const [tSim, setTSim] = useState(0);

  const rafRef = useRef<number | null>(null);
  const terakhirRef = useRef<number | null>(null);

  useEffect(() => {
    if (!berjalan) return;

    const tick = (now: number) => {
      const sebelumnya = terakhirRef.current ?? now;
      const dt = (now - sebelumnya) / 1000; // detik nyata sejak frame lalu
      terakhirRef.current = now;

      setTSim((t) => {
        const berikut = t + dt;
        if (berikut >= state.waktuTarget) {
          setBerjalan(false);
          return state.waktuTarget;
        }
        return berikut;
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      terakhirRef.current = null;
    };
  }, [berjalan, state.waktuTarget]);

  // Render
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = color.surface;
    ctx.fillRect(0, 0, W, H);

    // lintasan
    ctx.strokeStyle = color.border;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(20, H - 50);
    ctx.lineTo(W - 20, H - 50);
    ctx.stroke();

    // penanda jarak tiap 10 m
    ctx.fillStyle = color.inkFaint;
    ctx.font = '10px sans-serif';
    for (let m = 0; m <= 100; m += 10) {
      const px = 20 + m * SKALA_PX_PER_M;
      if (px > W - 20) break;
      ctx.fillRect(px, H - 54, 1, 8);
      ctx.fillText(`${m}m`, px - 8, H - 30);
    }

    const s = jarakTempuh(state.kecepatanAwal, state.percepatan, tSim);
    const x = Math.min(20 + s * SKALA_PX_PER_M, W - 20);

    // benda
    ctx.fillStyle = color.teal;
    ctx.beginPath();
    ctx.arc(x, H - 62, 10, 0, Math.PI * 2);
    ctx.fill();

    // bacaan
    ctx.fillStyle = color.ink;
    ctx.font = '13px sans-serif';
    ctx.fillText(`t = ${tSim.toFixed(2)} s`, 20, 24);
    ctx.fillText(`s = ${s.toFixed(2)} m`, 130, 24);
    ctx.fillText(
      `v = ${kecepatanPada(state.kecepatanAwal, state.percepatan, tSim).toFixed(2)} m/s`,
      250,
      24,
    );
  }, [state, tSim]);

  const ulang = () => {
    setTSim(0);
    terakhirRef.current = null;
    setBerjalan(true);
  };

  const slider = (
    label: string,
    nilai: number,
    min: number,
    max: number,
    step: number,
    set: (n: number) => void,
  ) => (
    <div style={{ flex: 1, minWidth: '12rem' }}>
      <label
        style={{
          display: 'block',
          fontFamily: typography.fontFamilyUI,
          fontSize: typography.size.sm,
          color: color.inkMuted,
          marginBottom: spacing.xs,
        }}
      >
        {label}: {nilai}
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={nilai}
        onChange={(e) => {
          set(Number(e.target.value));
          setTSim(0);
          setBerjalan(false);
        }}
        style={{ width: '100%' }}
      />
    </div>
  );

  return (
    <div style={{ maxWidth: '46rem', margin: '0 auto', padding: spacing.md }}>
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        style={{ width: '100%', height: 'auto', borderRadius: radius.md, border: `1px solid ${color.border}` }}
        aria-label="Simulasi gerak lurus berubah beraturan"
      />
      <div style={{ display: 'flex', gap: spacing.md, flexWrap: 'wrap', marginTop: spacing.md }}>
        {slider('Kecepatan awal (m/s)', state.kecepatanAwal, 0, 20, 1, (n) =>
          onStateChange({ ...state, kecepatanAwal: n }),
        )}
        {slider('Percepatan (m/s²)', state.percepatan, 0, 5, 0.5, (n) =>
          onStateChange({ ...state, percepatan: n }),
        )}
      </div>
      <button
        type="button"
        onClick={ulang}
        style={{
          marginTop: spacing.md,
          background: 'transparent',
          color: color.teal,
          border: `1px solid ${color.teal}`,
          borderRadius: radius.pill,
          padding: `${spacing.sm} ${spacing.lg}`,
          fontFamily: typography.fontFamilyUI,
          fontSize: typography.size.sm,
          cursor: 'pointer',
        }}
      >
        {berjalan ? 'Berjalan…' : `Jalankan ${state.waktuTarget} detik`}
      </button>
    </div>
  );
}
