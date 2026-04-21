import { useEffect, useRef } from 'react';
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

    useEffect(() => {
        let mounted = true;

        const state = (location.state ?? {}) as {
            mode?: LegacyMode;
            winsNeeded?: number;
            config?: { mode?: LegacyMode; winsNeeded?: number };
        };
        const mode: LegacyMode = state.config?.mode ?? state.mode ?? 'vs-ai';
        const winsNeeded: number = state.winsNeeded ?? state.config?.winsNeeded ?? 5;

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
                aiRating: 3,
                winsNeeded: winsNeeded,
                p1Wins: 0,
                p2Wins: 0,
            };
        };

        const patchLegacyLoaderPaths = () => {
            const w = window as any;
            const loaderProto = w.Phaser?.Loader?.prototype;
            if (!loaderProto || w.__legacyLoaderPathPatched) return;

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

            const originalAudio = loaderProto.audio;
            loaderProto.audio = function patchedAudio(key: unknown, urls: unknown, ...rest: unknown[]) {
                return originalAudio.call(this, key, mapAudio(urls), ...rest);
            };

            const originalAtlas = loaderProto.atlas;
            loaderProto.atlas = function patchedAtlas(
                key: unknown,
                textureURL: unknown,
                atlasURL: unknown,
                atlasData: unknown,
                format: unknown,
            ) {
                return originalAtlas.call(this, key, mapPath(textureURL), mapPath(atlasURL), atlasData, format);
            };

            w.__legacyLoaderPathPatched = true;
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
                        w.game.state.start('play');
                        return;
                    }
                    navigate('/');
                },
            };

            w.Point = w.Phaser.Point;
            w.game = new w.Phaser.Game({
                width: 1920,
                height: 1080,
                renderer: w.Phaser.CANVAS,
                parent: 'mygame',
                scaleMode: w.Phaser.ScaleManager.SHOW_ALL,
            });

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

    return (
        <div
            style={{
                width: '100vw',
                height: '100vh',
                background: '#0d0d1a',
                overflow: 'hidden',
            }}
        >
            <div id="mygame" ref={containerRef} style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }} />
        </div>
    );
}