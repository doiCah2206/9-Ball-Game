import type { Application, Container } from 'pixi.js'

export class ScreenManager {
  private current: Container | null = null

  constructor(private app: Application) {}

  show(screen: Container) {
    if (this.current) {
      this.app.stage.removeChild(this.current)
    }
    this.current = screen
    this.app.stage.addChild(screen)
  }

  hide() {
    if (this.current) {
      this.app.stage.removeChild(this.current)
      this.current = null
    }
  }
}