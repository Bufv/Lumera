import { applySecurityHeaders } from './security-headers.js';

// @vitejs/plugin-react menyisipkan preamble React Refresh inline dan memakai
// WebSocket untuk HMR. CSP deployment sengaja tidak diterapkan pada Vite dev;
// header keamanan lain tetap aktif. Build/preview tidak memiliki DEV=true,
// sehingga staging dan production selalu memakai CSP ketat dari kontrak.
// FR-005/T047: commit SHA yang di-build disematkan sebagai header pada setiap
// response, sehingga versi yang SEDANG DILAYANI dapat dibaca langsung dari
// aplikasi hidup. `vite.config.ts` menjamin nilainya tidak pernah undefined
// (fallback 'dev' saat VITE_APP_VERSION tidak diset).
const securityHeaderOptions = Object.freeze({
  omitContentSecurityPolicy: import.meta.env?.DEV === true,
  appVersion: import.meta.env?.VITE_APP_VERSION ?? 'dev',
});

function secure(response) {
  return applySecurityHeaders(response, securityHeaderOptions);
}

/** Cloudflare Worker entry point for the Lumera hash-routed Vite application. */
export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404 || request.method !== 'GET') {
      return secure(response);
    }

    const acceptsHtml = request.headers.get('accept')?.includes('text/html');
    if (!acceptsHtml) return secure(response);

    const indexUrl = new globalThis.URL('/index.html', request.url);
    const fallback = await env.ASSETS.fetch(new globalThis.Request(indexUrl, request));
    return secure(fallback);
  },
};
