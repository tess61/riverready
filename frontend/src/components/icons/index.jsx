import Icon from './Icon.jsx';

// Original line icons drawn for this project on a 24px grid. All share the Icon base style.
const make = (paths) => function RrIcon(props) { return <Icon {...props}>{paths}</Icon>; };

// A pin whose inner mark is a small wave (place + water).
export const PinIcon = make(<><path d="M12 21.5s-6.5-6-6.5-11.3a6.5 6.5 0 0 1 13 0C18.5 15.5 12 21.5 12 21.5Z" /><path d="M9 10.4c1-.9 2-.9 3 0s2 .9 3 0" /></>);
// Two stacked waves.
export const WaveIcon = make(<><path d="M2.5 9c1.6-1.5 3.2-1.5 4.8 0s3.2 1.5 4.7 0 3.2-1.5 4.8 0 3.1 1.5 4.7 0" /><path d="M2.5 15c1.6-1.5 3.2-1.5 4.8 0s3.2 1.5 4.7 0 3.2-1.5 4.8 0 3.1 1.5 4.7 0" /></>);
// A staff gauge: post with tick marks and a water line.
export const GaugeIcon = make(<><path d="M9 3v18" /><path d="M9 6h3M9 9h5M9 12h3M9 15h5" /><path d="M3 18.5c1.5-1.2 3-1.2 4.5 0s3 1.2 4.5 0 3-1.2 4.5 0 3 1.2 4.5 0" /></>);
export const ChecklistIcon = make(<><path d="m4 6.5 1.5 1.5L8.5 5" /><path d="m4 13 1.5 1.5L8.5 11.5" /><path d="M11.5 6.5H20M11.5 13H20M11.5 19.5H20" /><circle cx="6" cy="19.5" r="1.2" /></>);
export const AddIcon = make(<><path d="M12 5v14M5 12h14" /></>);
export const EditIcon = make(<><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Z" /><path d="m13.5 6.5 4 4" /></>);
export const DeleteIcon = make(<><path d="M4 7h16" /><path d="M9.5 7V4.5h5V7" /><path d="M6 7l1 13h10l1-13" /><path d="M10 11v5M14 11v5" /></>);
export const WarningIcon = make(<><path d="M10.3 4.2 2.6 18a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0Z" /><path d="M12 9.5v4.5" /><circle cx="12" cy="17.3" r=".6" fill="currentColor" /></>);
export const CheckIcon = make(<><path d="m4.5 12.5 5 5L19.5 7" /></>);
export const RefreshIcon = make(<><path d="M20 12a8 8 0 1 1-2.6-5.9" /><path d="M20 4v4.5h-4.5" /></>);
export const SunIcon = make(<><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" /></>);
export const MoonIcon = make(<><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" /></>);
export const SearchIcon = make(<><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 5 5" /></>);
export const ClockIcon = make(<><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>);
export const TrendUpIcon = make(<><path d="M3 17c3 0 4-3 6-5s3 1 5-1 3-5 7-6" /><path d="M16.5 5H21v4.5" /></>);
export const TrendDownIcon = make(<><path d="M3 7c3 0 4 3 6 5s3-1 5 1 3 5 7 6" /><path d="M16.5 19H21v-4.5" /></>);
export const TrendSteadyIcon = make(<><path d="M3 12c2-1.5 4-1.5 6 0s4 1.5 6 0 3-1 6 0" /><path d="m18 9 3 3-3 3" /></>);
// Signal arcs with a strike-through: live data unavailable.
export const WifiOffIcon = make(<><path d="M5 12.5a10 10 0 0 1 4-2.3M2 9a14 14 0 0 1 5-3M19 12.5a10 10 0 0 0-2.5-1.7M22 9a14 14 0 0 0-9.5-3.9" /><path d="M8.5 16a5 5 0 0 1 6 0" /><circle cx="12" cy="19.5" r=".8" fill="currentColor" /><path d="m3 3 18 18" /></>);
export const InfoIcon = make(<><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5.5" /><circle cx="12" cy="7.8" r=".6" fill="currentColor" /></>);
export const ArrowLeftIcon = make(<><path d="M19 12H5M11 6l-6 6 6 6" /></>);
export const SparkIcon = make(<><path d="M12 3.5v4M12 16.5v4M3.5 12h4M16.5 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" /></>);
// Status shapes (distinct silhouettes so status never relies on colour).
export const DiamondIcon = make(<><path d="M12 4 20 12l-8 8-8-8 8-8Z" /></>);
export const CircleDashIcon = make(<><circle cx="12" cy="12" r="8" strokeDasharray="3 3" /></>);
export const ArrowUpBoldIcon = make(<><path d="M12 19.5V5M5.5 11.5 12 5l6.5 6.5" strokeWidth="2.4" /></>);
export const ArrowDownBoldIcon = make(<><path d="M12 4.5V19M5.5 12.5 12 19l6.5-6.5" strokeWidth="2.4" /></>);
