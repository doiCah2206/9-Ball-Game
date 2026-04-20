import { Container, Graphics, Text, TextStyle } from 'pixi.js'

export class ResultScreen extends Container {
  public onPlayAgain?: () => void
  public onMenu?: () => void

  constructor(
    w: number, h: number,
    winnerName: string,
    p1Score: number, p2Score: number,
    p1Name: string, p2Name: string
  ) {
    super()

    // Overlay tối
    const overlay = new Graphics()
    overlay.rect(0, 0, w, h).fill({ color: 0x000000, alpha: 0.75 })
    this.addChild(overlay)

    // Panel chính
    const panelW = Math.min(700, w * 0.8)
    const panelH = 420
    const px = (w - panelW) / 2
    const py = (h - panelH) / 2

    const panel = new Graphics()
    panel.roundRect(px, py, panelW, panelH, 20)
      .fill({ color: 0x0a0f1e, alpha: 0.97 })
    panel.roundRect(px, py, panelW, panelH, 20)
      .stroke({ color: 0xf7c948, width: 2 })
    this.addChild(panel)

    const isP1Winner = winnerName === p1Name

    // Crown icon (bên thắng)
    const crownSize = 50
    const crownX = isP1Winner ? px + 60 : px + panelW - 60
    this.drawCrown(crownX, py + 80, crownSize)

    // X icon (bên thua)
    const xX = isP1Winner ? px + panelW - 60 : px + 60
    this.drawX(xX, py + 80, 36)

    // Tiêu đề kết quả
    const isWin = true // màn hình này luôn hiện người thắng
    const resultTitle = new Text({
      text: `${winnerName} THẮNG CHUNG CUỘC!`,
      style: new TextStyle({
        fontSize: 26, fontWeight: 'bold', fill: 0xffffff,
        dropShadow: { color: 0x000000, distance: 3, blur: 4 },
      }),
    })
    resultTitle.anchor.set(0.5)
    resultTitle.x = w / 2
    resultTitle.y = py + 55
    this.addChild(resultTitle)

    // Avatars + Scores
    this.drawPlayerCard(px + 30, py + 100, panelW * 0.42, p1Name, p1Score, isP1Winner)
    this.drawPlayerCard(px + panelW * 0.58, py + 100, panelW * 0.42, p2Name, p2Score, !isP1Winner)

    // Message lớn ở giữa
    const msgTxt = new Text({
      text: `XIN CHÚC MỪNG ${winnerName.toUpperCase()}!`,
      style: new TextStyle({
        fontSize: 30, fontWeight: 'bold', fill: 0xf7c948,
        dropShadow: { color: 0x000000, distance: 4, blur: 6 },
      }),
    })
    msgTxt.anchor.set(0.5)
    msgTxt.x = w / 2
    msgTxt.y = py + 230
    this.addChild(msgTxt)

    // Nút CHƠI TIẾP
    const btn1 = this.makeBtn('CHƠI TIẾP', w / 2 - 120, py + panelH - 65, 0xf7c948, 0x111111, () => this.onPlayAgain?.())
    this.addChild(btn1)

    // Nút MENU
    const btn2 = this.makeBtn('MENU', w / 2 + 120, py + panelH - 65, 0xe8601c, 0xffffff, () => this.onMenu?.())
    this.addChild(btn2)
  }

