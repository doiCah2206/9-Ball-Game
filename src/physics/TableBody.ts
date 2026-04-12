import RAPIER from '@dimforge/rapier2d-compat'
import { TABLE, POCKET_POSITIONS } from '../constants'
import type { PhysicsWorld } from './PhysicsWorld'

export class TableBody {
  readonly pocketHandles: Set<number> = new Set()

  constructor(world: PhysicsWorld) {
    this.buildWalls(world)
    this.buildPockets(world)
  }

  private buildWalls(world: PhysicsWorld): void {
    const W = TABLE.WIDTH
    const H = TABLE.HEIGHT
    const T = TABLE.CUSHION
    const GC = TABLE.POCKET_RADIUS_CORNER * 2  // gap tại 4 góc = 37px
    const GM = TABLE.POCKET_RADIUS_MIDDLE * 2  // gap tại 2 giữa = 42px

    // Mỗi tường là cuboid dày T, đặt SAT mép bàn
    // Top: 2 đoạn, chừa góc trái + phải + giữa
    const walls = [
      // --- Top ---
      { x1: GC,       y1: 0, x2: W/2 - GM, y2: 0 },  // top-left đoạn
      { x1: W/2 + GM, y1: 0, x2: W - GC,   y2: 0 },  // top-right đoạn

      // --- Bottom ---
      { x1: GC,       y1: H, x2: W/2 - GM, y2: H },
      { x1: W/2 + GM, y1: H, x2: W - GC,   y2: H },

      // --- Left: 1 đoạn, chừa 2 góc ---
      { x1: 0, y1: GC, x2: 0, y2: H - GC },

      // --- Right ---
      { x1: W, y1: GC, x2: W, y2: H - GC },
    ]

    for (const w of walls) {
      // Tính center và half-extents của đoạn tường
      const cx  = (w.x1 + w.x2) / 2
      const cy  = (w.y1 + w.y2) / 2

      // Tường ngang: hw = chiều dài/2, hh = T/2
      // Tường dọc:  hw = T/2, hh = chiều cao/2
      const isHoriz = w.y1 === w.y2
      const hw = isHoriz ? Math.abs(w.x2 - w.x1) / 2 : T / 2
      const hh = isHoriz ? T / 2 : Math.abs(w.y2 - w.y1) / 2

      if (hw < 1 || hh < 1) continue

      const body = world.createRigidBody(
        RAPIER.RigidBodyDesc.fixed().setTranslation(cx, cy)
      )
      world.createCollider(
        RAPIER.ColliderDesc.cuboid(hw, hh)
          .setRestitution(0.6)
          .setFriction(0.5),
        body
      )
    }
  }

  private buildPockets(world: PhysicsWorld): void {
    for (const pos of POCKET_POSITIONS) {
      const body = world.createRigidBody(
        RAPIER.RigidBodyDesc.fixed().setTranslation(pos.x, pos.y)
      )
      const collider = world.createCollider(
        RAPIER.ColliderDesc.ball(pos.r)
          .setSensor(true)
          .setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS),
        body
      )
      this.pocketHandles.add(collider.handle)
    }
  }
}