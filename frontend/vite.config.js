import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Base path and API base come from env so the nuwebspace URL is not hardcoded.
// Dev: /api is proxied to the PHP server so the browser sees one origin (no CORS).
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const base = env.VITE_BASE || '/'; // must start and end with "/"
  return {
    base,
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icons/apple-touch-icon.png'],
        manifest: {
          name: 'RiverReady',
          short_name: 'RiverReady',
          description: 'Educational flood preparedness checklists with live Environment Agency readings.',
          display: 'standalone',
          start_url: base,
          scope: base,
          theme_color: '#0f4c5c',
          background_color: '#ffffff',
          icons: [
            { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
            { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          // Precache the static app shell only.
          globPatterns: ['**/*.{js,css,html,png,svg,ico,webmanifest}'],
          // Offline navigation falls back to the static page; /api is never a navigation fallback.
          navigateFallback: `${base}index.html`,
          navigateFallbackDenylist: [/\/api(\/|$)/],
          cleanupOutdatedCaches: true,
          // /api is NetworkOnly: never cached, so data is never stale.
          runtimeCaching: [
            { urlPattern: ({ url }) => /\/api(\/|$)/.test(url.pathname), handler: 'NetworkOnly' },
          ],
        },
      }),
    ],
    server: { proxy: { '/api': 'http://localhost:8000' } },
  };
});
