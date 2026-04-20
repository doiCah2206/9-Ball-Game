import RAPIER from '@dimforge/rapier2d-compat'
import { PHYSICS } from '../constants'

export class PhysicsWorld {
  private world!:      RAPIER.World
  private eventQueue!: RAPIER.EventQueue
  private initialized = false

  public onCollision?: (handle1: number, handle2: number, started: boolean) => void

  async init(): Promise<void> {
    await RAPIER.init()
    this.world = new RAPIER.World({ x: 0, y: 0 })
    this.world.timestep = PHYSICS.TIMESTEP
    this.eventQueue = new RAPIER.EventQueue(true)
    this.initialized = true
  }

  step(): void {
    if (!this.initialized) return
    this.world.step(this.eventQueue)
    this.eventQueue.drainCollisionEvents((h1, h2, started) => {
      this.onCollision?.(h1, h2, started)
    })
  }

  getWorld()    { return this.world }

  createRigidBody(desc: RAPIER.RigidBodyDesc) {
    return this.world.createRigidBody(desc)
  }

  createCollider(desc: RAPIER.ColliderDesc, body: RAPIER.RigidBody) {
    return this.world.createCollider(desc, body)
  }

  removeRigidBody(body: RAPIER.RigidBody): void {
    if (this.world) this.world.removeRigidBody(body)
  }
}