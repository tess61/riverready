// Base for the RiverReady icon set: 24px grid, 1.75 stroke, round caps/joins, colour from currentColor.
// Decorative by default (aria-hidden). Pass `title` to make an icon meaningful on its own.
export default function Icon({ title, size = 20, className = '', children, ...rest }) {
  return (
    <svg
      className={`icon ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : 'true'}
      role={title ? 'img' : undefined}
      aria-label={title}
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}
