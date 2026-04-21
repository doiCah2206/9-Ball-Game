import { useNavigate, useLocation } from "react-router";
import { useEffect, useRef, useCallback } from "react";
import { GameEngine } from "../game/GameEngine";
import { Renderer } from "../game/Renderer";
import { CueController } from "../game/CueController";
import { AIPlayer } from "../game/AIPlayer";
import { CW, CH, FELT } from "../game/constants";
import type { GameConfig } from "../types";

const AI_DELAY = 950; // ms before AI shoots after turn

export function GameTable() {
  const navigate    = useNavigate();
  const location    = useLocation();
  const winsNeeded  = (location.state as any)?.winsNeeded ?? 3;

  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const engineRef  = useRef<GameEngine | null>(null);
  const rendRef    = useRef<Renderer | null>(null);
  const cueRef     = useRef<CueController | null>(null);
  const aiRef      = useRef<AIPlayer | null>(null);
  const rafRef     = useRef<number>(0);
  const aiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scaleRef   = useRef(1);
  const prevPhase  = useRef("aiming");

  // ─── Canvas ↔ logical coord conversion ───────────────────────────────
  const toLogical = useCallback((cx: number, cy: number) => {
    const canvas = canvasRef.current!;
    const rect   = canvas.getBoundingClientRect();
    const s      = scaleRef.current;
    return { x: (cx - rect.left) / s, y: (cy - rect.top) / s };
  }, []);

  // ─── Schedule AI turn ────────────────────────────────────────────────
  const scheduleAI = useCallback(() => {
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    aiTimerRef.current = setTimeout(() => {
      const engine = engineRef.current!;
      const ai     = aiRef.current!;
      const state  = engine.state;
      if (state.phase !== "aiming" || state.currentPlayer !== 1) return;

      const shot = ai.computeShot(state.balls);
      if (!shot) return;

      const cue = engine.getCueBall();
      if (!cue) return;

      const dx  = shot.targetX - cue.x;
      const dy  = shot.targetY - cue.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const spd = 80 + shot.power * (1100 - 80);
      engine.shoot((dx / len) * spd, (dy / len) * spd);
    }, AI_DELAY);
  }, []);

  // ─── Main setup ──────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext("2d")!;

    const config: GameConfig = {
      mode:        "vs-ai",
      winsNeeded,
      player1Name: "Bạn",
      player2Name: "Máy",
    };

    const engine = new GameEngine();
    engine.initPhysics();
    engine.newGame(config);

    const renderer = new Renderer(ctx);
    const cue      = new CueController();
    const ai       = new AIPlayer(1);

    engineRef.current = engine;
    rendRef.current   = renderer;
    cueRef.current    = cue;
    aiRef.current     = ai;

    const cueBall = engine.getCueBall();
    if (cueBall) cue.beginAim(cueBall);

    // ── Canvas scaling ──
    function resize() {
      const s  = Math.min(window.innerWidth / CW, window.innerHeight / CH);
      scaleRef.current = s;
      canvas.style.width  = `${CW * s}px`;
      canvas.style.height = `${CH * s}px`;
      canvas.style.left   = `${(window.innerWidth  - CW * s) / 2}px`;
      canvas.style.top    = `${(window.innerHeight - CH * s) / 2}px`;
    }
    resize();
    window.addEventListener("resize", resize);

    // ── Game loop ──
    function loop() {
      const state    = engine.state;
      const curPhase = state.phase;

      engine.update();

      // Detect turn transitions to trigger AI
      if (
        prevPhase.current === "resolving" &&
        curPhase === "aiming" &&
        state.config.mode === "vs-ai" &&
        state.currentPlayer === 1
      ) {
        scheduleAI();
      }
      prevPhase.current = curPhase;

      // ── Render ──
      renderer.clear();
      renderer.drawTable();
      renderer.drawBalls(state.balls);

      const cb    = engine.getCueBall();
      const isAI  = state.config.mode === "vs-ai" && state.currentPlayer === 1;
      const inAim = state.phase === "aiming" && !isAI;

      if (cb && inAim) {
        renderer.drawCueAndAim(cue, cb, state.balls);
        renderer.drawPowerBar(cue.aim.power);
      }

      if (state.phase === "ball-in-hand" && !isAI && cb) {
        renderer.drawBallInHandCursor(cue.aim.curX, cue.aim.curY);
      }

      renderer.drawGameHUD(state);

      if (state.phase === "game-over") {
        renderer.drawGameOver(state);
      }

      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [winsNeeded, scheduleAI]);

  // ─── Input handlers ──────────────────────────────────────────────────
  function handleDown(e: React.PointerEvent) {
    canvasRef.current?.setPointerCapture(e.pointerId);
    const engine = engineRef.current!;
    const cue    = cueRef.current!;
    const state  = engine.state;
    const { x, y } = toLogical(e.clientX, e.clientY);

    if (state.phase === "ball-in-hand" && state.currentPlayer === 0) {
      const pt = cue.placeBall(x, y);
      if (pt) {
        engine.setCueBallPos(pt.x, pt.y);
        const cb = engine.getCueBall();
        if (cb) cue.beginAim(cb);
      }
      return;
    }

    if (state.phase !== "aiming") return;
    if (state.config.mode === "vs-ai" && state.currentPlayer === 1) return;

    const cb = engine.getCueBall();
    if (cb) cue.onMouseDown(x, y, cb);
  }

  function handleMove(e: React.PointerEvent) {
    const { x, y } = toLogical(e.clientX, e.clientY);
    cueRef.current?.onMouseMove(x, y);
  }

  function handleUp(e: React.PointerEvent) {
    const engine = engineRef.current!;
    const cue    = cueRef.current!;
    const state  = engine.state;

    if (state.phase !== "aiming") return;
    if (state.config.mode === "vs-ai" && state.currentPlayer === 1) return;

    const cb = engine.getCueBall();
    if (!cb) return;

    const { x, y } = toLogical(e.clientX, e.clientY);
    const vel = cue.onMouseUp(x, y, cb);
    if (vel) engine.shoot(vel.vx, vel.vy);
  }

  function handleClick(e: React.MouseEvent) {
    const engine = engineRef.current!;
    const state  = engine.state;
    if (state.phase !== "game-over") return;

    // Check if "Chơi lại" or "Thoát" button clicked
    const { x, y } = toLogical(e.clientX, e.clientY);
    const cx = CW / 2;
    const cy = CH / 2;

    // Chơi lại button: cx-170 … cx-10, cy+60 … cy+104
    if (x >= cx - 170 && x <= cx - 10 && y >= cy + 60 && y <= cy + 104) {
      engine.resetRack();
      const cb = engine.getCueBall();
      if (cb) cueRef.current?.beginAim(cb);
      prevPhase.current = "aiming";
    }
    // Thoát button: cx+10 … cx+170, cy+60 … cy+104
    if (x >= cx + 10 && x <= cx + 170 && y >= cy + 60 && y <= cy + 104) {
      navigate("/");
    }
  }

  // ─── Compute cursor style based on phase ─────────────────────────────
  function cursorStyle(): string {
    const state = engineRef.current?.state;
    if (!state) return "default";
    if (state.phase === "ball-in-hand" && state.currentPlayer === 0) return "cell";
    if (state.phase === "aiming" && !(state.config.mode === "vs-ai" && state.currentPlayer === 1)) return "crosshair";
    return "default";
  }

  return (
    <div style={{
      width: "100vw", height: "100vh",
      background: "#0d0d1a",
      position: "relative",
      overflow: "hidden",
    }}>
      <canvas
        ref={canvasRef}
        width={CW}
        height={CH}
        style={{ position: "absolute", cursor: cursorStyle() }}
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onClick={handleClick}
      />

      {/* Back to menu button — positioned outside canvas area */}
      <button
        onClick={() => navigate("/")}
        style={{
          position: "absolute",
          top: 8, left: 8,
          zIndex: 100,
          width: 38, height: 38,
          borderRadius: "50%",
          background: "rgba(0,0,0,0.55)",
          border: "1px solid rgba(255,255,255,0.18)",
          color: "#fff",
          fontSize: 18,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 200ms",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,145,0,0.85)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,0,0,0.55)"; }}
        title="Về menu"
      >
        ←
      </button>
    </div>
  );
}
