import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { daftarkanSemuaModul } from './modules';
import { initErrorReporting } from './monitoring/errorReporting';
import './index.css';

// US3 spec 002: pemantauan error produksi diinisialisasi paling awal, sebelum
// render apapun, agar error saat render pertama pun tertangkap.
initErrorReporting();

// Registry melempar jika ada modul yang tidak memenuhi kontrak — kegagalan ini
// disengaja keras dan terlihat, bukan diam-diam (Prinsip II).
daftarkanSemuaModul();

const root = document.getElementById('root');
if (!root) throw new Error('Elemen #root tidak ditemukan');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
