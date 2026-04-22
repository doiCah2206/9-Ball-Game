import { TABLE_W, TABLE_H, BALL_RADIUS } from "./constants";
import { POCKETS } from "./TableGeometry";
import type { BilliardBall } from "./BilliardPhysics";

export interface AIShot {
  angle: number;   // radians, direction cue ball shoots
  power: number;   // 0–1
}

/* ─── Geometry helpers ─── */
function dist(ax: number, ay: number, bx: number, by: number) {
  return Math.sqrt((bx - ax) ** 2 + (by - ay) ** 2);
}

function angleTo(fromX: number, fromY: number, toX: number, toY: number) {
  return Math.atan2(toY - fromY, toX - fromX);
}

/* Ghost-ball position: where cue ball centre must be to pocket `target` into `pocket`.
   Returns null if the ghost position would be outside the table. */
function ghostBall(
  target: BilliardBall,
  pocket: { x: number; y: number }
): { x: number; y: number } | null {
  const angle = angleTo(pocket.x, pocket.y, target.pos.x, target.pos.y);
  const gx = target.pos.x + Math.cos(angle) * BALL_RADIUS * 2;
  const gy = target.pos.y + Math.sin(angle) * BALL_RADIUS * 2;
  if (gx < 0 || gx > TABLE_W || gy < 0 || gy > TABLE_H) return null;
  return { x: gx, y: gy };
}

/* Check if the straight line from (x1,y1) to (x2,y2) is clear of all balls in `obstacles`.
   Uses circle-segment distance test. */
function lineBlocked(
  x1: number, y1: number,
  x2: number, y2: number,
  obstacles: BilliardBall[],
  ignoreBallNum: number,
  R: number
): boolean {
  const dx = x2 - x1, dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  for (const ob of obstacles) {
    if (ob.num === ignoreBallNum || ob.pocketed) continue;
    const fx = ob.pos.x - x1, fy = ob.pos.y - y1;
    const t = Math.max(0, Math.min(1, (fx * dx + fy * dy) / len2));
    const cx = x1 + t * dx - ob.pos.x;
    const cy = y1 + t * dy - ob.pos.y;
    if (cx * cx + cy * cy < (R * 1.8) ** 2) return true;
  }
  return false;
}

/* ─── Main AI function ─── */
export function calcAIShot(balls: BilliardBall[]): AIShot {
  const cue = balls.find(b => b.num === 0 && !b.pocketed);
  if (!cue) return { angle: Math.random() * Math.PI * 2, power: 0.4 };

  // Find lowest numbered ball on table (9-ball rules)
  const targets = balls
    .filter(b => b.num > 0 && !b.pocketed)
    .sort((a, b) => a.num - b.num);
  if (targets.length === 0) return { angle: 0, power: 0 };

  const target = targets[0];
  const others = balls.filter(b => !b.pocketed);

  // --- Try direct shots into each pocket ---
  for (const pocket of POCKETS) {
    const ghost = ghostBall(target, pocket);
    if (!ghost) continue;

    // Is the path from ghost to pocket clear?
    const blocked1 = lineBlocked(
      target.pos.x, target.pos.y,
      pocket.x, pocket.y,
      others, target.num, BALL_RADIUS
    );
    if (blocked1) continue;

    // Is the path from cue to ghost clear?
    const blocked2 = lineBlocked(
      cue.pos.x, cue.pos.y,
      ghost.x, ghost.y,
      others, 0, BALL_RADIUS
    );
    if (blocked2) continue;

    // Valid shot found
    const angle = angleTo(cue.pos.x, cue.pos.y, ghost.x, ghost.y);
    const d = dist(cue.pos.x, cue.pos.y, ghost.x, ghost.y);
    const power = Math.min(0.65, 0.25 + d / TABLE_W * 0.8);
    return { angle, power };
  }

  // --- Fallback: aim at target ball directly (safety shot) ---
  const fallbackAngle = angleTo(
    cue.pos.x, cue.pos.y,
    target.pos.x, target.pos.y
  );
  return {
    angle: fallbackAngle + (Math.random() - 0.5) * 0.3,
    power: 0.35 + Math.random() * 0.2,
  };
}
