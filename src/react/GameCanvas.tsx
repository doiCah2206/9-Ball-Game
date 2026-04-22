import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router';
import RAPIER from '@dimforge/rapier2d-compat';
import { Renderer } from '../game/Renderer';
import { GameEngine } from '../game/GameEngine';
import { GameScreen } from '../screens/GameScreen';
import { CW, CH } from '../game/constants';
import type { GameConfig } from '../types';

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const config: GameConfig = location.state?.config ?? {
      mode: 'vs-ai',
      winsNeeded: 3,
      player1Name: 'Cảnh',
      player2Name: 'Máy',
    };

    let rafId = 0;
    let scale = 1;
    let mounted = true;

    const ctx = canvas.getContext('2d')!;
    const renderer = new Renderer(ctx);
    const engine = new GameEngine();

    const resize = () => {
      const s = Math.min(window.innerWidth / CW, window.innerHeight / CH);
      scale = s;
      canvas.width  = Math.round(CW * s);
      canvas.height = Math.round(CH * s);
      canvas.style.width  = `${canvas.width}px`;
      canvas.style.height = `${canvas.height}px`;
      ctx.setTransform(s, 0, 0, s, 0, 0);
    };

    const toLogical = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      return { lx: (clientX - rect.left) / scale, ly: (clientY - rect.top) / scale };
    };

    RAPIER.init().then(() => {
      if (!mounted) return;
      engine.initPhysics();
      const screen = new GameScreen(renderer, engine);
      screen.startGame(config);
      resize();

      window.addEventListener('resize', resize);

      const onMouseMove = (e: MouseEvent) => { const { lx, ly } = toLogical(e.clientX, e.clientY); screen.onMouseMove(lx, ly); };
      const onMouseDown = (e: MouseEvent) => { const { lx, ly } = toLogical(e.clientX, e.clientY); screen.onMouseDown(lx, ly); };
      const onMouseUp   = (e: MouseEvent) => {
        const { lx, ly } = toLogical(e.clientX, e.clientY);
        const next = screen.onMouseUp(lx, ly);
        if (next === 'menu') navigate('/');
      };
      const onTouchStart = (e: TouchEvent) => { e.preventDefault(); const t = e.touches[0]; const { lx, ly } = toLogical(t.clientX, t.clientY); screen.onMouseDown(lx, ly); };
      const onTouchMove  = (e: TouchEvent) => { e.preventDefault(); const t = e.touches[0]; const { lx, ly } = toLogical(t.clientX, t.clientY); screen.onMouseMove(lx, ly); };
      const onTouchEnd   = (e: TouchEvent) => { e.preventDefault(); const t = e.changedTouches[0]; const { lx, ly } = toLogical(t.clientX, t.clientY); const next = screen.onMouseUp(lx, ly); if (next === 'menu') navigate('/'); };

      canvas.addEventListener('mousemove', onMouseMove);
      canvas.addEventListener('mousedown', onMouseDown);
      canvas.addEventListener('mouseup',   onMouseUp);
      canvas.addEventListener('touchstart', onTouchStart, { passive: false });
      canvas.addEventListener('touchmove',  onTouchMove,  { passive: false });
      canvas.addEventListener('touchend',   onTouchEnd,   { passive: false });

      const loop = () => {
        if (!mounted) return;
        screen.update();
        screen.draw();
        rafId = requestAnimationFrame(loop);
      };
      rafId = requestAnimationFrame(loop);

      // store cleanup for the effect cleanup fn
      (canvas as any).__cleanup = () => {
        cancelAnimationFrame(rafId);
        window.removeEventListener('resize', resize);
        canvas.removeEventListener('mousemove', onMouseMove);
        canvas.removeEventListener('mousedown', onMouseDown);
        canvas.removeEventListener('mouseup',   onMouseUp);
        canvas.removeEventListener('touchstart', onTouchStart);
        canvas.removeEventListener('touchmove',  onTouchMove);
        canvas.removeEventListener('touchend',   onTouchEnd);
      };
    });

    return () => {
      mounted = false;
      cancelAnimationFrame(rafId);
      (canvas as any).__cleanup?.();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-screen h-screen flex items-center justify-center" style={{ background: '#0d0d1a' }}>
      <canvas ref={canvasRef} style={{ display: 'block', cursor: 'default' }} />
    </div>
  );
}
