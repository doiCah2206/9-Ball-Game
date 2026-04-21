/* ═══════════════════════════════════════════════════════════════
   Pool Game Constants
   All dimensions are in "game units" – the renderer scales them
   to fit the actual viewport.
═══════════════════════════════════════════════════════════════ */

// ── Table geometry ──
export const TABLE_W = 900;          // playable felt width
export const TABLE_H = 450;          // playable felt height
export const RAIL_THICKNESS = 52;    // decorative rail band
export const FRAME_THICKNESS = 14;   // outer dark-wood frame
export const CUSHION_DEPTH = 12;     // rubber cushion thickness

// ── Pockets ──
export const CORNER_POCKET_R = 22;
export const SIDE_POCKET_R = 19;

// ── Balls ──
export const BALL_RADIUS = 12;
export const BALL_RESTITUTION = 0.88;
export const BALL_FRICTION = 0.004;
export const BALL_AIR_FRICTION = 0.013;
export const BALL_DENSITY = 0.004;

// ── Cue ──
export const CUE_LENGTH = 320;
export const MAX_POWER = 32;

// ── Standard 9-ball colours ──
export interface BallStyle {
  base: string;   // main colour
  light: string;  // highlight
  dark: string;   // shadow
  stripe?: boolean;
}

export const BALL_STYLES: Record<number, BallStyle> = {
  0:  { base: "#F0EDE6", light: "#FFFFFF", dark: "#C8C0B0" },           // cue
  1:  { base: "#D4A017", light: "#FFD54F", dark: "#8B6914" },           // yellow
  2:  { base: "#1565C0", light: "#64B5F6", dark: "#0D3B7A" },           // blue
  3:  { base: "#C62828", light: "#EF5350", dark: "#7B1A1A" },           // red
  4:  { base: "#6A1B9A", light: "#AB47BC", dark: "#3E0E5C" },           // purple
  5:  { base: "#E65100", light: "#FF8A50", dark: "#8B3000" },           // orange
  6:  { base: "#2E7D32", light: "#66BB6A", dark: "#1A4D1E" },           // green
  7:  { base: "#7B1E1E", light: "#C06060", dark: "#4A1010" },           // maroon
  8:  { base: "#212121", light: "#616161", dark: "#000000" },           // black
  9:  { base: "#D4A017", light: "#FFD54F", dark: "#8B6914", stripe: true }, // yellow-stripe
};

// 9-ball diamond rack positions (row, col offsets from centre)
export const RACK_POSITIONS = [
  { num: 1, row: 0,  col: 0 },
  { num: 2, row: 1,  col: -0.5 },
  { num: 3, row: 1,  col: 0.5 },
  { num: 4, row: 2,  col: -1 },
  { num: 9, row: 2,  col: 0 },     // 9-ball always centre
  { num: 5, row: 2,  col: 1 },
  { num: 6, row: 3,  col: -0.5 },
  { num: 7, row: 3,  col: 0.5 },
  { num: 8, row: 4,  col: 0 },
];

// Pocket positions (relative to felt origin 0,0)
export function getPocketPositions(w: number, h: number) {
  return [
    { x: 2,         y: 2,          r: CORNER_POCKET_R },   // top-left
    { x: w / 2,     y: -2,         r: SIDE_POCKET_R },     // top-centre
    { x: w - 2,     y: 2,          r: CORNER_POCKET_R },   // top-right
    { x: 2,         y: h - 2,      r: CORNER_POCKET_R },   // bot-left
    { x: w / 2,     y: h + 2,      r: SIDE_POCKET_R },     // bot-centre
    { x: w - 2,     y: h - 2,      r: CORNER_POCKET_R },   // bot-right
  ];
}
