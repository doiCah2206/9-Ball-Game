// Custom billiard physics — no external library
import { FELT, BALL_R, CORNER_CUT, SIDE_HALF } from './constants';

const DT          = 1 / 60;       // seconds per step() call
const SUB_STEPS   = 4;             // sub-steps per step for tunnelling prevention
const RES_BALL    = 0.96;          // ball-ball restitution
const RES_CUSHION = 0.72;          // ball-cushion restitution
const FRICTION    = 2.2;           // rolling friction coefficient (1/s)
const STOP_V      = 1.5;           // px/s threshold to call settled

interface Ball {
  x: number; y: number;
  vx: number; vy: number;
}

export class PhysicsEngine {
  private balls = new Map<number, Ball>();

  // ── No-op init (was async with Rapier2D) ──
  init() {}

  addBall(id: number, bx: number, by: number) {
    this.balls.set(id, { x: bx, y: by, vx: 0, vy: 0 });
  }

  removeBall(id: number) {
    this.balls.delete(id);
  }

  setBallPos(id: number, bx: number, by: number) {
    const b = this.balls.get(id);
    if (b) { b.x = bx; b.y = by; b.vx = 0; b.vy = 0; }
    else     this.balls.set(id, { x: bx, y: by, vx: 0, vy: 0 });
  }

  applyImpulse(id: number, vx: number, vy: number) {
    const b = this.balls.get(id);
    if (b) { b.vx = vx; b.vy = vy; }
  }

  getBallPos(id: number) {
    const b = this.balls.get(id);
    return b ? { x: b.x, y: b.y } : { x: 0, y: 0 };
  }

  getBallVel(id: number) {
    const b = this.balls.get(id);
    return b ? { x: b.vx, y: b.vy } : { x: 0, y: 0 };
  }

  step() {
    const sub = DT / SUB_STEPS;
    for (let i = 0; i < SUB_STEPS; i++) this._sub(sub);
  }

  private _sub(dt: number) {
    const all = Array.from(this.balls.values());
    const ids = Array.from(this.balls.keys());

    // Integrate
    for (const b of all) {
      b.x += b.vx * dt;
      b.y += b.vy * dt;
    }

    // Ball-ball collisions (two passes reduces residual overlap)
    for (let pass = 0; pass < 2; pass++) {
      for (let i = 0; i < ids.length; i++) {
        for (let j = i + 1; j < ids.length; j++) {
          const a = this.balls.get(ids[i])!;
          const b = this.balls.get(ids[j])!;
          this._bb(a, b);
        }
      }
    }

    // Cushion collisions
    for (const b of all) this._cushion(b);

    // Rolling friction
    const decay = 1 - FRICTION * dt;
    for (const b of all) {
      b.vx *= decay;
      b.vy *= decay;
      if (b.vx * b.vx + b.vy * b.vy < STOP_V * STOP_V * 0.25) {
        b.vx = 0;
        b.vy = 0;
      }
    }
  }

  private _bb(a: Ball, b: Ball) {
    const dx = b.x - a.x, dy = b.y - a.y;
    const d2 = dx * dx + dy * dy;
    const md = BALL_R * 2;
    if (d2 >= md * md || d2 === 0) return;

    const d  = Math.sqrt(d2);
    const nx = dx / d, ny = dy / d;
    const ov = (md - d) * 0.5;
    a.x -= nx * ov; a.y -= ny * ov;
    b.x += nx * ov; b.y += ny * ov;

    const dv = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
    if (dv >= 0) return;
    const imp = (1 + RES_BALL) * dv / 2;
    a.vx += imp * nx; a.vy += imp * ny;
    b.vx -= imp * nx; b.vy -= imp * ny;
  }

  private _cushion(b: Ball) {
    const { x: fx, y: fy, w: fw, h: fh } = FELT;
    const cc = CORNER_CUT, sh = SIDE_HALF;
    const cx = fx + fw / 2;
    const R  = BALL_R, e = RES_CUSHION;

    // Left wall
    if (b.x < fx + R && b.y > fy + cc && b.y < fy + fh - cc) {
      b.x = fx + R;
      if (b.vx < 0) b.vx = -b.vx * e;
    }
    // Right wall
    if (b.x > fx + fw - R && b.y > fy + cc && b.y < fy + fh - cc) {
      b.x = fx + fw - R;
      if (b.vx > 0) b.vx = -b.vx * e;
    }
    // Top wall (two segments around side pocket)
    if (b.y < fy + R) {
      if ((b.x > fx + cc && b.x < cx - sh) || (b.x > cx + sh && b.x < fx + fw - cc)) {
        b.y = fy + R;
        if (b.vy < 0) b.vy = -b.vy * e;
      }
    }
    // Bottom wall
    if (b.y > fy + fh - R) {
      if ((b.x > fx + cc && b.x < cx - sh) || (b.x > cx + sh && b.x < fx + fw - cc)) {
        b.y = fy + fh - R;
        if (b.vy > 0) b.vy = -b.vy * e;
      }
    }
  }

  isSettled(): boolean {
    for (const b of this.balls.values()) {
      if (Math.abs(b.vx) > STOP_V || Math.abs(b.vy) > STOP_V) return false;
    }
    return true;
  }

  hasBall(id: number) { return this.balls.has(id); }

  reset() { this.balls.clear(); }
}
