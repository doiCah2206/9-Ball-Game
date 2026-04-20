export type Player = { name: string; score: number }
export type GameMode = 'race3' | 'race5' | 'race7'
export type TurnPhase = 'aiming' | 'shooting' | 'waiting'

export class GameState {
  player1: Player
  player2: Player
  currentPlayer: 0 | 1
  mode: GameMode
  raceTo: number
  ballsPocketed: Set<number>
  lowestBallOnTable: number
  phase: TurnPhase
  foulThisTurn: boolean
  ballInHand: boolean

  constructor(p1Name: string, p2Name: string, mode: GameMode) {
    this.player1 = { name: p1Name, score: 0 }
    this.player2 = { name: p2Name, score: 0 }
    this.currentPlayer = 0
    this.mode = mode
    this.raceTo = mode === 'race3' ? 3 : mode === 'race5' ? 5 : 7
    this.ballsPocketed = new Set()
    this.lowestBallOnTable = 1
    this.phase = 'aiming'
    this.foulThisTurn = false
    this.ballInHand = false
  }

  get currentPlayerObj(): Player {
    return this.currentPlayer === 0 ? this.player1 : this.player2
  }

  get opponentObj(): Player {
    return this.currentPlayer === 0 ? this.player2 : this.player1
  }

  switchTurn() {
    this.currentPlayer = this.currentPlayer === 0 ? 1 : 0
    this.foulThisTurn = false
    this.ballInHand = false
  }

  winRack() {
    this.currentPlayerObj.score++
  }

  get isMatchOver(): boolean {
    return this.player1.score >= this.raceTo || this.player2.score >= this.raceTo
  }

  get winner(): Player | null {
    if (this.player1.score >= this.raceTo) return this.player1
    if (this.player2.score >= this.raceTo) return this.player2
    return null
  }
}