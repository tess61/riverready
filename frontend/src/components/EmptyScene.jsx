// Empty-state illustration: an aerial patch of land with a river and an unplaced pin hovering above it.
// Decorative only; the message next to it carries the meaning.
export default function EmptyScene() {
  return (
    <svg className="empty-scene" viewBox="0 0 240 150" aria-hidden="true" focusable="false">
      <path className="es-land" d="M18 92C26 58 70 40 118 44s86 4 102 30c14 24-4 54-48 62s-100 6-128-6S10 116 18 92Z" />
      <path className="es-field" d="M36 96c10-20 40-30 70-26s44 18 30 34-56 20-80 12-26-10-20-20Z" />
      <path className="es-contour" d="M44 88c14-14 40-20 64-16M150 64c20-6 44 0 54 14M160 118c18 2 34-4 40-14" />
      <path className="es-bank" d="M8 74c40 6 54 40 92 40s52-46 92-46 34 14 44 22" />
      <path className="es-river" d="M8 74c40 6 54 40 92 40s52-46 92-46 34 14 44 22" />
      <path className="es-flow" d="M30 80c18 6 30 20 46 28M150 74c14-6 28-8 42-6" />
      <ellipse className="es-shadow" cx="150" cy="104" rx="14" ry="4" />
      <g className="es-pin">
        <path d="M150 92s-18-16-18-30a18 18 0 0 1 36 0c0 14-18 30-18 30Z" />
        <circle cx="150" cy="62" r="6.5" />
      </g>
    </svg>
  );
}
