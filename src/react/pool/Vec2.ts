// Port of Vector2D from 8Ball-Pool-HTML5

function fix(v: number): number {
  return isNaN(Number(v)) ? 0 : Math.round(Number(v) * 1e4) / 1e4;
}

export class Vec2 {
  private _x: number;
  private _y: number;

  constructor(x: number, y: number) {
    this._x = fix(x);
    this._y = fix(y);
  }

  get x() { return this._x; }
  set x(v: number) { this._x = fix(v); }
  get y() { return this._y; }
  set y(v: number) { this._y = fix(v); }

  get magnitude() { return fix(Math.sqrt(this._x * this._x + this._y * this._y)); }
  get magnitudeSquared() { return fix(this._x * this._x + this._y * this._y); }

  plus(v: Vec2) { return new Vec2(this._x + v._x, this._y + v._y); }
  minus(v: Vec2) { return new Vec2(this._x - v._x, this._y - v._y); }
  times(s: number) { return new Vec2(this._x * s, this._y * s); }
  invert() { return new Vec2(-this._x, -this._y); }

  dot(v: Vec2) { return fix(this._x * v._x + this._y * v._y); }

  normalize(): Vec2 {
    const m = this.magnitude;
    if (m === 0) return new Vec2(0, 0);
    return new Vec2(this._x / m, this._y / m);
  }

  getRightNormal() { return new Vec2(this._y, -this._x); }
  getLeftNormal() { return new Vec2(-this._y, this._x); }

  angleBetweenCos(v: Vec2) {
    const d = this.magnitude * v.magnitude;
    return d === 0 ? 0 : fix(this.dot(v) / d);
  }
  cross(v: Vec2) {
    return Math.abs(fix(this._x * v._y - this._y * v._x));
  }
  angleBetweenSin(v: Vec2) {
    const d = this.magnitude * v.magnitude;
    return d === 0 ? 0 : fix(this.cross(v) / d);
  }
}
