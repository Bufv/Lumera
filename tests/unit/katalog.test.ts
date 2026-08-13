import { describe, expect, it } from 'vitest';
import {
  KATALOG,
  type JalurKatalog,
  ambilKursus,
  bagiJalur,
  jalurUntukKursus,
  kursusUntukModul,
  labelMenit,
  semuaKursus,
  susunJalur,
  susunKatalog,
  susunKursus,
} from '../../src/courses/katalog';
import type { CatatanMastery, Siswa } from '../../src/progress/store';

/**
 * Katalog memuat pelajaran yang naskahnya belum ditulis. Tes ini mengunci dua
 * hal: pelajaran seperti itu tidak pernah bisa dibuka, dan angkanya tidak
 * pernah ikut membentuk persentase penguasaan.
 */

function siswa(patch: Partial<Siswa> = {}): Siswa {
  return {
    schemaVersion: 1,
    id: 'uji',
    lumens: 0,
    streakCount: 0,
    streakLastDate: null,
    mastery: [],
    modulSelesai: [],
    ...patch,
  };
}

function rec(moduleId: string, persen: number): CatatanMastery {
  return {
    moduleId,
    masteryPersen: persen,
    skorTerakhir: [persen],
    diperbaruiPada: '2026-08-08',
  };
}

const JALUR_UJI: JalurKatalog = {
  id: 'jalur-uji',
  judul: 'Jalur Uji',
  ringkas: 'Untuk pengujian.',
  jenjang: 'SMP Kelas VII',
  jenjangKelompok: 'SMP',
  hue: 'violet',
  ikon: 'math',
  kursus: [
    {
      id: 'kursus-uji',
      subjectWorldId: 'matematika',
      judul: 'Kursus Uji',
      ringkas: 'Untuk pengujian.',
      kelas: 'Kls VII',
      ikon: 'math',
      level: [
        {
          id: 'lv1',
          judul: 'Level Satu',
          konsep: ['Konsep A', 'Konsep B'],
          pelajaran: [
            {
              id: 'p1',
              judul: 'Sudah ada',
              ringkas: '',
              menit: [5, 7],
              jenis: 'pelajari',
              moduleId: 'nyata',
            },
            { id: 'p2', judul: 'Belum ditulis', ringkas: '', menit: [6, 8], jenis: 'pelajari' },
            {
              id: 'p3',
              judul: 'Terdaftar tapi hilang dari registry',
              ringkas: '',
              menit: [8, 12],
              jenis: 'cek-level',
              moduleId: 'hantu',
            },
          ],
        },
      ],
    },
  ],
};

const KURSUS_UJI = JALUR_UJI.kursus[0]!;
const TERDAFTAR = new Set(['nyata']);

describe('susunKursus — pelajaran yang belum dibangun', () => {
  it('tidak pernah bisa dibuka, baik yang tanpa moduleId maupun yang tidak ada di registry', () => {
    const pelajaran = susunKursus(KURSUS_UJI, siswa(), TERDAFTAR).level[0]!.pelajaran;

    expect(pelajaran.map((p) => p.bisaDibuka)).toEqual([true, false, false]);
    expect(pelajaran.map((p) => p.status)).toEqual(['terbuka', 'disiapkan', 'disiapkan']);
  });

  it('memberi masteryPersen null — bukan 0 — supaya tidak ikut dirata-rata', () => {
    const hasil = susunKursus(KURSUS_UJI, siswa({ mastery: [rec('nyata', 80)] }), TERDAFTAR);
    const pelajaran = hasil.level[0]!.pelajaran;

    expect(pelajaran[1]!.masteryPersen).toBeNull();
    expect(pelajaran[2]!.masteryPersen).toBeNull();
    // 80 dari satu pelajaran yang ada, bukan 80/3 = 27.
    expect(hasil.persen).toBe(80);
  });

  it('menghitung jumlah tersedia dan disiapkan secara terpisah', () => {
    const hasil = susunKursus(KURSUS_UJI, siswa(), TERDAFTAR);
    expect(hasil.jumlahTersedia).toBe(1);
    expect(hasil.jumlahDisiapkan).toBe(2);
    expect(hasil.totalPelajaran).toBe(3);
  });

  it('memberi nomor urut mulai dari 1 di setiap level', () => {
    const hasil = susunKursus(KURSUS_UJI, siswa(), TERDAFTAR);
    expect(hasil.level[0]!.pelajaran.map((p) => p.no)).toEqual([1, 2, 3]);
    expect(hasil.level[0]!.urutan).toBe(1);
  });

  it('menjumlahkan durasi dan konsep seluruh kursus', () => {
    const hasil = susunKursus(KURSUS_UJI, siswa(), TERDAFTAR);
    expect(hasil.totalMenit).toEqual([19, 27]);
    expect(hasil.totalKonsep).toBe(2);
  });
});

