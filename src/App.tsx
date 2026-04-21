import { Routes, Route } from 'react-router';
import { MainMenu } from './react/MainMenu';
import { ChooseMode } from './react/ChooseMode';
import { HowToPlay } from './react/HowToPlay';
import { LegacyGameCanvas } from './react/LegacyGameCanvas';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<MainMenu />} />
      <Route path="/choose-mode" element={<ChooseMode />} />
      <Route path="/how-to-play" element={<HowToPlay />} />
      <Route path="/game" element={<LegacyGameCanvas />} />
    </Routes>
  );
}
