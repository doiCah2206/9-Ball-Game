// Port of Maths + Point from 8Ball-Pool-HTML5
import { Vec2 } from "./Vec2";

export class Pt {
  constructor(public x: number, public y: number) {}
  equals(p: Pt) { return this.x === p.x && this.y === p.y; }
  static interpolate(a: Pt, b: Pt, t: number) {
    return new Pt(fix((1-t)*a.x + t*b.x), fix((1-t)*a.y + t*b.y));
  }
}

export function fix(v: number) {
  return isNaN(Number(v)) ? 0 : Math.round(Number(v) * 1e4) / 1e4;
}

interface CircleIntersect {
  inside: boolean; tangent: boolean; intersects: boolean;
  enter: Pt | null; exit: Pt | null;
}

export const BilliardMaths = {
  fixNumber: fix,

  lineIntersectLine(p1: Pt, p2: Pt, p3: Pt, p4: Pt): Pt | null {
    const a1 = p2.y - p1.y, b1 = p1.x - p2.x;
    const c1 = p2.x * p1.y - p1.x * p2.y;
    const a2 = p4.y - p3.y, b2 = p3.x - p4.x;
    const c2 = p4.x * p3.y - p3.x * p4.y;
    const det = a1 * b2 - a2 * b1;
    if (det === 0) return null;
    const x = fix((b1 * c2 - b2 * c1) / det);
    const y = fix((a2 * c1 - a1 * c2) / det);
    if ((x - p1.x) * (x - p2.x) > 0 || (y - p1.y) * (y - p2.y) > 0) return null;
    if ((x - p3.x) * (x - p4.x) > 0 || (y - p3.y) * (y - p4.y) > 0) return null;
    return new Pt(x, y);
  },

  lineIntersectCircle(p1: Pt, p2: Pt, center: Pt, r: number): CircleIntersect {
    const res: CircleIntersect = { inside: false, tangent: false, intersects: false, enter: null, exit: null };
    const dx = p2.x - p1.x, dy = p2.y - p1.y;
    const fx = p1.x - center.x, fy = p1.y - center.y;
    const A = dx*dx + dy*dy;
    const B = 2*(fx*dx + fy*dy);
    const C = fx*fx + fy*fy - r*r;
    let disc = fix(B*B - 4*A*C);
    if (disc <= 0) { res.inside = false; return res; }
    disc = fix(Math.sqrt(disc));
    const t1 = fix((-B - disc) / (2*A));
    const t2 = fix((-B + disc) / (2*A));
    if ((t1 < 0 && t2 < 0) || (t1 > 1 && t2 > 1)) {
      res.inside = !(t1 < 0 && t2 < 0 || t1 > 1 && t2 > 1);
      return res;
    }
    if (t1 < 0 && t2 > 1) { res.inside = true; return res; }
    if (t1 >= 0 && t1 <= 1) {
      res.enter = Pt.interpolate(p1, p2, t2);
      res.enter = new Pt(fix(res.enter.x), fix(res.enter.y));
      res.intersects = true;
    }
    if (t2 >= 0 && t2 <= 1) {
      res.exit = Pt.interpolate(p1, p2, t1);
      res.exit = new Pt(fix(res.exit.x), fix(res.exit.y));
      res.intersects = true;
    }
    if (res.exit && res.enter && res.exit.equals(res.enter)) res.tangent = true;
    return res;
  },

  createVectorFrom2Points(a: Pt, b: Pt) {
    return new Vec2(b.x - a.x, b.y - a.y);
  },

  checkObjectsConverging(pos1: Vec2, pos2: Vec2, vel1: Vec2, vel2: Vec2) {
    const rel = vel2.minus(vel1);
    const dir = pos2.minus(pos1).normalize();
    return rel.angleBetweenCos(dir) < 0;
  },

  findBearing(x: number, y: number) {
    return fix(180 / Math.PI * Math.atan2(y, x));
  },

  angleDiff(a: number, b: number) {
    let n = ((a + 180 - b) % 360) - 180;
    if (n < -180) n += 360;
    return fix(n);
  },
};
