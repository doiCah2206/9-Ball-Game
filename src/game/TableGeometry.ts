// Port of the table geometry from 14setup.js (afzalimdad9/8Ball-Pool-HTML5)
// Adapted to our pixel coordinate system (FELT origin at FELT.x, FELT.y)
import { Vec2 } from '../react/pool/Vec2';
import { FELT, BALL_R } from './constants';

export interface CushionLine {
  name: string;
  p1: Vec2; p2: Vec2;  // raw endpoints (wall boundary)
  p3: Vec2; p4: Vec2;  // bounce detection line (offset inward by ballRadius)
  p5: Vec2; p6: Vec2;  // fallback detection line (offset inward by 0.8 * ballRadius)
  normal: Vec2;        // unit vector pointing INTO the table
  direction: Vec2;     // unit vector along the line (p1 → p2)
}

export interface Vertex {
  name: string;
  position: Vec2;
}

export interface PocketGeom {
  id: number;
  position: Vec2;
  radius: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function v(x: number, y: number) { return new Vec2(x, y); }

function makeLine(name: string, x1: number, y1: number, x2: number, y2: number): CushionLine {
  const p1 = v(x1, y1);
  const p2 = v(x2, y2);
  const dir = v(x2 - x1, y2 - y1).normalize();
  const normal = dir.getLeftNormal(); // points INTO table
  const off1 = v(normal.x * BALL_R, normal.y * BALL_R);
  const off2 = v(normal.x * BALL_R * 0.8, normal.y * BALL_R * 0.8);
  return {
    name,
    p1, p2,
    p3: v(p1.x + off1.x, p1.y + off1.y),
    p4: v(p2.x + off1.x, p2.y + off1.y),
    p5: v(p1.x + off2.x, p1.y + off2.y),
    p6: v(p2.x + off2.x, p2.y + off2.y),
    normal,
    direction: dir,
  };
}

// ── Proportional mapping from original 100n × 50n table to our FELT size ──
// In the original: x ∈ [-50, 50], y ∈ [-25, 25] (in units of n), centered at origin.
// Here we convert to absolute pixel coordinates.
const CX = FELT.x + FELT.w / 2;   // felt center x (px)
const CY = FELT.y + FELT.h / 2;   // felt center y (px)
const SX = FELT.w / 100;          // pixels per original unit (x-axis)  ≈ 10.12
const SY = FELT.h / 50;           // pixels per original unit (y-axis)  ≈  8.64

function px(u: number)  { return CX + u * SX; }  // x: units → pixels
function py(u: number)  { return CY + u * SY; }  // y: units → pixels

// ── 18 cushion lines (from 14setup.js, both directions adapted) ──────────────
// Original line names: AB, BC, CD, EF, FG, GH, IJ, JK, KL, MN, NO, OP, QR, RS, ST, UV, VW, WX
export const CUSHION_LINES: CushionLine[] = [
  // Top rail (2 segments separated by centre side pocket)
  makeLine('BC', px(-46), py(-25), px(-4),  py(-25)),   // top-left
  makeLine('FG', px(4),   py(-25), px(46),  py(-25)),   // top-right

  // Bottom rail
  makeLine('NO', px(46),  py(25),  px(4),   py(25)),    // bottom-right
  makeLine('RS', px(-4),  py(25),  px(-46), py(25)),    // bottom-left

  // Left rail
  makeLine('VW', px(-50), py(-21), px(-50), py(21)),    // left wall (going down)

  // Right rail
  makeLine('JK', px(50),  py(-21), px(50),  py(21)),    // right wall (going down)

  // Top-left corner pieces
  makeLine('AB', px(-50), py(-29), px(-46), py(-25)),   // TL upper diagonal
  makeLine('WX', px(-50), py(-21), px(-54), py(-25)),   // TL lower diagonal (goes outside)

  // Top-right corner pieces
  makeLine('GH', px(46),  py(-25), px(50),  py(-29)),   // TR upper diagonal
  makeLine('IJ', px(54),  py(-25), px(50),  py(-21)),   // TR lower diagonal

  // Bottom-right corner pieces
  makeLine('KL', px(50),  py(21),  px(54),  py(25)),    // BR upper diagonal
  makeLine('MN', px(50),  py(29),  px(46),  py(25)),    // BR lower diagonal

  // Bottom-left corner pieces
  makeLine('OP', px(4),   py(25),  px(2),   py(29)),    // BL-side: right edge of mid-bottom pocket
  makeLine('QR', px(-2),  py(29),  px(-4),  py(25)),    // BL-side: left edge

  makeLine('ST', px(-46), py(25),  px(-50), py(29)),    // BL corner lower
  makeLine('UV', px(-54), py(25),  px(-50), py(21)),    // BL corner upper

  // Top centre pocket edges
  makeLine('CD', px(-4),  py(-25), px(-2),  py(-29)),
  makeLine('EF', px(2),   py(-29), px(4),   py(-25)),
];

// ── 12 vertices (corner points where lines meet, used for vertex collisions) ──
export const VERTICES: Vertex[] = [
  { name: 'B',  position: v(px(-46), py(-25)) },
  { name: 'C',  position: v(px(-4),  py(-25)) },
  { name: 'F',  position: v(px(4),   py(-25)) },
  { name: 'G',  position: v(px(46),  py(-25)) },
  { name: 'J',  position: v(px(50),  py(-21)) },
  { name: 'K',  position: v(px(50),  py(21))  },
  { name: 'N',  position: v(px(46),  py(25))  },
  { name: 'O',  position: v(px(4),   py(25))  },
  { name: 'R',  position: v(px(-4),  py(25))  },
  { name: 'S',  position: v(px(-46), py(25))  },
  { name: 'V',  position: v(px(-50), py(21))  },
  { name: 'W',  position: v(px(-50), py(-21)) },
];

// ── 6 pocket centres and radii ────────────────────────────────────────────────
// pocketRadius in the original = 2250 (physics units). Here scaled to pixels.
const POCKET_R = Math.round(2250 / 1000 * BALL_R);  // ≈ 31px

export const POCKET_GEOMS: PocketGeom[] = [
  { id: 0, position: v(px(-50) - POCKET_R / 2, py(-25) - POCKET_R / 4), radius: POCKET_R },
  { id: 1, position: v(px(0),                  py(-25) - POCKET_R),      radius: Math.round(POCKET_R * 0.85) },
  { id: 2, position: v(px(50)  + POCKET_R / 2, py(-25) - POCKET_R / 4), radius: POCKET_R },
  { id: 3, position: v(px(-50) - POCKET_R / 2, py(25)  + POCKET_R / 4), radius: POCKET_R },
  { id: 4, position: v(px(0),                  py(25)  + POCKET_R),      radius: Math.round(POCKET_R * 0.85) },
  { id: 5, position: v(px(50)  + POCKET_R / 2, py(25)  + POCKET_R / 4), radius: POCKET_R },
];
