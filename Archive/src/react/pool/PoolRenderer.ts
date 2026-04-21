/* ═══════════════════════════════════════════════════════════════
   Pool Renderer – HTML5 Canvas
   
   Draws ONLY dynamic elements on a transparent canvas overlay:
   - 3D glossy balls (solid & stripe)
   - Cue stick (marble pattern, follows mouse)
   - Aim guideline + ghost ball + reflection line
   
   The static table (frame, rails, pockets, felt) is rendered
   by CSS/HTML in the React component for pixel-perfect accuracy.
═══════════════════════════════════════════════════════════════ */
import {
  BALL_RADIUS, CUE_LENGTH,
  BALL_STYLES,
  type BallStyle,
} from "./constants";
import type { BilliardBall } from "./BilliardPhysics";

export class PoolRenderer {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  w = 0;
  h = 0;
  scale = 1;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
  }

  resize(w: number, h: number) {
    const dpr = window.devicePixelRatio || 1;
    this.w = w;
    this.h = h;
    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /* ── Clear frame ── */
  clear() {
    this.ctx.clearRect(0, 0, this.w, this.h);
  }

  /* ═══════════ DRAW ALL BALLS ═══════════ */
  drawBalls(balls: BilliardBall[], scale: number) {
    this.scale = scale;
    const ctx = this.ctx;

    for (const ball of balls) {
      if (ball.pocketed) continue;
      this.drawBall(ctx, ball.pos.x * scale, ball.pos.y * scale, ball.num, scale);
    }
  }

  /* ── Draw a single glossy 3D ball ── */
  private drawBall(ctx: CanvasRenderingContext2D, x: number, y: number, num: number, s: number) {
    const r = BALL_RADIUS * s;
    const style = BALL_STYLES[num] || BALL_STYLES[0];
    const isCue = num === 0;

    ctx.save();

    // ── Shadow ──
    ctx.beginPath();
    ctx.ellipse(x + 1.5 * s, y + 3 * s, r * 1.0, r * 0.65, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.fill();

    if (style.stripe) {
      // ── Stripe ball: white base + colored band ──
      // Clip to circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.clip();

      // White base
      const baseGrad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
      baseGrad.addColorStop(0, "#FFFFFF");
      baseGrad.addColorStop(0.5, "#F5EDD8");
      baseGrad.addColorStop(1, "#C8BDA0");
      ctx.fillStyle = baseGrad;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);

      // Colored stripe band
      const bandGrad = ctx.createRadialGradient(x - r * 0.25, y - r * 0.25, 0, x, y, r);
      bandGrad.addColorStop(0, style.light);
      bandGrad.addColorStop(0.5, style.base);
      bandGrad.addColorStop(1, style.dark);
      ctx.fillStyle = bandGrad;
      ctx.fillRect(x - r, y - r * 0.44, r * 2, r * 0.88);

      ctx.restore();
    } else {
      // ── Solid ball ──
      const grad = ctx.createRadialGradient(x - r * 0.28, y - r * 0.28, r * 0.1, x, y, r);
      grad.addColorStop(0, style.light);
      grad.addColorStop(0.5, style.base);
      grad.addColorStop(1, style.dark);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }

    // ── Glossy highlight (top-left) ──
    const gloss = ctx.createRadialGradient(
      x - r * 0.25, y - r * 0.35, 0,
      x - r * 0.1, y - r * 0.15, r * 0.6
    );
    gloss.addColorStop(0, "rgba(255,255,255,0.85)");
    gloss.addColorStop(0.45, "rgba(255,255,255,0.18)");
    gloss.addColorStop(1, "rgba(255,255,255,0)");
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = gloss;
    ctx.fill();

    // ── Small specular highlight ──
    ctx.save();
    ctx.translate(x - r * 0.22, y - r * 0.34);
    ctx.rotate(-0.38);
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.23, r * 0.13, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fill();
    ctx.restore();

    // ── Number circle + text ──
    if (!isCue) {
      ctx.beginPath();
      ctx.arc(x, y, r * 0.38, 0, Math.PI * 2);
      ctx.fillStyle = "#F5EDD8";
      ctx.fill();

      ctx.fillStyle = "#1A1A1A";
      ctx.font = `800 ${r * 0.56}px Arial, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(num), x, y + 0.5);
    }

    // ── Subtle edge ring ──
    ctx.beginPath();
    ctx.arc(x, y, r - 0.5, 0, Math.PI * 2);
    ctx.strokeStyle = `${style.dark}44`;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }

  /* ═══════════ DRAW CUE STICK & AIM LINES ═══════════ */
  drawCue(
    cueBallPos: { x: number; y: number } | null,
    mouseX: number, mouseY: number,
    isDragging: boolean,
    power: number,  // 0..1
    show: boolean,
    scale: number,
  ) {
    if (!cueBallPos || !show) return;

    const ctx = this.ctx;
    const s = scale;
    const cbx = cueBallPos.x;
    const cby = cueBallPos.y;
    const r = BALL_RADIUS * s;

    // Angle from cue ball towards mouse
    const angle = Math.atan2(mouseY - cby, mouseX - cbx);

    ctx.save();

    // ── 1. Dashed aim guideline ──
    const startDist = r * 1.3;
    const aimStartX = cbx + Math.cos(angle) * startDist;
    const aimStartY = cby + Math.sin(angle) * startDist;
    const lineLen = 800 * s;

    ctx.beginPath();
    ctx.moveTo(aimStartX, aimStartY);
    ctx.lineTo(
      cbx + Math.cos(angle) * lineLen,
      cby + Math.sin(angle) * lineLen
    );
    ctx.strokeStyle = "rgba(255,255,255,0.45)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([7 * s, 5 * s]);
    ctx.stroke();
    ctx.setLineDash([]);

    // ── 2. Ghost ball circle ──
    const ghostDist = 110 * s;
    const ghostX = cbx + Math.cos(angle) * ghostDist;
    const ghostY = cby + Math.sin(angle) * ghostDist;
    ctx.beginPath();
    ctx.arc(ghostX, ghostY, r + 3 * s, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 2 * s;
    ctx.stroke();

    // Inner glow
    ctx.beginPath();
    ctx.arc(ghostX, ghostY, r + 2 * s, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fill();

    // ── 3. Reflection line (faint) ──
    const reflAngle = angle + Math.PI * 0.18;
    ctx.beginPath();
    ctx.moveTo(ghostX, ghostY);
    ctx.lineTo(
      ghostX + Math.cos(reflAngle) * 70 * s,
      ghostY + Math.sin(reflAngle) * 70 * s
    );
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 1 * s;
    ctx.setLineDash([4 * s, 4 * s]);
    ctx.stroke();
    ctx.setLineDash([]);

    // ── 4. Cue stick ──
    const cueAngle = angle + Math.PI;
    const pullBack = power * 90 * s;
    const cueStartDist = r + 6 * s + pullBack;
    const cueEndDist = cueStartDist + CUE_LENGTH * s;

    const sx = cbx + Math.cos(cueAngle) * cueStartDist;
    const sy = cby + Math.sin(cueAngle) * cueStartDist;
    const ex = cbx + Math.cos(cueAngle) * cueEndDist;
    const ey = cby + Math.sin(cueAngle) * cueEndDist;

    // Cue shadow
    ctx.beginPath();
    ctx.moveTo(sx + 2, sy + 3);
    ctx.lineTo(ex + 2, ey + 3);
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.lineWidth = 10 * s;
    ctx.lineCap = "round";
    ctx.stroke();

    // ── Back portion (dark wood) ──
    const midDist = cueStartDist + CUE_LENGTH * s * 0.42;
    const mx = cbx + Math.cos(cueAngle) * midDist;
    const my = cby + Math.sin(cueAngle) * midDist;

    ctx.beginPath();
    ctx.moveTo(mx, my);
    ctx.lineTo(ex, ey);
    const darkGrad = ctx.createLinearGradient(mx, my, ex, ey);
    darkGrad.addColorStop(0, "#4A3520");
    darkGrad.addColorStop(0.3, "#2A1A10");
    darkGrad.addColorStop(0.7, "#3A2518");
    darkGrad.addColorStop(1, "#1A0D08");
    ctx.strokeStyle = darkGrad;
    ctx.lineWidth = 7.5 * s;
    ctx.lineCap = "round";
    ctx.stroke();

    // ── Front portion (marble/ivory) ──
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(mx, my);
    const frontGrad = ctx.createLinearGradient(sx, sy, mx, my);
    frontGrad.addColorStop(0, "#F0ECD8");
    frontGrad.addColorStop(0.15, "#222");
    frontGrad.addColorStop(0.25, "#E5E5E2");
    frontGrad.addColorStop(0.4, "#888");
    frontGrad.addColorStop(0.55, "#222");
    frontGrad.addColorStop(0.7, "#E5E5E2");
    frontGrad.addColorStop(0.85, "#888");
    frontGrad.addColorStop(1, "#E5E5E2");
    ctx.strokeStyle = frontGrad;
    ctx.lineWidth = 6 * s;
    ctx.lineCap = "round";
    ctx.stroke();

    // ── Gold wrap ring ──
    const perpX = -Math.sin(cueAngle) * 5 * s;
    const perpY = Math.cos(cueAngle) * 5 * s;
    ctx.beginPath();
    ctx.moveTo(mx - perpX, my - perpY);
    ctx.lineTo(mx + perpX, my + perpY);
    ctx.strokeStyle = "#D4A030";
    ctx.lineWidth = 3 * s;
    ctx.lineCap = "butt";
    ctx.stroke();

    // ── Ferrule (white tip) ──
    ctx.beginPath();
    ctx.arc(sx, sy, 4 * s, 0, Math.PI * 2);
    ctx.fillStyle = "#EAE4D4";
    ctx.fill();

    // Blue chalk
    ctx.beginPath();
    ctx.arc(sx, sy, 2.5 * s, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(68,136,204,0.7)";
    ctx.fill();

    ctx.restore();
  }

  destroy() {
    // Nothing to clean up for Canvas
  }
}
