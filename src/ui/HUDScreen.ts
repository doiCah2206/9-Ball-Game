import { Container, Graphics, Text, TextStyle } from 'pixi.js'
import type { GameState } from '../game/GameState'

export class HUDScreen extends Container {
  private p1NameTxt:  Text
  private p2NameTxt:  Text
  private p1ScoreTxt: Text
  private p2ScoreTxt: Text
  private turnArrow:  Graphics
  private ballDots:   Map<number, { bg: Graphics; lbl: Text }> = new Map()
  private pocketedBalls: number[] = []

  // Thanh bóng rơi — vẽ ra ngoài HUD (screen coords) nên cần biết canvas size
  private readonly SCREEN_W: number
  private readonly SCREEN_H: number

  // Container độc lập trên stage — được add từ ngoài
  readonly pocketedStrip: Container

  private _turnLabelP1?: Text
  private _turnLabelP2?: Text

  constructor(w: number, h: number, state: GameState) {
    super()
    this.SCREEN_W = w
    this.SCREEN_H = h

    // Thanh bóng rơi — container riêng, sẽ được add vào stage từ main.ts
    this.pocketedStrip = new Container()

    // === Nền HUD ===
    const bg = new Graphics()
    bg.rect(0, 0, w, h).fill({ color: 0x070c18, alpha: 0.96 })
    this.addChild(bg)

    const border = new Graphics()
    border.rect(0, h - 2, w, 2).fill(0xf7c948)
    this.addChild(border)

    // === TRÁI: Player 1 ===
    const p1Box = new Graphics()
    p1Box.roundRect(8, 5, 220, 70, 8).fill({ color: 0x111827, alpha: 0.95 })
    this.addChild(p1Box)

    // Avatar
    const av1 = new Graphics()
    av1.roundRect(14, 11, 46, 46, 8).fill(0x1e2d3d)
    av1.circle(37, 25, 10).fill(0x4a6080)
    av1.circle(37, 43, 15).fill(0x4a6080)
    this.addChild(av1)

    this.p1NameTxt = new Text({
      text: state.player1.name,
      style: new TextStyle({ fontSize: 14, fontWeight: 'bold', fill: 0xffffff }),
    })
    this.p1NameTxt.x = 66; this.p1NameTxt.y = 12
    this.addChild(this.p1NameTxt)

    this.p1ScoreTxt = new Text({
      text: '0 VÁN',
      style: new TextStyle({ fontSize: 22, fontWeight: 'bold', fill: 0xf7c948 }),
    })
    this.p1ScoreTxt.x = 66; this.p1ScoreTxt.y = 33
    this.addChild(this.p1ScoreTxt)

    // === PHẢI: Player 2 ===
    const p2Box = new Graphics()
    p2Box.roundRect(w - 228, 5, 220, 70, 8).fill({ color: 0x111827, alpha: 0.95 })
    this.addChild(p2Box)

    const av2 = new Graphics()
    av2.roundRect(w - 60, 11, 46, 46, 8).fill(0x1e2d3d)
    av2.circle(w - 37, 25, 10).fill(0x4a6080)
    av2.circle(w - 37, 43, 15).fill(0x4a6080)
    this.addChild(av2)

    this.p2NameTxt = new Text({
      text: state.player2.name,
      style: new TextStyle({ fontSize: 14, fontWeight: 'bold', fill: 0xffffff }),
    })
    this.p2NameTxt.anchor.set(1, 0)
    this.p2NameTxt.x = w - 66; this.p2NameTxt.y = 12
    this.addChild(this.p2NameTxt)

    this.p2ScoreTxt = new Text({
      text: '0 VÁN',
      style: new TextStyle({ fontSize: 22, fontWeight: 'bold', fill: 0xf7c948 }),
    })
    this.p2ScoreTxt.anchor.set(1, 0)
    this.p2ScoreTxt.x = w - 66; this.p2ScoreTxt.y = 33
    this.addChild(this.p2ScoreTxt)

    // === GIỮA: 9 bóng tracking ===
    const cx = w / 2
    const ballColors: Record<number, number> = {
      1:0xf7c948, 2:0x1e3faa, 3:0xcc2222, 4:0x7b3fa0,
      5:0xe8601c, 6:0x1a7a3c, 7:0x7a1a1a, 8:0x111111, 9:0xf7c948,
    }
    const dotGap = 32
    const dotsX0 = cx - (8 * dotGap) / 2

    for (let i = 1; i <= 9; i++) {
      const dx = dotsX0 + (i - 1) * dotGap
      const dy = 40

      const dotBg = new Graphics()
      dotBg.circle(dx, dy, 13).fill(ballColors[i])
      if (i === 9) dotBg.circle(dx, dy, 13).stroke({ color: 0xffffff, width: 1.5 })
      this.addChild(dotBg)

      const lbl = new Text({
        text: String(i),
        style: new TextStyle({
          fontSize: 10, fontWeight: 'bold',
          fill: i === 8 ? 0xffffff : 0x111111,
        }),
      })
      lbl.anchor.set(0.5)
      lbl.x = dx; lbl.y = dy
      this.addChild(lbl)

      this.ballDots.set(i, { bg: dotBg, lbl })
    }

    // Turn arrow graphics
    this.turnArrow = new Graphics()
    this.addChild(this.turnArrow)

    this.update(state, new Set(), 1)
  }

