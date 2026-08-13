import { applySecurityHeaders } from './security-headers.js';

// import.meta.env.DEV diinlinekan oleh Vite saat memproses berkas ini sebagai
// SSR bundle (@cloudflare/vite-plugin) -- true HANYA untuk `vite dev`
// (npm run dev), false untuk output `vite build` manapun (staging DAN
// production sama-sama lewat vite build, jadi keduanya benar mendapat CSP
// ketat). Sengaja BUKAN env.ENVIRONMENT dari wrangler vars -- lihat catatan
// panjang di security-headers.js untuk alasannya.
const isDev = import.meta.env.DEV;

/** Cloudflare Worker entry point for the Lumera hash-routed Vite application. */
export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404 || request.method !== 'GET') {
      return applySecurityHeaders(response, isDev);
    }

    const acceptsHtml = request.headers.get('accept')?.includes('text/html');
    if (!acceptsHtml) return applySecurityHeaders(response, isDev);

    const indexUrl = new globalThis.URL('/index.html', request.url);
    const fallback = await env.ASSETS.fetch(new globalThis.Request(indexUrl, request));
    return applySecurityHeaders(fallback, isDev);
  },
};
