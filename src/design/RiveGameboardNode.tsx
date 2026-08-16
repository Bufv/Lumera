import { Icon } from './Icon';
import type { RiveNodeStatus } from './RiveGameboardNode.types';
import './RiveGameboardNode.css';

/**
 * Visual simpul jalur dibuat deterministik dengan CSS/SVG.
 *
 * File .riv lama menghasilkan glyph yang tidak konsisten pada beberapa
 * browser: ikon kunci/play bisa tampak terlepas dari badan node. Untuk
 * navigasi utama, kejelasan status lebih penting daripada animasi aset.
 */
export function RiveGameboardNode({
  status,
  selected = false,
}: {
  status: RiveNodeStatus;
  selected?: boolean;
}) {
  const icon = status === 'selesai' ? 'check' : status === 'berjalan' ? 'play' : 'lock';

  return (
    <span
      className="course-node__rive"
      data-status={status}
      data-selected={selected}
      aria-hidden="true"
    >
      <span className="course-node__glyph-shadow" />
      <span className="course-node__glyph-face">
        <span className="course-node__glyph-inner">
          <Icon name={icon} width={24} height={24} />
        </span>
      </span>
    </span>
  );
}