  private drawPlayerCard(x: number, y: number, cardW: number, name: string, score: number, isWinner: boolean) {
    const cardH = 110
    const card = new Graphics()
    card.roundRect(x, y, cardW, cardH, 10)
      .fill({ color: isWinner ? 0x1a3a1a : 0x1a1a2a, alpha: 0.9 })
    if (isWinner) {
      card.roundRect(x, y, cardW, cardH, 10)
        .stroke({ color: 0xf7c948, width: 1.5 })
    }
    this.addChild(card)

    // Avatar
    const av = new Graphics()
    av.roundRect(x + 10, y + 10, 50, 50, 6).fill(0x2a3a4a)
    av.roundRect(x + 10, y + 10, 50, 50, 6).stroke({ color: isWinner ? 0xf7c948 : 0x4a5a6a, width: 1.5 })
    this.addChild(av)

    const nameTxt = new Text({
      text: name,
      style: new TextStyle({ fontSize: 16, fontWeight: 'bold', fill: 0xffffff }),
    })
    nameTxt.x = x + 68; nameTxt.y = y + 14
    this.addChild(nameTxt)

    const scoreTxt = new Text({
      text: `${score} VÁN THẮNG`,
      style: new TextStyle({ fontSize: 13, fill: isWinner ? 0xf7c948 : 0x888888 }),
    })
    scoreTxt.x = x + 68; scoreTxt.y = y + 38
    this.addChild(scoreTxt)
  }

  private drawCrown(cx: number, cy: number, size: number) {
    const g = new Graphics()
    // Thân vương miện đơn giản bằng polygon
    g.poly([
      cx - size * 0.5, cy + size * 0.3,
      cx - size * 0.5, cy - size * 0.1,
      cx - size * 0.3, cy + size * 0.1,
      cx, cy - size * 0.4,
      cx + size * 0.3, cy + size * 0.1,
      cx + size * 0.5, cy - size * 0.1,
      cx + size * 0.5, cy + size * 0.3,
    ]).fill(0xf7c948)
    g.poly([
      cx - size * 0.5, cy + size * 0.3,
      cx - size * 0.5, cy - size * 0.1,
      cx - size * 0.3, cy + size * 0.1,
      cx, cy - size * 0.4,
      cx + size * 0.3, cy + size * 0.1,
      cx + size * 0.5, cy - size * 0.1,
      cx + size * 0.5, cy + size * 0.3,
    ]).stroke({ color: 0xe8601c, width: 1.5 })
    // Đế
    g.rect(cx - size * 0.5, cy + size * 0.3, size, size * 0.2).fill(0xf7c948)
    // Ngôi sao nhỏ
    g.circle(cx, cy + size * 0.05, size * 0.1).fill(0xffffff)
    g.circle(cx - size * 0.25, cy + size * 0.2, size * 0.07).fill(0xffffff)
    g.circle(cx + size * 0.25, cy + size * 0.2, size * 0.07).fill(0xffffff)
    this.addChild(g)
  }

  private drawX(cx: number, cy: number, size: number) {
    const g = new Graphics()
    g.circle(cx, cy, size * 0.8).fill(0x3a1a1a)
    g.circle(cx, cy, size * 0.8).stroke({ color: 0x884444, width: 2 })
    g.moveTo(cx - size * 0.4, cy - size * 0.4)
      .lineTo(cx + size * 0.4, cy + size * 0.4)
      .stroke({ color: 0xcc4444, width: 4 })
    g.moveTo(cx + size * 0.4, cy - size * 0.4)
      .lineTo(cx - size * 0.4, cy + size * 0.4)
      .stroke({ color: 0xcc4444, width: 4 })
    this.addChild(g)
  }

  private makeBtn(label: string, cx: number, cy: number, bgColor: number, textColor: number, onClick: () => void): Container {
    const ct = new Container()
    ct.eventMode = 'static'
    ct.cursor = 'pointer'

    const bg = new Graphics()
    bg.roundRect(-100, -26, 200, 52, 12).fill(bgColor)
    ct.addChild(bg)

    const txt = new Text({
      text: label,
      style: new TextStyle({ fontSize: 20, fontWeight: 'bold', fill: textColor }),
    })
    txt.anchor.set(0.5)
    ct.addChild(txt)

    ct.x = cx; ct.y = cy
    ct.on('pointerover', () => { bg.alpha = 0.8 })
    ct.on('pointerout', () => { bg.alpha = 1 })
    ct.on('pointertap', onClick)
    return ct
  }
}