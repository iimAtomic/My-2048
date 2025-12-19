
import React, { useState, useEffect } from 'react';
import { GameState, MultiplayerState } from '../types';

interface OverlayProps {
  gameState: GameState;
  mpState: MultiplayerState;
  onRestart: () => void;
  onUndo: () => void;
  onInstall?: () => void;
  showInstallBanner?: boolean;
  onDismissInstall?: () => void;
  onCreateRoom: () => void;
  onJoinRoom: (code: string) => void;
  onReady: () => void;
  onCountdownEnd: () => void;
  onResetMp: () => void;
}

const Overlay: React.FC<OverlayProps> = ({ 
  gameState, 
  mpState,
  onRestart, 
  onUndo, 
  onInstall, 
  showInstallBanner, 
  onDismissInstall,
  onCreateRoom,
  onJoinRoom,
  onReady,
  onCountdownEnd,
  onResetMp
}) => {
  const [joinCode, setJoinCode] = useState('');
  const [counter, setCounter] = useState(3);
  const [showMpMenu, setShowMpMenu] = useState(false);

  useEffect(() => {
    if (mpState.status === 'countdown') {
      const timer = setInterval(() => {
        setCounter(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            onCountdownEnd();
            return 3;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [mpState.status, onCountdownEnd]);

  const canUndo = !!gameState.history && mpState.status !== 'playing';
  const isMultiplayerActive = mpState.status !== 'idle' && mpState.status !== 'searching';

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-4 md:p-8 text-white select-none overflow-hidden">
      {/* Header */}
      <div className="w-full max-w-lg flex justify-between items-start pointer-events-auto mt-2 md:mt-4">
        <div className="flex flex-col">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter bg-gradient-to-br from-[#00f2ff] via-[#ffffff] to-[#7000ff] bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(0,242,255,0.4)]">
            Lux 2048
          </h1>
          <p className="text-[#00f2ff] text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase opacity-80">Premium Edition</p>
        </div>
        
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 md:gap-3">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 px-3 py-1 md:px-4 md:py-2 rounded-xl md:rounded-2xl flex flex-col items-center min-w-[70px] md:min-w-[90px] shadow-[0_0_20px_rgba(0,242,255,0.1)]">
              <span className="text-[8px] md:text-[10px] uppercase font-black text-[#00f2ff]">Score</span>
              <span className="text-lg md:text-2xl font-black leading-tight tracking-tight">{gameState.score}</span>
            </div>
            {mpState.status === 'playing' ? (
              <div className="bg-white/5 backdrop-blur-xl border border-red-500/30 px-3 py-1 md:px-4 md:py-2 rounded-xl md:rounded-2xl flex flex-col items-center min-w-[70px] md:min-w-[90px] shadow-[0_0_20px_rgba(255,0,0,0.1)]">
                <span className="text-[8px] md:text-[10px] uppercase font-black text-red-500">Rival</span>
                <span className="text-lg md:text-2xl font-black leading-tight tracking-tight">{mpState.opponentScore}</span>
              </div>
            ) : (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 px-3 py-1 md:px-4 md:py-2 rounded-xl md:rounded-2xl flex flex-col items-center min-w-[70px] md:min-w-[90px] shadow-[0_0_20px_rgba(255,0,122,0.1)]">
                <span className="text-[8px] md:text-[10px] uppercase font-black text-[#ff007a]">Best</span>
                <span className="text-lg md:text-2xl font-black leading-tight tracking-tight">{gameState.bestScore}</span>
              </div>
            )}
          </div>
          
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`w-full py-2 rounded-xl font-black text-[10px] uppercase tracking-widest border transition-all pointer-events-auto ${
              canUndo 
              ? 'bg-[#00f2ff]/10 border-[#00f2ff]/30 text-[#00f2ff] hover:bg-[#00f2ff]/20 active:scale-95' 
              : 'bg-white/5 border-white/5 text-white/20 cursor-not-allowed'
            }`}
          >
            Undo (1)
          </button>
        </div>
      </div>

      {/* Versus Menu Overlay */}
      {(mpState.status === 'idle' && showMpMenu || mpState.status === 'searching') && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto bg-black/60 backdrop-blur-md z-50 p-4">
          <div className="bg-white/10 border border-white/20 p-6 md:p-8 rounded-[2.5rem] flex flex-col gap-5 w-full max-w-sm animate-in zoom-in duration-300 shadow-[0_0_50px_rgba(0,242,255,0.2)]">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-black uppercase tracking-[0.2em] text-[#00f2ff] text-xl">Versus Mode</h3>
              <button onClick={() => setShowMpMenu(false)} className="text-white/40 hover:text-white transition-colors">✕</button>
            </div>

            {mpState.status === 'searching' ? (
              <div className="py-12 flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-[#00f2ff] border-t-transparent rounded-full animate-spin" />
                <p className="font-black uppercase tracking-widest text-sm animate-pulse text-center">Connexion au salon {mpState.roomCode}...</p>
              </div>
            ) : (
              <>
                <button 
                  onClick={() => onCreateRoom()} 
                  className="w-full bg-[#00f2ff] text-black font-black py-4 rounded-2xl hover:scale-[1.02] transition-transform active:scale-95 shadow-lg"
                >
                  CRÉER UNE DOUBLE PARTIE
                </button>
                <div className="relative">
                   <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                      <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Code</span>
                   </div>
                   <input 
                    type="text" 
                    maxLength={4} 
                    placeholder="0000"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-16 font-black text-xl tracking-[0.5em] focus:outline-none focus:border-[#00f2ff] transition-colors placeholder:text-white/10"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.replace(/[^0-9]/g, ''))}
                  />
                  <button 
                    onClick={() => onJoinRoom(joinCode)} 
                    className="absolute right-2 top-2 bottom-2 bg-white text-black font-black px-6 rounded-xl hover:bg-[#00f2ff] transition-colors active:scale-95"
                  >
                    GO
                  </button>
                </div>
                {mpState.error && (
                  <p className="text-red-500 text-[10px] font-black uppercase text-center bg-red-500/10 py-3 rounded-xl border border-red-500/20 animate-bounce">{mpState.error}</p>
                )}
                <p className="text-[9px] text-white/40 text-center font-bold uppercase tracking-widest leading-relaxed">
                  Défiez un ami partout dans le monde.<br/>Le premier qui perd donne la victoire.
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Waiting Lobby */}
      {mpState.status === 'waiting' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto bg-black/70 backdrop-blur-xl z-[60] p-4">
          <div className="bg-white/5 border border-white/10 p-8 md:p-10 rounded-[3rem] text-center flex flex-col items-center gap-8 shadow-2xl animate-in fade-in zoom-in duration-500 w-full max-w-sm">
            <div className="space-y-2">
              <p className="text-[10px] uppercase font-black tracking-[0.3em] text-white/40">Code du Salon</p>
              <h2 className="text-6xl font-black text-[#00f2ff] tracking-[0.2em] drop-shadow-[0_0_20px_rgba(0,242,255,0.5)]">{mpState.roomCode}</h2>
              <p className="text-[9px] text-white/20 font-bold uppercase">En attente de connexion...</p>
            </div>
            
            <div className="flex gap-10">
              <div className="flex flex-col items-center gap-3">
                <div className={`w-4 h-4 rounded-full shadow-lg ${mpState.localReady ? 'bg-[#00ff85]' : 'bg-red-500 animate-pulse'}`} />
                <span className="text-[10px] uppercase font-black tracking-widest">Toi</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className={`w-4 h-4 rounded-full shadow-lg ${mpState.opponentReady ? 'bg-[#00ff85]' : 'bg-red-500 animate-pulse'}`} />
                <span className="text-[10px] uppercase font-black tracking-widest">Rival</span>
              </div>
            </div>

            <div className="flex flex-col gap-4 items-center w-full">
              <button 
                disabled={mpState.localReady}
                onClick={onReady}
                className={`w-full py-5 rounded-2xl font-black text-xl uppercase tracking-widest transition-all ${mpState.localReady ? 'bg-white/10 text-white/20 cursor-wait' : 'bg-[#00f2ff] text-black hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(0,242,255,0.4)]'}`}
              >
                {mpState.localReady ? 'En attente...' : 'PRÊT'}
              </button>
            </div>

            <button onClick={onResetMp} className="text-white/30 text-[11px] font-black uppercase tracking-[0.2em] hover:text-white transition-colors">Annuler le Clash</button>
          </div>
        </div>
      )}

      {/* Countdown overlay */}
      {mpState.status === 'countdown' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-[70] pointer-events-none">
          <h1 className="text-[15rem] md:text-[18rem] font-black italic text-white drop-shadow-[0_0_80px_rgba(255,255,255,0.6)] animate-ping">
            {counter}
          </h1>
        </div>
      )}

      {/* Result screen */}
      {mpState.status === 'ended' && (
        <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl pointer-events-auto flex items-center justify-center z-[110] p-6">
          <div className="text-center space-y-10 animate-in zoom-in fade-in duration-700 max-w-md w-full">
             <div className="space-y-2">
                <p className="text-[#00f2ff] text-xs font-black uppercase tracking-[0.5em]">Résultat du Clash</p>
                <h2 className={`text-6xl md:text-9xl font-black italic tracking-tighter drop-shadow-2xl ${mpState.winner === 'local' ? 'text-[#00ff85]' : 'text-[#ff007a]'}`}>
                  {mpState.winner === 'local' ? 'VICTOIRE' : 'DÉFAITE'}
                </h2>
             </div>
             <div className="grid grid-cols-2 gap-4 md:gap-6">
               <div className="bg-white/5 p-4 md:p-6 rounded-[2rem] border border-white/10 backdrop-blur-md">
                 <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Toi</p>
                 <p className="text-3xl md:text-4xl font-black">{gameState.score}</p>
               </div>
               <div className="bg-white/5 p-4 md:p-6 rounded-[2rem] border border-white/10 backdrop-blur-md">
                 <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Rival</p>
                 <p className="text-3xl md:text-4xl font-black text-red-400">{mpState.opponentScore}</p>
               </div>
             </div>
             <button 
                onClick={onResetMp} 
                className="w-full bg-white text-black px-12 py-5 rounded-2xl font-black text-xl hover:scale-105 transition-all active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
              >
                RETOUR AU SOLO
              </button>
          </div>
        </div>
      )}

      {/* Solo Over Screen */}
      {!isMultiplayerActive && (gameState.gameOver || gameState.won) && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md pointer-events-auto flex items-center justify-center z-40 p-6">
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

      {/* Bottom Bar */}
      <div className="w-full max-w-lg pointer-events-auto mb-2 md:mb-4 px-2">
        <div className="flex justify-between items-center bg-black/40 backdrop-blur-2xl border border-white/5 p-4 md:p-5 rounded-2xl md:rounded-[2rem] shadow-2xl gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-[8px] md:text-[9px] text-[#00f2ff]/60 uppercase tracking-[0.3em] font-bold">Forge the 2048</p>
            <p className="hidden md:block text-[8px] text-white/20 uppercase font-bold">Swipe to Move • Z to Undo</p>
          </div>
          
          <div className="flex gap-2">
             {!isMultiplayerActive && (
               <button
                  onClick={() => setShowMpMenu(true)}
                  className="bg-[#7000ff]/20 hover:bg-[#7000ff]/40 border border-[#7000ff]/30 text-[#7000ff] px-4 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all active:scale-95 shadow-[0_0_15px_rgba(112,0,255,0.2)]"
                >
                  Versus
                </button>
             )}
             
             <button
              onClick={onRestart}
              className="bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-white px-4 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest active:scale-95"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overlay;
