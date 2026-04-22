import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

const LEGACY_SCRIPTS = [
    '/src/react/game/01phaser.js',
    '/src/react/game/02Ball.js',
    '/src/react/game/03contactListener.js',
    '/src/react/game/04billiardPhysics.js',
    '/src/react/game/05levelData.js',
    '/src/react/game/06maths.js',
    '/src/react/game/07vector2d.js',
    '/src/react/game/08render.js',
    '/src/react/game/09sound.js',
    '/src/react/game/10effects.js',
    '/src/react/game/11timer.js',
    '/src/react/game/12load.js',
    '/src/react/game/14setup.js',
    '/src/react/game/15gameController.js',
];

const BALL_COLORS: Record<number, { bg: string; text: string }> = {
    1: { bg: '#FFD100', text: '#000' },
    2: { bg: '#1565C0', text: '#fff' },
    3: { bg: '#C62828', text: '#fff' },
    4: { bg: '#6A1B9A', text: '#fff' },
    5: { bg: '#E65100', text: '#fff' },
    6: { bg: '#2E7D32', text: '#fff' },
    7: { bg: '#8B1A1A', text: '#fff' },
    8: { bg: '#212121', text: '#fff' },
};

function loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[data-legacy-src="${src}"]`) as HTMLScriptElement | null;
        if (existing) {
            if ((existing as any).__loaded) { resolve(); return; }
            existing.addEventListener('load', () => resolve(), { once: true });
            existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true });
            return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.async = false;
        script.setAttribute('data-legacy-src', src);
        script.onload = () => { (script as any).__loaded = true; resolve(); };
        script.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.body.appendChild(script);
    });
}

export function PracticeCanvas() {
    const containerRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const [gameReady, setGameReady] = useState(false);
    const [ballsInTray, setBallsInTray] = useState([1, 2, 3, 4, 5, 6, 7, 8]);

    useEffect(() => {
        let mounted = true;
        setGameReady(false);

        const setupGlobals = () => {
            const w = window as any;
            w.fenster = w;
            if (typeof w.fenster.subscribeToOffsetUpdates !== 'function') w.fenster.subscribeToOffsetUpdates = () => { };
            if (!w.famobi) w.famobi = {};
            if (typeof w.famobi.onOrientationChange !== 'function') w.famobi.onOrientationChange = () => { };
            if (typeof w.famobi.getOrientation !== 'function')
                w.famobi.getOrientation = () => (window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
            if (typeof w.famobi.hasFeature !== 'function') w.famobi.hasFeature = () => false;
            if (typeof w.famobi.log !== 'function') w.famobi.log = (...args: unknown[]) => console.log(...args);
            if (typeof w.famobi.getBrandingButtonImage !== 'function') w.famobi.getBrandingButtonImage = () => '';
            if (!w.famobi.localStorage) w.famobi.localStorage = window.localStorage;
            if (!w.famobi_analytics) w.famobi_analytics = {};
            const analytics = w.famobi_analytics;
            if (typeof analytics.trackScreen !== 'function') analytics.trackScreen = () => Promise.resolve();
            if (typeof analytics.trackEvent !== 'function') analytics.trackEvent = () => Promise.resolve();
            analytics.EVENT_LEVELFAIL ??= 'EVENT_LEVELFAIL';
            analytics.EVENT_LEVELSUCCESS ??= 'EVENT_LEVELSUCCESS';
            analytics.EVENT_TOTALSCORE ??= 'EVENT_TOTALSCORE';
            analytics.EVENT_VOLUMECHANGE ??= 'EVENT_VOLUMECHANGE';
            analytics.EVENT_LEVELRESTART ??= 'EVENT_LEVELRESTART';

            w.projectInfo = {
                ...(w.projectInfo ?? {}),
                mode: 3,
                levelName: 'practice',
                level: 1,
                levelComplete: false,
                tutorial: false,
                tutorialPlayed: true,
                clickedHelpButton: false,
                guideOn: 1,
                lastBreaker: 'none',
                score: 0,
                bestScore: 0,
                bestTime: 0,
                numGames: 0,
                aiRating: 1,
                winsNeeded: 99,
                p1Wins: 0,
                p2Wins: 0,
            };
        };

        const patchLegacyLoaderPaths = () => {
            const w = window as any;
            const loaderProto = w.Phaser?.Loader?.prototype;
            if (!loaderProto || w.__legacyLoaderPathPatchedV2) return;
            const mapPath = (value: unknown) => {
                if (typeof value !== 'string') return value;
                if (value.startsWith('assets/img/')) return `/src/react/img/${value.slice('assets/img/'.length)}`;
                if (value.startsWith('assets/fonts/')) return `/src/react/fonts/${value.slice('assets/fonts/'.length)}`;
                if (value.startsWith('assets/audio/')) return `/src/react/audio/${value.slice('assets/audio/'.length)}`;
                if (value.startsWith('assets/')) return `/src/react/${value.slice('assets/'.length)}`;
                return value;
            };
            const mapAudio = (value: unknown) => Array.isArray(value) ? value.map((v) => mapPath(v)) : mapPath(value);
            const origImage = loaderProto.image;
            loaderProto.image = function (k: unknown, u: unknown, ...r: unknown[]) { return origImage.call(this, k, mapPath(u), ...r); };
            const origSpritesheet = loaderProto.spritesheet;
            loaderProto.spritesheet = function (k: unknown, u: unknown, fw: unknown, fh: unknown, fm?: unknown, ma?: unknown, sp?: unknown) {
                return origSpritesheet.call(this, k, mapPath(u), fw, fh, fm, ma, sp);
            };
            const origBitmapFont = loaderProto.bitmapFont;
            loaderProto.bitmapFont = function (k: unknown, t: unknown, at: unknown, ...r: unknown[]) {
                return origBitmapFont.call(this, k, mapPath(t), mapPath(at), ...r);
            };
            const origAtlas = loaderProto.atlas;
            loaderProto.atlas = function (k: unknown, t: unknown, at: unknown, ...r: unknown[]) {
                return origAtlas.call(this, k, mapPath(t), mapPath(at), ...r);
            };
            const origAudio = loaderProto.audio;
            loaderProto.audio = function (k: unknown, urls: unknown, ...r: unknown[]) {
                return origAudio.call(this, k, mapAudio(urls), ...r);
            };
            w.__legacyLoaderPathPatchedV2 = true;
        };

        const destroyLegacyGame = () => {
            const w = window as any;
            if (w.game && typeof w.game.destroy === 'function') {
                try { w.game.destroy(true); } catch { }
            }
            w.game = null;
            w.practiceAPI = null;
        };

        const startPractice = async () => {
            setupGlobals();
            for (const script of LEGACY_SCRIPTS) await loadScript(script);
            if (!mounted) return;

            const w = window as any;
            if (!w.Phaser || !w.loadState || !w.playState)
                throw new Error('Legacy game scripts did not initialize expected globals');

            patchLegacyLoaderPaths();
            const host = containerRef.current;
            if (!host) return;
            host.innerHTML = '';
            destroyLegacyGame();

            let hasEnteredPlay = false;
            const mainMenuState = {
                create: () => {
                    if (!hasEnteredPlay) {
                        hasEnteredPlay = true;
                        if (mounted) setGameReady(true);
                        w.game.state.start('play');
                        return;
                    }
                    navigate('/');
                },
            };

            w.Point = w.Phaser.Point;
            w.game = new w.Phaser.Game(1920, 1080, w.Phaser.CANVAS, 'mygame');
            w.game.state.add('mainMenu', mainMenuState);
            w.game.state.add('load', w.loadState);
            w.game.state.add('play', w.playState);
            w.game.state.start('load');
        };

        startPractice().catch((err) => { console.error(err); navigate('/'); });

        return () => {
            mounted = false;
            const w = window as any;
            if (w.game && typeof w.game.destroy === 'function') {
                try { w.game.destroy(true); } catch { }
            }
            w.practiceAPI = null;
        };
    }, [navigate]);

    // Sync tray with balls actually on the table
    useEffect(() => {
        if (!gameReady) return;
        const interval = setInterval(() => {
            const api = (window as any).practiceAPI;
            if (!api) return;
            const onTable: number[] = api.getBallsOnTable();
            setBallsInTray([1, 2, 3, 4, 5, 6, 7, 8].filter(id => !onTable.includes(id)));
        }, 300);
        return () => clearInterval(interval);
    }, [gameReady]);

    const handleDragStart = useCallback((e: React.DragEvent, ballId: number) => {
        e.dataTransfer.setData('ballId', String(ballId));
        e.dataTransfer.effectAllowed = 'copy';
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const ballId = parseInt(e.dataTransfer.getData('ballId') || '0');
        if (!ballId) return;

        const canvas = document.querySelector('#mygame canvas') as HTMLCanvasElement | null;
        if (!canvas) return;
        const gi = (window as any).gi;
        if (!gi) return;

        const rect = canvas.getBoundingClientRect();
        const isPortrait = gi.landscape === false;
        const gameW = isPortrait ? 1080 : 1920;
        const gameH = isPortrait ? 1920 : 1080;
        const phaserX = (e.clientX - rect.left) * (gameW / rect.width);
        const phaserY = (e.clientY - rect.top) * (gameH / rect.height);

        let physX: number, physY: number;
        if (isPortrait) {
            physX = (gi.gameCanvas.y - phaserY) / gi.physScale;
            physY = (phaserX - gi.gameCanvas.x) / gi.physScale;
        } else {
            physX = (phaserX - gi.gameCanvas.x) / gi.physScale;
            physY = (phaserY - gi.gameCanvas.y) / gi.physScale;
        }

        (window as any).practiceAPI?.placeBall(ballId, physX, physY);
    }, []);

    const handleRack = useCallback(() => {
        (window as any).practiceAPI?.rackBalls();
        setBallsInTray([]);
    }, []);

    const handleReset = useCallback(() => {
        (window as any).practiceAPI?.resetTable();
        setBallsInTray([1, 2, 3, 4, 5, 6, 7, 8]);
    }, []);

    return (
        <div style={{ width: '100vw', height: '100vh', background: '#0d0d1a', overflow: 'hidden', position: 'relative' }}>
            {/* Phaser canvas host */}
            <div
                id="mygame"
                ref={containerRef}
                style={{ width: '100%', height: '100%' }}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            />

            {/* Practice UI overlay */}
            {gameReady && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    padding: '8px 12px 6px',
                    background: 'linear-gradient(180deg, rgba(10,12,24,0.92) 0%, rgba(10,12,24,0.0) 100%)',
                    pointerEvents: 'none',
                }}>
                    <div style={{
                        color: 'rgba(255,255,255,0.55)', fontSize: '12px',
                        fontFamily: 'Arial, sans-serif', marginBottom: '6px',
                    }}>
                        Kéo bi từ khay vào bàn — bấm ◆ để xếp bi, bấm Đặt Lại Bàn để reset
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', pointerEvents: 'all' }}>
                        {/* Ball tray */}
                        <div style={{
                            display: 'flex', gap: '6px', alignItems: 'center',
                            background: 'rgba(255,255,255,0.06)', borderRadius: '10px',
                            padding: '5px 10px', border: '1px solid rgba(255,255,255,0.1)',
                        }}>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(id => {
                                const inTray = ballsInTray.includes(id);
                                const { bg, text } = BALL_COLORS[id];
                                return (
                                    <div
                                        key={id}
                                        draggable={inTray}
                                        onDragStart={inTray ? (e) => handleDragStart(e, id) : undefined}
                                        style={{
                                            width: '34px', height: '34px', borderRadius: '50%',
                                            background: inTray ? bg : 'rgba(255,255,255,0.07)',
                                            border: `2px solid ${inTray ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: inTray ? text : 'rgba(255,255,255,0.15)',
                                            fontSize: '13px', fontWeight: 'bold', fontFamily: 'Arial, sans-serif',
                                            cursor: inTray ? 'grab' : 'default',
                                            userSelect: 'none',
                                            transition: 'all 200ms ease',
                                            boxShadow: inTray ? '0 2px 8px rgba(0,0,0,0.5)' : 'none',
                                            flexShrink: 0,
                                        }}
                                    >
                                        {inTray ? id : ''}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Rack button */}
                        <button
                            onClick={handleRack}
                            title="Xếp bi 9-ball"
                            style={{
                                height: '44px', padding: '0 16px',
                                background: 'rgba(30,130,255,0.15)',
                                border: '1px solid rgba(30,130,255,0.4)',
                                borderRadius: '8px', color: '#60aaff',
                                fontSize: '20px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(30,130,255,0.32)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(30,130,255,0.15)'; }}
                        >
                            ◆
                        </button>

                        {/* Reset button */}
                        <button
                            onClick={handleReset}
                            style={{
                                height: '44px', padding: '0 14px',
                                background: 'rgba(255,160,0,0.13)',
                                border: '1px solid rgba(255,160,0,0.38)',
                                borderRadius: '8px', color: '#ffb830',
                                fontSize: '13px', fontWeight: 'bold',
                                fontFamily: 'Arial, sans-serif',
                                cursor: 'pointer', whiteSpace: 'nowrap',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,160,0,0.28)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,160,0,0.13)'; }}
                        >
                            Đặt Lại Bàn
                        </button>

                        {/* Close */}
                        <button
                            onClick={() => navigate('/')}
                            style={{
                                width: '44px', height: '44px',
                                background: 'rgba(255,60,60,0.13)',
                                border: '1px solid rgba(255,60,60,0.32)',
                                borderRadius: '8px', color: '#ff6060',
                                fontSize: '18px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,60,60,0.28)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,60,60,0.13)'; }}
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {/* Loading overlay */}
            {!gameReady && (
                <div style={{
                    position: 'absolute', inset: 0, background: '#0d0d1a',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexDirection: 'column', gap: '20px',
                }}>
                    <div style={{
                        color: '#f5a623', fontSize: '22px', fontWeight: 'bold',
                        fontFamily: 'Arial, sans-serif', letterSpacing: '1px',
                    }}>
                        Đang tải chế độ luyện tập...
                    </div>
                    <div style={{ width: '260px', height: '6px', background: '#1e1e38', borderRadius: '3px', overflow: 'hidden' }}>
                        <div className="game-loading-shimmer" style={{ width: '100%', height: '100%', borderRadius: '3px' }} />
                    </div>
                </div>
            )}
        </div>
    );
}
