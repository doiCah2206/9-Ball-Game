// Logical canvas dimensions (scaled to fit window)
export const CW = 1280;
export const CH = 720;

// Table (wood outer frame)
export const TABLE = { x: 55, y: 85, w: 1100, h: 520 };

// Wood border thickness
export const WOOD = 44;

// Felt playing area
export const FELT = {
  x: TABLE.x + WOOD,
  y: TABLE.y + WOOD,
  w: TABLE.w - WOOD * 2,
  h: TABLE.h - WOOD * 2,
};
// FELT: x=99, y=129, w=1012, h=432

export const BALL_R = 14;
export const POCKET_R = 22;

// Corner and side pocket cutoffs
export const CORNER_CUT = 28;
export const SIDE_HALF = 28;
export const WALL_THICK = 10;

// Pocket centers
export const POCKETS: { x: number; y: number }[] = [
  { x: FELT.x,                   y: FELT.y },                      // TL
  { x: FELT.x + FELT.w / 2,      y: FELT.y - 4 },                  // TM
  { x: FELT.x + FELT.w,          y: FELT.y },                      // TR
  { x: FELT.x,                   y: FELT.y + FELT.h },              // BL
  { x: FELT.x + FELT.w / 2,      y: FELT.y + FELT.h + 4 },         // BM
  { x: FELT.x + FELT.w,          y: FELT.y + FELT.h },             // BR
];

// Rack center (foot spot, ~2/3 from head)
export const RACK_CENTER = {
  x: FELT.x + FELT.w * 0.67,
  y: FELT.y + FELT.h / 2,
};

// Head string X (break from here)
export const HEAD_STRING_X = FELT.x + FELT.w * 0.25;

// Cue ball starting position
export const CUE_START = {
  x: HEAD_STRING_X,
  y: FELT.y + FELT.h / 2,
};

// Diamond rack positions relative to RACK_CENTER (ball #1 at apex left)
const SX = BALL_R * 2 + 1;  // ~29 horizontal spacing
const SY = SX * 0.866;       // ~25 vertical (sin60)
export const RACK_POSITIONS: { dx: number; dy: number }[] = [
  { dx: 0,      dy: 0   },   // index 0 → ball #1 (apex)
  { dx: SX,     dy: -SY },   // index 1
  { dx: SX,     dy: SY  },   // index 2
  { dx: SX*2,   dy: -SY*2 }, // index 3
  { dx: SX*2,   dy: 0   },   // index 4 → ball #9 (center)
  { dx: SX*2,   dy: SY*2 },  // index 5
  { dx: SX*3,   dy: -SY },   // index 6
  { dx: SX*3,   dy: SY  },   // index 7
  { dx: SX*4,   dy: 0   },   // index 8
];

// Shot power
export const MAX_VEL = 1100;
export const MIN_VEL = 80;

// Ball colors (solid fill for 1-8, stripe for 9)
export const BALL_COLOR: Record<number, string> = {
  0: '#ffffff',
  1: '#FFD700',
  2: '#1560BD',
  3: '#CC2200',
  4: '#6A0DAD',
  5: '#FF6600',
  6: '#007A33',
  7: '#9B1B30',
  8: '#111111',
  9: '#FFD700',
};

// UI palette
export const C = {
  bg:            '#0d0d1a',
  orange:        '#f5a623',
  orangeDark:    '#c8880f',
  orangeDeep:    '#a06800',
  tableWood:     '#4a2008',
  tableWoodLt:   '#6b3210',
  tableRail:     '#7a3b0f',
  tableFelt:     '#0e6b52',
  tableFeltLt:   '#127a5e',
  tableFeltDot:  '#0d5c46',
  pocketBg:      '#000000',
  white:         '#ffffff',
  gray:          '#aaaaaa',
  grayDk:        '#555555',
  cardBg:        '#161628',
  cardBgHov:     '#1e1e38',
  headerBg:      '#0a0a18',
  scoreBg:       '#12122a',
};

// Power meter
export const POWER_BAR = {
  x: TABLE.x + TABLE.w + 14,
  y: TABLE.y + 60,
  w: 22,
  h: TABLE.h - 120,
};
