import * as RAPIER from "@dimforge/rapier2d";

type Vector2 = {
    x: number;
    y: number;
};

export abstract class Ball {
    readonly radius: number;
    readonly color: string;
    readonly rigidBody: RAPIER.RigidBody;
    readonly world: RAPIER.World;

    protected constructor(
        world: RAPIER.World,
        x: number = 100,
        y: number = 100,
        radius: number = 10,
        color: string = "red",
        initialVelocity: Vector2 = { x: 5, y: 3 }
    ) {
        this.world = world;
        this.radius = radius;
        this.color = color;

        const rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(x, y);
        this.rigidBody = this.world.createRigidBody(rigidBodyDesc);
        this.rigidBody.setLinvel(initialVelocity, true);

        const colliderDesc = RAPIER.ColliderDesc.ball(this.radius);
        this.world.createCollider(colliderDesc, this.rigidBody);
    }

    get position() {
        return this.rigidBody.translation();
    }

    draw(ctx: CanvasRenderingContext2D) {
        const position = this.position;

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(position.x, position.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

export class CueBall extends Ball {
    constructor(world: RAPIER.World, x: number = 100, y: number = 100) {
        super(world, x, y, 10, "white", { x: 5, y: 3 });
    }
}

export class ObjectBall extends Ball {
    constructor(
        world: RAPIER.World,
        x: number,
        y: number,
        color: string = "red"
    ) {
        super(world, x, y, 10, color, { x: 0, y: 0 });
    }
}


