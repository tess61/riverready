import { useEffect } from 'react';
import '../lib/liquid-glass.js'; // side effect: defines window.liquidGlass

// Which elements get their own liquid glass, and how strong. Small controls get a gentler, tighter rim.
const SMALL = { scale: -60, chroma: 4, border: 0.1, mapBlur: 6, blur: 2 };
const CARD = { scale: -120, chroma: 6, mapBlur: 14, blur: 2 };
// Header pills float over scrolling content, so they blur it more to keep their labels clean.
const HEADER = { ...SMALL, scale: -50, blur: 8 };
const RULES = [
  ['.brand, .main-nav a, .theme-toggle', HEADER],
  ['.btn, .back-link', SMALL],
  ['.card, .panel, .result, .action', CARD],
  ['.disclaimer', { scale: -60, chroma: 3, blur: 5 }],
];
const MAX_SIDE = 900; // module guidance: refraction maps get costly past ~800px a side; bigger panels get a plain blur

// Called once in Layout. Applies glass to every matching element, including ones that appear later
// (route changes, data arriving), and removes it from elements that leave the page. Decorative only.
export function useLiquidGlassAll() {
  useEffect(() => {
    if (typeof window.liquidGlass !== 'function') return undefined;
    // Users who ask for less transparency or use forced colours get solid surfaces (glass.css) and no filters.
    if (window.matchMedia('(prefers-reduced-transparency: reduce), (forced-colors: active)').matches) return undefined;
    const live = new Map(); // element -> { destroy }
    let frame = 0;
    function frosted(el) {
      el.style.backdropFilter = 'blur(12px) saturate(1.4)';
      return { destroy: () => { el.style.backdropFilter = ''; } };
    }
    function sync() {
      frame = 0;
      for (const [el, glass] of live) if (!el.isConnected) { glass.destroy(); live.delete(el); }
      for (const [selector, opts] of RULES) {
        for (const el of document.querySelectorAll(selector)) {
          if (live.has(el)) continue;
          const big = el.offsetWidth > MAX_SIDE || el.offsetHeight > MAX_SIDE;
          live.set(el, big ? frosted(el) : window.liquidGlass(el, opts));
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
