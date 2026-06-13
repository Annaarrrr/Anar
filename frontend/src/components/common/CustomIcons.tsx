import React from 'react';
import Svg, { Path, Circle, Rect, Line, G } from 'react-native-svg';
import { StyleProp, ViewStyle } from 'react-native';

export interface IconProps {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

// Helper to wrap paths with default Svg properties
const createIcon = (
  displayName: string,
  drawPaths: (color: string) => React.ReactNode,
  viewBox = '0 0 24 24'
) => {
  const Component = ({ size = 24, color = '#2D211A', style }: IconProps) => (
    <Svg
      width={size}
      height={size}
      viewBox={viewBox}
      style={style}
    >
      {drawPaths(color)}
    </Svg>
  );
  Component.displayName = displayName;
  return Component;
};

// ─── 1. HomeIcon ─────────────────────────────────────────────────────────────
export const HomeIcon = createIcon('HomeIcon', (color) => (
  <G stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none">
    <Path d="M 5 11.5 L 5.2 20.2 C 5.2 20.8 5.7 21 6.3 21 L 17.7 20.7 C 18.3 20.7 18.7 20.2 18.7 19.6 L 19 11.5" />
    <Path d="M 2 12 C 5.5 8.5 9 5 12 4.5 C 15 4 18.5 7.5 22 11" />
    <Path d="M 3 11 C 6.5 8 9.5 5 12 4.8" strokeWidth={1.2} opacity={0.7} />
    <Path d="M 10 21 L 10 15 C 10 14.5 10.5 14 11 14 L 13 14 C 13.5 14 14 14.5 14 15 L 14 21" />
    <Circle cx="12" cy="9.5" r="1.5" />
  </G>
));

// ─── 2. ChatIcon ─────────────────────────────────────────────────────────────
export const ChatIcon = createIcon('ChatIcon', (color) => (
  <G stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none">
    <Path d="M 3.5 11 C 3.5 6.5 7.5 4 12 4 C 16.5 4 20.5 6.5 20.5 11 C 20.5 15.5 16.5 18 12 18 C 10.5 18 9.2 17.6 8 17 C 6.5 18 4.5 19.5 3 20 C 3.2 18.5 3.8 16.5 4 15 C 3.7 13.7 3.5 12.4 3.5 11 Z" />
    <Path d="M 4.5 11 C 4.5 7.5 7.8 5 12 5" strokeWidth={1} opacity={0.6} />
    <Path d="M 9.5 11 L 11 11 M 12.5 11 L 14.5 11" strokeWidth={1.5} />
    <Path d="M 12 9 L 12 13" strokeWidth={1.5} />
  </G>
));

// ─── 3. VisionIcon (Lightbulb) ──────────────────────────────────────────────
export const VisionIcon = createIcon('VisionIcon', (color) => (
  <G stroke={color} fill="none" strokeLinecap="round" strokeLinejoin="round">
    <Path
      d="M 12 3 C 8.5 3 6.5 5.5 6.5 9 C 6.5 11.5 7.8 13.5 9.5 15 L 9.5 17.5 C 9.5 18 10 18.5 10.5 18.5 L 13.5 18.5 C 14 18.5 14.5 18 14.5 17.5 L 14.5 15 C 16.2 13.5 17.5 11.5 17.5 9 C 17.5 5.5 15.5 3 12 3 Z"
      strokeWidth={2}
    />
    <Path d="M 9.5 10 C 10.5 9 11 9.5 12 8 C 13 9.5 13.5 9 14.5 10" strokeWidth={1.5} />
    <Path d="M 11 13 L 13 13" strokeWidth={1.5} />
    <Path d="M 10 18.5 L 14 18.5 M 10.5 20.5 L 13.5 20.5" strokeWidth={2} />
    <Line x1="12" y1="1" x2="12" y2="2" strokeWidth={1.8} />
    <Line x1="3.5" y1="4.5" x2="4.8" y2="5.8" strokeWidth={1.5} />
    <Line x1="2" y1="10" x2="3.5" y2="10" strokeWidth={1.5} />
    <Line x1="20.5" y1="4.5" x2="19.2" y2="5.8" strokeWidth={1.5} />
    <Line x1="22" y1="10" x2="20.5" y2="10" strokeWidth={1.5} />
  </G>
));

// ─── 4. ProgressIcon ─────────────────────────────────────────────────────────
export const ProgressIcon = createIcon('ProgressIcon', (color) => (
  <G stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none">
    <Path d="M 3 21 C 9 21 15 21 21 21" />
    <Rect x="5" y="13" width="3.2" height="8" rx="1" />
    <Line x1="6.6" y1="15" x2="6.6" y2="19" strokeWidth={1} opacity={0.6} />
    <Rect x="10.5" y="8" width="3.2" height="13" rx="1" />
    <Line x1="12.1" y1="11" x2="12.1" y2="18" strokeWidth={1} opacity={0.6} />
    <Rect x="16" y="4" width="3.2" height="17" rx="1" />
    <Line x1="17.6" y1="7" x2="17.6" y2="18" strokeWidth={1} opacity={0.6} />
  </G>
));

// ─── 5. SettingsIcon ─────────────────────────────────────────────────────────
export const SettingsIcon = createIcon('SettingsIcon', (color) => (
  <G stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none">
    <Path d="M 12 8 C 10.5 8 9.5 9 9.5 10.5 M 12 16 C 13.5 16 14.5 15 14.5 13.5" strokeWidth={1.5} opacity={0.6} />
    <Path d="M 12 5.5 C 13 5.5 13.5 4 14.5 4 C 15.5 4 16.5 5 16.5 6.5 C 16.5 7.5 18 8 18.5 9 C 19 10 20.5 10 20.5 11.5 C 20.5 13 19 13.5 18.5 14.5 C 18 15.5 16.5 16 16.5 17 C 16.5 18.5 15.5 19.5 14.5 19.5 C 13.5 19.5 13 21 12 21 C 11 21 10.5 19.5 9.5 19.5 C 8.5 19.5 7.5 18.5 7.5 17 C 7.5 16 6 15.5 5.5 14.5 C 5 13.5 3.5 13 3.5 11.5 C 3.5 10 5 9.5 5.5 8.5 C 6 7.5 7.5 7 7.5 6 C 7.5 4.5 8.5 3.5 9.5 3.5 C 10.5 3.5 11 5.5 12 5.5 Z" />
    <Circle cx="12" cy="11.5" r="3.2" />
  </G>
));

// ─── 6. PlusIcon ─────────────────────────────────────────────────────────────
export const PlusIcon = createIcon('PlusIcon', (color) => (
  <G stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Line x1="12" y1="4" x2="11.8" y2="20" />
    <Line x1="4" y1="12" x2="20" y2="12.2" />
    <Line x1="12.5" y1="5.5" x2="12.3" y2="18.5" strokeWidth={1} opacity={0.5} />
  </G>
));

// ─── 7. ArrowLeftIcon ────────────────────────────────────────────────────────
export const ArrowLeftIcon = createIcon('ArrowLeftIcon', (color) => (
  <G stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" fill="none">
    <Path d="M 20 12 L 4 12" />
    <Path d="M 10 6 C 8.5 8 5.5 10.5 4 12 C 5.5 13.5 8.5 16 10 18" />
    <Path d="M 19 13 L 7 13" strokeWidth={1} opacity={0.5} />
  </G>
));

// ─── 8. ArrowRightIcon ───────────────────────────────────────────────────────
export const ArrowRightIcon = createIcon('ArrowRightIcon', (color) => (
  <G stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" fill="none">
    <Path d="M 4 12 L 20 12" />
    <Path d="M 14 6 C 15.5 8 18.5 10.5 20 12 C 18.5 13.5 15.5 16 14 18" />
    <Path d="M 5 13 L 17 13" strokeWidth={1} opacity={0.5} />
  </G>
));

// ─── 9. BellIcon ─────────────────────────────────────────────────────────────
export const BellIcon = createIcon('BellIcon', (color) => (
  <G stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none">
    <Path d="M 12 3 C 9.5 3 9 5 9 7.5 L 9 12 C 9 14.5 7.5 16 6.5 17 L 17.5 17 C 16.5 16 15 14.5 15 12 L 15 7.5 C 15 5 14.5 3 12 3 Z" />
    <Path d="M 10.5 19.5 C 10.8 21 12 21.5 13.5 19.5" strokeWidth={2.5} />
    <Path d="M 3.5 8 C 2.5 10.5 2.5 13.5 3.5 16" strokeWidth={1.2} />
    <Path d="M 20.5 8 C 21.5 10.5 21.5 13.5 20.5 16" strokeWidth={1.2} />
  </G>
));

// ─── 10. ZapIcon ────────────────────────────────────────────────────────────
export const ZapIcon = createIcon('ZapIcon', (color) => (
  <G stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none">
    <Path d="M 13.5 2 L 4.5 12.5 L 11.5 12.5 L 10.5 22 L 19.5 11.5 L 12.5 11.5 Z" />
    <Path d="M 12.5 4 L 5.8 11.8" strokeWidth={1} opacity={0.5} />
  </G>
));

// ─── 11. TargetIcon ──────────────────────────────────────────────────────────
export const TargetIcon = createIcon('TargetIcon', (color) => (
  <G stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none">
    <Circle cx="12" cy="12" r="9.5" />
    <Circle cx="12" cy="12" r="6" strokeWidth={1.5} />
    <Circle cx="12" cy="12" r="2.5" />
    <Path d="M 3 12 L 4.5 12 M 19.5 12 L 21 12 M 12 3 L 12 4.5 M 12 19.5 L 12 21" strokeWidth={1.2} />
  </G>
));

// ─── 12. TrendingUpIcon ──────────────────────────────────────────────────────
export const TrendingUpIcon = createIcon('TrendingUpIcon', (color) => (
  <G stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none">
    <Path d="M 3 18 C 6 15 8 15 11 11.5 C 14 8 17 9 20.5 5" />
    <Path d="M 16 5 L 21 5 L 21 10" />
    <Path d="M 3 19 L 10 12" strokeWidth={1.2} opacity={0.4} />
  </G>
));

// ─── 13. CheckIcon ───────────────────────────────────────────────────────────
export const CheckIcon = createIcon('CheckIcon', (color) => (
  <G stroke={color} strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" fill="none">
    <Path d="M 4 12 C 6.5 14.5 7.5 16 9.2 18 C 12.5 13.5 16.5 8 20 4.5" />
  </G>
));

// ─── 14. MailIcon ────────────────────────────────────────────────────────────
// A cute hand-drawn letter envelope.
export const MailIcon = createIcon('MailIcon', (color) => (
  <G stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none">
    {/* Envelope Main Frame */}
    <Path d="M 3.2 5.5 C 9 5.5 15 5.5 20.8 5.5 C 20.8 10 20.8 14 20.8 18.5 C 15 18.5 9 18.5 3.2 18.5 C 3.2 14 3.2 10 3.2 5.5 Z" />
    {/* Folder flaps */}
    <Path d="M 3.5 6 L 12 12.2 L 20.5 6" />
    <Path d="M 3.5 18 L 9 12.5 M 20.5 18 L 15 12.5" strokeWidth={1.2} opacity={0.6} />
  </G>
));

// ─── 15. LockIcon ────────────────────────────────────────────────────────────
// A sketchy pad lock.
export const LockIcon = createIcon('LockIcon', (color) => (
  <G stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none">
    {/* Shackle */}
    <Path d="M 8 11.5 L 8 7.5 C 8 5 9.8 3.5 12 3.5 C 14.2 3.5 16 5 16 7.5 L 16 11.5" />
    {/* Lock Body */}
    <Rect x="5" y="11" width="14" height="9.5" rx="2" />
    {/* Keyhole */}
    <Circle cx="12" cy="14.5" r="1.5" />
    <Line x1="12" y1="16" x2="12" y2="18" strokeWidth={1.8} />
  </G>
));

// ─── 16. UnlockIcon ──────────────────────────────────────────────────────────
export const UnlockIcon = createIcon('UnlockIcon', (color) => (
  <G stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none">
    {/* Shackle (Open) */}
    <Path d="M 8 11 L 8 7 C 8 4.5 9.8 3.5 12 3.5 C 14 3.5 15.8 4.8 16 6.8" />
    {/* Lock Body */}
    <Rect x="5" y="11" width="14" height="9.5" rx="2" />
    <Circle cx="12" cy="14.5" r="1.5" />
    <Line x1="12" y1="16" x2="12" y2="18" strokeWidth={1.8} />
  </G>
));

// ─── 17. GlobeIcon ───────────────────────────────────────────────────────────
// A sketchy globe.
export const GlobeIcon = createIcon('GlobeIcon', (color) => (
  <G stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none">
    <Circle cx="12" cy="12" r="9.5" />
    {/* Equator & Meridians */}
    <Path d="M 2.8 12 C 9 12 15 12 21.2 12" />
    <Path d="M 12 2.8 C 15.5 6 15.5 18 12 21.2" />
    <Path d="M 12 2.8 C 8.5 6 8.5 18 12 21.2" />
  </G>
));

// ─── 18. SendIcon ────────────────────────────────────────────────────────────
// A sketchy paper airplane.
export const SendIcon = createIcon('SendIcon', (color) => (
  <G stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" fill="none">
    <Path d="M 22 2 L 2 10.5 L 9.5 14.5 L 22 2 Z" />
    <Path d="M 22 2 L 14.5 18.5 L 9.5 14.5" />
    <Path d="M 9.5 14.5 L 9.5 21 L 13 17.5" />
  </G>
));

// ─── 19. MicIcon ─────────────────────────────────────────────────────────────
// A sketchy podcast mic.
export const MicIcon = createIcon('MicIcon', (color) => (
  <G stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none">
    <Rect x="9" y="3.5" width="6" height="11" rx="3" />
    <Path d="M 5.5 10 C 5.5 14 8.5 16.5 12 16.5 C 15.5 16.5 18.5 14 18.5 10" />
    <Line x1="12" y1="16.5" x2="12" y2="21" strokeWidth={2.2} />
    <Path d="M 8.5 21 C 11 21 13 21 15.5 21" />
  </G>
));

// ─── 20. SparklesIcon ────────────────────────────────────────────────────────
// 3 cute little sketched four-point stars.
export const SparklesIcon = createIcon('SparklesIcon', (color) => (
  <G stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none">
    {/* Big Star */}
    <Path d="M 12 5 C 12 8 13 9 15 9 C 13 9 12 10 12 13 C 12 10 11 9 9 9 C 11 9 12 8 12 5 Z" />
    {/* Medium Star */}
    <Path d="M 19 13 C 19 15 19.5 15.5 20.5 15.5 C 19.5 15.5 19 16 19 18 C 19 16 18.5 15.5 17.5 15.5 C 18.5 15.5 19 15 19 13 Z" strokeWidth={1.2} />
    {/* Small Star */}
    <Path d="M 6 13 C 6 14.2 6.3 14.5 7 14.5 C 6.3 14.5 6 14.8 6 16 C 6 14.8 5.7 14.5 5 14.5 C 5.7 14.5 6 14.2 6 13 Z" strokeWidth={1.2} />
  </G>
));

// ─── 21. ShareIcon ───────────────────────────────────────────────────────────
// Sketchy nodes connecting.
export const ShareIcon = createIcon('ShareIcon', (color) => (
  <G stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none">
    <Circle cx="18" cy="5" r="3" />
    <Circle cx="6" cy="12" r="3" />
    <Circle cx="18" cy="19" r="3" />
    <Line x1="8.6" y1="10.7" x2="15.4" y2="6.3" />
    <Line x1="8.6" y1="13.3" x2="15.4" y2="17.7" />
  </G>
));

// ─── 22. XIcon ───────────────────────────────────────────────────────────────
export const XIcon = createIcon('XIcon', (color) => (
  <G stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Line x1="4.5" y1="4.5" x2="19.5" y2="19.5" />
    <Line x1="19.5" y1="4.5" x2="4.5" y2="19.5" />
    <Line x1="6.5" y1="5.5" x2="17.5" y2="18.5" strokeWidth={1.2} opacity={0.5} />
  </G>
));

// ─── 23. PencilIcon ──────────────────────────────────────────────────────────
export const PencilIcon = createIcon('PencilIcon', (color) => (
  <G stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none">
    <Path d="M 18.5 2.5 C 19 2 20 2 20.5 2.5 C 21 3 21 4 20.5 4.5 L 7.5 17.5 L 3 19.5 L 5 15 L 18.5 2.5 Z" />
    <Line x1="16" y1="5" x2="18" y2="7" />
  </G>
));

// ─── 24. TrashIcon ───────────────────────────────────────────────────────────
export const TrashIcon = createIcon('TrashIcon', (color) => (
  <G stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none">
    {/* Trash Can Body */}
    <Path d="M 5 6 L 5.8 19.5 C 5.8 20.3 6.5 21 7.3 21 L 16.7 21 C 17.5 21 18.2 20.3 18.2 19.5 L 19 6" />
    {/* Lid */}
    <Path d="M 3 6 L 21 6 M 9 6 L 9 4 C 9 3.5 9.5 3 10 3 L 14 3 C 14.5 3 15 3.5 15 4 L 15 6" />
    {/* Grate stripes */}
    <Line x1="9.5" y1="9.5" x2="9.5" y2="17.5" strokeWidth={1.5} opacity={0.6} />
    <Line x1="14.5" y1="9.5" x2="14.5" y2="17.5" strokeWidth={1.5} opacity={0.6} />
  </G>
));

// ─── 25. SunIcon ─────────────────────────────────────────────────────────────
export const SunIcon = createIcon('SunIcon', (color) => (
  <G stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none">
    <Circle cx="12" cy="12" r="5" />
    <Line x1="12" y1="2" x2="12" y2="4" />
    <Line x1="12" y1="20" x2="12" y2="22" />
    <Line x1="2" y1="12" x2="4" y2="12" />
    <Line x1="20" y1="12" x2="22" y2="12" />
    <Line x1="4.9" y1="4.9" x2="6.3" y2="6.3" />
    <Line x1="17.7" y1="17.7" x2="19.1" y2="19.1" />
    <Line x1="4.9" y1="19.1" x2="6.3" y2="17.7" />
    <Line x1="17.7" y1="6.3" x2="19.1" y2="4.9" />
  </G>
));

// ─── 26. MoonIcon ────────────────────────────────────────────────────────────
export const MoonIcon = createIcon('MoonIcon', (color) => (
  <G stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none">
    <Path d="M 12 3 C 7.5 3 4.5 6.5 4.5 11 C 4.5 15.5 8 19 12.5 19 C 14.5 19 16.5 18 18 16.5 C 13.5 16.5 10 13.5 10 9 C 10 6.5 11.5 4.5 13 3.5 C 12.6 3.2 12.3 3 12 3 Z" />
    <Circle cx="16.5" cy="6.5" r="0.6" strokeWidth={1.2} />
    <Circle cx="6.5" cy="7.5" r="0.4" strokeWidth={1} />
  </G>
));

// ─── 27. LogOutIcon ──────────────────────────────────────────────────────────
export const LogOutIcon = createIcon('LogOutIcon', (color) => (
  <G stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none">
    <Path d="M 9 21 L 4 21 C 3.5 21 3 20.5 3 20 L 3 4 C 3 3.5 3.5 3 4 3 L 9 3" />
    <Path d="M 16 17 C 18 15 19.5 13.5 21 12 C 19.5 10.5 18 9 16 7" />
    <Line x1="20" y1="12" x2="10" y2="12" />
  </G>
));

// ─── 28. ChevronRightIcon ────────────────────────────────────────────────────
export const ChevronRightIcon = createIcon('ChevronRightIcon', (color) => (
  <G stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" fill="none">
    <Path d="M 8.5 5 C 11.5 8.5 14 11 15.5 12 C 14 13 11.5 15.5 8.5 19" />
  </G>
));

// ─── 29. TrophyIcon ──────────────────────────────────────────────────────────
export const TrophyIcon = createIcon('TrophyIcon', (color) => (
  <G stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none">
    {/* Base stem */}
    <Path d="M 6 21 L 18 21 M 12 17 L 12 21" />
    {/* Cup Bowl */}
    <Path d="M 5 4 L 19 4 C 19 11 16 17 12 17 C 8 17 5 11 5 4 Z" />
    {/* Handles */}
    <Path d="M 5 7 C 3 7 2.5 5 2.5 4 C 2.5 3.2 3.2 2.5 4 2.5 L 5 2.5" />
    <Path d="M 19 7 C 21 7 21.5 5 21.5 4 C 21.5 3.2 20.8 2.5 20 2.5 L 19 2.5" />
    {/* Handle loops */}
    <Path d="M 5 7 C 3 7 3 11 5 11" />
    <Path d="M 19 7 C 21 7 21 11 19 11" />
  </G>
));
