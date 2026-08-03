import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { daftarkanSemuaModul } from './modules';
import './index.css';

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
