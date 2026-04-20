import RAPIER from '@dimforge/rapier2d-compat'
import { TABLE } from '../constants'
import type { PhysicsWorld } from './PhysicsWorld'

export class TableBody {
  readonly pocketHandles: Set<number> = new Set()

  constructor(world: PhysicsWorld) {
    this.buildWalls(world)
    this.buildPockets(world)
  }

  private addWall(world: PhysicsWorld, cx: number, cy: number, hw: number, hh: number) {
    const body = world.createRigidBody(
      RAPIER.RigidBodyDesc.fixed().setTranslation(cx, cy)
    )
    world.createCollider(
      RAPIER.ColliderDesc.cuboid(hw, hh)
        .setRestitution(0.60)    // tường nảy ít hơn bóng-bóng
        .setFriction(0.4),
      body
    )
  }

  private buildWalls(world: PhysicsWorld) {
    const W  = TABLE.WIDTH   // 800
    const H  = TABLE.HEIGHT  // 400
    const T  = 40            // độ dày tường (đủ dày để bóng không xuyên qua)

    const PC = 24   // gap góc — ~2.5x RADIUS
    const PM = 18   // gap giữa — ~2x RADIUS
    const MX = 400

    // ── TOP wall: y=0, tường nằm phía trên ──
    // Đoạn trái: từ PC đến MX-PM
    this.addWall(world,
      (PC + MX - PM) / 2,       -T / 2,
      (MX - PM - PC) / 2,        T / 2
    )
    // Đoạn phải: từ MX+PM đến W-PC
    this.addWall(world,
      (MX + PM + W - PC) / 2,   -T / 2,
      (W - PC - MX - PM) / 2,    T / 2
    )

    // ── BOTTOM wall: y=H ──
    this.addWall(world,
      (PC + MX - PM) / 2,        H + T / 2,
      (MX - PM - PC) / 2,        T / 2
    )
    this.addWall(world,
      (MX + PM + W - PC) / 2,    H + T / 2,
      (W - PC - MX - PM) / 2,    T / 2
    )

    // ── LEFT wall: x=0 ──
    this.addWall(world,
      -T / 2,  H / 2,
       T / 2,  (H - PC * 2) / 2
    )

    // ── RIGHT wall: x=W ──
    this.addWall(world,
      W + T / 2,  H / 2,
      T / 2,     (H - PC * 2) / 2
    )

    // ── Cushion góc xiên (diagonal bumpers tại 4 góc) ──
    // Giúp bóng không mắc kẹt ở góc pocket
    const diagSize = PC * 0.7
    const diagHW   = diagSize / 2
    const corners = [
      { cx: PC / 2,       cy: PC / 2,       angle:  Math.PI / 4 },   // TL
      { cx: W - PC / 2,   cy: PC / 2,       angle: -Math.PI / 4 },   // TR
      { cx: PC / 2,       cy: H - PC / 2,   angle: -Math.PI / 4 },   // BL
      { cx: W - PC / 2,   cy: H - PC / 2,   angle:  Math.PI / 4 },   // BR
    ]
    for (const c of corners) {
      const body = world.createRigidBody(
        RAPIER.RigidBodyDesc.fixed()
          .setTranslation(c.cx, c.cy)
          .setRotation(c.angle)
      )
      world.createCollider(
        RAPIER.ColliderDesc.cuboid(diagHW, 4)
          .setRestitution(0.55)
          .setFriction(0.3),
        body
      )
    }
  }

  private buildPockets(world: PhysicsWorld) {
    const W  = TABLE.WIDTH
    const H  = TABLE.HEIGHT
    const RC = 22   // sensor radius góc
    const RM = 16   // sensor radius giữa

    // Pocket sensor nằm TẠI góc/giữa mép bàn
    // Bóng chạm sensor → bị pocket()
    const pockets = [
      { x: 0,   y: 0,   r: RC },  // TL
      { x: W,   y: 0,   r: RC },  // TR
      { x: 0,   y: H,   r: RC },  // BL
      { x: W,   y: H,   r: RC },  // BR
      { x: 400, y: 0,   r: RM },  // TM
      { x: 400, y: H,   r: RM },  // BM
    ]

    for (const p of pockets) {
      const body = world.createRigidBody(
        RAPIER.RigidBodyDesc.fixed().setTranslation(p.x, p.y)
      )
      const col = world.createCollider(
        RAPIER.ColliderDesc.ball(p.r)
          .setSensor(true)
          .setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS),
        body
      )
      this.pocketHandles.add(col.handle)
    }
  }
}