import { BallState, Point } from '../types';
import { POCKETS, BALL_R } from './constants';

export interface AIShot {
  targetX: number;
  targetY: number;
  power: number;
}

export class AIPlayer {
  private difficulty: number;  // 0=easy, 1=medium, 2=hard

  constructor(difficulty = 1) {
    this.difficulty = difficulty;
  }

  computeShot(balls: BallState[]): AIShot | null {
    const cueBall = balls.find(b => b.id === 0 && !b.pocketed);
    if (!cueBall) return null;

    const lowestBall = this._lowestBall(balls);
    if (!lowestBall) return null;

    // Try each pocket for the lowest ball
    let bestShot: AIShot | null = null;
    let bestScore = -Infinity;

    for (const pocket of POCKETS) {
      const shot = this._tryPocket(cueBall, lowestBall, pocket, balls);
      if (!shot) continue;
      const score = this._scoreShot(shot, cueBall, lowestBall, pocket);
      if (score > bestScore) {
        bestScore = score;
        bestShot = shot;
      }
    }

    if (!bestShot) {
      // Safe shot: just aim at lowest ball with low power
      bestShot = {
        targetX: lowestBall.x + (Math.random() - 0.5) * 40,
        targetY: lowestBall.y + (Math.random() - 0.5) * 40,
        power: 0.25 + Math.random() * 0.15,
      };
    }

    // Add difficulty-based error
    const errorRange = [60, 20, 5][this.difficulty];
    bestShot.targetX += (Math.random() - 0.5) * errorRange;
    bestShot.targetY += (Math.random() - 0.5) * errorRange;
    bestShot.power = Math.min(1, Math.max(0.1, bestShot.power));

    return bestShot;
  }

  private _lowestBall(balls: BallState[]): BallState | null {
    let lowest: BallState | null = null;
    for (const b of balls) {
      if (b.id > 0 && !b.pocketed) {
        if (!lowest || b.id < lowest.id) lowest = b;
      }
    }
    return lowest;
  }

  private _tryPocket(
    cue: Point,
    target: Point,
    pocket: Point,
    balls: BallState[],
  ): AIShot | null {
    // Ghost ball position: where cue ball must be to send target into pocket
    const toPocketDx = pocket.x - target.x;
    const toPocketDy = pocket.y - target.y;
    const toPocketLen = Math.sqrt(toPocketDx ** 2 + toPocketDy ** 2) || 1;
    const toPocketNx = toPocketDx / toPocketLen;
    const toPocketNy = toPocketDy / toPocketLen;

    const ghostX = target.x - toPocketNx * BALL_R * 2;
    const ghostY = target.y - toPocketNy * BALL_R * 2;

    // Check path from cue to ghost is clear
    if (this._isPathBlocked(cue, { x: ghostX, y: ghostY }, balls, -1)) return null;

    const dist = Math.sqrt((ghostX - cue.x) ** 2 + (ghostY - cue.y) ** 2);
    const power = Math.min(1, 0.3 + dist / 2000);

    return { targetX: ghostX, targetY: ghostY, power };
  }

  private _isPathBlocked(from: Point, to: Point, balls: BallState[], ignoreId: number): boolean {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    const nx = dx / len;
    const ny = dy / len;

    for (const b of balls) {
      if (b.pocketed || b.id === 0 || b.id === ignoreId) continue;
      const bx = b.x - from.x;
      const by = b.y - from.y;
      const proj = bx * nx + by * ny;
      if (proj < 0 || proj > len) continue;
      const perpX = bx - nx * proj;
      const perpY = by - ny * proj;
      if (perpX * perpX + perpY * perpY < (BALL_R * 2.1) ** 2) return true;
    }
    return false;
  }

  private _scoreShot(shot: AIShot, cue: Point, target: BallState, pocket: Point): number {
    // Prefer shots where cue travels directly to ghost position (shorter distance = easier)
    const dist = Math.sqrt((shot.targetX - cue.x) ** 2 + (shot.targetY - cue.y) ** 2);
    // Prefer pocket that is closest to target ball
    const toPocket = Math.sqrt((pocket.x - target.x) ** 2 + (pocket.y - target.y) ** 2);
    return -dist * 0.001 - toPocket * 0.002;
  }
}
