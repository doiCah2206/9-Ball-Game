import { GameState, GameConfig, BallState } from '../types';
import { PhysicsEngine } from './Physics';
import {
  FELT, BALL_R, POCKETS, POCKET_R,
  RACK_CENTER, RACK_POSITIONS, CUE_START,
} from './constants';

type ContactListener = (ballId: number) => void;

export class GameEngine {
  state!: GameState;
  private physics: PhysicsEngine;
  private onFirstContact: ContactListener | null = null;
  private prevVelocities = new Map<number, { vx: number; vy: number }>();

  constructor() {
    this.physics = new PhysicsEngine();
  }

  initPhysics() {
    this.physics.init();
  }

  newGame(config: GameConfig) {
    this.physics.reset();

    this.state = {
      config,
      balls: [],
      currentPlayer: 0,
      scores: [0, 0],
      phase: 'aiming',
      isBreakShot: true,
      foulMessage: '',
      firstContactBallId: null,
      hasCushionContact: false,
      ballPocketedThisTurn: false,
      winner: null,
    };

    this._placeBalls();
  }

  private _placeBalls() {
    this.state.balls = [];

    // Cue ball
    const cue: BallState = { id: 0, x: CUE_START.x, y: CUE_START.y, vx: 0, vy: 0, pocketed: false };
    this.state.balls.push(cue);
    this.physics.addBall(0, cue.x, cue.y);

    // Numbered balls: 1 at apex (index 0), 9 at center (index 4), others random
    const numberedIds = [2, 3, 4, 5, 6, 7, 8];
    const shuffled = [...numberedIds].sort(() => Math.random() - 0.5);

    for (let i = 0; i < 9; i++) {
      let ballId: number;
      if (i === 0) ballId = 1;
      else if (i === 4) ballId = 9;
      else ballId = shuffled.pop()!;

      const pos = RACK_POSITIONS[i];
      const bx = RACK_CENTER.x + pos.dx;
      const by = RACK_CENTER.y + pos.dy;
      const ball: BallState = { id: ballId, x: bx, y: by, vx: 0, vy: 0, pocketed: false };
      this.state.balls.push(ball);
      this.physics.addBall(ballId, bx, by);
    }
  }

  shoot(vx: number, vy: number) {
    if (this.state.phase !== 'aiming') return;
    this.state.phase = 'resolving';
    this.state.firstContactBallId = null;
    this.state.hasCushionContact = false;
    this.state.ballPocketedThisTurn = false;
    this.state.foulMessage = '';
    this.physics.applyImpulse(0, vx, vy);
    this.prevVelocities.clear();
  }

  setCueBallPos(x: number, y: number) {
    if (this.state.phase !== 'ball-in-hand') return;
    const cue = this.state.balls.find(b => b.id === 0);
    if (!cue) return;
    cue.x = x;
    cue.y = y;
    cue.pocketed = false;
    this.physics.addBall(0, x, y);
    this.state.phase = 'aiming';
  }

  update() {
    if (this.state.phase !== 'resolving') return;

    // Step physics
    this.physics.step();

    // Sync positions + detect contacts
    for (const ball of this.state.balls) {
      if (ball.pocketed) continue;
      const pos = this.physics.getBallPos(ball.id);
      const vel = this.physics.getBallVel(ball.id);

      // Detect first cue-ball contact (first non-cue ball that cue ball hits)
      if (ball.id === 0) {
        const prevVel = this.prevVelocities.get(0) ?? { vx: vel.x, vy: vel.y };
        const speed = Math.sqrt(vel.x ** 2 + vel.y ** 2);
        if (speed > 5 && this.state.firstContactBallId === null) {
          // Check proximity to other balls
          for (const other of this.state.balls) {
            if (other.id === 0 || other.pocketed) continue;
            const opos = this.physics.getBallPos(other.id);
            const d = Math.sqrt((pos.x - opos.x) ** 2 + (pos.y - opos.y) ** 2);
            if (d <= BALL_R * 2.2) {
              this.state.firstContactBallId = other.id;
              break;
            }
          }
        }
        this.prevVelocities.set(0, { vx: vel.x, vy: vel.y });
        void prevVel;
      }

      ball.x = pos.x;
      ball.y = pos.y;
      ball.vx = vel.x;
      ball.vy = vel.y;

      // Pocket detection
      for (const pocket of POCKETS) {
        const d = Math.sqrt((pos.x - pocket.x) ** 2 + (pos.y - pocket.y) ** 2);
        if (d < POCKET_R + BALL_R * 0.5) {
          this._pocketBall(ball);
          break;
        }
      }

      // Keep inside felt (safety clamp — shouldn't happen if walls are correct)
      if (!ball.pocketed) {
        const margin = BALL_R;
        if (
          pos.x < FELT.x - margin || pos.x > FELT.x + FELT.w + margin ||
          pos.y < FELT.y - margin || pos.y > FELT.y + FELT.h + margin
        ) {
          this._pocketBall(ball);
        }
      }
    }

    // Cushion contact: detect if cue ball velocity direction changed sharply after hitting a wall
    const cueVel = this.physics.getBallVel(0);
    if (this.state.firstContactBallId !== null && Math.sqrt(cueVel.x ** 2 + cueVel.y ** 2) > 2) {
      this.state.hasCushionContact = true;
    }

    // Settled?
    if (this.physics.isSettled()) {
      this._resolveTurn();
    }
  }

