import { fmtDate } from './Reading.jsx';
import StatusChip from './StatusChip.jsx';
import StatusDial from './StatusDial.jsx';
import LevelGauge from './LevelGauge.jsx';
import RiverScene from './RiverScene.jsx';
import { ClockIcon, WarningIcon } from './icons/index.jsx';
import { getStatus, isStale } from '../lib/status.js';

// Plain-language line under the status. Describes the data only; it is not advice.
const NOTES = {
  high: 'Above the typical range for this station. Check the Environment Agency for official warnings.',
  normal: 'Within the typical range for this station.',
  low: 'Below the typical range for this station.',
  reading: 'This station does not publish a typical range, so only the reading is shown.',
};

// Top of the live panel: big reading + illustration, then status chip + dial, then the level tube.
export default function ReadingHero({ measure: m }) {
  const status = getStatus(m);
  return (
    <div className={`hero-reading is-${status.key}`}>
      <div className="hero-top">
        <div className="hero-figure">
          <p className="hero-label">{m.name || 'Latest reading'}</p>
          <p className="value"><span className="num">{m.latest.value}</span> <span className="unit">{m.unit || ''}</span></p>
          <p className="meta"><ClockIcon size={16} />Updated {fmtDate(m.latest.dateTime)}</p>
          {isStale(m.latest.dateTime) && <p className="meta stale"><WarningIcon size={16} />Reading may be out of date</p>}
        </div>
        <RiverScene statusKey={status.key} />
      </div>
      <div className="hero-status">
        <div className="hero-status-text">
          <p className="hero-label">Status</p>
          <StatusChip status={status} large />
          <p className="hero-note">{NOTES[status.key]}</p>
        </div>
        <StatusDial measure={m} statusKey={status.key} size="lg" />
      </div>
      <LevelGauge measure={m} />
    </div>
  );
}
