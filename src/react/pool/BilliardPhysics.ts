import { BALL_RADIUS, TABLE_W, TABLE_H, RACK_POSITIONS } from "./constants";
import { CUSHIONS, POCKETS, CORNER_GAP, SIDE_GAP } from "./TableGeometry";

export interface BilliardBall {
  num: number;
  pocketed: boolean;
  pos: { x: number; y: number };
  vel: { x: number; y: number };
}

// Physics constants
const BALL_DIAM = BALL_RADIUS * 2;
const RESTITUTION_CUSHION = 0.78;
const RESTITUTION_BALL    = 0.95;
const ROLLING_DECAY = 1.6;   // velocity loss per second (fraction)
const STOP_THR = 5;          // px/s below which ball is considered stopped
const SPACING = BALL_RADIUS * 2.15;

function mkBall(x: number, y: number, num: number): BilliardBall {
  return { num, pocketed: false, pos: { x, y }, vel: { x: 0, y: 0 } };
}

export class BilliardPhysics {
  balls: BilliardBall[] = [];
  cueBall: BilliardBall | null = null;

  onPocketed: ((ball: BilliardBall) => void) | null = null;
  onCueFoul:  (() => void) | null = null;

  setup() {
    this.balls = [];
    const W = TABLE_W, H = TABLE_H;

    const cb = mkBall(W * 0.25, H / 2, 0);
    this.cueBall = cb;

    const rackX = W * 0.72;
    const rackY = H / 2;
    const numbered = RACK_POSITIONS.map(p =>
      mkBall(
        rackX + p.row * SPACING * 0.866,
        rackY + p.col * SPACING,
        p.num
      )
    );

    this.balls = [cb, ...numbered];
  }

  /* ── dt in milliseconds ── */
  update(dt: number) {
    const SUBSTEPS = 3;
    const sub = Math.min(dt, 32) / SUBSTEPS;
    for (let i = 0; i < SUBSTEPS; i++) this._step(sub);
  }

  private _step(dt: number) {
    const sec = dt / 1000;
    const active = this.balls.filter(b => !b.pocketed);

    // Integrate positions
    for (const b of active) {
      b.pos.x += b.vel.x * sec;
      b.pos.y += b.vel.y * sec;
    }

    // Ball-ball collisions (multiple passes to reduce tunnelling)
    for (let pass = 0; pass < 2; pass++) {
      for (let i = 0; i < active.length; i++) {
        for (let j = i + 1; j < active.length; j++) {
          this._ballBall(active[i], active[j]);
        }
      }
    }

    // Cushion collisions
    for (const b of active) this._cushion(b);

    // Rolling friction + stop
    const decay = 1 - ROLLING_DECAY * sec;
    for (const b of active) {
      b.vel.x *= decay;
      b.vel.y *= decay;
      if (Math.abs(b.vel.x) < STOP_THR && Math.abs(b.vel.y) < STOP_THR) {
        b.vel.x = 0;
        b.vel.y = 0;
      }
    }

    // Pocket check
    for (const b of active) {
      for (const p of POCKETS) {
        const dx = b.pos.x - p.x;
        const dy = b.pos.y - p.y;
        if (dx * dx + dy * dy < (p.r + BALL_RADIUS * 0.4) ** 2) {
          if (b.num === 0) {
            this._resetCueBall();
            this.onCueFoul?.();
          } else {
            b.pocketed = true;
            b.vel.x = 0;
            b.vel.y = 0;
            this.onPocketed?.(b);
          }
          break;
        }
      }
    }
  }

  private _ballBall(a: BilliardBall, b: BilliardBall) {
    const dx = b.pos.x - a.pos.x;
    const dy = b.pos.y - a.pos.y;
    const dist2 = dx * dx + dy * dy;
    if (dist2 >= BALL_DIAM * BALL_DIAM || dist2 === 0) return;

    const dist = Math.sqrt(dist2);
    const nx = dx / dist;
    const ny = dy / dist;

    // Separate
    const overlap = (BALL_DIAM - dist) * 0.5;
    a.pos.x -= nx * overlap;
    a.pos.y -= ny * overlap;
    b.pos.x += nx * overlap;
    b.pos.y += ny * overlap;

    // Elastic 1D collision along normal
    const dvn = (b.vel.x - a.vel.x) * nx + (b.vel.y - a.vel.y) * ny;
    if (dvn >= 0) return;

    const imp = (1 + RESTITUTION_BALL) * dvn / 2;
    a.vel.x += imp * nx;
    a.vel.y += imp * ny;
    b.vel.x -= imp * nx;
    b.vel.y -= imp * ny;
  }

  private _cushion(b: BilliardBall) {
    const { x, y } = b.pos;
    const R = BALL_RADIUS;
    const W = TABLE_W;
    const H = TABLE_H;
    const e = RESTITUTION_CUSHION;

    // Left wall
    if (x < R && y > CORNER_GAP && y < H - CORNER_GAP) {
      b.pos.x = R;
      if (b.vel.x < 0) b.vel.x = -b.vel.x * e;
    }
    // Right wall
    if (x > W - R && y > CORNER_GAP && y < H - CORNER_GAP) {
      b.pos.x = W - R;
      if (b.vel.x > 0) b.vel.x = -b.vel.x * e;
    }
    // Top wall — two segments around side pocket
    if (y < R) {
      if ((x > CORNER_GAP && x < W / 2 - SIDE_GAP) ||
          (x > W / 2 + SIDE_GAP && x < W - CORNER_GAP)) {
        b.pos.y = R;
        if (b.vel.y < 0) b.vel.y = -b.vel.y * e;
      }
    }
    // Bottom wall
    if (y > H - R) {
      if ((x > CORNER_GAP && x < W / 2 - SIDE_GAP) ||
          (x > W / 2 + SIDE_GAP && x < W - CORNER_GAP)) {
        b.pos.y = H - R;
        if (b.vel.y > 0) b.vel.y = -b.vel.y * e;
      }
    }
  }

  private _resetCueBall() {
    if (!this.cueBall) return;
    this.cueBall.pos.x = TABLE_W * 0.25;
    this.cueBall.pos.y = TABLE_H / 2;
    this.cueBall.vel.x = 0;
    this.cueBall.vel.y = 0;
    this.cueBall.pocketed = false;
  }

  shoot(power: number, angle: number) {
    if (!this.cueBall || this.cueBall.pocketed) return;
    // power 0-1 → speed 0-1600 px/s
    const speed = power * 1600;
    this.cueBall.vel.x = Math.cos(angle) * speed;
    this.cueBall.vel.y = Math.sin(angle) * speed;
  }

  isMoving(): boolean {
    return this.balls.some(b =>
      !b.pocketed && (Math.abs(b.vel.x) > STOP_THR || Math.abs(b.vel.y) > STOP_THR)
    );
  }

  getActive(): BilliardBall[] {
    return this.balls.filter(b => !b.pocketed);
  }

  getPocketedNums(): number[] {
    return this.balls.filter(b => b.pocketed).map(b => b.num);
  }

  destroy() {}
}
