import { Graphics, Container } from 'pixi.js'
import { BALL } from '../constants'

export class CueSprite {
  readonly container: Container
  private cueGfx:   Graphics
  private guideGfx: Graphics
  private powerGfx: Graphics

  private readonly CUE_LENGTH = 200
  private readonly CUE_WIDTH_BACK = 9
  private readonly CUE_WIDTH_TIP  = 2.5
  // Khoảng cách đầu tip đến tâm bóng khi không kéo
  private readonly CUE_GAP = BALL.RADIUS + 3

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
    ballX:        number,
    ballY:        number,
    angle:        number,   // hướng BẮN (từ cue ball ra target)
    pullDistance: number,
    maxPull:      number,
    tableWidth:   number,
    tableHeight:  number,
  ): void {
    this.cueGfx.clear()
    this.guideGfx.clear()
    this.powerGfx.clear()

    const power = pullDistance / maxPull  // 0..1

    // === Đường ngắm (guideline) ===
    // Vẽ từ tâm bóng theo hướng bắn (angle)
    const GUIDE_LEN = 350
    const gEndX = ballX + Math.cos(angle) * GUIDE_LEN
    const gEndY = ballY + Math.sin(angle) * GUIDE_LEN
    const gStartX = ballX + Math.cos(angle) * BALL.RADIUS
    const gStartY = ballY + Math.sin(angle) * BALL.RADIUS

    this.guideGfx
      .moveTo(gStartX, gStartY)
      .lineTo(
        Math.max(0, Math.min(tableWidth,  gEndX)),
        Math.max(0, Math.min(tableHeight, gEndY)),
      )
      .stroke({ color: 0xffffff, width: 0.8, alpha: 0.20 })

    // === Cue stick ===
    // Gậy nằm ở phía NGƯỢC hướng bắn (angle + π)
    // Đầu tip cách tâm bóng = CUE_GAP + pullDistance (kéo ra xa hơn khi pull)
    const backAngle = angle + Math.PI  // hướng ngược lại (phía sau bóng)

    const tipDist  = this.CUE_GAP + pullDistance
    const backDist = tipDist + this.CUE_LENGTH

    // Tọa độ đầu tip (gần bóng nhất)
    const tipX  = ballX + Math.cos(backAngle) * tipDist
    const tipY  = ballY + Math.sin(backAngle) * tipDist

    // Tọa độ đầu back (xa bóng nhất)
    const backX = ballX + Math.cos(backAngle) * backDist
    const backY = ballY + Math.sin(backAngle) * backDist

    // Vector vuông góc để tạo độ dày gậy
    const perpX = -Math.sin(backAngle)
    const perpY =  Math.cos(backAngle)

    const hwTip  = this.CUE_WIDTH_TIP  / 2
    const hwBack = this.CUE_WIDTH_BACK / 2

    // Vẽ thân gậy (hình thang)
    this.cueGfx.poly([
      tipX  + perpX * hwTip,   tipY  + perpY * hwTip,
      tipX  - perpX * hwTip,   tipY  - perpY * hwTip,
      backX - perpX * hwBack,  backY - perpY * hwBack,
      backX + perpX * hwBack,  backY + perpY * hwBack,
    ]).fill(0xd4a84b)

    this.cueGfx.poly([
      tipX  + perpX * hwTip,   tipY  + perpY * hwTip,
      tipX  - perpX * hwTip,   tipY  - perpY * hwTip,
      backX - perpX * hwBack,  backY - perpY * hwBack,
      backX + perpX * hwBack,  backY + perpY * hwBack,
    ]).stroke({ color: 0x8b6914, width: 0.8 })

    // Đầu tip xanh
    this.cueGfx.circle(tipX, tipY, hwTip + 1.5).fill(0x4fc3f7)

    // Đầu butt (trang trí)
    this.cueGfx.circle(backX, backY, hwBack).fill(0x5a3800)

    // === Power bar ===
    if (pullDistance > 2) {
      const barW = 80
      const barH = 7
      const barX = ballX - barW / 2
      const barY = ballY + BALL.RADIUS + 18

      this.powerGfx.rect(barX, barY, barW, barH)
        .fill({ color: 0x222222, alpha: 0.8 })

      const fillColor = power < 0.4 ? 0x4caf50 : power < 0.75 ? 0xff9800 : 0xf44336
      this.powerGfx.rect(barX, barY, barW * power, barH).fill(fillColor)
      this.powerGfx.rect(barX, barY, barW, barH)
        .stroke({ color: 0xffffff, width: 0.8, alpha: 0.4 })
    }
  }

  setVisible(v: boolean): void {
    this.container.visible = v
  }
}