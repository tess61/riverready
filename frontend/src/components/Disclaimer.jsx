import { InfoIcon } from './icons/index.jsx';

// Always visible (fixed footer). Wording from CLAUDE.md section 7.
export default function Disclaimer() {
  return (
    <footer className="disclaimer" role="contentinfo">
      <InfoIcon size={18} />
      <p>
        Educational project. Not an official flood warning service and not safety advice.
        Check the Environment Agency for official information.
      </p>
    </footer>
  );
}
