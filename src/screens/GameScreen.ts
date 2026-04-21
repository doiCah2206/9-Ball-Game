import { CW, CH, TABLE, C, MAX_VEL, MIN_VEL } from '../game/constants';
import { GameEngine } from '../game/GameEngine';
import { Renderer } from '../game/Renderer';
import { CueController } from '../game/CueController';
import { AIPlayer } from '../game/AIPlayer';
import type { GameConfig, ScreenName } from '../types';

interface GSButton { x: number; y: number; w: number; h: number; label: string }

export class GameScreen {
  private renderer: Renderer;
  private engine: GameEngine;
  private cue: CueController;
  private ai: AIPlayer;
  private mx = 0;
  private my = 0;
  private aiThinkTimer = 0;
  private menuBtn: GSButton;
  // game-over button rects (must match Renderer.drawGameOver layout)
  private readonly goReplayBtn = { x: CW / 2 - 170, y: CH / 2 + 60, w: 160, h: 44 };
  private readonly goExitBtn = { x: CW / 2 + 10, y: CH / 2 + 60, w: 160, h: 44 };

  constructor(renderer: Renderer, engine: GameEngine) {
    this.renderer = renderer;
    this.engine = engine;
    this.cue = new CueController();
    this.ai = new AIPlayer(1);

    this.menuBtn = { x: CW - 48, y: 10, w: 36, h: 36, label: '☰' };
  }

  startGame(config: GameConfig) {
    this.engine.newGame(config);
    this.aiThinkTimer = 0;
    this._refreshAim();
  }

  private _refreshAim() {
    const st = this.engine.state;
    const cueBall = this.engine.getCueBall();
    if (!cueBall) return;
    if (st.phase === 'ball-in-hand') {
      this.cue.beginBallInHand();
    } else if (st.phase === 'aiming') {
      this.cue.beginAim(cueBall);
    }
  }

  update() {
    const st = this.engine.state;
    if (st.phase === 'game-over') return;

    const wasResolving = st.phase === 'resolving';
    this.engine.update();
    const isNowAiming = st.phase === 'aiming' || st.phase === 'ball-in-hand';

    if (wasResolving && isNowAiming) {
      this._refreshAim();
    }

    // AI turn
    if (
      st.config.mode === 'vs-ai' &&
      st.currentPlayer === 1 &&
      st.phase === 'aiming'
    ) {
      this.aiThinkTimer++;
      if (this.aiThinkTimer > 90) {
        this.aiThinkTimer = 0;
        this._doAIShot();
      }
    }
  }

  private _doAIShot() {
    const st = this.engine.state;
    const cueBall = this.engine.getCueBall();
    if (!cueBall) return;

    const shot = this.ai.computeShot(st.balls);
    if (!shot) return;

    const dx = shot.targetX - cueBall.x;
    const dy = shot.targetY - cueBall.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const speed = MIN_VEL + shot.power * (MAX_VEL - MIN_VEL);
    const vx = (dx / len) * speed;
    const vy = (dy / len) * speed;

    this.cue.aim.active = true;
    this.cue.aim.startX = cueBall.x;
    this.cue.aim.startY = cueBall.y;
    this.cue.aim.curX = shot.targetX;
    this.cue.aim.curY = shot.targetY;
    this.cue.aim.power = shot.power;

    this.engine.shoot(vx, vy);
  }

  draw() {
    const g = this.renderer['ctx'];
    const R = this.renderer;
    const st = this.engine.state;

    R.clear();
    R.drawTable();
    R.drawBalls(st.balls);

    const cueBall = this.engine.getCueBall();
    const isHumanTurn = st.config.mode !== 'vs-ai' || st.currentPlayer === 0;

    if (cueBall && st.phase === 'aiming' && isHumanTurn) {
      R.drawCueAndAim(this.cue, cueBall, st.balls);
    }

    if (st.phase === 'ball-in-hand' && isHumanTurn) {
      R.drawBallInHandCursor(this.mx, this.my);
      g.fillStyle = C.orange;
      g.font = 'bold 14px Arial';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText('Nhấp để đặt bi cái', CW / 2, TABLE.y + TABLE.h + 18);
    }

    R.drawPowerBar(this.cue.aim.power);
    R.drawGameHUD(st);

    // Menu button
    this._drawBtn(g, R, this.menuBtn);

    // Lowest ball indicator
    const lowest = this.engine.getLowestBall();
    if (lowest !== null && (st.phase === 'aiming' || st.phase === 'ball-in-hand')) {
      g.fillStyle = 'rgba(245,166,35,0.8)';
      g.font = '12px Arial';
      g.textAlign = 'left';
      g.textBaseline = 'middle';
      g.fillText(`Bi mục tiêu: #${lowest}`, TABLE.x + 4, TABLE.y + TABLE.h + 16);
    }

    if (st.phase === 'game-over') {
      R.drawGameOver(st);
    }
  }

  private _drawBtn(g: CanvasRenderingContext2D, R: Renderer, btn: GSButton) {
    const hov = this.mx >= btn.x && this.mx <= btn.x + btn.w && this.my >= btn.y && this.my <= btn.y + btn.h;
    g.fillStyle = hov ? C.cardBgHov : 'rgba(0,0,0,0.4)';
    R._roundRect(btn.x, btn.y, btn.w, btn.h, 6);
    g.fill();
    g.fillStyle = hov ? C.orange : C.gray;
    g.font = '16px Arial';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(btn.label, btn.x + btn.w / 2, btn.y + btn.h / 2);
  }

  onMouseDown(lx: number, ly: number) {
    const st = this.engine.state;
    if (st.phase === 'game-over') return;

    if (st.phase === 'ball-in-hand') {
      const isHumanTurn = st.config.mode !== 'vs-ai' || st.currentPlayer === 0;
      if (!isHumanTurn) return;
      const pos = this.cue.placeBall(lx, ly);
      if (pos) {
        this.engine.setCueBallPos(pos.x, pos.y);
        this._refreshAim();
      }
      return;
    }

    if (st.phase === 'aiming') {
      if (st.config.mode === 'vs-ai' && st.currentPlayer === 1) return;
      const cueBall = this.engine.getCueBall();
      if (cueBall) this.cue.onMouseDown(lx, ly, cueBall);
    }
  }

  onMouseMove(lx: number, ly: number) {
    this.mx = lx;
    this.my = ly;
    this.cue.onMouseMove(lx, ly);
  }

  onMouseUp(lx: number, ly: number): ScreenName | null {
    const st = this.engine.state;

    if (st.phase === 'game-over') {
      const { goReplayBtn: rb, goExitBtn: eb } = this;
      if (lx >= rb.x && lx <= rb.x + rb.w && ly >= rb.y && ly <= rb.y + rb.h) {
        this.engine.newGame(st.config);
        this._refreshAim();
        return null;
      }
      if (lx >= eb.x && lx <= eb.x + eb.w && ly >= eb.y && ly <= eb.y + eb.h) {
        return 'menu';
      }
      return null;
    }

    // Menu button
    if (
      lx >= this.menuBtn.x && lx <= this.menuBtn.x + this.menuBtn.w &&
      ly >= this.menuBtn.y && ly <= this.menuBtn.y + this.menuBtn.h
    ) {
      return 'menu';
    }

    if (st.phase !== 'aiming') return null;
    if (st.config.mode === 'vs-ai' && st.currentPlayer === 1) return null;

    const cueBall = this.engine.getCueBall();
    if (!cueBall) return null;

    const result = this.cue.onMouseUp(lx, ly, cueBall);
    if (result) {
      this.engine.shoot(result.vx, result.vy);
    }
    return null;
  }
}
