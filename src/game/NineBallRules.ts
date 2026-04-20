import type { BallBody } from '../physics/BallBody'
import type { GameState } from './GameState'

export class NineBallRules {
  private pocketedThisTurn: number[] = []
  private cueScratch     = false
  private wrongFirstHit  = false
  private hitRegistered  = false  // đã có va chạm hợp lệ chưa

  constructor(private state: GameState) {}

  resetTurn() {
    this.pocketedThisTurn = []
    this.cueScratch       = false
    this.wrongFirstHit    = false
    this.hitRegistered    = false
  }

  // Gọi khi cue ball chạm bóng đầu tiên trong lượt
  onFirstHit(ballNumber: number, lowestOnTable: number) {
    if (this.hitRegistered) return  // chỉ tính lần chạm đầu tiên
    this.hitRegistered = true
    if (ballNumber !== lowestOnTable) {
      this.wrongFirstHit = true  // phạm lỗi: chạm sai bóng
    }
  }

  onBallPocketed(ballNumber: number) {
    if (ballNumber === 0) {
      this.cueScratch = true  // cue ball xuống lỗ = foul
    } else {
      this.pocketedThisTurn.push(ballNumber)
    }
  }

  resolveTurn(_balls: BallBody[]): {
    foul:       boolean
    nineBallWin: boolean
    scored:     boolean
    switchTurn: boolean
  } {
    const ninePocketed = this.pocketedThisTurn.includes(9)
    const noHit        = !this.hitRegistered  // không chạm bóng nào = foul
    const foul         = this.cueScratch || this.wrongFirstHit || noHit

    // Nếu foul + bóng 9 vào lỗ → KHÔNG thắng, đổi lượt (theo luật 9-ball)
    if (foul) {
      this.state.foulThisTurn = true
      this.state.ballInHand   = true
      return { foul: true, nineBallWin: false, scored: false, switchTurn: true }
    }

    // Bóng 9 vào lỗ hợp lệ (không foul) → thắng ván
    if (ninePocketed) {
      this.state.winRack()
      return { foul: false, nineBallWin: true, scored: true, switchTurn: false }
    }

    const scored = this.pocketedThisTurn.length > 0
    // Nếu bỏ được bóng → tiếp tục đánh; không bỏ được → đổi lượt
    return { foul: false, nineBallWin: false, scored, switchTurn: !scored }
  }

  getLowestBall(balls: BallBody[]): number {
    const nums = balls
      .filter(b => !b.isPocketed && b.ballNumber !== 0)
      .map(b => b.ballNumber)
      .sort((a, b) => a - b)
    return nums[0] ?? 9
  }
}