  private _pocketBall(ball: BallState) {
    ball.pocketed = true;
    this.physics.removeBall(ball.id);

    if (ball.id === 0) {
      // Cue ball pocketed = scratch
    } else {
      this.state.ballPocketedThisTurn = true;
      if (ball.id === 9) {
        this._handle9BallPocketed();
      }
    }
  }

  private _handle9BallPocketed() {
    const lowestBall = this._getLowestBall();

    if (
      this.state.firstContactBallId !== null &&
      this.state.firstContactBallId <= (lowestBall ?? 99)
    ) {
      // Legal 9-ball pocket → win the rack
      this._winRack();
    }
    // else: foul or illegal, just treat as normal pocket (but no win yet)
  }

  private _resolveTurn() {
    const cueWasPocketed = this.state.balls.find(b => b.id === 0)?.pocketed ?? false;
    const lowestBall = this._getLowestBall();
    let foul = false;
    let foulMsg = '';

    // Rule checks
    const firstContact = this.state.firstContactBallId;

    if (firstContact === null && !this.state.isBreakShot) {
      foul = true;
      foulMsg = 'Lỗi: Không chạm bi nào!';
    } else if (firstContact !== null && lowestBall !== null && firstContact > lowestBall) {
      foul = true;
      foulMsg = `Lỗi: Phải chạm bi số ${lowestBall} trước!`;
    } else if (cueWasPocketed) {
      foul = true;
      foulMsg = 'Lỗi: Bi cái rơi vào lỗ!';
    }

    this.state.isBreakShot = false;
    this.state.foulMessage = foulMsg;

    // Check if game is already won (9-ball pocketed legally)
    if (this.state.phase === 'game-over') return;

    if (foul) {
      this._nextPlayer();
      // Restore cue ball for ball-in-hand
      const cue = this.state.balls.find(b => b.id === 0);
      if (cue) {
        cue.pocketed = true;
        this.physics.removeBall(0);
      }
      this.state.phase = 'ball-in-hand';
      return;
    }

    // Continue or switch player
    if (this.state.ballPocketedThisTurn && !cueWasPocketed) {
      // Current player keeps turn
      this.state.phase = 'aiming';
    } else {
      this._nextPlayer();
      this.state.phase = 'aiming';
    }

    // Cue ball in hand if it was scratched
    if (cueWasPocketed) {
      this.state.phase = 'ball-in-hand';
    }
  }

  private _winRack() {
    this.state.scores[this.state.currentPlayer]++;
    if (this.state.scores[this.state.currentPlayer] >= this.state.config.winsNeeded) {
      this.state.winner = this.state.currentPlayer;
      this.state.phase = 'game-over';
    } else {
      // Start new rack
      this.physics.reset();
      this.state.phase = 'aiming';
      this.state.isBreakShot = true;
      this.state.foulMessage = '';
      this._placeBalls();
    }
  }

  private _nextPlayer() {
    this.state.currentPlayer = this.state.currentPlayer === 0 ? 1 : 0;
  }

  private _getLowestBall(): number | null {
    let min: number | null = null;
    for (const b of this.state.balls) {
      if (b.id > 0 && !b.pocketed && b.id !== 9) {
        if (min === null || b.id < min) min = b.id;
      }
    }
    // If only ball 9 remains, lowest is 9
    if (min === null) {
      const nine = this.state.balls.find(b => b.id === 9 && !b.pocketed);
      if (nine) min = 9;
    }
    return min;
  }

  getCueBall(): BallState | undefined {
    return this.state.balls.find(b => b.id === 0 && !b.pocketed);
  }

  getLowestBall(): number | null {
    return this._getLowestBall();
  }

  resetRack() {
    this.physics.reset();
    this.state.phase = 'aiming';
    this.state.isBreakShot = true;
    this.state.foulMessage = '';
    this._placeBalls();
  }

  // Practice mode: free placement
  placeBallPractice(id: number, x: number, y: number) {
    const existing = this.state.balls.find(b => b.id === id);
    if (existing) {
      existing.pocketed = false;
      existing.x = x;
      existing.y = y;
      if (this.physics.hasBall(id)) {
        this.physics.setBallPos(id, x, y);
      } else {
        this.physics.addBall(id, x, y);
      }
    } else {
      const ball: BallState = { id, x, y, vx: 0, vy: 0, pocketed: false };
      this.state.balls.push(ball);
      this.physics.addBall(id, x, y);
    }
  }

  removeAllBalls() {
    for (const b of this.state.balls) {
      if (this.physics.hasBall(b.id)) this.physics.removeBall(b.id);
    }
    this.state.balls = [];
  }
}
