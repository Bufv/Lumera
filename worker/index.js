import { applySecurityHeaders } from './security-headers.js';

/** Cloudflare Worker entry point for the Lumera hash-routed Vite application. */
export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404 || request.method !== 'GET') {
      return applySecurityHeaders(response);
    }

    const acceptsHtml = request.headers.get('accept')?.includes('text/html');
    if (!acceptsHtml) return applySecurityHeaders(response);

    const indexUrl = new globalThis.URL('/index.html', request.url);
    const fallback = await env.ASSETS.fetch(new globalThis.Request(indexUrl, request));
    return applySecurityHeaders(fallback);
  },
};
