import { useEffect, useState } from 'react';
import { Icon } from '../design/Icon';
import { langgananStorageGagal } from './safeStorage';
import './StorageWarningBanner.css';

/**
 * Peringatan eksplisit saat `localStorage` penuh/diblokir (US8 spec 002,
 * FR-026). Dipasang sekali di root shell siswa (`StudentApp.tsx`) — muncul
 * begitu `safeStorage` melaporkan kegagalan tulis, hilang lagi jika storage
 * kembali berfungsi. Siswa tetap MUST bisa memakai aplikasi selama banner ini
 * tampil, hanya progres sesi ini tidak tersimpan antar sesi.
 */
export function StorageWarningBanner() {
  const [gagal, setGagal] = useState(false);

  useEffect(() => langgananStorageGagal(setGagal), []);

  if (!gagal) return null;

  return (
    <div className="storage-warning" role="status" aria-live="polite">
      <Icon name="info" width={18} height={18} />
      <p>
        Penyimpanan perangkat ini penuh atau diblokir. Kamu tetap bisa memakai Lumera sekarang,
        tapi progres dari sesi ini <strong>tidak akan tersimpan</strong> setelah kamu menutup atau
        memuat ulang halaman.
      </p>
    </div>
  );
}
