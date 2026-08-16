import { beforeEach, describe, expect, it } from 'vitest';
import {
  bacaProgresDemo,
  DEMO_PROGRESS_STORAGE_KEY,
  resetProgresDemo,
  selesaikanPelajaranDemo,
} from '../../src/progress/demoStore';
import { bacaSiswa, simpanSiswa } from '../../src/progress/store';

describe('isolasi progres demo', () => {
  beforeEach(() => localStorage.clear());

  it('menyimpan penyelesaian pada kunci terpisah tanpa mengubah progres asli', () => {
    const asli = bacaSiswa();
    simpanSiswa({ ...asli, lumens: 13, modulSelesai: ['legacy-module'] });

    const hasil = selesaikanPelajaranDemo('aljabar-pola-yang-tumbuh', 1);

    expect(hasil.siswa.modulSelesai).toContain('aljabar-pola-yang-tumbuh');
    expect(bacaSiswa().lumens).toBe(13);
    expect(bacaSiswa().modulSelesai).toEqual(['legacy-module']);
    expect(localStorage.getItem(DEMO_PROGRESS_STORAGE_KEY)).not.toBeNull();
  });

  it('reset demo tidak menghapus progres asli', () => {
    const asli = bacaSiswa();
    simpanSiswa({ ...asli, lumens: 55 });
    selesaikanPelajaranDemo('kalkulus-seberapa-cepat-berubah', 0);

    resetProgresDemo();

    expect(bacaProgresDemo().modulSelesai).toEqual([]);
    expect(bacaSiswa().lumens).toBe(55);
  });
});
