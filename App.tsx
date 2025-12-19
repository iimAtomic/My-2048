
import React, { useEffect, useRef, useState } from 'react';
import GameScene from './components/GameScene';
import Overlay from './components/Overlay';
import { useGameLogic } from './hooks/useGameLogic';
import { useMultiplayer } from './hooks/useMultiplayer';

const App: React.FC = () => {
  const { gameState, move, initGame, undo } = useGameLogic();
  const { mpState, createRoom, joinRoom, setReady, startGame, resetMp } = useMultiplayer(gameState.score, gameState.gameOver);
  const touchStartRef = useRef<{ x: number, y: number } | null>(null);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
      setTimeout(() => setShowInstallBanner(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      // En mode multijoueur, on bloque les touches sauf si la partie a commencé (playing)
      // En mode solo (idle), on laisse jouer normalement
      if (mpState.status !== 'playing' && mpState.status !== 'idle') return;

      switch (key) {
        case 'arrowup':
        case 'w':
          move('UP');
          break;
        case 'arrowdown':
        case 's':
          move('DOWN');
          break;
        case 'arrowleft':
        case 'a':
          move('LEFT');
          break;
        case 'arrowright':
        case 'd':
          move('RIGHT');
          break;
        case 'z':
        case 'u':
          undo();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [move, undo, mpState.status]);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
      setShowInstallBanner(false);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (mpState.status !== 'playing' && mpState.status !== 'idle') return;
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (Math.max(absX, absY) > 30) {
      if (absX > absY) {
        move(dx > 0 ? 'RIGHT' : 'LEFT');
      } else {
        move(dy > 0 ? 'DOWN' : 'UP');
      }
    }
    touchStartRef.current = null;
  };

  // Synchronisation du début de jeu Versus
  const onCountdownEnd = () => {
    initGame();
    startGame();
  };

  return (
    <div 
      className="relative w-full h-full bg-[#050505] overflow-hidden"
      style={{ touchAction: 'none' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Dynamic Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#7000ff] blur-[150px] opacity-[0.15] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#ff007a] blur-[150px] opacity-[0.15] animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />
      
      {/* 3D Scene Layer */}
      <GameScene tiles={gameState.tiles} />
      
      {/* UI Overlay Layer */}
      <Overlay 
        gameState={gameState} 
        mpState={mpState}
        onRestart={initGame} 
        onUndo={undo} 
        onInstall={installPrompt ? handleInstall : undefined}
        showInstallBanner={showInstallBanner}
        onDismissInstall={() => setShowInstallBanner(false)}
        onCreateRoom={createRoom}
        onJoinRoom={joinRoom}
        onReady={setReady}
        onCountdownEnd={onCountdownEnd}
        onResetMp={resetMp}
      />
    </div>
  );
};

export default App;