describe('susunKursus — status dari progres siswa', () => {
  it('menandai selesai hanya bila modulnya ada di modulSelesai', () => {
    const s = siswa({ mastery: [rec('nyata', 100)], modulSelesai: ['nyata'] });
    expect(susunKursus(KURSUS_UJI, s, TERDAFTAR).level[0]!.pelajaran[0]!.status).toBe('selesai');
  });

  it('menandai sedang dipelajari saat sudah ada penguasaan tapi belum selesai', () => {
    const s = siswa({ mastery: [rec('nyata', 45)] });
    expect(susunKursus(KURSUS_UJI, s, TERDAFTAR).level[0]!.pelajaran[0]!.status).toBe('sedang');
  });

  it('memilih pelajaran berikutnya: yang sedang dikerjakan didahulukan', () => {
    const s = siswa({ mastery: [rec('nyata', 45)] });
    expect(susunKursus(KURSUS_UJI, s, TERDAFTAR).berikutnya?.id).toBe('p1');
  });

  it('tidak pernah menawarkan pelajaran yang belum dibangun sebagai berikutnya', () => {
    const kosong = {
      ...KURSUS_UJI,
      level: [{ ...KURSUS_UJI.level[0]!, pelajaran: [KURSUS_UJI.level[0]!.pelajaran[1]!] }],
    };
    const hasil = susunKursus(kosong, siswa(), TERDAFTAR);
    expect(hasil.berikutnya).toBeNull();
    expect(hasil.persen).toBe(0);
  });
});

describe('susunJalur', () => {
  it('menandai jalur sudah dimulai hanya bila ada kursus yang berprogres', () => {
    expect(susunJalur(JALUR_UJI, siswa(), TERDAFTAR).sudahDimulai).toBe(false);
    expect(
      susunJalur(JALUR_UJI, siswa({ mastery: [rec('nyata', 30)] }), TERDAFTAR).sudahDimulai,
    ).toBe(true);
  });

  it('merata-rata hanya kursus yang punya pelajaran tersedia', () => {
    const jalurCampur: JalurKatalog = {
      ...JALUR_UJI,
      kursus: [
        KURSUS_UJI,
        { ...KURSUS_UJI, id: 'kursus-kosong', level: [{ ...KURSUS_UJI.level[0]!, pelajaran: [] }] },
      ],
    };
    const hasil = susunJalur(jalurCampur, siswa({ mastery: [rec('nyata', 60)] }), TERDAFTAR);
    // 60 dari satu kursus yang punya isi, bukan 60/2 = 30.
    expect(hasil.persen).toBe(60);
  });
});

describe('bagiJalur', () => {
  it('mengelompokkan jalur yang sudah dikerjakan sebagai milikmu', () => {
    const terdaftar = new Set(['math-slope', 'physics-motion']);
    const daftar = susunKatalog(siswa({ mastery: [rec('physics-motion', 40)] }), terdaftar);
    const { milikmu, lainnya } = bagiJalur(daftar);

    expect(milikmu.map((j) => j.id)).toEqual(['sains-terapan']);
    expect(lainnya.some((j) => j.id === 'sains-terapan')).toBe(false);
    expect(milikmu.length + lainnya.length).toBe(daftar.length);
  });

  it('saat belum ada progres, jalur yang punya pelajaran siap jadi titik mulai', () => {
    const daftar = susunKatalog(siswa(), new Set(['math-slope']));
    const { milikmu } = bagiJalur(daftar);
    expect(milikmu.map((j) => j.id)).toEqual(['matematika-dasar']);
  });

  it('tidak kehilangan satu jalur pun saat tidak ada yang tersedia', () => {
    const daftar = susunKatalog(siswa(), new Set());
    const { milikmu, lainnya } = bagiJalur(daftar);
    expect(milikmu).toHaveLength(0);
    expect(lainnya).toHaveLength(daftar.length);
  });
});

describe('katalog bawaan', () => {
  it('setiap jalur dan kursus punya id unik', () => {
    const idJalur = KATALOG.map((j) => j.id);
    const idKursus = semuaKursus().map((k) => k.id);
    expect(new Set(idJalur).size).toBe(idJalur.length);
    expect(new Set(idKursus).size).toBe(idKursus.length);
  });

  it('setiap pelajaran punya id unik di seluruh katalog', () => {
    const id = semuaKursus().flatMap((k) =>
      k.level.flatMap((lv) => lv.pelajaran.map((p) => p.id)),
    );
    expect(new Set(id).size).toBe(id.length);
  });

  it('tidak memakai satu moduleId di dua pelajaran berbeda', () => {
    const moduleId = semuaKursus().flatMap((k) =>
      k.level.flatMap((lv) => lv.pelajaran.map((p) => p.moduleId).filter(Boolean)),
    );
    expect(new Set(moduleId).size).toBe(moduleId.length);
  });

  it('setiap level ditutup satu pelajaran cek-level', () => {
    for (const kursus of semuaKursus()) {
      for (const level of kursus.level) {
        expect(level.pelajaran.at(-1)?.jenis).toBe('cek-level');
      }
    }
  });

  it('menemukan kembali kursus lewat id, modul, maupun jalurnya', () => {
    expect(ambilKursus('gerak-benda')?.subjectWorldId).toBe('sains');
    expect(ambilKursus('tidak-ada')).toBeNull();
    expect(kursusUntukModul('econ-supply-demand')?.id).toBe('pasar-dan-harga');
    expect(kursusUntukModul('bukan-modul')).toBeNull();
    expect(jalurUntukKursus('sebab-akibat')?.id).toBe('sejarah-nalar');
    expect(jalurUntukKursus('tidak-ada')).toBeNull();
  });
});

describe('labelMenit', () => {
  it('menyingkat rentang yang kedua ujungnya sama', () => {
    expect(labelMenit([6, 10])).toBe('6–10 menit');
    expect(labelMenit([8, 8])).toBe('8 menit');
  });
});
