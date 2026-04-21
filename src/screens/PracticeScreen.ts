import { CW, TABLE, C, FELT, BALL_R, BALL_COLOR } from '../game/constants';
import { GameEngine } from '../game/GameEngine';
import { Renderer } from '../game/Renderer';
import { CueController } from '../game/CueController';
import type { ScreenName } from '../types';

export class PracticeScreen {
  private renderer: Renderer;
  private engine: GameEngine;
  private cue: CueController;
  private mx = 0;
  private my = 0;
  private selectedBallId = 1;
  private exitBtn  = { x: CW - 55,  y: TABLE.y - 36, w: 40, h: 28 };
  private resetBtn = { x: CW - 158, y: TABLE.y - 36, w: 96, h: 28 };
  private ballBtns: { x: number; y: number; id: number }[] = [];

  constructor(renderer: Renderer, engine: GameEngine) {
    this.renderer = renderer;
    this.engine = engine;
    this.cue = new CueController();
    this._buildBallBtns();
  }

  private _buildBallBtns() {
    const spacing = 38;
    const startX = 20;
    const btnY = TABLE.y - 36;
    for (let i = 0; i <= 9; i++) {
      this.ballBtns.push({ x: startX + i * spacing, y: btnY, id: i });
    }
  }

  startPractice() {
    const config = { mode: 'practice' as const, winsNeeded: 0, player1Name: 'Luyện tập', player2Name: '' };
    this.engine.newGame(config);
    const cueBall = this.engine.getCueBall();
    if (cueBall) this.cue.beginAim(cueBall);
  }

  update() {
    this.engine.update();
    if (this.engine.state.phase === 'aiming') {
      const cueBall = this.engine.getCueBall();
      if (cueBall) this.cue.beginAim(cueBall);
    }
  }

