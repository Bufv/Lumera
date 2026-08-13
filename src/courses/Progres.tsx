/**
 * Indikator progres bersama. Cincinnya mengikuti anatomi di
 * `docs/sample/brilliant/`: dua lingkaran setumpuk, `stroke-linecap: round`,
 * diputar −90° supaya isian mulai dari atas.
 */

export function CincinProgres({
  persen,
  ukuran = 20,
  tebal = 3.33,
  label,
}: {
  persen: number;
  ukuran?: number;
  tebal?: number;
  label?: string;
}) {
  const aman = Math.max(0, Math.min(100, persen));
  const r = (ukuran - tebal) / 2;
  const keliling = 2 * Math.PI * r;
  const c = ukuran / 2;

  return (
    <svg
      width={ukuran}
      height={ukuran}
      viewBox={`0 0 ${ukuran} ${ukuran}`}
      className="cincin"
      role={label ? 'img' : 'presentation'}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <circle className="cincin-track" cx={c} cy={c} r={r} strokeWidth={tebal} />
      <circle
        className="cincin-isi"
        cx={c}
        cy={c}
        r={r}
        strokeWidth={tebal}
        strokeDasharray={`${(keliling * aman) / 100} ${keliling}`}
        transform={`rotate(-90 ${c} ${c})`}
      />
    </svg>
  );
}

export function BarProgres({ persen, label }: { persen: number; label: string }) {
  const aman = Math.max(0, Math.min(100, persen));
  return (
    <span
      className="bar-progres"
      role="progressbar"
      aria-label={label}
      aria-valuenow={aman}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <i style={{ width: `${aman}%` }} />
    </span>
  );
}
