/** Cloudflare Worker entry point for the Lumera hash-routed Vite application. */
export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404 || request.method !== 'GET') return response;

    const acceptsHtml = request.headers.get('accept')?.includes('text/html');
    if (!acceptsHtml) return response;

    const indexUrl = new globalThis.URL('/index.html', request.url);
    return env.ASSETS.fetch(new globalThis.Request(indexUrl, request));
  },
};
