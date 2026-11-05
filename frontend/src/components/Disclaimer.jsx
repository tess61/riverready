import { InfoIcon } from './icons/index.jsx';

// Always visible (fixed glass footer; glass applied by useLiquidGlassAll in Layout). Wording from CLAUDE.md section 7.
export default function Disclaimer() {
  return (
    <footer className="disclaimer glass glass-surface" role="contentinfo">
      <InfoIcon size={18} />
      <p>
        Educational project. Not an official flood warning service and not safety advice.
        Check the Environment Agency for official information.
      </p>
    </footer>
  );
}
