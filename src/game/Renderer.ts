import {
  CW, CH,
  TABLE, FELT, WOOD, BALL_R, POCKET_R,
  POCKETS, BALL_COLOR, C, POWER_BAR,
} from './constants';
import { BallState, AimInfo } from '../types';
import { CueController } from './CueController';
import type { GameState } from '../types';

export class Renderer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  clear() {
    const g = this.ctx;
    g.fillStyle = C.bg;
    g.fillRect(0, 0, CW, CH);
  }

  // ─── TABLE ──────────────────────────────────────────────────────────

  drawTable() {
    const g = this.ctx;

    // Outer shadow
    g.shadowColor = 'rgba(0,0,0,0.8)';
    g.shadowBlur = 40;
    g.fillStyle = C.tableWood;
    this._roundRect(TABLE.x, TABLE.y, TABLE.w, TABLE.h, 14);
    g.fill();
    g.shadowBlur = 0;

    // Wood grain
    const woodGrad = g.createLinearGradient(TABLE.x, TABLE.y, TABLE.x, TABLE.y + TABLE.h);
    woodGrad.addColorStop(0, C.tableWoodLt);
    woodGrad.addColorStop(0.3, C.tableWood);
    woodGrad.addColorStop(0.7, C.tableWood);
    woodGrad.addColorStop(1, C.tableWoodLt);
    g.fillStyle = woodGrad;
    this._roundRect(TABLE.x, TABLE.y, TABLE.w, TABLE.h, 14);
    g.fill();

    // Rail stripe pattern (decorative zigzag)
    this._drawRailPattern();

    // Felt
    const feltGrad = g.createLinearGradient(FELT.x, FELT.y, FELT.x, FELT.y + FELT.h);
    feltGrad.addColorStop(0, '#0f7a60');
    feltGrad.addColorStop(0.5, C.tableFelt);
    feltGrad.addColorStop(1, '#0c5e49');
    g.fillStyle = feltGrad;
    g.fillRect(FELT.x, FELT.y, FELT.w, FELT.h);

    // Felt center dot
    g.fillStyle = C.tableFeltDot;
    g.beginPath();
    g.arc(FELT.x + FELT.w / 2, FELT.y + FELT.h / 2, 4, 0, Math.PI * 2);
    g.fill();

    // Rail dots (reference marks)
    this._drawRailDots();

    // Head string line (faint)
    const hsx = FELT.x + FELT.w * 0.25;
    g.strokeStyle = 'rgba(255,255,255,0.06)';
    g.lineWidth = 1;
    g.setLineDash([4, 6]);
    g.beginPath();
    g.moveTo(hsx, FELT.y + 4);
    g.lineTo(hsx, FELT.y + FELT.h - 4);
    g.stroke();
    g.setLineDash([]);

    // Pockets
    for (const p of POCKETS) {
      g.fillStyle = '#000';
      g.beginPath();
      g.arc(p.x, p.y, POCKET_R, 0, Math.PI * 2);
      g.fill();

      // Pocket ring
      g.strokeStyle = 'rgba(0,0,0,0.6)';
      g.lineWidth = 3;
      g.beginPath();
      g.arc(p.x, p.y, POCKET_R + 3, 0, Math.PI * 2);
      g.stroke();
    }

    // Felt border highlight (inner shadow)
    g.strokeStyle = 'rgba(0,0,0,0.4)';
    g.lineWidth = 3;
    g.strokeRect(FELT.x, FELT.y, FELT.w, FELT.h);
  }

  private _drawRailPattern() {
    const g = this.ctx;
    const zig = 12;
    g.strokeStyle = 'rgba(255,200,100,0.15)';
    g.lineWidth = 1.5;

    // Top rail
    g.beginPath();
    for (let i = 0; i < TABLE.w / zig; i++) {
      const xBase = TABLE.x + i * zig;
      g.moveTo(xBase, TABLE.y + 8);
      g.lineTo(xBase + zig / 2, TABLE.y + 20);
      g.lineTo(xBase + zig, TABLE.y + 8);
    }
    g.stroke();

    // Bottom rail
    g.beginPath();
    for (let i = 0; i < TABLE.w / zig; i++) {
      const xBase = TABLE.x + i * zig;
      g.moveTo(xBase, TABLE.y + TABLE.h - 8);
      g.lineTo(xBase + zig / 2, TABLE.y + TABLE.h - 20);
      g.lineTo(xBase + zig, TABLE.y + TABLE.h - 8);
    }
    g.stroke();

    // Left rail
    g.beginPath();
    for (let i = 0; i < TABLE.h / zig; i++) {
      const yBase = TABLE.y + i * zig;
      g.moveTo(TABLE.x + 8, yBase);
      g.lineTo(TABLE.x + 20, yBase + zig / 2);
      g.lineTo(TABLE.x + 8, yBase + zig);
    }
    g.stroke();

    // Right rail
    g.beginPath();
    for (let i = 0; i < TABLE.h / zig; i++) {
      const yBase = TABLE.y + i * zig;
      g.moveTo(TABLE.x + TABLE.w - 8, yBase);
      g.lineTo(TABLE.x + TABLE.w - 20, yBase + zig / 2);
      g.lineTo(TABLE.x + TABLE.w - 8, yBase + zig);
    }
    g.stroke();
  }

  private _drawRailDots() {
    const g = this.ctx;
    g.fillStyle = 'rgba(255,230,150,0.55)';
    const dotR = 4;
    const positions = [
      // Top rail
      { x: FELT.x + FELT.w * 0.25, y: TABLE.y + WOOD / 2 },
      { x: FELT.x + FELT.w * 0.5, y: TABLE.y + WOOD / 2 },
      { x: FELT.x + FELT.w * 0.75, y: TABLE.y + WOOD / 2 },
      // Bottom rail
      { x: FELT.x + FELT.w * 0.25, y: TABLE.y + TABLE.h - WOOD / 2 },
      { x: FELT.x + FELT.w * 0.5, y: TABLE.y + TABLE.h - WOOD / 2 },
      { x: FELT.x + FELT.w * 0.75, y: TABLE.y + TABLE.h - WOOD / 2 },
    ];
    for (const d of positions) {
      g.beginPath();
      g.arc(d.x, d.y, dotR, 0, Math.PI * 2);
      g.fill();
    }
  }

  // ─── BALLS ──────────────────────────────────────────────────────────

  drawBalls(balls: BallState[]) {
    for (const b of balls) {
      if (!b.pocketed) this.drawBall(b);
    }
  }

  drawBall(b: BallState) {
    const g = this.ctx;
    const { x, y, id } = b;

    // Shadow
    g.shadowColor = 'rgba(0,0,0,0.5)';
    g.shadowBlur = 8;
    g.shadowOffsetX = 2;
    g.shadowOffsetY = 2;

    if (id === 0) {
      // Cue ball
      const grad = g.createRadialGradient(x - BALL_R * 0.35, y - BALL_R * 0.35, 1, x, y, BALL_R);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(1, '#cccccc');
      g.fillStyle = grad;
      g.beginPath();
      g.arc(x, y, BALL_R, 0, Math.PI * 2);
      g.fill();
    } else if (id === 9) {
      // Ball 9: stripe
      this._drawStripeBall(x, y, BALL_COLOR[9], id);
    } else {
      // Solid balls
      this._drawSolidBall(x, y, BALL_COLOR[id] ?? '#888888', id);
    }

    g.shadowColor = 'transparent';
    g.shadowBlur = 0;
    g.shadowOffsetX = 0;
    g.shadowOffsetY = 0;
  }

  private _drawSolidBall(x: number, y: number, color: string, id: number) {
    const g = this.ctx;

    const grad = g.createRadialGradient(x - BALL_R * 0.3, y - BALL_R * 0.3, 1, x, y, BALL_R);
    grad.addColorStop(0, this._lighten(color, 0.4));
    grad.addColorStop(0.6, color);
    grad.addColorStop(1, this._darken(color, 0.3));
    g.fillStyle = grad;
    g.beginPath();
    g.arc(x, y, BALL_R, 0, Math.PI * 2);
    g.fill();

    // White number circle
    g.fillStyle = 'rgba(255,255,255,0.92)';
    g.beginPath();
    g.arc(x, y, BALL_R * 0.52, 0, Math.PI * 2);
    g.fill();

    // Number
    g.fillStyle = id === 8 ? '#fff' : '#111';
    g.font = `bold ${BALL_R * 0.7}px Arial`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(String(id), x, y + 1);
  }

  private _drawStripeBall(x: number, y: number, color: string, id: number) {
    const g = this.ctx;

    // White base
    const grad = g.createRadialGradient(x - BALL_R * 0.3, y - BALL_R * 0.3, 1, x, y, BALL_R);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(1, '#dddddd');
    g.fillStyle = grad;
    g.beginPath();
    g.arc(x, y, BALL_R, 0, Math.PI * 2);
    g.fill();

    // Stripe
    g.save();
    g.beginPath();
    g.arc(x, y, BALL_R, 0, Math.PI * 2);
    g.clip();
    g.fillStyle = color;
    g.fillRect(x - BALL_R, y - BALL_R * 0.45, BALL_R * 2, BALL_R * 0.9);
    g.restore();

    // White number circle
    g.fillStyle = 'rgba(255,255,255,0.92)';
    g.beginPath();
    g.arc(x, y, BALL_R * 0.52, 0, Math.PI * 2);
    g.fill();

    // Number
    g.fillStyle = '#111';
    g.font = `bold ${BALL_R * 0.7}px Arial`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(String(id), x, y + 1);
  }

  // ─── CUE STICK & AIM LINE ───────────────────────────────────────────

  drawCueAndAim(cue: CueController, cueBall: BallState, balls: BallState[]) {
    const aim = cue.aim;
    if (!aim.active || aim.placingBall) return;

    const g = this.ctx;
    const { nx, ny } = cue.getAimDirection(cueBall);

    // Ghost ball
    const ghost = cue.computeGhostBall(cueBall, balls);
    if (ghost) {
      g.strokeStyle = 'rgba(255,255,255,0.25)';
      g.lineWidth = 1.5;
      g.setLineDash([4, 5]);
      g.beginPath();
      g.arc(ghost.x, ghost.y, BALL_R, 0, Math.PI * 2);
      g.stroke();
      g.setLineDash([]);

      // Trajectory dot line
      g.strokeStyle = 'rgba(255,255,255,0.20)';
      g.lineWidth = 1;
      g.setLineDash([3, 8]);
      g.beginPath();
      g.moveTo(cueBall.x, cueBall.y);
      g.lineTo(ghost.x, ghost.y);
      g.stroke();
      g.setLineDash([]);
    } else {
      // Long aim line to wall
      g.strokeStyle = 'rgba(255,255,255,0.18)';
      g.lineWidth = 1;
      g.setLineDash([3, 8]);
      g.beginPath();
      g.moveTo(cueBall.x, cueBall.y);
      g.lineTo(cueBall.x + nx * 600, cueBall.y + ny * 600);
      g.stroke();
      g.setLineDash([]);
    }

    // Cue stick (drawn opposite to aim direction)
    const cueLen = 220;
    const cueGap = BALL_R + 4 + aim.power * 18;
    const stickStartX = cueBall.x - nx * cueGap;
    const stickStartY = cueBall.y - ny * cueGap;
    const stickEndX = stickStartX - nx * cueLen;
    const stickEndY = stickStartY - ny * cueLen;

    g.save();
    const cueWidth1 = 4;
    const cueWidth2 = 14;
    const perpX = -ny;
    const perpY = nx;

    g.beginPath();
    g.moveTo(stickStartX + perpX * cueWidth1 / 2, stickStartY + perpY * cueWidth1 / 2);
    g.lineTo(stickEndX + perpX * cueWidth2 / 2, stickEndY + perpY * cueWidth2 / 2);
    g.lineTo(stickEndX - perpX * cueWidth2 / 2, stickEndY - perpY * cueWidth2 / 2);
    g.lineTo(stickStartX - perpX * cueWidth1 / 2, stickStartY - perpY * cueWidth1 / 2);
    g.closePath();

    const cueGrad = g.createLinearGradient(stickStartX, stickStartY, stickEndX, stickEndY);
    cueGrad.addColorStop(0, '#f5e4b0');
    cueGrad.addColorStop(0.6, '#c8a44a');
    cueGrad.addColorStop(0.85, '#7a4a1a');
    cueGrad.addColorStop(1, '#3a1a0a');
    g.fillStyle = cueGrad;
    g.fill();

    // Cue tip
    g.fillStyle = '#e8d0a0';
    g.beginPath();
    g.ellipse(
      stickStartX, stickStartY,
      cueWidth1 / 2, cueWidth1,
      Math.atan2(ny, nx) + Math.PI / 2,
      0, Math.PI * 2,
    );
    g.fill();

    g.restore();
  }

  // ─── POWER METER ────────────────────────────────────────────────────

  drawPowerBar(power: number) {
    const g = this.ctx;
    const { x, y, w, h } = POWER_BAR;

    // Background
    g.fillStyle = '#111122';
    this._roundRect(x, y, w, h, 6);
    g.fill();

    g.strokeStyle = '#333355';
    g.lineWidth = 1;
    this._roundRect(x, y, w, h, 6);
    g.stroke();

    // Fill
    const fillH = h * power;
    const fillY = y + h - fillH;
    const colors = power > 0.7 ? ['#ff4444', '#cc1111'] : power > 0.4 ? ['#ffaa22', '#dd7700'] : ['#44ff88', '#22aa55'];
    const barGrad = g.createLinearGradient(0, fillY, 0, y + h);
    barGrad.addColorStop(0, colors[0]);
    barGrad.addColorStop(1, colors[1]);
    g.fillStyle = barGrad;
    g.save();
    g.beginPath();
    this._roundRect(x + 2, fillY, w - 4, fillH - 2, 4);
    g.clip();
    g.fillRect(x + 2, fillY, w - 4, fillH);
    g.restore();

    // Label
    g.fillStyle = C.gray;
    g.font = '10px Arial';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.save();
    g.translate(x + w / 2, y + h / 2);
    g.rotate(-Math.PI / 2);
    g.fillText('LỰC', 0, 0);
    g.restore();

    // Tick marks
    for (let i = 1; i < 5; i++) {
      const ty = y + h - (h / 5) * i;
      g.strokeStyle = '#333355';
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(x + w - 6, ty);
      g.lineTo(x + w - 1, ty);
      g.stroke();
    }
  }

  // ─── GAME HUD ────────────────────────────────────────────────────────

  drawGameHUD(state: GameState) {
    const g = this.ctx;
    const topH = TABLE.y - 4;

    // Score bar background
    g.fillStyle = C.headerBg;
    g.fillRect(0, 0, CW, topH);

    // Score
    const scoreText = `${state.scores[0]}  :  ${state.scores[1]}`;
    g.fillStyle = C.white;
    g.font = 'bold 28px Arial';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(scoreText, CW / 2, topH / 2);

    // Player names + avatars
    this._drawPlayerInfo(120, topH / 2, state.config.player1Name, state.currentPlayer === 0, 0);
    this._drawPlayerInfo(CW - 120, topH / 2, state.config.player2Name, state.currentPlayer === 1, 1);

    // Ball indicators
    this._drawBallIndicators(state.balls, CW / 2, topH + 22);

    // Turn indicator
    const turnMsg = state.phase === 'ball-in-hand' ? '⚐ Đặt bi cái tự do' :
      state.phase === 'game-over' ? '🏆 Kết thúc!' :
        state.config.mode === 'vs-ai' && state.currentPlayer === 1 ? '🤖 Máy đang suy nghĩ...' :
          `Lượt: ${state.currentPlayer === 0 ? state.config.player1Name : state.config.player2Name}`;
    g.font = '13px Arial';
    g.fillStyle = C.gray;
    g.textAlign = 'center';
    g.fillText(turnMsg, CW / 2, topH + 42);

    // Foul message
    if (state.foulMessage) {
      g.fillStyle = '#ff6644';
      g.font = 'bold 13px Arial';
      g.fillText(state.foulMessage, CW / 2, topH + 57);
    }
  }

  private _drawPlayerInfo(x: number, y: number, name: string, active: boolean, side: number) {
    const g = this.ctx;
    const avatarR = 20;
    const avatarX = side === 0 ? x - 50 : x + 50;

    // Avatar circle
    g.fillStyle = active ? C.orange : C.grayDk;
    g.beginPath();
    g.arc(avatarX, y, avatarR, 0, Math.PI * 2);
    g.fill();

    // Person icon
    g.fillStyle = active ? '#fff' : '#aaa';
    g.font = '16px Arial';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText('👤', avatarX, y);

    // Name
    g.fillStyle = active ? C.orange : C.gray;
    g.font = active ? 'bold 14px Arial' : '14px Arial';
    g.textAlign = side === 0 ? 'left' : 'right';
    g.fillText(name, x + (side === 0 ? -30 : 30), y);

    // Active indicator
    if (active) {
      g.fillStyle = C.orange;
      g.beginPath();
      g.arc(avatarX, y + avatarR + 5, 4, 0, Math.PI * 2);
      g.fill();
    }
  }

  private _drawBallIndicators(balls: BallState[], cx: number, y: number) {
    const g = this.ctx;
    const total = 9;
    const spacing = 28;
    const startX = cx - ((total - 1) * spacing) / 2;

    for (let id = 1; id <= total; id++) {
      const ball = balls.find(b => b.id === id);
      const pocketed = !ball || ball.pocketed;
      const bx = startX + (id - 1) * spacing;

      if (pocketed) {
        g.fillStyle = '#333355';
        g.beginPath();
        g.arc(bx, y, 10, 0, Math.PI * 2);
        g.fill();
        g.strokeStyle = '#444466';
        g.lineWidth = 1;
        g.stroke();
      } else {
        // Colored indicator
        g.fillStyle = BALL_COLOR[id] ?? '#888';
        g.beginPath();
        g.arc(bx, y, 10, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = id === 8 ? '#fff' : '#111';
        g.font = 'bold 8px Arial';
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.fillText(String(id), bx, y + 1);
      }
    }
  }

  // ─── BALL-IN-HAND OVERLAY ────────────────────────────────────────────

  drawBallInHandCursor(mx: number, my: number) {
    const g = this.ctx;
    const grad = g.createRadialGradient(mx - 4, my - 4, 1, mx, my, BALL_R);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(1, 'rgba(200,200,200,0.7)');
    g.fillStyle = grad;
    g.beginPath();
    g.arc(mx, my, BALL_R, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = C.orange;
    g.lineWidth = 2;
    g.setLineDash([4, 4]);
    g.beginPath();
    g.arc(mx, my, BALL_R + 4, 0, Math.PI * 2);
    g.stroke();
    g.setLineDash([]);
  }

  // ─── GAME-OVER OVERLAY ───────────────────────────────────────────────

  drawGameOver(state: GameState) {
    const g = this.ctx;
    g.fillStyle = 'rgba(0,0,0,0.7)';
    g.fillRect(0, 0, CW, CH);

    const winnerName = state.winner === 0 ? state.config.player1Name : state.config.player2Name;
    const cx = CW / 2;
    const cy = CH / 2;

    // Panel
    g.fillStyle = C.cardBg;
    this._roundRect(cx - 220, cy - 120, 440, 240, 16);
    g.fill();
    g.strokeStyle = C.orange;
    g.lineWidth = 2;
    this._roundRect(cx - 220, cy - 120, 440, 240, 16);
    g.stroke();

    g.fillStyle = C.orange;
    g.font = 'bold 38px Arial';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText('🏆 CHIẾN THẮNG!', cx, cy - 60);

    g.fillStyle = C.white;
    g.font = 'bold 24px Arial';
    g.fillText(winnerName, cx, cy - 15);

    g.fillStyle = C.gray;
    g.font = '16px Arial';
    g.fillText(`${state.scores[0]} - ${state.scores[1]}`, cx, cy + 25);

    // Buttons
    this._button(cx - 170, cy + 60, 160, 44, 'Chơi lại', C.orange, C.orangeDark, '#111');
    this._button(cx + 10, cy + 60, 160, 44, 'Thoát', C.cardBgHov, '#2a2a4a', C.white);
  }

  // ─── UTILITY DRAWING ─────────────────────────────────────────────────

  _button(x: number, y: number, w: number, h: number, label: string, bg: string, bg2: string, fg: string) {
    const g = this.ctx;
    const grad = g.createLinearGradient(x, y, x, y + h);
    grad.addColorStop(0, bg);
    grad.addColorStop(1, bg2);
    g.fillStyle = grad;
    this._roundRect(x, y, w, h, 8);
    g.fill();
    g.fillStyle = fg;
    g.font = 'bold 15px Arial';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(label, x + w / 2, y + h / 2);
  }

  _roundRect(x: number, y: number, w: number, h: number, r: number) {
    const g = this.ctx;
    g.beginPath();
    g.moveTo(x + r, y);
    g.lineTo(x + w - r, y);
    g.quadraticCurveTo(x + w, y, x + w, y + r);
    g.lineTo(x + w, y + h - r);
    g.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    g.lineTo(x + r, y + h);
    g.quadraticCurveTo(x, y + h, x, y + h - r);
    g.lineTo(x, y + r);
    g.quadraticCurveTo(x, y, x + r, y);
    g.closePath();
  }

  private _lighten(hex: string, amt: number): string {
    const n = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, (n >> 16) + Math.round(255 * amt));
    const gb = Math.min(255, ((n >> 8) & 0xff) + Math.round(255 * amt));
    const b = Math.min(255, (n & 0xff) + Math.round(255 * amt));
    return `rgb(${r},${gb},${b})`;
  }

  private _darken(hex: string, amt: number): string {
    const n = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, (n >> 16) - Math.round(255 * amt));
    const gb = Math.max(0, ((n >> 8) & 0xff) - Math.round(255 * amt));
    const b = Math.max(0, (n & 0xff) - Math.round(255 * amt));
    return `rgb(${r},${gb},${b})`;
  }

  // ─── BACKGROUND (atmospheric with faint table) ───────────────────────

  drawAtmosphericBg() {
    const g = this.ctx;
    // Radial vignette
    const vign = g.createRadialGradient(CW * 0.6, CH * 0.5, 50, CW * 0.6, CH * 0.5, CW * 0.8);
    vign.addColorStop(0, 'rgba(30,40,20,0.3)');
    vign.addColorStop(1, 'rgba(0,0,0,0.85)');
    g.fillStyle = vign;
    g.fillRect(0, 0, CW, CH);
  }
}
