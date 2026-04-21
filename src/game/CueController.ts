import { AimInfo, BallState, Point } from '../types';
import { BALL_R, MAX_VEL, MIN_VEL, FELT, POCKETS, POCKET_R } from './constants';

const AIM_DRAG_SCALE = 0.003; // how fast power builds per drag pixel

export class CueController {
  aim: AimInfo = {
    active: false,
    startX: 0,
    startY: 0,
    curX: 0,
    curY: 0,
    power: 0,
    dragging: false,
    placingBall: false,
  };

  private dragStartX = 0;
  private dragStartY = 0;

  beginAim(cueBall: BallState) {
    this.aim.active = true;
    this.aim.startX = cueBall.x;
    this.aim.startY = cueBall.y;
    this.aim.curX = cueBall.x;
    this.aim.curY = cueBall.y;
    this.aim.power = 0;
    this.aim.dragging = false;
    this.aim.placingBall = false;
  }

  beginBallInHand() {
    this.aim.active = true;
    this.aim.placingBall = true;
    this.aim.dragging = false;
  }

  onMouseDown(mx: number, my: number, cueBall: BallState) {
    if (this.aim.placingBall) return;
    const dx = mx - cueBall.x;
    const dy = my - cueBall.y;
    if (Math.sqrt(dx * dx + dy * dy) < BALL_R * 4) {
      this.aim.dragging = true;
      this.dragStartX = mx;
      this.dragStartY = my;
      this.aim.startX = cueBall.x;
      this.aim.startY = cueBall.y;
    }
  }

  onMouseMove(mx: number, my: number) {
    this.aim.curX = mx;
    this.aim.curY = my;
    if (this.aim.dragging) {
      const ddx = this.dragStartX - mx;
      const ddy = this.dragStartY - my;
      const dist = Math.sqrt(ddx * ddx + ddy * ddy);
      this.aim.power = Math.min(1, dist * AIM_DRAG_SCALE * 5);
    }
  }

  onMouseUp(mx: number, my: number, cueBall: BallState): { vx: number; vy: number } | null {
    this.aim.curX = mx;
    this.aim.curY = my;
    if (!this.aim.dragging) return null;
    this.aim.dragging = false;

    const power = this.aim.power;
    if (power < 0.01) return null;

    // Direction: from cursor toward cue ball
    const dx = cueBall.x - mx;
    const dy = cueBall.y - my;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 1) return null;

    const speed = MIN_VEL + power * (MAX_VEL - MIN_VEL);
    return { vx: (dx / len) * speed, vy: (dy / len) * speed };
  }

  placeBall(mx: number, my: number): Point | null {
    // Place cue ball only inside felt area (with margin)
    const margin = BALL_R + 2;
    const fx = Math.max(FELT.x + margin, Math.min(FELT.x + FELT.w - margin, mx));
    const fy = Math.max(FELT.y + margin, Math.min(FELT.y + FELT.h - margin, my));
    // Must not be on a pocket
    for (const p of POCKETS) {
      const d = Math.sqrt((fx - p.x) ** 2 + (fy - p.y) ** 2);
      if (d < POCKET_R + BALL_R) return null;
    }
    return { x: fx, y: fy };
  }

  reset() {
    this.aim = {
      active: false,
      startX: 0,
      startY: 0,
      curX: 0,
      curY: 0,
      power: 0,
      dragging: false,
      placingBall: false,
    };
  }

  getAimDirection(cueBall: BallState): { nx: number; ny: number } {
    const dx = cueBall.x - this.aim.curX;
    const dy = cueBall.y - this.aim.curY;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    return { nx: dx / len, ny: dy / len };
  }

  computeGhostBall(cueBall: BallState, balls: BallState[]): Point | null {
    const { nx, ny } = this.getAimDirection(cueBall);
    let minT = Infinity;
    let ghostPt: Point | null = null;

    for (const b of balls) {
      if (b.id === 0 || b.pocketed) continue;
      const dx = b.x - cueBall.x;
      const dy = b.y - cueBall.y;
      const a = 1;
      const bCoef = -2 * (dx * nx + dy * ny);
      const c = dx * dx + dy * dy - (BALL_R * 2) ** 2;
      const disc = bCoef * bCoef - 4 * a * c;
      if (disc < 0) continue;
      const sqrtD = Math.sqrt(disc);
      const t1 = (-bCoef - sqrtD) / 2;
      const t2 = (-bCoef + sqrtD) / 2;
      const t = t1 > 0.1 ? t1 : t2 > 0.1 ? t2 : -1;
      if (t > 0.1 && t < minT) {
        minT = t;
        ghostPt = { x: cueBall.x + nx * t, y: cueBall.y + ny * t };
      }
    }
    return ghostPt;
  }
}
