import { Container, Graphics, Text, TextStyle } from 'pixi.js'
import type { GameMode } from '../game/GameState'

export class ModeScreen extends Container {
  public onSelect?: (mode: GameMode, p1: string, p2: string) => void
  public onBack?: () => void

  constructor(w: number, h: number) {
    super()

    const bg = new Graphics()
    bg.rect(0, 0, w, h).fill(0x0d1b2e)
    this.addChild(bg)

    const title = new Text({
      text: 'CHỌN CHẾ ĐỘ CHƠI',
      style: new TextStyle({ fontSize: 42, fontWeight: 'bold', fill: 0xf7c948 }),
    })
    title.anchor.set(0.5)
    title.x = w / 2
    title.y = h * 0.15
    this.addChild(title)

    // Tên người chơi
    const p1Label = this.makeLabel('Người chơi 1:', w * 0.5, h * 0.28)
    this.addChild(p1Label)
    const p2Label = this.makeLabel('Người chơi 2:', w * 0.5, h * 0.37)
    this.addChild(p2Label)

    // Input tên (HTML overlay vì Pixi không có input native)
    // Dùng tên mặc định, có thể đổi sau
    let p1Name = 'Người 1'
    let p2Name = 'Người 2'

    // Tạo input HTML
    const input1 = document.createElement('input')
    input1.value = p1Name
    input1.placeholder = 'Tên người chơi 1'
    Object.assign(input1.style, {
      position: 'fixed', left: `${w * 0.55}px`, top: `${h * 0.265}px`,
      width: '180px', height: '32px', fontSize: '16px',
      borderRadius: '6px', border: '2px solid #1a9e7a',
      padding: '0 8px', background: '#1a2a3a', color: '#fff', zIndex: '10',
    })
    document.body.appendChild(input1)
    input1.addEventListener('input', () => p1Name = input1.value || 'Người 1')

    const input2 = document.createElement('input')
    input2.value = p2Name
    input2.placeholder = 'Tên người chơi 2'
    Object.assign(input2.style, {
      position: 'fixed', left: `${w * 0.55}px`, top: `${h * 0.355}px`,
      width: '180px', height: '32px', fontSize: '16px',
      borderRadius: '6px', border: '2px solid #1a9e7a',
      padding: '0 8px', background: '#1a2a3a', color: '#fff', zIndex: '10',
    })
    document.body.appendChild(input2)
    input2.addEventListener('input', () => p2Name = input2.value || 'Người 2')

    // Hàm dọn input khi rời màn hình
    this.on('destroyed', () => {
      input1.remove()
      input2.remove()
    })

    // 3 nút chế độ
    const modes: { label: string; sub: string; mode: GameMode }[] = [
      { label: 'CHẠM 3', sub: 'Thắng 3 ván', mode: 'race3' },
      { label: 'CHẠM 5', sub: 'Thắng 5 ván', mode: 'race5' },
      { label: 'CHẠM 7', sub: 'Thắng 7 ván', mode: 'race7' },
    ]

    const btnW = 200
    const totalW = btnW * 3 + 40 * 2
    const startX = (w - totalW) / 2

    modes.forEach((m, i) => {
      const isPopular = i === 1
      const color = isPopular ? 0xf7c948 : 0x1a3a5a
      const textColor = isPopular ? 0x111111 : 0xffffff
      const ct = this.makeModeBtn(
        startX + i * (btnW + 40) + btnW / 2,
        h * 0.6,
        m.label, m.sub, color, textColor, isPopular,
        () => {
          input1.remove()
          input2.remove()
          this.onSelect?.(m.mode, p1Name, p2Name)
        }
      )
      this.addChild(ct)
    })

    // Nút back
    const back = this.makeSmallBtn('← QUAY LẠI', w * 0.12, h * 0.88, () => {
      input1.remove()
      input2.remove()
      this.onBack?.()
    })
    this.addChild(back)
  }

  private makeLabel(text: string, x: number, y: number): Text {
    const t = new Text({ text, style: new TextStyle({ fontSize: 20, fill: 0xaaaaaa }) })
    t.anchor.set(1, 0.5)
    t.x = x * 0.98
    t.y = y
    return t
  }

  private makeModeBtn(
    x: number, y: number,
    label: string, sub: string,
    bgColor: number, textColor: number,
    popular: boolean,
    onClick: () => void
  ): Container {
    const ct = new Container()
    ct.eventMode = 'static'
    ct.cursor = 'pointer'

    const bg = new Graphics()
    bg.roundRect(-100, -70, 200, 140, 16).fill(bgColor)
    if (popular) bg.roundRect(-100, -70, 200, 140, 16).stroke({ color: 0xffffff, width: 2 })
    ct.addChild(bg)

    if (popular) {
      const badge = new Text({
        text: 'PHỔ BIẾN',
        style: new TextStyle({ fontSize: 13, fill: 0x1a9e7a, fontWeight: 'bold' }),
      })
      badge.anchor.set(0.5)
      badge.y = -55
      ct.addChild(badge)
    }

    const num = new Text({
      text: label.split(' ')[1],
      style: new TextStyle({ fontSize: 44, fontWeight: 'bold', fill: textColor }),
    })
    num.anchor.set(0.5)
    num.y = -10
    ct.addChild(num)

    const lbl = new Text({
      text: label,
      style: new TextStyle({ fontSize: 18, fontWeight: 'bold', fill: textColor }),
    })
    lbl.anchor.set(0.5)
    lbl.y = 30
    ct.addChild(lbl)

    const subTxt = new Text({
      text: sub,
      style: new TextStyle({ fontSize: 14, fill: popular ? 0x333333 : 0x888888 }),
    })
    subTxt.anchor.set(0.5)
    subTxt.y = 52
    ct.addChild(subTxt)

    ct.x = x
    ct.y = y
    ct.on('pointerover', () => { bg.tint = 0xdddddd })
    ct.on('pointerout',  () => { bg.tint = 0xffffff })
    ct.on('pointertap',  onClick)
    return ct
  }

  private makeSmallBtn(label: string, x: number, y: number, onClick: () => void): Container {
    const ct = new Container()
    ct.eventMode = 'static'
    ct.cursor = 'pointer'
    const bg = new Graphics()
    bg.roundRect(-80, -20, 160, 40, 8).fill(0x333333)
    ct.addChild(bg)
    const txt = new Text({ text: label, style: new TextStyle({ fontSize: 18, fill: 0xffffff }) })
    txt.anchor.set(0.5)
    ct.addChild(txt)
    ct.x = x; ct.y = y
    ct.on('pointertap', onClick)
    return ct
  }
}