import { Container, Graphics, Text, TextStyle } from 'pixi.js'

export class HowToScreen extends Container {
  public onBack?: () => void

  constructor(w: number, h: number) {
    super()

    // Nền
    const bg = new Graphics()
    bg.rect(0, 0, w, h).fill(0x0d1118)
    this.addChild(bg)

    // Header bar
    const header = new Graphics()
    header.rect(0, 0, w, 56).fill(0x0a0f1e)
    header.rect(0, 54, w, 2).fill(0xf7c948)
    this.addChild(header)

    const headerTitle = new Text({
      text: '9 BALL BY NHÓM 17',
      style: new TextStyle({ fontSize: 18, fontWeight: 'bold', fill: 0xf7c948, letterSpacing: 2 }),
    })
    headerTitle.anchor.set(0.5)
    headerTitle.x = w / 2; headerTitle.y = 27
    this.addChild(headerTitle)

    // Nút quay lại
    const backBtn = new Container()
    backBtn.eventMode = 'static'; backBtn.cursor = 'pointer'
    const backBg = new Graphics()
    backBg.roundRect(0, 0, 110, 34, 8).fill({ color: 0xffffff, alpha: 0 })
    backBtn.addChild(backBg)
    const backTxt = new Text({
      text: '← QUAY LẠI',
      style: new TextStyle({ fontSize: 15, fill: 0xf7c948, fontWeight: 'bold' }),
    })
    backTxt.y = 8; backTxt.x = 5
    backBtn.addChild(backTxt)
    backBtn.x = 20; backBtn.y = 11
    backBtn.on('pointertap', () => this.onBack?.())
    this.addChild(backBtn)

    // Tiêu đề
    const title = new Text({
      text: 'HƯỚNG DẪN CHƠI',
      style: new TextStyle({
        fontSize: Math.min(w * 0.05, 44),
        fontWeight: 'bold', fill: 0xf7c948,
        dropShadow: { color: 0x000000, distance: 3, blur: 6 },
      }),
    })
    title.anchor.set(0.5)
    title.x = w / 2; title.y = h * 0.14
    this.addChild(title)

    // 3 card chính
    const cards = [
      {
        icon: '⭐',
        title: 'Mục tiêu',
        body: 'Đưa quả bi số 9 vào lỗ bất kể trong cú đánh trực tiếp hay gián tiếp.',
      },
      {
        icon: '🎱',
        title: 'Cách đánh',
        body: 'Người chơi phải chạm quả bi có số nhỏ nhất hiện có trên bàn đầu tiên trong mọi cú đánh.',
      },
      {
        icon: '🏆',
        title: 'Cách thắng',
        body: 'Thắng đủ số ván mục tiêu theo quy định của trận đấu (Chạm 3, 5, hoặc 7).',
      },
    ]

    const cardW = Math.min((w - 80) / 3, 280)
    const cardH = 180
    const gapX = (w - cardW * 3) / 4
    const cardY = h * 0.25

    cards.forEach((c, i) => {
      const cx = gapX + i * (cardW + gapX)
      this.addChild(this.makeCard(cx, cardY, cardW, cardH, c.icon, c.title, c.body))
    })

    // Tip box
    const tipY = h * 0.57
    const tipW = Math.min(w * 0.65, 700)
    const tipX = (w - tipW) / 2

    const tipBox = new Graphics()
    tipBox.roundRect(tipX, tipY, tipW, 100, 12).fill({ color: 0x1a2a1a, alpha: 0.9 })
    tipBox.roundRect(tipX, tipY, tipW, 100, 12).stroke({ color: 0xf7c948, width: 1 })
    this.addChild(tipBox)

    const tipLabel = new Text({
      text: '🟡 MẸO CHUYÊN NGHIỆP',
      style: new TextStyle({ fontSize: 13, fontWeight: 'bold', fill: 0xf7c948 }),
    })
    tipLabel.x = tipX + 16; tipLabel.y = tipY + 14
    this.addChild(tipLabel)

    const tipBody = new Text({
      text: 'Việc điều bi sau cú đánh đầu tiên là vô cùng quan trọng. Hãy luôn tính toán vị trí của bi cái cho cú đánh tiếp theo dựa trên thứ tự các số.',
      style: new TextStyle({
        fontSize: 14, fill: 0xcccccc,
        wordWrap: true, wordWrapWidth: tipW - 32,
      }),
    })
    tipBody.x = tipX + 16; tipBody.y = tipY + 38
    this.addChild(tipBody)

    // Controls
    const controls = [
      { key: 'Di chuyển chuột', desc: 'Ngắm hướng bắn' },
      { key: 'Nhấn giữ chuột', desc: 'Kéo để tích lực (xa = mạnh hơn)' },
      { key: 'Thả chuột', desc: 'Bắn cue ball' },
    ]

    const ctrlY = h * 0.72
    controls.forEach((c, i) => {
      const row = new Container()
      const keyTxt = new Text({
        text: c.key,
        style: new TextStyle({ fontSize: 14, fontWeight: 'bold', fill: 0xf7c948 }),
      })
      row.addChild(keyTxt)
      const descTxt = new Text({
        text: `→ ${c.desc}`,
        style: new TextStyle({ fontSize: 14, fill: 0xbbbbbb }),
      })
      descTxt.x = 200
      row.addChild(descTxt)
      row.x = w * 0.2
      row.y = ctrlY + i * 30
      this.addChild(row)
    })

    // Nút quay lại bottom
    const backBottom = this.makeBackBtn(w / 2, h * 0.92, () => this.onBack?.())
    this.addChild(backBottom)
  }

  private makeCard(x: number, y: number, cw: number, ch: number, icon: string, title: string, body: string): Container {
    const ct = new Container()

    const bg = new Graphics()
    bg.roundRect(0, 0, cw, ch, 14).fill({ color: 0x111827, alpha: 0.95 })
    bg.roundRect(0, 0, cw, ch, 14).stroke({ color: 0x2a3a4a, width: 1 })
    ct.addChild(bg)

    const iconTxt = new Text({ text: icon, style: new TextStyle({ fontSize: 28 }) })
    iconTxt.anchor.set(0.5)
    iconTxt.x = cw / 2; iconTxt.y = 30
    ct.addChild(iconTxt)

    const titleTxt = new Text({
      text: title,
      style: new TextStyle({ fontSize: 17, fontWeight: 'bold', fill: 0xffffff }),
    })
    titleTxt.anchor.set(0.5)
    titleTxt.x = cw / 2; titleTxt.y = 68
    ct.addChild(titleTxt)

    const bodyTxt = new Text({
      text: body,
      style: new TextStyle({
        fontSize: 13, fill: 0xaaaaaa,
        wordWrap: true, wordWrapWidth: cw - 24,
        align: 'center',
      }),
    })
    bodyTxt.anchor.set(0.5, 0)
    bodyTxt.x = cw / 2; bodyTxt.y = 92
    ct.addChild(bodyTxt)

    ct.x = x; ct.y = y
    return ct
  }

  private makeBackBtn(cx: number, cy: number, onClick: () => void): Container {
    const ct = new Container()
    ct.eventMode = 'static'; ct.cursor = 'pointer'
    const bg = new Graphics()
    bg.roundRect(-110, -24, 220, 48, 10).fill(0x1a9e7a)
    ct.addChild(bg)
    const txt = new Text({
      text: '← QUAY LẠI MENU',
      style: new TextStyle({ fontSize: 18, fontWeight: 'bold', fill: 0xffffff }),
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