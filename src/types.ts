export type ScreenName = 'menu' | 'mode-select' | 'how-to-play' | 'game' | 'practice';
export type GameMode = 'vs-ai' | 'vs-player' | 'practice';
export type TurnPhase =
  | 'ball-in-hand'
  | 'aiming'
  | 'shooting'
  | 'resolving'
  | 'game-over';

export interface BallState {
  id: number;   // 0 = cue ball, 1-9 = numbered balls
  x: number;
  y: number;
  vx: number;
  vy: number;
  pocketed: boolean;
}

export interface GameConfig {
  mode: GameMode;
  winsNeeded: number;   // 3, 5, or 7
  player1Name: string;
  player2Name: string;
}

export interface GameState {
  config: GameConfig;
  balls: BallState[];
  currentPlayer: 0 | 1;
  scores: [number, number];
  phase: TurnPhase;
  isBreakShot: boolean;
  foulMessage: string;
  firstContactBallId: number | null;
  hasCushionContact: boolean;
  ballPocketedThisTurn: boolean;
  winner: number | null;
}

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface AimInfo {
  active: boolean;
  startX: number;
  startY: number;
  curX: number;
  curY: number;
  power: number;     // 0..1
  dragging: boolean;
  placingBall: boolean;  // ball-in-hand placement mode
}

export interface PracticeConfig {
  selectedBallId: number;
}
