import { applySecurityHeaders } from './security-headers.js';

// @vitejs/plugin-react menyisipkan preamble React Refresh inline dan memakai
// WebSocket untuk HMR. CSP deployment sengaja tidak diterapkan pada Vite dev;
// header keamanan lain tetap aktif. Build/preview tidak memiliki DEV=true,
// sehingga staging dan production selalu memakai CSP ketat dari kontrak.
const securityHeaderOptions = Object.freeze({
  omitContentSecurityPolicy: import.meta.env?.DEV === true,
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
