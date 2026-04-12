import { Graphics, Container } from 'pixi.js'
import { BALL } from '../constants'

export class CueSprite {
  readonly container: Container
  private cueGfx: Graphics
  private guideGfx: Graphics
  private powerGfx: Graphics

  private readonly CUE_LENGTH = 180
  private readonly CUE_WIDTH_BACK = 8
  private readonly CUE_WIDTH_TIP  = 3
  private readonly CUE_OFFSET = BALL.RADIUS + 4  // khoảng cách đầu cue đến tâm bóng

  constructor() {
    this.container = new Container()
    this.cueGfx    = new Graphics()
    this.guideGfx  = new Graphics()
    this.powerGfx  = new Graphics()

    this.container.addChild(this.guideGfx)
    this.container.addChild(this.cueGfx)
    this.container.addChild(this.powerGfx)
  }

  update(
    ballX: number,
    ballY: number,
    angle: number,        // radian — hướng bắn
    pullDistance: number, // px kéo
    maxPull: number,
    tableWidth: number,
    tableHeight: number,
  ): void {
    this.cueGfx.clear()
    this.guideGfx.clear()
    this.powerGfx.clear()

    const power = pullDistance / maxPull  // 0..1

    // --- Đường ngắm (guideline) ---
    // Vẽ đường từ cue ball theo hướng aim
    const GUIDE_LEN = 300
    const gx = ballX + Math.cos(angle) * GUIDE_LEN
    const gy = ballY + Math.sin(angle) * GUIDE_LEN

    // Clamp trong bàn
    this.guideGfx
      .moveTo(ballX + Math.cos(angle) * BALL.RADIUS, ballY + Math.sin(angle) * BALL.RADIUS)
      .lineTo(
        Math.max(0, Math.min(tableWidth,  gx)),
        Math.max(0, Math.min(tableHeight, gy)),
      )
    this.guideGfx.stroke({ color: 0xffffff, width: 1, alpha: 0.25 })

    // --- Cue stick ---
    // Cue lùi ra phía sau (ngược hướng aim) theo pullDistance
    const tipOffset  = this.CUE_OFFSET + pullDistance
    const backOffset = tipOffset + this.CUE_LENGTH

    // Tọa độ đầu tip (gần bóng)
    const tipX  = ballX - Math.cos(angle) * tipOffset
    const tipY  = ballY - Math.sin(angle) * tipOffset

    // Tọa độ đầu back (xa bóng)
    const backX = ballX - Math.cos(angle) * backOffset
    const backY = ballY - Math.sin(angle) * backOffset

    // Vector vuông góc để vẽ cue dày
    const perpX = -Math.sin(angle)
    const perpY =  Math.cos(angle)

    // Vẽ cue hình thang (tip nhỏ, back to)
    const hw_tip  = this.CUE_WIDTH_TIP  / 2
    const hw_back = this.CUE_WIDTH_BACK / 2

    this.cueGfx.poly([
      tipX  + perpX * hw_tip,  tipY  + perpY * hw_tip,
      tipX  - perpX * hw_tip,  tipY  - perpY * hw_tip,
      backX - perpX * hw_back, backY - perpY * hw_back,
      backX + perpX * hw_back, backY + perpY * hw_back,
    ]).fill(0xd4a84b)  // màu gỗ

    // Viền cue
    this.cueGfx.poly([
      tipX  + perpX * hw_tip,  tipY  + perpY * hw_tip,
      tipX  - perpX * hw_tip,  tipY  - perpY * hw_tip,
      backX - perpX * hw_back, backY - perpY * hw_back,
      backX + perpX * hw_back, backY + perpY * hw_back,
    ]).stroke({ color: 0x8b6914, width: 1 })

    // Đầu tip màu xanh da trời
    this.cueGfx.circle(tipX, tipY, hw_tip + 1).fill(0x4fc3f7)

    // --- Power bar (hiển thị lực kéo) ---
    if (pullDistance > 0) {
      const barW = 80
      const barH = 8
      const barX = ballX - barW / 2
      const barY = ballY + BALL.RADIUS + 16

      // Nền
      this.powerGfx.rect(barX, barY, barW, barH).fill({ color: 0x333333, alpha: 0.7 })
      // Lực
      const fillColor = power < 0.5 ? 0x4caf50 : power < 0.8 ? 0xff9800 : 0xf44336
      this.powerGfx.rect(barX, barY, barW * power, barH).fill(fillColor)
      // Viền
      this.powerGfx.rect(barX, barY, barW, barH).stroke({ color: 0xffffff, width: 1, alpha: 0.5 })
    }
  }

  setVisible(v: boolean): void {
    this.container.visible = v
  }
}