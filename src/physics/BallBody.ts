import RAPIER from '@dimforge/rapier2d-compat'
import { BALL } from '../constants'
import type { PhysicsWorld } from './PhysicsWorld'

export class BallBody {
  readonly ballNumber: number   // 0 = cue ball, 1-9 = numbered
  readonly body: RAPIER.RigidBody
  readonly collider: RAPIER.Collider
  private pocketed = false

  constructor(
    world: PhysicsWorld,
    ballNumber: number,
    x: number,
    y: number,
  ) {
    this.ballNumber = ballNumber

    const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(x, y)
      .setLinearDamping(BALL.LINEAR_DAMPING)
      .setAngularDamping(BALL.ANGULAR_DAMPING)
      .setCcdEnabled(true) // Continuous collision detection — tránh bóng xuyên tường khi đánh mạnh

    this.body = world.createRigidBody(bodyDesc)

    const colliderDesc = RAPIER.ColliderDesc.ball(BALL.RADIUS)
      .setMass(BALL.MASS)
      .setFriction(BALL.FRICTION)
      .setRestitution(BALL.RESTITUTION)
      .setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS)

    this.collider = world.createCollider(colliderDesc, this.body)
  }

  get x(): number { return this.body.translation().x }
  get y(): number { return this.body.translation().y }
  get vx(): number { return this.body.linvel().x }
  get vy(): number { return this.body.linvel().y }
  get speed(): number { return Math.hypot(this.vx, this.vy) }
  get isMoving(): boolean { return this.speed > 0.5 }
  get isPocketed(): boolean { return this.pocketed }

  applyImpulse(fx: number, fy: number): void {
    this.body.wakeUp()
    this.body.applyImpulse({ x: fx, y: fy }, true)
  }

  setPosition(x: number, y: number): void {
    this.body.setTranslation({ x, y }, true)
    this.body.setLinvel({ x: 0, y: 0 }, true)
    this.body.setAngvel(0, true)
  }

  pocket(): void {
    this.pocketed = true
    // Đưa ra ngoài màn hình, tắt physics
    this.body.setEnabled(false)
  }

  reset(x: number, y: number): void {
    this.pocketed = false
    this.body.setEnabled(true)
    this.setPosition(x, y)
  }

  // Collider handle để map với collision event
  get handle(): number { return this.collider.handle }
}