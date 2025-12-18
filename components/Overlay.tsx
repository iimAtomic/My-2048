
import React from 'react';
import { GameState } from '../types';

interface OverlayProps {
  gameState: GameState;
  onRestart: () => void;
}

const Overlay: React.FC<OverlayProps> = ({ gameState, onRestart }) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-4 md:p-8 text-white select-none">
      {/* Header */}
      <div className="w-full max-w-lg flex justify-between items-start pointer-events-auto mt-2 md:mt-4">
        <div className="flex flex-col">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter bg-gradient-to-br from-[#00f2ff] via-[#ffffff] to-[#7000ff] bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(0,242,255,0.4)]">
            Lux 2048
          </h1>
          <p className="text-[#00f2ff] text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase opacity-80">Premium Edition</p>
        </div>
        <div className="flex gap-2 md:gap-3">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 px-3 py-1 md:px-4 md:py-2 rounded-xl md:rounded-2xl flex flex-col items-center min-w-[70px] md:min-w-[90px] shadow-[0_0_20px_rgba(0,242,255,0.1)]">
            <span className="text-[8px] md:text-[10px] uppercase font-black text-[#00f2ff]">Score</span>
            <span className="text-lg md:text-2xl font-black leading-tight tracking-tight">{gameState.score}</span>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 px-3 py-1 md:px-4 md:py-2 rounded-xl md:rounded-2xl flex flex-col items-center min-w-[70px] md:min-w-[90px] shadow-[0_0_20px_rgba(255,0,122,0.1)]">
            <span className="text-[8px] md:text-[10px] uppercase font-black text-[#ff007a]">Best</span>
            <span className="text-lg md:text-2xl font-black leading-tight tracking-tight">{gameState.bestScore}</span>
          </div>
        </div>
      </div>

      {/* Game End Modals */}
      {(gameState.gameOver || gameState.won) && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md pointer-events-auto flex items-center justify-center z-50 p-6">
          <div className="bg-gradient-to-b from-white/15 to-white/5 border border-white/20 p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] shadow-2xl text-center flex flex-col items-center gap-6 md:gap-8 animate-in zoom-in fade-in duration-500 max-w-sm w-full">
            <h2 className={`text-5xl md:text-6xl font-black italic tracking-tighter ${gameState.won ? 'text-[#00ff85]' : 'text-[#ff3d00]'}`}>
              {gameState.won ? 'VICTORY' : 'FINISH'}
            </h2>
            <div className="space-y-1">
              <p className="text-white/50 uppercase font-bold text-[10px] md:text-xs tracking-widest">Final Tally</p>
              <p className="text-4xl md:text-5xl font-black text-white">{gameState.score}</p>
            </div>
            <button
              onClick={onRestart}
              className="group relative bg-white text-black px-10 py-4 rounded-full font-black text-lg uppercase tracking-tighter overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.2)]"
            >
              <span className="relative z-10">Rebirth</span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#00f2ff] to-[#7000ff] opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </div>
      )}

      {/* Footer Instructions */}
      <div className="w-full max-w-lg pointer-events-auto mb-2 md:mb-4">
        <div className="flex justify-between items-center bg-black/40 backdrop-blur-2xl border border-white/5 p-4 md:p-5 rounded-2xl md:rounded-[2rem] shadow-2xl">
          <div className="flex flex-col gap-1 md:gap-2">
            <div className="hidden md:flex items-center gap-2">
              <div className="flex gap-1">
                {['W', 'A', 'S', 'D'].map(k => (
                  <span key={k} className="bg-white/10 w-7 h-7 flex items-center justify-center rounded-lg text-[10px] font-black border border-white/10">{k}</span>
                ))}
              </div>
              <span className="text-[9px] text-white/40 font-black uppercase tracking-widest">or Swipe</span>
            </div>
            <div className="md:hidden flex items-center gap-1">
               <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">Swipe to move</span>
            </div>
            <p className="text-[8px] md:text-[9px] text-[#00f2ff]/60 uppercase tracking-[0.3em] font-bold">Forge the 2048</p>
          </div>
          <button
            onClick={onRestart}
            className="bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-white px-5 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest active:scale-95"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default Overlay;
