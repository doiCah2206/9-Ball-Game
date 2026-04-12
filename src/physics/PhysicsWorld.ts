import RAPIER from '@dimforge/rapier2d-compat'
import { PHYSICS } from '../constants'

export class PhysicsWorld {
  private world!: RAPIER.World
  private eventQueue!: RAPIER.EventQueue
  private initialized = false

  // Collision callback: gọi khi 2 collider va chạm
  public onCollision?: (handle1: number, handle2: number, started: boolean) => void

  async init(): Promise<void> {
    await RAPIER.init()
    // gravity = 0 vì bàn billiards nằm ngang
    this.world = new RAPIER.World({ x: 0, y: 0 })
    this.world.timestep = PHYSICS.TIMESTEP
    this.eventQueue = new RAPIER.EventQueue(true)
    this.initialized = true
  }

  step(): void {
    if (!this.initialized) return
    this.world.step(this.eventQueue)

    // Drain collision events
    this.eventQueue.drainCollisionEvents((handle1, handle2, started) => {
      this.onCollision?.(handle1, handle2, started)
    })
  }

  getWorld(): RAPIER.World {
    return this.world
  }

  createRigidBody(desc: RAPIER.RigidBodyDesc): RAPIER.RigidBody {
    return this.world.createRigidBody(desc)
  }

  createCollider(desc: RAPIER.ColliderDesc, body: RAPIER.RigidBody): RAPIER.Collider {
    return this.world.createCollider(desc, body)
  }

  removeRigidBody(body: RAPIER.RigidBody): void {
    this.world.removeRigidBody(body)
  }
}