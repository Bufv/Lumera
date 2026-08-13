import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { initErrorReporting } from './monitoring/errorReporting';
import './index.css';
import './student/LearnScreen.square.css';

// US3 spec 002: pemantauan error produksi diinisialisasi paling awal, sebelum
// render apapun, agar error saat render pertama pun tertangkap.
initErrorReporting();

// US11 spec 002 (T061): TIDAK LAGI mendaftarkan seluruh modul secara eager di
// sini — `src/modules/index.ts` (MODULE_META) sudah menyediakan metadata
// listing tanpa perlu pendaftaran, dan modul penuh dimuat lazy lewat
// `muatModul(id)` saat benar-benar diakses. Fail-fast Prinsip II (modul yang
// melanggar kontrak MELEMPAR) tetap ditegakkan — hanya waktunya bergeser dari
// boot browser ke gerbang CI (`npm test` via `src/modules/eager.ts`) dan ke
// akses pertama modul tersebut di runtime. Lihat `src/modules/index.ts`.

const root = document.getElementById('root');
if (!root) throw new Error('Elemen #root tidak ditemukan');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
