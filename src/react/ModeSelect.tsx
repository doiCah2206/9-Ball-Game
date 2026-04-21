import { useNavigate, useLocation } from 'react-router';
import { ChevronLeft } from 'lucide-react';
import { GameLayout } from './GameLayout';
import type { GameConfig } from '../types';

const WIN_OPTIONS = [1, 3, 5, 7];

export function ModeSelect() {
  const navigate = useNavigate();
  const location = useLocation();
  const mode = (location.state?.mode ?? 'vs-ai') as 'vs-ai' | 'vs-player';
  const isVsAI = mode === 'vs-ai';

  const handleStart = (wins: number) => {
    const config: GameConfig = {
      mode,
      winsNeeded: wins,
      player1Name: 'Cảnh',
      player2Name: isVsAI ? 'Máy' : 'Tài',
    };
    navigate('/game', { state: { config } });
  };

  return (
    <GameLayout>
      <div className="relative z-20 flex items-center px-5 pt-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-white/50 hover:text-white/90 cursor-pointer"
          style={{ transition: 'all 200ms ease-in-out' }}
        >
          <ChevronLeft size={18} />
          <span style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.04em' }}>QUAY LẠI</span>
        </button>
      </div>

      <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-4 -mt-4">
        <div className="text-center mb-10">
          <h2 style={{
            fontFamily: "'Lexend', sans-serif",
            fontWeight: 800,
            fontSize: '36px',
            color: '#FF9100',
            textShadow: '0 2px 12px rgba(255,145,0,0.25)',
          }}>
            {isVsAI ? 'Chơi với Máy' : 'Chơi với Người'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px', marginTop: '8px', letterSpacing: '0.05em' }}>
            CHỌN SỐ VÁN THẮNG
          </p>
        </div>

        <div className="flex gap-4">
          {WIN_OPTIONS.map((wins) => (
            <button
              key={wins}
              onClick={() => handleStart(wins)}
              className="flex flex-col items-center justify-center rounded-2xl cursor-pointer"
              style={{
                width: '80px',
                height: '80px',
                backgroundColor: 'rgba(26,29,31,0.85)',
                border: '1px solid rgba(60,65,72,0.6)',
                color: '#FFFFFF',
                transition: 'all 200ms ease-in-out',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FF9100';
                e.currentTarget.style.borderColor = '#FF9100';
                e.currentTarget.style.color = '#000';
                e.currentTarget.style.boxShadow = '0 0 24px rgba(255,145,0,0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(26,29,31,0.85)';
                e.currentTarget.style.borderColor = 'rgba(60,65,72,0.6)';
                e.currentTarget.style.color = '#FFFFFF';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span style={{ fontFamily: "'Lexend', sans-serif", fontWeight: 900, fontSize: '28px', lineHeight: 1 }}>
                {wins}
              </span>
              <span style={{ fontSize: '11px', opacity: 0.6, marginTop: '4px', letterSpacing: '0.05em' }}>
                VÁN
              </span>
            </button>
          ))}
        </div>
      </div>
    </GameLayout>
  );
}
