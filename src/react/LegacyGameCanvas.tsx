import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

type LegacyMode = 'vs-ai' | 'vs-player';

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

function loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[data-legacy-src="${src}"]`) as HTMLScriptElement | null;
        if (existing) {
            if ((existing as any).__loaded) {
                resolve();
                return;
            }
            existing.addEventListener('load', () => resolve(), { once: true });
            existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true });
            return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.async = false;
        script.setAttribute('data-legacy-src', src);
        script.onload = () => {
            (script as any).__loaded = true;
            resolve();
        };
        script.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.body.appendChild(script);
    });
}

export function LegacyGameCanvas() {
    const containerRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const location = useLocation();
    const [gameReady, setGameReady] = useState(false);

    useEffect(() => {
        let mounted = true;
        setGameReady(false);

        const state = (location.state ?? {}) as {
            mode?: LegacyMode;
            winsNeeded?: number;
            config?: { mode?: LegacyMode; winsNeeded?: number };
        };
        const mode: LegacyMode = state.config?.mode ?? state.mode ?? 'vs-ai';
        const winsNeeded: number = state.config?.winsNeeded ?? state.winsNeeded ?? 3;

        const setupGlobals = () => {
            const w = window as any;

            w.fenster = w;
            if (typeof w.fenster.subscribeToOffsetUpdates !== 'function') {
                w.fenster.subscribeToOffsetUpdates = () => { };
            }

            if (!w.famobi) w.famobi = {};
            if (typeof w.famobi.onOrientationChange !== 'function') w.famobi.onOrientationChange = () => { };
            if (typeof w.famobi.getOrientation !== 'function') {
                w.famobi.getOrientation = () => (window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
            }
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
                mode: mode === 'vs-ai' ? 1 : 2,
                levelName: 'react_legacy_9ball',
                level: 1,
                levelComplete: false,
                tutorial: false,
                tutorialPlayed: true,
                clickedHelpButton: false,
                guideOn: 1,
                lastBreaker: 'none',
                score: 0,
                bestScore: Number(window.localStorage.getItem('bestScore') ?? 0),
                bestTime: Number(window.localStorage.getItem('bestTime') ?? 0),
                numGames: Number(window.localStorage.getItem('numGames') ?? 0),
                aiRating: 4,
                winsNeeded,
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

            const mapAudio = (value: unknown) => {
                if (Array.isArray(value)) return value.map((entry) => mapPath(entry));
                return mapPath(value);
            };

            const originalImage = loaderProto.image;
            loaderProto.image = function patchedImage(key: unknown, url: unknown, ...rest: unknown[]) {
                return originalImage.call(this, key, mapPath(url), ...rest);
            };

            const originalSpritesheet = loaderProto.spritesheet;
            loaderProto.spritesheet = function patchedSpritesheet(
                key: unknown,
                url: unknown,
                frameWidth: unknown,
                frameHeight: unknown,
                frameMax?: unknown,
                margin?: unknown,
                spacing?: unknown,
            ) {
                return originalSpritesheet.call(
                    this,
                    key,
                    mapPath(url),
                    frameWidth,
                    frameHeight,
                    frameMax,
                    margin,
                    spacing,
                );
            };

            const originalBitmapFont = loaderProto.bitmapFont;
            loaderProto.bitmapFont = function patchedBitmapFont(
                key: unknown,
                textureURL: unknown,
                atlasURL: unknown,
                ...rest: unknown[]
            ) {
                return originalBitmapFont.call(this, key, mapPath(textureURL), mapPath(atlasURL), ...rest);
            };

            const originalAtlas = loaderProto.atlas;
            loaderProto.atlas = function patchedAtlas(
                key: unknown,
                textureURL: unknown,
                atlasURL: unknown,
                ...rest: unknown[]
            ) {
                return originalAtlas.call(this, key, mapPath(textureURL), mapPath(atlasURL), ...rest);
            };

            const originalAtlasJSONArray = loaderProto.atlasJSONArray;
            if (originalAtlasJSONArray) {
                loaderProto.atlasJSONArray = function patchedAtlasJSONArray(
                    key: unknown,
                    textureURL: unknown,
                    atlasURL: unknown,
                    ...rest: unknown[]
                ) {
                    return originalAtlasJSONArray.call(this, key, mapPath(textureURL), mapPath(atlasURL), ...rest);
                };
            }

            const originalAtlasJSONHash = loaderProto.atlasJSONHash;
            if (originalAtlasJSONHash) {
                loaderProto.atlasJSONHash = function patchedAtlasJSONHash(
                    key: unknown,
                    textureURL: unknown,
                    atlasURL: unknown,
                    ...rest: unknown[]
                ) {
                    return originalAtlasJSONHash.call(this, key, mapPath(textureURL), mapPath(atlasURL), ...rest);
                };
            }

            const originalAudio = loaderProto.audio;
            loaderProto.audio = function patchedAudio(key: unknown, urls: unknown, ...rest: unknown[]) {
                return originalAudio.call(this, key, mapAudio(urls), ...rest);
            };

            w.__legacyLoaderPathPatchedV2 = true;
        };

        const destroyLegacyGame = () => {
            const w = window as any;
            if (w.game && typeof w.game.destroy === 'function') {
                try {
                    w.game.destroy(true);
                } catch {
                    // Ignore teardown errors from stale Phaser state.
                }
            }
            w.game = null;
        };

        const startLegacyGame = async () => {
            setupGlobals();
            for (const script of LEGACY_SCRIPTS) {
                await loadScript(script);
            }
            if (!mounted) return;

            const w = window as any;
            if (!w.Phaser || !w.loadState || !w.playState) {
                throw new Error('Legacy game scripts did not initialize expected globals');
            }

            patchLegacyLoaderPaths();

            const host = containerRef.current;
            if (!host) return;
            host.innerHTML = '';

            destroyLegacyGame();

            let hasEnteredPlay = false;
            const mainMenuState = {
                create: () => {
                    // Legacy load state always enters "mainMenu" first; bootstrap directly into play once.
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

        startLegacyGame().catch((err) => {
            console.error(err);
            navigate('/');
        });

        return () => {
            mounted = false;
            const w = window as any;
            if (w.game && typeof w.game.destroy === 'function') {
                try {
                    w.game.destroy(true);
                } catch {
                    // Ignore teardown errors during route unmount.
                }
            }
        };
    }, [location.state, navigate]);

    // Poll window.gi to track wins and update Phaser scoreboard text
    useEffect(() => {
        if (!gameReady) return;
        const interval = setInterval(() => {
            const gi = (window as any).gi;
            const info = (window as any).projectInfo;
            if (!gi || !info || !gi.p1WinsText || !gi.p2WinsText) return;

            const isVsAI = info.mode === 1;
            const p1Label = isVsAI ? 'Ban' : 'B1';
            const p2Label = isVsAI ? 'May' : 'B2';
            gi.p1WinsText.text = p1Label;
            gi.vsText.text = (info.p1Wins || 0) + '-' + (info.p2Wins || 0);
            gi.p2WinsText.text = p2Label;

        }, 300);
        return () => clearInterval(interval);
    }, [gameReady]);

    return (
        <div
            style={{
                width: '100vw',
                height: '100vh',
                background: '#0d0d1a',
                overflow: 'hidden',
                position: 'relative',
            }}
        >
            <div id="mygame" ref={containerRef} style={{ width: '100%', height: '100%' }} />
            {!gameReady && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: '#0d0d1a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        gap: '20px',
                    }}
                >
                    <div style={{ color: '#f5a623', fontSize: '22px', fontWeight: 'bold', fontFamily: 'Arial, sans-serif', letterSpacing: '1px' }}>
                        Đang tải trò chơi...
                    </div>
                    <div style={{ width: '260px', height: '6px', background: '#1e1e38', borderRadius: '3px', overflow: 'hidden' }}>
                        <div className="game-loading-shimmer" style={{ width: '100%', height: '100%', borderRadius: '3px' }} />
                    </div>
                </div>
            )}
        </div>
    );
}
