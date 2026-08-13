import { SCHEMA_VERSION, type LearningEvent } from './events';

/**
 * Validasi event sebelum ditulis (kontrak aturan 3).
 *
 * Kegagalan senyap adalah mode kegagalan paling berbahaya di sini: demo manual tetap
 * terlihat normal sementara datanya tidak pernah tersimpan. Karena itu event yang
 * melanggar aturan field DITOLAK dan errornya dimunculkan — bukan ditelan diam-diam.
 */

export class InvalidLearningEventError extends Error {
  readonly pelanggaran: string[];

  constructor(pelanggaran: string[]) {
    super(`Event pembelajaran tidak valid: ${pelanggaran.join('; ')}`);
    this.name = 'InvalidLearningEventError';
    this.pelanggaran = pelanggaran;
  }
}

export function validasiEvent(event: LearningEvent): string[] {
  const pelanggaran: string[] = [];

  if (event.type !== 'lesson_completed') {
    pelanggaran.push(`type tidak dikenal: ${String(event.type)}`);
  }
  if (!event.eventId) pelanggaran.push('eventId kosong');
  if (!event.siswaId) pelanggaran.push('siswaId kosong');
  if (!event.moduleId) pelanggaran.push('moduleId kosong');

  if (!Array.isArray(event.conceptIds) || event.conceptIds.length === 0) {
    pelanggaran.push('conceptIds kosong — data minimal Prinsip VI tidak terpenuhi');
  }

  if (typeof event.durasiMs !== 'number' || !Number.isFinite(event.durasiMs) || event.durasiMs <= 0) {
    pelanggaran.push('durasiMs harus > 0 — data minimal Prinsip VI tidak terpenuhi');
  }

  if (!Array.isArray(event.mistakes)) {
    pelanggaran.push('mistakes bukan array');
  } else {
    event.mistakes.forEach((m, i) => {
      if (!m.conceptId) pelanggaran.push(`mistakes[${i}].conceptId kosong`);
      if (!m.mistakeType) pelanggaran.push(`mistakes[${i}].mistakeType kosong`);
      if (!Number.isInteger(m.nomorPercobaan) || m.nomorPercobaan < 1) {
        pelanggaran.push(`mistakes[${i}].nomorPercobaan tidak valid`);
      }
    });
  }

  if (!event.selesaiPada || Number.isNaN(Date.parse(event.selesaiPada))) {
    pelanggaran.push('selesaiPada bukan ISO 8601 yang valid');
  }

  if (event.schemaVersion !== SCHEMA_VERSION) {
    pelanggaran.push(`schemaVersion harus ${SCHEMA_VERSION}`);
  }

  return pelanggaran;
}

export function pastikanEventValid(event: LearningEvent): void {
  const pelanggaran = validasiEvent(event);
  if (pelanggaran.length > 0) {
    throw new InvalidLearningEventError(pelanggaran);
  }
}
