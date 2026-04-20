import {
    Application,
    Graphics,
    Text,
    TextStyle,
    Container,
    Sprite,
    Assets,
} from "pixi.js";
import { PhysicsWorld } from "./physics/PhysicsWorld";
import { TableBody } from "./physics/TableBody";
import { BallBody } from "./physics/BallBody";
import { TABLE, RACK_POSITIONS, CUE_BALL_START, BALL } from "./constants";
import { ShotController } from "./game/ShotController";
import { CueSprite } from "./renderer/CueSprite";
import { GameState, type GameMode } from "./game/GameState";
import { NineBallRules } from "./game/NineBallRules";
import { ScreenManager } from "./ui/ScreenManager";
import { MenuScreen } from "./ui/MenuScreen";
import { ModeScreen } from "./ui/ModeScreen";
import { HowToScreen } from "./ui/HowToScreen";
import { HUDScreen } from "./ui/HUDScreen";
import { ResultScreen } from "./ui/ResultScreen";

async function main() {
    const CANVAS_W = window.innerWidth;
    const CANVAS_H = window.innerHeight;

    const IMG_W = 2560,
        IMG_H = 1184;
    const SCALE = CANVAS_W / IMG_W;
    const IMG_H_RENDER = Math.round(IMG_H * SCALE);
    const imgOffY = Math.round((CANVAS_H - IMG_H_RENDER) / 2);

    // Tọa độ vùng chơi thực trên ảnh gốc (đo chính xác từ table.png)
    const PLAY_L = 553,
        PLAY_T = 283,
        PLAY_R = 2003,
        PLAY_B = 1015;
    const gL = Math.round(PLAY_L * SCALE);
    const gT = Math.round(PLAY_T * SCALE) + imgOffY;
    const gW = Math.round((PLAY_R - PLAY_L) * SCALE);
    const gH = Math.round((PLAY_B - PLAY_T) * SCALE);
    const psx = gW / TABLE.WIDTH;
    const psy = gH / TABLE.HEIGHT;

    const app = new Application();
    await app.init({
        canvas: document.getElementById("game-canvas") as HTMLCanvasElement,
        width: CANVAS_W,
        height: CANVAS_H,
        background: 0x0d1b2e,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
    });

    app.stage.eventMode = "static";

    const screens = new ScreenManager(app);

    function showMenu() {
        const menu = new MenuScreen(CANVAS_W, CANVAS_H);
        menu.onPlay = showMode;
        menu.onHowTo = showHowTo;
        screens.show(menu);
    }

    function showHowTo() {
        const hw = new HowToScreen(CANVAS_W, CANVAS_H);
        hw.onBack = showMenu;
        screens.show(hw);
    }

    function showMode() {
        const ms = new ModeScreen(CANVAS_W, CANVAS_H);
        ms.onSelect = (mode, p1, p2) => startGame(mode, p1, p2);
        ms.onBack = showMenu;
        screens.show(ms);
    }

    async function startGame(mode: GameMode, p1Name: string, p2Name: string) {
        screens.hide();

        const state = new GameState(p1Name, p2Name, mode);

        const physics = new PhysicsWorld();
        await physics.init();

        let table = new TableBody(physics);
        let balls: BallBody[] = [];
        let cueBall!: BallBody;

        const rules = new NineBallRules(state);

        function spawnBalls() {
            balls = [];
            cueBall = new BallBody(
                physics,
                0,
                CUE_BALL_START.x,
                CUE_BALL_START.y,
            );
            balls.push(cueBall);
            for (const pos of RACK_POSITIONS)
                balls.push(new BallBody(physics, pos.ballNum, pos.x, pos.y));
        }

        spawnBalls();

        // Collision
        physics.onCollision = (h1, h2, started) => {
            if (!started) return;
            const p1 = table.pocketHandles.has(h1);
            const p2 = table.pocketHandles.has(h2);
            if (!p1 && !p2) return;
            const bh = p1 ? h2 : h1;
            const ball = balls.find((b) => b.handle === bh);
            if (ball && !ball.isPocketed) {
                ball.pocket();
                rules.onBallPocketed(ball.ballNumber);
                pocketedThisRack.add(ball.ballNumber);
                // Animate bóng vào thanh bên phải
                hud.animateBallIn(ball.ballNumber);
            }
        };

        // Game container (physics → screen)
        const gameCt = new Container();
        gameCt.x = gL;
        gameCt.y = gT;
        gameCt.scale.set(psx, psy);
        app.stage.addChild(gameCt);

        // Ảnh bàn
        try {
            await Assets.load("/assets/table.png");
            const ts = Sprite.from("/assets/table.png");
            ts.width = CANVAS_W;
            ts.height = IMG_H_RENDER;
            ts.y = imgOffY;
            app.stage.addChildAt(ts, 0);
        } catch {
            const fallback = new Graphics();
            fallback.rect(0, 0, CANVAS_W, CANVAS_H).fill(0x0d1b2e);
            fallback.rect(gL - 30, gT - 30, gW + 60, gH + 60).fill(0x4a0a6e);
            fallback.rect(gL, gT, gW, gH).fill(0x1aaa82);
            app.stage.addChildAt(fallback, 0);
        }

        // Đường kẻ head string (chỉ vẽ đường thẳng đứng, KHÔNG vẽ vòng tròn)
        const mark = new Graphics();
        mark.moveTo(TABLE.WIDTH * 0.25, 0)
            .lineTo(TABLE.WIDTH * 0.25, TABLE.HEIGHT)
            .stroke({ color: 0xffffff, width: 1.0 / psx, alpha: 0.1 });
        gameCt.addChild(mark);

        // Ball colors
        const COLORS: Record<number, number> = {
            0: 0xffffff,
            1: 0xf7c948,
            2: 0x1e3faa,
            3: 0xcc2222,
            4: 0x7b3fa0,
            5: 0xe8601c,
            6: 0x1a7a3c,
            7: 0x7a1a1a,
            8: 0x111111,
            9: 0xf7c948,
        };
        const ballCts = new Map<number, Container>();
        const ballLbls = new Map<number, Text>();

        function buildBallGraphics() {
            ballCts.forEach((bc) => gameCt.removeChild(bc));
            ballCts.clear();
            ballLbls.clear();

            for (const ball of balls) {
                const bc = new Container();
                const r = BALL.RADIUS;
                const col = COLORS[ball.ballNumber] ?? 0xffffff;
                const g = new Graphics();

                if (ball.ballNumber === 0) {
                    // Cue ball: thêm điểm lệch tâm để thấy xoay
                    g.circle(0, 0, r).fill(0xf8f8f0);
                    g.circle(0, 0, r).stroke({ color: 0xd0d0c0, width: 0.8 });
                    bc.addChild(g);
                    // Điểm xám lệch tâm — xoay thì thấy nó quay
                    const dot = new Graphics();
                    dot.circle(r * 0.5, 0, r * 0.2).fill({
                        color: 0xaaaaaa,
                        alpha: 0.7,
                    });
                    bc.addChild(dot);
                } else {
                    if (ball.ballNumber === 9) {
                        g.circle(0, 0, r).fill(0xffffff);
                        bc.addChild(g);
                        const stripe = new Graphics();
                        stripe.rect(-r, -r * 0.42, r * 2, r * 0.84).fill(col);
                        const mask = new Graphics();
                        mask.circle(0, 0, r).fill(0xffffff);
                        stripe.mask = mask;
                        bc.addChild(mask);
                        bc.addChild(stripe);
                    } else {
                        g.circle(0, 0, r).fill(col);
                        bc.addChild(g);
                    }

                    // Chấm trắng + số — xoay cùng bóng, có thể mất khỏi tầm nhìn
                    const dot = new Graphics();
                    dot.circle(0, 0, r * 0.42).fill(0xffffff);
                    bc.addChild(dot);

                    const lbl = new Text({
                        text: String(ball.ballNumber),
                        style: new TextStyle({
                            fontSize: r * 0.85,
                            fontWeight: "bold",
                            fill: 0x111111,
                        }),
                    });
                    lbl.anchor.set(0.5);
                    bc.addChild(lbl);
                    ballLbls.set(ball.ballNumber, lbl);

                    // Highlight phản quang lệch tâm — xoay thì thấy rõ
                    const hl = new Graphics();
                    hl.circle(-r * 0.26, -r * 0.26, r * 0.19).fill({
                        color: 0xffffff,
                        alpha: 0.5,
                    });
                    bc.addChild(hl);
                }

                gameCt.addChild(bc);
                ballCts.set(ball.ballNumber, bc);
            }
        }
        buildBallGraphics();

        // Cue
        const cue = new CueSprite();
        gameCt.addChild(cue.container);

        // Shot controller
        let shot = new ShotController(app.canvas, cueBall, gL, gT, psx, psy);
        shot.onShoot = (angle, power) => {
            const impulse = power * 2.2; // nhân hệ số để bù damping cao
            cueBall.applyImpulse(
                Math.cos(angle) * impulse,
                Math.sin(angle) * impulse,
            );
            rules.resetTurn();
        };
        shot.activate();

        // HUD (80px cao, hiển thị lượt chơi)
        const hud = new HUDScreen(CANVAS_W, 80, state);
        hud.y = 0;
        app.stage.addChild(hud);
        app.stage.addChild(hud.pocketedStrip);

        let pocketedThisRack = new Set<number>();
        let firstHitDetected = false;
        let resolving = false;

        const FIXED_DT = 1 / 120;
        let acc = 0;

        const ticker = app.ticker.add((tk) => {
            acc += tk.deltaMS / 1000;
            let steps = 0;
            while (acc >= FIXED_DT && steps < 4) {
                physics.step();
                acc -= FIXED_DT;
                steps++;
            }
            if (acc > FIXED_DT * 4) acc = 0; // xả khi lag đột biến

            // Sync bóng
            for (const ball of balls) {
                const bc = ballCts.get(ball.ballNumber);
                if (!bc) continue;
                bc.visible = !ball.isPocketed;
                bc.x = ball.x;
                bc.y = ball.y;

                ball.tickRoll(FIXED_DT);
                bc.rotation = ball.rotation; // toàn bộ bóng xoay — số cũng mất khi quay xuống

                const lbl = ballLbls.get(ball.ballNumber);
                if (lbl) lbl.visible = !ball.isPocketed;
            }

            // HUD update — truyền thêm lowest để highlight
            const lowest = rules.getLowestBall(balls);
            hud.update(state, pocketedThisRack, lowest);

            // Cue
            const st = shot.getState();
            const showCue =
                (st === "aiming" || st === "pulling") && !cueBall.isPocketed;
            cue.setVisible(showCue);
            if (showCue) {
                cue.update(
                    cueBall.x,
                    cueBall.y,
                    shot.getAimAngle(),
                    shot.getPullDistance(),
                    shot.MAX_PULL,
                    TABLE.WIDTH,
                    TABLE.HEIGHT,
                );
            }

            // Phát hiện bóng đầu tiên cue chạm
            if (st === "waiting" && !firstHitDetected && cueBall.isMoving) {
                for (const b of balls) {
                    if (b.ballNumber === 0 || b.isPocketed) continue;
                    if (b.isMoving) {
                        rules.onFirstHit(b.ballNumber, lowest);
                        firstHitDetected = true;
                        break;
                    }
                }
            }

            // Khi tất cả dừng
            const allStopped = balls.every((b) => b.isPocketed || !b.isMoving);
            if (allStopped && st === "waiting" && !resolving) {
                resolving = true;
                firstHitDetected = false;

                const result = rules.resolveTurn(balls);

                if (result.nineBallWin) {
                    if (state.isMatchOver) {
                        ticker.stop();
                        app.stage.removeChild(hud);
                        const rs = new ResultScreen(
                            CANVAS_W,
                            CANVAS_H,
                            state.winner!.name,
                            state.player1.score,
                            state.player2.score,
                            state.player1.name,
                            state.player2.name,
                        );
                        rs.onPlayAgain = () => {
                            app.stage.removeChild(rs);
                            app.stage.removeChild(gameCt);
                            startGame(mode, p1Name, p2Name);
                        };
                        rs.onMenu = () => {
                            app.stage.removeChild(rs);
                            app.stage.removeChild(gameCt);
                            showMenu();
                        };
                        app.stage.addChild(rs);
                    } else {
                        resetRack();
                    }
                } else {
                    if (result.foul || result.switchTurn) {
                        state.switchTurn();
                    }
                    rules.resetTurn();
                    shot.activate();
                }
                resolving = false;
            }
        });

        function resetRack() {
            balls.forEach((b) => physics.removeRigidBody(b.body));
            pocketedThisRack = new Set();
            hud.clearPocketed();
            rules.resetTurn();
            spawnBalls();
            buildBallGraphics();

            shot.destroy();
            shot = new ShotController(app.canvas, cueBall, gL, gT, psx, psy);
            shot.onShoot = (angle, power) => {
                const impulse = power * 2.2; // nhân hệ số để bù damping cao
                cueBall.applyImpulse(
                    Math.cos(angle) * impulse,
                    Math.sin(angle) * impulse,
                );
                rules.resetTurn();
            };
            shot.activate();
        }
    }

    showMenu();
    window.addEventListener("resize", () => location.reload());
}

main().catch(console.error);
