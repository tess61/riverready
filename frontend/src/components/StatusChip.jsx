import { ArrowDownBoldIcon, ArrowUpBoldIcon, CheckIcon, CircleDashIcon, ClockIcon, DiamondIcon } from './icons/index.jsx';

// Each status has its own icon shape as well as text and colour, so colour is never the only signal.
const ICONS = {
  normal: CheckIcon, high: ArrowUpBoldIcon, low: ArrowDownBoldIcon,
  reading: DiamondIcon, nodata: CircleDashIcon, loading: ClockIcon,
};

export default function StatusChip({ status, large = false }) {
  const Glyph = ICONS[status.key] || CircleDashIcon;
  return (
    <span className={`chip chip-${status.key}${large ? ' chip-lg' : ''}`}>
      <Glyph size={large ? 20 : 16} />
      {status.label}
    </span>
  );
}
