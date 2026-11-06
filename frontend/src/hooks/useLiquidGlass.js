import { useEffect } from 'react';
import '../lib/liquid-glass.js'; // side effect: defines window.liquidGlass

// Only the header pills (brand, nav links, theme toggle) and the disclaimer footer get liquid glass.
// Cards, panels and buttons stay solid: one refraction filter per element was too costly to paint.
// Header pills float over scrolling text, so a very light blur keeps their labels readable while it bends.
const HEADER = { scale: -80, chroma: 5, border: 0.22, mapBlur: 6, blur: 1, saturate: 1.3 };
const RULES = [
  ['.brand, .main-nav a, .theme-toggle', HEADER],
  ['.disclaimer', { scale: -110, chroma: 6, border: 0.18, mapBlur: 8, blur: 1 }],
];
// Called once in Layout. Applies glass to every matching element, including ones that appear later
// (route changes, data arriving), and removes it from elements that leave the page. Decorative only.
export function useLiquidGlassAll() {
  useEffect(() => {
    if (typeof window.liquidGlass !== 'function') return undefined;
    // Users who ask for less transparency or use forced colours get solid surfaces (glass.css) and no filters.
    if (window.matchMedia('(prefers-reduced-transparency: reduce), (forced-colors: active)').matches) return undefined;
    const live = new Map(); // element -> { destroy }
    let frame = 0;
    function sync() {
      frame = 0;
      for (const [el, glass] of live) if (!el.isConnected) { glass.destroy(); live.delete(el); }
      for (const [selector, opts] of RULES) {
        for (const el of document.querySelectorAll(selector)) {
          if (live.has(el)) continue;
          live.set(el, window.liquidGlass(el, opts));
        }
      }
    }
    sync();
    // Batch DOM changes into one scan per animation frame.
    const mo = new MutationObserver(() => { if (!frame) frame = requestAnimationFrame(sync); });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
      cancelAnimationFrame(frame);
      live.forEach((glass) => glass.destroy());
      live.clear();
    };
  }, []);
}