  update(state: GameState, pocketed: Set<number>, lowestBall: number) {
    this.p1ScoreTxt.text = `${state.player1.score} VÁN`
    this.p2ScoreTxt.text = `${state.player2.score} VÁN`
    this.p1NameTxt.text  = state.player1.name
    this.p2NameTxt.text  = state.player2.name

    // Dim bóng đã vào lỗ, highlight target
    this.ballDots.forEach((dot, num) => {
      if (pocketed.has(num)) {
        dot.bg.alpha = 0.15; dot.lbl.alpha = 0.15
      } else if (num === lowestBall) {
        dot.bg.alpha = 1; dot.lbl.alpha = 1
        // pulse border xung quanh bóng target
      } else {
        dot.bg.alpha = 0.75; dot.lbl.alpha = 0.75
      }
    })

    // Turn indicator
    this.turnArrow.clear()
    const isP1 = state.currentPlayer === 0
    const gold = 0xf7c948
    const dim  = 0x1a2030

    // Thanh dưới box player đang đánh
    this.turnArrow.rect(8,             73, 220, 3).fill(isP1 ? gold : dim)
    this.turnArrow.rect(this.SCREEN_W - 228, 73, 220, 3).fill(isP1 ? dim : gold)

    // Mũi tên tam giác nhỏ
    if (isP1) {
      this.turnArrow.poly([232, 26,  248, 20,  248, 32]).fill(gold)
    } else {
      this.turnArrow.poly([this.SCREEN_W - 232, 26,  this.SCREEN_W - 248, 20,  this.SCREEN_W - 248, 32]).fill(gold)
    }

    // Label lượt
    if (!this._turnLabelP1) {
      this._turnLabelP1 = new Text({
        text: '▶ LƯỢT CỦA BẠN',
        style: new TextStyle({ fontSize: 11, fill: 0xf7c948, fontWeight: 'bold' }),
      })
      this._turnLabelP1.x = 66; this._turnLabelP1.y = 58
      this.addChild(this._turnLabelP1)
    }
    if (!this._turnLabelP2) {
      this._turnLabelP2 = new Text({
        text: '▶ LƯỢT CỦA BẠN',
        style: new TextStyle({ fontSize: 11, fill: 0xf7c948, fontWeight: 'bold' }),
      })
      this._turnLabelP2.anchor.set(1, 0)
      this._turnLabelP2.x = this.SCREEN_W - 66; this._turnLabelP2.y = 58
      this.addChild(this._turnLabelP2)
    }
    this._turnLabelP1.visible = isP1
    this._turnLabelP2.visible = !isP1
  }

  // Bóng rơi vào lỗ → hiện trong thanh dọc bên phải bàn
  animateBallIn(ballNum: number) {
    if (ballNum === 0) return
    if (this.pocketedBalls.includes(ballNum)) return
    this.pocketedBalls.push(ballNum)
    this._rebuildStrip()
  }

  clearPocketed() {
    this.pocketedBalls = []
    this._rebuildStrip()
  }

  private _rebuildStrip() {
    this.pocketedStrip.removeChildren()

    const ballColors: Record<number, number> = {
      1:0xf7c948, 2:0x1e3faa, 3:0xcc2222, 4:0x7b3fa0,
      5:0xe8601c, 6:0x1a7a3c, 7:0x7a1a1a, 8:0x111111, 9:0xf7c948,
    }

    const R = 16           // bán kính bóng trong thanh
    const stripX = this.SCREEN_W - R - 8   // sát mép phải màn hình
    const startY = 90      // bắt đầu từ dưới HUD
    const gap    = R * 2 + 8

    // Nền thanh dọc
    const totalH = this.pocketedBalls.length * gap + 16
    if (totalH > 20) {
      const stripBg = new Graphics()
      stripBg.roundRect(stripX - R - 6, startY - 8, R * 2 + 12, totalH, 10)
        .fill({ color: 0x0a0f1e, alpha: 0.85 })
      stripBg.roundRect(stripX - R - 6, startY - 8, R * 2 + 12, totalH, 10)
        .stroke({ color: 0xf7c948, width: 1, alpha: 0.5 })
      this.pocketedStrip.addChild(stripBg)
    }

    this.pocketedBalls.forEach((num, i) => {
      const bx = stripX
      const by = startY + i * gap + R

      const g = new Graphics()
      const col = ballColors[num] ?? 0xffffff

      // Bóng 9 có sọc
      if (num === 9) {
        g.circle(bx, by, R).fill(0xffffff)
        g.rect(bx - R, by - R * 0.4, R * 2, R * 0.8).fill(col)
        g.circle(bx, by, R).stroke({ color: 0xdddddd, width: 1 })
      } else {
        g.circle(bx, by, R).fill(col)
      }

      // Dot trắng + số
      if (num !== 0) {
        g.circle(bx, by, R * 0.45).fill(0xffffff)
      }
      this.pocketedStrip.addChild(g)

      const lbl = new Text({
        text: String(num),
        style: new TextStyle({
          fontSize: 11, fontWeight: 'bold',
          fill: num === 8 ? 0xffffff : 0x111111,
        }),
      })
      lbl.anchor.set(0.5)
      lbl.x = bx; lbl.y = by
      this.pocketedStrip.addChild(lbl)
    })
  }
}