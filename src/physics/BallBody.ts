import RAPIER from "@dimforge/rapier2d-compat";
import { BALL } from "../constants";
import type { PhysicsWorld } from "./PhysicsWorld";

export class BallBody {
    readonly ballNumber: number;
    readonly body: RAPIER.RigidBody;
    readonly collider: RAPIER.Collider;
    private pocketed = false;
    private _angle = 0; // ← tích lũy thủ công, KHÔNG dùng body.rotation()

    constructor(world: PhysicsWorld, ballNumber: number, x: number, y: number) {
        this.ballNumber = ballNumber;

        const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
            .setTranslation(x, y)
            .setLinearDamping(BALL.LINEAR_DAMPING)
            .setAngularDamping(BALL.ANGULAR_DAMPING)
            .setCcdEnabled(true);

        this.body = world.createRigidBody(bodyDesc);

        const colliderDesc = RAPIER.ColliderDesc.ball(BALL.RADIUS)
            .setMass(BALL.MASS)
            .setFriction(BALL.FRICTION)
            .setRestitution(BALL.RESTITUTION)
            .setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS);

        this.collider = world.createCollider(colliderDesc, this.body);
    }

    get x(): number {
        return this.body.translation().x;
    }
    get y(): number {
        return this.body.translation().y;
    }
    get vx(): number {
        return this.body.linvel().x;
    }
    get vy(): number {
        return this.body.linvel().y;
    }
    get speed(): number {
        return Math.hypot(this.vx, this.vy);
    }
    get isMoving(): boolean {
        return this.speed > 0.5;
    }
    get isPocketed(): boolean {
        return this.pocketed;
    }
    get rotation(): number {
        return this._angle;
    } // ← trả về góc tích lũy

    // Gọi mỗi physics step (dt = 1/120)
    tickRoll(dt: number): void {
        if (this.pocketed) return;
        if (this.speed < 0.1) return;
        // Nhân 8x để bù damping cao — bóng xoay đủ vòng để mắt nhận ra
        this._angle += (this.speed / BALL.RADIUS) * dt * 8;
    }

    applyImpulse(fx: number, fy: number): void {
        this.body.wakeUp();
        this.body.applyImpulse({ x: fx, y: fy }, true);
    }

    setPosition(x: number, y: number): void {
        this.body.setTranslation({ x, y }, true);
        this.body.setLinvel({ x: 0, y: 0 }, true);
        this.body.setAngvel(0, true);
        this._angle = 0;
    }

    pocket(): void {
        this.pocketed = true;
        this.body.setEnabled(false);
    }

    reset(x: number, y: number): void {
        this.pocketed = false;
        this.body.setEnabled(true);
        this.setPosition(x, y);
    }

    get handle(): number {
        return this.collider.handle;
    }
}