  draw() {
    const g = this.renderer['ctx'];
    const R = this.renderer;
    const st = this.engine.state;

    R.clear();
    R.drawTable();
    R.drawBalls(st.balls);

    const cueBall = this.engine.getCueBall();
    if (cueBall && st.phase === 'aiming') {
      R.drawCueAndAim(this.cue, cueBall, st.balls);
    }

    R.drawPowerBar(this.cue.aim.power);

    // Top control bar
    const barY = TABLE.y - 42;
    g.fillStyle = C.headerBg;
    g.fillRect(0, barY, CW, 42);

    // Instruction text
    g.fillStyle = 'rgba(255,255,255,0.7)';
    g.font = '12px Arial';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(
      'Chạm hoặc kéo các quả bóng để thêm chúng vào bàn và tạo ra các thiết kế độc đáo!',
      CW / 2 - 80, barY + 14,
    );

    // Ball selector buttons
    for (const btn of this.ballBtns) {
      const sel = btn.id === this.selectedBallId;
      const hov = Math.sqrt((this.mx - btn.x) ** 2 + (this.my - (btn.y + 14)) ** 2) < 15;

      if (sel) {
        g.strokeStyle = C.orange;
        g.lineWidth = 2;
        g.beginPath();
        g.arc(btn.x, btn.y + 14, 15, 0, Math.PI * 2);
        g.stroke();
      } else if (hov) {
        g.strokeStyle = '#555577';
        g.lineWidth = 1;
        g.beginPath();
        g.arc(btn.x, btn.y + 14, 15, 0, Math.PI * 2);
        g.stroke();
      }

      g.fillStyle = btn.id === 0 ? '#fff' : (BALL_COLOR[btn.id] ?? '#888');
      g.beginPath();
      g.arc(btn.x, btn.y + 14, 11, 0, Math.PI * 2);
      g.fill();

      if (btn.id > 0) {
        g.fillStyle = btn.id === 8 ? '#fff' : '#111';
        g.font = 'bold 9px Arial';
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.fillText(String(btn.id), btn.x, btn.y + 15);
      }
    }

    // Range label (1-8)
    const rangeX = CW / 2 + 20;
    const rangeY = barY + 9;
    g.fillStyle = C.cardBg;
    R._roundRect(rangeX, rangeY, 70, 24, 4);
    g.fill();
    g.strokeStyle = C.orange;
    g.lineWidth = 1;
    R._roundRect(rangeX, rangeY, 70, 24, 4);
    g.stroke();
    g.fillStyle = C.white;
    g.font = '11px Arial';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText('1 - 8', rangeX + 35, rangeY + 12);

    // Arrow buttons
    [0, 34].forEach((off, idx) => {
      g.fillStyle = C.cardBg;
      R._roundRect(rangeX + 78 + off, rangeY, 28, 24, 4);
      g.fill();
      g.fillStyle = C.white;
      g.font = '13px Arial';
      g.textAlign = 'center';
      g.fillText(idx === 0 ? '◀' : '▶', rangeX + 78 + off + 14, rangeY + 12);
    });

    // Reset button
    const rHov = this.mx >= this.resetBtn.x && this.mx <= this.resetBtn.x + this.resetBtn.w &&
                 this.my >= this.resetBtn.y && this.my <= this.resetBtn.y + this.resetBtn.h;
    g.fillStyle = rHov ? '#2a2a50' : C.cardBg;
    R._roundRect(this.resetBtn.x, this.resetBtn.y, this.resetBtn.w, this.resetBtn.h, 5);
    g.fill();
    g.fillStyle = C.white;
    g.font = 'bold 11px Arial';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText('Đặt Lại Bàn', this.resetBtn.x + this.resetBtn.w / 2, this.resetBtn.y + 14);

    // Exit button
    const xHov = this.mx >= this.exitBtn.x && this.mx <= this.exitBtn.x + this.exitBtn.w &&
                 this.my >= this.exitBtn.y && this.my <= this.exitBtn.y + this.exitBtn.h;
    g.fillStyle = xHov ? '#aa2222' : '#882222';
    R._roundRect(this.exitBtn.x, this.exitBtn.y, this.exitBtn.w, this.exitBtn.h, 5);
    g.fill();
    g.fillStyle = '#fff';
    g.font = 'bold 15px Arial';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText('✕', this.exitBtn.x + this.exitBtn.w / 2, this.exitBtn.y + 14);

    // Cue ball indicator top-right
    g.fillStyle = C.cardBg;
    g.beginPath();
    g.arc(CW - 28, 28, 18, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#eee';
    g.beginPath();
    g.arc(CW - 28, 28, 11, 0, Math.PI * 2);
    g.fill();
  }

  onMouseDown(lx: number, ly: number) {
    const st = this.engine.state;

    // Ball selector
    for (const btn of this.ballBtns) {
      if (Math.sqrt((lx - btn.x) ** 2 + (ly - (btn.y + 14)) ** 2) < 15) {
        this.selectedBallId = btn.id;
        return;
      }
    }

    // Reset
    if (
      lx >= this.resetBtn.x && lx <= this.resetBtn.x + this.resetBtn.w &&
      ly >= this.resetBtn.y && ly <= this.resetBtn.y + this.resetBtn.h
    ) {
      this.engine.removeAllBalls();
      const config = { mode: 'practice' as const, winsNeeded: 0, player1Name: 'Luyện tập', player2Name: '' };
      this.engine.newGame(config);
      const cb = this.engine.getCueBall();
      if (cb) this.cue.beginAim(cb);
      return;
    }

    // Cue aiming (if on table)
    if (st.phase === 'aiming') {
      const cueBall = this.engine.getCueBall();
      if (cueBall) this.cue.onMouseDown(lx, ly, cueBall);
      return;
    }

    // Place ball on felt
    if (lx > FELT.x && lx < FELT.x + FELT.w && ly > FELT.y && ly < FELT.y + FELT.h) {
      this.engine.placeBallPractice(this.selectedBallId, lx, ly);
    }
  }

  onMouseMove(lx: number, ly: number) {
    this.mx = lx;
    this.my = ly;
    this.cue.onMouseMove(lx, ly);
  }

  onMouseUp(lx: number, ly: number): ScreenName | null {
    if (
      lx >= this.exitBtn.x && lx <= this.exitBtn.x + this.exitBtn.w &&
      ly >= this.exitBtn.y && ly <= this.exitBtn.y + this.exitBtn.h
    ) {
      return 'menu';
    }

    const st = this.engine.state;
    const cueBall = this.engine.getCueBall();
    if (cueBall && st.phase === 'aiming') {
      const result = this.cue.onMouseUp(lx, ly, cueBall);
      if (result) this.engine.shoot(result.vx, result.vy);
    }
    return null;
  }

  // unused param kept to silence linter in App
  get ballRadius() { return BALL_R; }
}
