import { Application, Graphics, Text, TextStyle, Container } from "pixi.js";
import { PhysicsWorld } from "./physics/PhysicsWorld";
import { TableBody } from "./physics/TableBody";
import { BallBody } from "./physics/BallBody";
import {
    TABLE,
    RACK_POSITIONS,
    CUE_BALL_START,
    BALL,
    POCKET_POSITIONS,
} from "./constants";
import { ShotController } from "./game/ShotController";
import { CueSprite } from "./renderer/CueSprite";

async function main() {
    const app = new Application();
    await app.init({
        canvas: document.getElementById("game-canvas") as HTMLCanvasElement,
        width: TABLE.WIDTH + TABLE.CUSHION * 2 + 200,
        height: TABLE.HEIGHT + TABLE.CUSHION * 2 + 100,
        background: 0x1a1a2e,
        antialias: true,
    });

    const physics = new PhysicsWorld();
    await physics.init();

    const table = new TableBody(physics);

    const balls: BallBody[] = [];
    const cueBall = new BallBody(
        physics,
        0,
        CUE_BALL_START.x,
        CUE_BALL_START.y,
    );
    balls.push(cueBall);

    for (const pos of RACK_POSITIONS) {
        balls.push(new BallBody(physics, pos.ballNum, pos.x, pos.y));
    }

    physics.onCollision = (handle1, handle2, started) => {
        if (!started) return;
        const isPocket1 = table.pocketHandles.has(handle1);
        const isPocket2 = table.pocketHandles.has(handle2);
        if (!isPocket1 && !isPocket2) return;

        const ballHandle = isPocket1 ? handle2 : handle1;
        const pocketed = balls.find((b) => b.handle === ballHandle);
        if (pocketed && !pocketed.isPocketed) {
            console.log(`Ball ${pocketed.ballNumber} pocketed!`);
            pocketed.pocket();
        }
    };

    // Container chính — offset bằng CUSHION
    const gameContainer = new Container();
    gameContainer.x = TABLE.CUSHION;
    gameContainer.y = TABLE.CUSHION;
    app.stage.addChild(gameContainer);

    // --- Cushion (viền nâu gỗ) ---
    const cushionGfx = new Graphics();
    cushionGfx
        .rect(
            -TABLE.CUSHION,
            -TABLE.CUSHION,
            TABLE.WIDTH + TABLE.CUSHION * 2,
            TABLE.HEIGHT + TABLE.CUSHION * 2,
        )
        .fill(0x4a2c0a);
    gameContainer.addChild(cushionGfx);

    // --- Mặt bàn xanh ---
    const feltGfx = new Graphics();
    feltGfx.rect(0, 0, TABLE.WIDTH, TABLE.HEIGHT).fill(0x1f6b3a);
    gameContainer.addChild(feltGfx);

    // --- 6 lỗ pocket đen ---
    for (const pos of POCKET_POSITIONS) {
        const hole = new Graphics();
        hole.circle(0, 0, pos.r).fill(0x000000); // dùng pos.r
        hole.x = pos.x;
        hole.y = pos.y;
        gameContainer.addChild(hole);
    }

    // Head string — đường ngang tại 1/4 bàn tính từ trái
    const headString = new Graphics();
    headString
        .moveTo(TABLE.WIDTH * 0.25, 0)
        .lineTo(TABLE.WIDTH * 0.25, TABLE.HEIGHT)
        .stroke({ color: 0x3a9a5a, width: 1, alpha: 0.4 });
    gameContainer.addChild(headString);

    // Head spot — chấm tròn nhỏ tại tâm vùng break
    const headSpot = new Graphics();
    headSpot.circle(TABLE.WIDTH * 0.25, TABLE.HEIGHT * 0.5, 3).fill(0x3a9a5a);
    gameContainer.addChild(headSpot);

    // --- Màu từng bóng ---
    const BALL_COLORS: Record<number, number> = {
        1: 0xf5c518,
        2: 0x1a3faa,
        3: 0xcc2200,
        4: 0x6a0dad,
        5: 0xe8601c,
        6: 0x1a7a3c,
        7: 0x8b0000,
        8: 0x111111,
        9: 0xf5c518,
    };

    // --- Vẽ bóng có màu + số ---
    const ballGraphics = new Map<number, Graphics>();
    const ballLabels = new Map<number, Text>();

    for (const ball of balls) {
        const g = new Graphics();

        if (ball.ballNumber === 0) {
            // Cue ball trắng
            g.circle(0, 0, BALL.RADIUS).fill(0xffffff);
            g.circle(0, 0, BALL.RADIUS).stroke({ color: 0xcccccc, width: 1 });
        } else {
            const col = BALL_COLORS[ball.ballNumber] ?? 0xffffff;

            if (ball.ballNumber === 9) {
                // Bóng 9: sọc vàng
                g.circle(0, 0, BALL.RADIUS).fill(0xffffff);
                g.rect(
                    -BALL.RADIUS,
                    -BALL.RADIUS * 0.45,
                    BALL.RADIUS * 2,
                    BALL.RADIUS * 0.9,
                ).fill(col);
                g.circle(0, 0, BALL.RADIUS).stroke({
                    color: 0xaaaaaa,
                    width: 0.5,
                });
            } else {
                g.circle(0, 0, BALL.RADIUS).fill(col);
                g.circle(0, 0, BALL.RADIUS).stroke({
                    color: 0x000000,
                    width: 0.5,
                    alpha: 0.3,
                });
            }

            // Vòng trắng nhỏ giữa để đặt số
            g.circle(0, 0, BALL.RADIUS * 0.45).fill(0xffffff);

            // Số bóng
            const style = new TextStyle({
                fontSize: BALL.RADIUS * 0.9,
                fontWeight: "bold",
                fill: 0x111111,
            });
            const label = new Text({ text: String(ball.ballNumber), style });
            label.anchor.set(0.5);
            gameContainer.addChild(label);
            ballLabels.set(ball.ballNumber, label);
        }

        gameContainer.addChild(g);
        ballGraphics.set(ball.ballNumber, g);
    }

    // --- Cue sprite ---
    const cueSprite = new CueSprite();
    gameContainer.addChild(cueSprite.container);

    // --- Shot controller ---
    const shotController = new ShotController(
        app.canvas,
        cueBall,
        TABLE.CUSHION,
        TABLE.CUSHION,
    );

    shotController.onShoot = (angle, power) => {
        cueBall.applyImpulse(Math.cos(angle) * power, Math.sin(angle) * power);
    };

    // Bắt đầu ở trạng thái aiming
    shotController.activate();

    // --- Game loop ---
    let accumulator = 0;
    const FIXED_DT = 1 / 60;

    app.ticker.add((ticker) => {
        accumulator += ticker.deltaMS / 1000;
        while (accumulator >= FIXED_DT) {
            physics.step();
            accumulator -= FIXED_DT;
        }

        for (const ball of balls) {
            const g = ballGraphics.get(ball.ballNumber);
            const lbl = ballLabels.get(ball.ballNumber);
            if (!g) continue;
            const visible = !ball.isPocketed;
            g.visible = visible;
            g.x = ball.x;
            g.y = ball.y;
            if (lbl) {
                lbl.visible = visible;
                lbl.x = ball.x;
                lbl.y = ball.y;
            }
        }

        // Kiểm tra tất cả bóng đã dừng chưa
        const allStopped = balls.every((b) => b.isPocketed || !b.isMoving);

        if (allStopped && shotController.getState() === "waiting") {
            shotController.activate();
        }

        // Cập nhật cue sprite
        const state = shotController.getState();
        const showCue = state === "aiming" || state === "pulling";
        cueSprite.setVisible(showCue && !cueBall.isPocketed);

        if (showCue) {
            cueSprite.update(
                cueBall.x,
                cueBall.y,
                shotController.getAimAngle(),
                shotController.getPullDistance(),
                shotController.MAX_PULL,
                TABLE.WIDTH,
                TABLE.HEIGHT,
            );
        }
    });

    console.log("Nine Ball initialized. Aim, pull, and release to shoot.");
}

main().catch(console.error);
