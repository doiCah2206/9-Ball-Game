import { Routes, Route } from 'react-router';
import { MainMenu } from './react/MainMenu';
import { ChooseMode } from './react/ChooseMode';
import { HowToPlay } from './react/HowToPlay';
import { LegacyGameCanvas } from './react/LegacyGameCanvas';
import { PracticeCanvas } from './react/PracticeCanvas';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<MainMenu />} />
      <Route path="/choose-mode" element={<ChooseMode />} />
      <Route path="/how-to-play" element={<HowToPlay />} />
      <Route path="/game" element={<LegacyGameCanvas />} />
      <Route path="/practice" element={<PracticeCanvas />} />
    </Routes>
  );
}
