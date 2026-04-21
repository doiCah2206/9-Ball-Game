import { TABLE_W, TABLE_H, BALL_RADIUS, CORNER_POCKET_R, SIDE_POCKET_R } from "./constants";

export interface Cushion {
  x1: number; y1: number;
  x2: number; y2: number;
  nx: number; ny: number; // inward unit normal
}

export interface Pocket {
  x: number; y: number; r: number;
}

const W = TABLE_W;
const H = TABLE_H;
const R = BALL_RADIUS;

// Gap from corner along each wall before the cushion starts
export const CORNER_GAP = CORNER_POCKET_R * 1.65;
// Half-gap from centre along top/bottom for the side pocket opening
export const SIDE_GAP = SIDE_POCKET_R * 2.3;

// Cushion bounce lines are located BALL_RADIUS in from the felt edge.
// Normal vectors point INTO the table (toward the centre).
export const CUSHIONS: Cushion[] = [
  // Top-left
  { x1: CORNER_GAP,       y1: R, x2: W / 2 - SIDE_GAP, y2: R, nx: 0,  ny: 1  },
  // Top-right
  { x1: W / 2 + SIDE_GAP, y1: R, x2: W - CORNER_GAP,   y2: R, nx: 0,  ny: 1  },
  // Bottom-left
  { x1: CORNER_GAP,       y1: H - R, x2: W / 2 - SIDE_GAP, y2: H - R, nx: 0,  ny: -1 },
  // Bottom-right
  { x1: W / 2 + SIDE_GAP, y1: H - R, x2: W - CORNER_GAP,   y2: H - R, nx: 0,  ny: -1 },
  // Left
  { x1: R, y1: CORNER_GAP, x2: R, y2: H - CORNER_GAP, nx: 1,  ny: 0  },
  // Right
  { x1: W - R, y1: CORNER_GAP, x2: W - R, y2: H - CORNER_GAP, nx: -1, ny: 0  },
];

export const POCKETS: Pocket[] = [
  { x: 0,   y: 0,   r: CORNER_POCKET_R },  // top-left
  { x: W/2, y: 0,   r: SIDE_POCKET_R   },  // top-centre
  { x: W,   y: 0,   r: CORNER_POCKET_R },  // top-right
  { x: 0,   y: H,   r: CORNER_POCKET_R },  // bot-left
  { x: W/2, y: H,   r: SIDE_POCKET_R   },  // bot-centre
  { x: W,   y: H,   r: CORNER_POCKET_R },  // bot-right
];
