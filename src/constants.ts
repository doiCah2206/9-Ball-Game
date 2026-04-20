export const TABLE = {
  WIDTH:  800,
  HEIGHT: 400,
} as const

export const BALL = {
  RADIUS: 9,
  MASS: 0.17,
  FRICTION:        0.5,
  RESTITUTION:     0.75,
  LINEAR_DAMPING:  0.8,   // giảm từ 1.8 → 0.8
  ANGULAR_DAMPING: 0.6,   // giảm từ 1.2 → 0.6
} as const

export const PHYSICS = {
  TIMESTEP: 1 / 120,   // 120Hz — mượt và chính xác hơn
} as const

const RACK_CENTER_X = TABLE.WIDTH  * 0.72
const RACK_CENTER_Y = TABLE.HEIGHT * 0.5
const D  = BALL.RADIUS * 2 + 0.8
const SX = D * 0.866
const SY = D * 0.5

export const BALL_COLORS: Record<number, number> = {
  0: 0xf5f5f5, 1: 0xf7c948, 2: 0x2255cc, 3: 0xcc2222,
  4: 0x7b3fa0, 5: 0xe8601c, 6: 0x1a7a3c, 7: 0x8b1a1a,
  8: 0x111111, 9: 0xf7c948,
}

export const POCKET_POSITIONS: { x: number; y: number; r: number }[] = []

export const RACK_POSITIONS = [
  { x: RACK_CENTER_X,        y: RACK_CENTER_Y,        ballNum: 1 },
  { x: RACK_CENTER_X + SX,   y: RACK_CENTER_Y - SY,   ballNum: 2 },
  { x: RACK_CENTER_X + SX,   y: RACK_CENTER_Y + SY,   ballNum: 3 },
  { x: RACK_CENTER_X + SX*2, y: RACK_CENTER_Y - SY*2, ballNum: 4 },
  { x: RACK_CENTER_X + SX*2, y: RACK_CENTER_Y,        ballNum: 9 },
  { x: RACK_CENTER_X + SX*2, y: RACK_CENTER_Y + SY*2, ballNum: 5 },
  { x: RACK_CENTER_X + SX*3, y: RACK_CENTER_Y - SY,   ballNum: 6 },
  { x: RACK_CENTER_X + SX*3, y: RACK_CENTER_Y + SY,   ballNum: 7 },
  { x: RACK_CENTER_X + SX*4, y: RACK_CENTER_Y,        ballNum: 8 },
]

export const CUE_BALL_START = {
  x: TABLE.WIDTH * 0.25,
  y: TABLE.HEIGHT * 0.5,
}