import { useState } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { color, radius, spacing, typography } from '../../design/tokens';
import type { UserActionProps } from '../../shell/types';
import { pindahkan, type CausalChainState } from './scoring';
import { PERISTIWA } from '../../content/history-causal-chain';

/**
 * Slot langkah 3 — menyusun urutan sebab-akibat.
 *
 * TIGA jalur setara, bukan satu (R-005, kontrak aturan 6):
 *   1. Drag pointer (mouse/sentuh presisi)
 *   2. Keyboard — sensor bawaan @dnd-kit
 *   3. Tap-to-move — tombol naik/turun untuk perangkat sentuh berlayar kecil
 *
 * Tanpa jalur 2 dan 3, kartu-kartu ini akan terlihat interaktif tapi tidak bisa
 * digerakkan di sebagian perangkat — persis pelanggaran FR-013 yang dilarang.
 */

function KartuSortable({
  id,
  teks,
  indeks,
  total,
  disabled,
  onNaik,
  onTurun,
}: {
  id: string;
  teks: string;
  indeks: number;
  total: number;
  disabled: boolean;
  onNaik: () => void;
  onTurun: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled,
  });

  const tombolGeser = (arah: 'naik' | 'turun', aktif: boolean, aksi: () => void) => (
    <button
      type="button"
      onClick={aksi}
      disabled={disabled || !aktif}
      aria-label={`Pindahkan "${teks}" ke ${arah}`}
      style={{
        background: 'transparent',
        border: `1px solid ${color.border}`,
        borderRadius: radius.sm,
        width: '2rem',
        height: '1.75rem',
        color: aktif && !disabled ? color.teal : color.inkFaint,
        cursor: aktif && !disabled ? 'pointer' : 'not-allowed',
        fontSize: typography.size.sm,
        lineHeight: 1,
      }}
    >
      {arah === 'naik' ? '↑' : '↓'}
    </button>
  );

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        display: 'flex',
        alignItems: 'center',
        gap: spacing.sm,
        background: isDragging ? color.tealSoft : color.surface,
        border: `1px solid ${isDragging ? color.teal : color.border}`,
        borderRadius: radius.md,
        padding: spacing.md,
        marginBottom: spacing.sm,
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {/* Pegangan drag — juga fokusable, sehingga keyboard bisa mengangkat kartu */}
      <span
        {...attributes}
        {...listeners}
        aria-label={`Seret "${teks}" untuk menyusun ulang`}
        style={{
          cursor: disabled ? 'not-allowed' : 'grab',
          color: color.inkFaint,
          fontSize: typography.size.base,
          padding: `0 ${spacing.xs}`,
          touchAction: 'none',
        }}
      >
        ⠿
      </span>

      <span
        style={{
          flex: 1,
          fontFamily: typography.fontFamilyUI,
          fontSize: typography.size.base,
          color: color.ink,
        }}
      >
        {teks}
      </span>

      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xs }}>
        {tombolGeser('naik', indeks > 0, onNaik)}
        {tombolGeser('turun', indeks < total - 1, onTurun)}
      </div>
    </li>
  );
}

export function CausalChainUserAction({
  state,
  onSubmit,
  disabled,
}: UserActionProps<CausalChainState, string[]>) {
  const [urutan, setUrutan] = useState<string[]>(state.urutan);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const dari = urutan.indexOf(String(active.id));
    const ke = urutan.indexOf(String(over.id));
    setUrutan((u) => pindahkan(u, dari, ke));
  };

  const geser = (dari: number, ke: number) => setUrutan((u) => pindahkan(u, dari, ke));

  return (
    <div style={{ maxWidth: '46rem', margin: '0 auto', padding: spacing.md }}>
      <p
        style={{
          fontFamily: typography.fontFamilyUI,
          fontSize: typography.size.sm,
          color: color.inkMuted,
          marginBottom: spacing.sm,
        }}
      >
        Susun dari sebab paling awal ke akibat paling akhir. Seret kartunya, atau pakai tombol ↑ ↓.
      </p>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={urutan} strategy={verticalListSortingStrategy}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {urutan.map((id, i) => (
              <KartuSortable
                key={id}
                id={id}
                teks={PERISTIWA.find((p) => p.id === id)?.teks ?? id}
                indeks={i}
                total={urutan.length}
                disabled={disabled}
                onNaik={() => geser(i, i - 1)}
                onTurun={() => geser(i, i + 1)}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      <button
        type="button"
        disabled={disabled}
        onClick={() => onSubmit(urutan)}
        style={{
          width: '100%',
          marginTop: spacing.md,
          background: disabled ? color.border : color.teal,
          color: disabled ? color.inkFaint : color.ivory,
          border: 'none',
          borderRadius: radius.pill,
          padding: spacing.md,
          fontFamily: typography.fontFamilyUI,
          fontSize: typography.size.base,
          fontWeight: typography.weight.semibold,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        Periksa urutan
      </button>
    </div>
  );
}
