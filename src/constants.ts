export const TABLE = {
  WIDTH: 800,
  HEIGHT: 400,
  CUSHION: 16,
  POCKET_RADIUS_CORNER: 18,
  POCKET_RADIUS_MIDDLE: 20,
  POCKET_RADIUS: 18,
} as const

// Pocket sensor lùi vào BÊN TRONG mặt bàn một chút
// để bóng có thể overlap trước khi bị tường chặn
const PC = TABLE.POCKET_RADIUS_CORNER  // 25
const PM = TABLE.POCKET_RADIUS_MIDDLE  // 28
const IC = 0  // lùi vào trong 15px với góc
const IM = 0         // giữa không cần lùi

export const POCKET_POSITIONS = [
  { x: IC,                  y: IC,                  r: PC }, // top-left
  { x: TABLE.WIDTH - IC,    y: IC,                  r: PC }, // top-right
  { x: IC,                  y: TABLE.HEIGHT - IC,   r: PC }, // bot-left
  { x: TABLE.WIDTH - IC,    y: TABLE.HEIGHT - IC,   r: PC }, // bot-right
  { x: TABLE.WIDTH / 2,     y: IM,                  r: PM }, // top-mid
  { x: TABLE.WIDTH / 2,     y: TABLE.HEIGHT - IM,   r: PM }, // bot-mid
] as const

export const BALL = {
  RADIUS: 9,
  MASS: 1.0,
  FRICTION: 0.05,
  RESTITUTION: 0.88,
  LINEAR_DAMPING: 0.8,
  ANGULAR_DAMPING: 0.8,
} as const

export const PHYSICS = {
  TIMESTEP: 1 / 60,
} as const

const RACK_CENTER_X = TABLE.WIDTH * 0.75
const RACK_CENTER_Y = TABLE.HEIGHT * 0.5
const D  = BALL.RADIUS * 2       // 18px = 1 diameter
const SX = D * 0.866             // 15.6px — ngang giữa 2 hàng
const SY = D * 0.5               // 9px   — dọc giữa 2 bóng liền kề

export const BALL_COLORS: Record<number, number> = {
  0: 0xf5f5f5,
  1: 0xf7c948,
  2: 0x2255cc,
  3: 0xcc2222,
  4: 0x7b3fa0,
  5: 0xe8601c,
  6: 0x1a7a3c,
  7: 0x8b1a1a,
  8: 0x1a1a1a,
  9: 0xf7c948,
}

export const RACK_POSITIONS = [
  { x: RACK_CENTER_X,           y: RACK_CENTER_Y,           ballNum: 1 },
  { x: RACK_CENTER_X + SX,      y: RACK_CENTER_Y - SY,      ballNum: 2 },
  { x: RACK_CENTER_X + SX,      y: RACK_CENTER_Y + SY,      ballNum: 3 },
  { x: RACK_CENTER_X + SX*2,    y: RACK_CENTER_Y - SY*2,    ballNum: 4 },
  { x: RACK_CENTER_X + SX*2,    y: RACK_CENTER_Y,           ballNum: 9 },
  { x: RACK_CENTER_X + SX*2,    y: RACK_CENTER_Y + SY*2,    ballNum: 5 },
  { x: RACK_CENTER_X + SX*3,    y: RACK_CENTER_Y - SY,      ballNum: 6 },
  { x: RACK_CENTER_X + SX*3,    y: RACK_CENTER_Y + SY,      ballNum: 7 },
  { x: RACK_CENTER_X + SX*4,    y: RACK_CENTER_Y,           ballNum: 8 },
]

export const CUE_BALL_START = {
  x: TABLE.WIDTH * 0.25,
  y: TABLE.HEIGHT * 0.5,
}