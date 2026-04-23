import { Routes, Route, useLocation } from 'react-router';
import { useEffect, useRef, useState, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { MainMenu } from './react/MainMenu';
import { ChooseMode } from './react/ChooseMode';
import { HowToPlay } from './react/HowToPlay';
import { LegacyGameCanvas } from './react/LegacyGameCanvas';
import { PracticeCanvas } from './react/PracticeCanvas';

const BGM_ROUTES = ['/', '/choose-mode', '/how-to-play'];

interface BgmContextValue { muted: boolean; toggle: () => void; }
const BgmContext = createContext<BgmContextValue>({ muted: false, toggle: () => {} });
export const useBgm = () => useContext(BgmContext);

function BgmProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const audio = new Audio('/src/react/audio/grateful.mp3');
    audio.loop = true;
    audio.volume = 0.4;
    audioRef.current = audio;
    return () => { audio.pause(); audio.src = ''; };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (BGM_ROUTES.includes(location.pathname) && !muted) {
      audio.play().catch(() => {
        const resume = () => { audio.play().catch(() => {}); };
        document.addEventListener('click', resume, { once: true });
      });
    } else {
      audio.pause();
    }
  }, [location.pathname, muted]);

  const toggle = () => setMuted(prev => !prev);

  return <BgmContext.Provider value={{ muted, toggle }}>{children}</BgmContext.Provider>;
}

export function App() {
  return (
    <BgmProvider>
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="/choose-mode" element={<ChooseMode />} />
        <Route path="/how-to-play" element={<HowToPlay />} />
        <Route path="/game" element={<LegacyGameCanvas />} />
        <Route path="/practice" element={<PracticeCanvas />} />
      </Routes>
    </BgmProvider>
  );
}
