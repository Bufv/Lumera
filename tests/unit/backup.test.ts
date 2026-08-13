import { beforeEach, describe, expect, it } from 'vitest';
import { buatBerkasEkspor } from '../../src/backup/export';
import { terapkanImpor, validasiBerkasImpor } from '../../src/backup/import';
import { EXPORT_SCHEMA_VERSION, namaBerkasEkspor } from '../../src/backup/schema';
import { loadLearnerProfile, saveLearnerProfile } from '../../src/profile';
import { bacaSiswa, simpanSiswa, type Siswa } from '../../src/progress/store';

/**
 * US7 spec 002 (T039). Kontrak lengkap:
 * specs/002-production-readiness/contracts/progress-export-contract.md
 * Sengaja tidak bergantung pada lesson engine sungguhan — memakai fixture
 * `Siswa`/`LearnerProfile` langsung (lihat T040 di tasks.md untuk alasan).
 */
describe('ekspor & impor progres (round-trip)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  function isiProgresContoh(): Siswa {
    const siswa = bacaSiswa();
    const bermutasi: Siswa = {
      ...siswa,
      lumens: 150,
      streakCount: 6,
      streakLastDate: '2026-08-09',
      modulSelesai: ['math-slope', 'physics-motion'],
      mastery: [
        {
          moduleId: 'math-slope',
          masteryPersen: 82,
          skorTerakhir: [70, 80, 82],
          diperbaruiPada: '2026-08-09T08:00:00.000Z',
        },
      ],
    };
    simpanSiswa(bermutasi);
    saveLearnerProfile({ ...loadLearnerProfile(), displayName: 'Nadia', onboardingComplete: true });
    return bermutasi;
  }

  it('round-trip: ekspor lalu impor mengembalikan seluruh progres persis sama', () => {
    isiProgresContoh();
    const berkas = buatBerkasEkspor();
    const teks = JSON.stringify(berkas);

    // Simulasikan "ganti perangkat" — hapus seluruh data lokal.
    localStorage.clear();
    expect(bacaSiswa().lumens).toBe(0);

    const hasil = validasiBerkasImpor(teks, bacaSiswa());
    expect(hasil.ok).toBe(true);
    if (!hasil.ok) return;

    terapkanImpor(hasil.data);

    const siswaPulih = bacaSiswa();
    expect(siswaPulih.lumens).toBe(150);
    expect(siswaPulih.streakCount).toBe(6);
    expect(siswaPulih.modulSelesai).toEqual(['math-slope', 'physics-motion']);
    expect(siswaPulih.mastery[0]?.masteryPersen).toBe(82);
    expect(loadLearnerProfile().displayName).toBe('Nadia');
  });

  it('menolak berkas dengan schemaVersion dari masa depan (belum dimengerti aplikasi ini)', () => {
    const berkas = buatBerkasEkspor();
    const teks = JSON.stringify({ ...berkas, schemaVersion: EXPORT_SCHEMA_VERSION + 99 });

    const hasil = validasiBerkasImpor(teks, bacaSiswa());
    expect(hasil.ok).toBe(false);
    if (hasil.ok) return;
    expect(hasil.error).toMatch(/lebih baru/i);
  });

  it('menolak JSON yang rusak dengan pesan jelas, tanpa merusak data lokal yang ada', () => {
    isiProgresContoh();
    const sebelum = bacaSiswa();

    const hasil = validasiBerkasImpor('{bukan json valid', sebelum);
    expect(hasil.ok).toBe(false);

    // Data lokal MUST tidak berubah sama sekali oleh validasi yang gagal.
    expect(bacaSiswa()).toEqual(sebelum);
  });

  it('menolak berkas yang kehilangan data siswa/profil (tidak lengkap)', () => {
    const hasil = validasiBerkasImpor(
      JSON.stringify({ schemaVersion: 1, exportedAt: new Date().toISOString() }),
      bacaSiswa(),
    );
    expect(hasil.ok).toBe(false);
  });

  it('meminta konfirmasi timpa jika berkas lebih lama dari data lokal saat ini', () => {
    const lama = isiProgresContoh();
    const berkasLama = JSON.stringify({
      schemaVersion: EXPORT_SCHEMA_VERSION,
      exportedAt: '2020-01-01T00:00:00.000Z',
      siswa: lama,
      learnerProfile: loadLearnerProfile(),
    });

    // Data lokal sekarang punya mastery yang diperbarui SETELAH tanggal berkas di atas.
    const hasil = validasiBerkasImpor(berkasLama, bacaSiswa());
    expect(hasil.ok).toBe(true);
    if (!hasil.ok) return;
    expect(hasil.perluKonfirmasiTimpa).toBe(true);
  });

  it('tidak meminta konfirmasi jika belum ada progres lokal sama sekali (siswa baru)', () => {
    const berkas = buatBerkasEkspor();
    localStorage.clear();

    const hasil = validasiBerkasImpor(JSON.stringify(berkas), bacaSiswa());
    expect(hasil.ok).toBe(true);
    if (!hasil.ok) return;
    expect(hasil.perluKonfirmasiTimpa).toBe(false);
  });

  it('nama berkas ekspor mengikuti pola lumera-progres-<YYYY-MM-DD>.json', () => {
    const nama = namaBerkasEkspor(new Date('2026-08-09T10:00:00.000Z'));
    expect(nama).toBe('lumera-progres-2026-08-09.json');
  });
});
