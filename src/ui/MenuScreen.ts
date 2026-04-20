import { Container, Graphics, Text, TextStyle } from 'pixi.js'

export class MenuScreen extends Container {
  public onPlay?: () => void
  public onHowTo?: () => void

  constructor(w: number, h: number) {
    super()

    // Nền tối
    const bg = new Graphics()
    bg.rect(0, 0, w, h).fill(0x0d1118)
    this.addChild(bg)

    // Viền vàng trang trí góc
    this.addChild(this.makeCornerDeco(w, h))

    // Logo "9 BALL"
    const logo = new Text({
      text: '9 BALL',
      style: new TextStyle({
        fontSize: Math.min(w * 0.12, 100),
        fontWeight: 'bold',
        fill: 0xf7c948,
        fontFamily: 'Impact, Arial Black, sans-serif',
        dropShadow: { color: 0xe8601c, distance: 6, blur: 8, angle: Math.PI / 4 },
      }),
    })
    logo.anchor.set(0.5)
    logo.x = w / 2
    logo.y = h * 0.22
    this.addChild(logo)

    // Subtitle
    const sub = new Text({
      text: '— BY NHÓM 17 —',
      style: new TextStyle({ fontSize: 18, fill: 0xaaaaaa, letterSpacing: 4 }),
    })
    sub.anchor.set(0.5)
    sub.x = w / 2
    sub.y = h * 0.33
    this.addChild(sub)

    // Đường kẻ trang trí
    const line = new Graphics()
    line.moveTo(w / 2 - 120, h * 0.37).lineTo(w / 2 + 120, h * 0.37)
      .stroke({ color: 0xf7c948, width: 1, alpha: 0.5 })
    this.addChild(line)

    // 4 nút giống PPTX
    const btns = [
      { label: 'CHƠI VỚI MÁY', icon: '🤖', color: 0xf7c948, textColor: 0x111111, cb: () => this.onPlay?.() },
      { label: 'CHƠI VỚI NGƯỜI', icon: '👥', color: 0x1a2a3a, textColor: 0xffffff, cb: () => this.onPlay?.() },
      { label: 'LUYỆN TẬP', icon: '🎯', color: 0x1a2a3a, textColor: 0xffffff, cb: () => this.onPlay?.() },
      { label: 'HƯỚNG DẪN CHƠI', icon: '❓', color: 0x1a2a3a, textColor: 0xaaaaaa, cb: () => this.onHowTo?.() },
    ]

    const btnW = Math.min(w * 0.45, 320)
    const btnH = 54
    const gap = 14
    const totalH = btns.length * btnH + (btns.length - 1) * gap
    const startY = h * 0.44

    btns.forEach((b, i) => {
      const ct = this.makeBtn(
        w / 2, startY + i * (btnH + gap),
        btnW, btnH,
        b.label, b.icon, b.color, b.textColor, b.cb
      )
      this.addChild(ct)
    })
  }

  private makeBtn(
    cx: number, cy: number,
    bw: number, bh: number,
    label: string, icon: string,
    bgColor: number, textColor: number,
    onClick: () => void
  ): Container {
    const ct = new Container()
    ct.eventMode = 'static'
    ct.cursor = 'pointer'

    const bg = new Graphics()
    bg.roundRect(-bw / 2, -bh / 2, bw, bh, 10).fill(bgColor)
    bg.roundRect(-bw / 2, -bh / 2, bw, bh, 10).stroke({ color: 0xf7c948, width: 1, alpha: 0.3 })
    ct.addChild(bg)

    const iconTxt = new Text({
      text: icon,
      style: new TextStyle({ fontSize: 22 }),
    })
    iconTxt.anchor.set(0, 0.5)
    iconTxt.x = -bw / 2 + 20
    iconTxt.y = 0
    ct.addChild(iconTxt)

    const txt = new Text({
      text: label,
      style: new TextStyle({ fontSize: 18, fontWeight: 'bold', fill: textColor }),
    })
    txt.anchor.set(0.5)
    txt.x = bw * 0.05
    ct.addChild(txt)

    ct.x = cx; ct.y = cy

    ct.on('pointerover', () => { bg.alpha = 0.8 })
    ct.on('pointerout', () => { bg.alpha = 1 })
    ct.on('pointertap', onClick)
    return ct
  }

  private makeCornerDeco(w: number, h: number): Graphics {
    const g = new Graphics()
    const s = 40
    // 4 góc
    ;[
      [0, 0], [w, 0], [0, h], [w, h]
    ].forEach(([cx, cy]) => {
      const dx = cx === 0 ? 1 : -1
      const dy = cy === 0 ? 1 : -1
      g.moveTo(cx + dx * s, cy).lineTo(cx, cy).lineTo(cx, cy + dy * s)
        .stroke({ color: 0xf7c948, width: 2, alpha: 0.5 })
    })
    return g
  }
}