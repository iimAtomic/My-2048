
import React, { useEffect, useRef } from 'react';
import GameScene from './components/GameScene';
import Overlay from './components/Overlay';
import { useGameLogic } from './hooks/useGameLogic';

const App: React.FC = () => {
  const { gameState, move, initGame } = useGameLogic();
  const touchStartRef = useRef<{ x: number, y: number } | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          move('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          move('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          move('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          move('RIGHT');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

  const handleTouchStart = (e: React.TouchEvent) => {
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

    // Minimum swipe distance threshold (30px)
    if (Math.max(absX, absY) > 30) {
      if (absX > absY) {
        move(dx > 0 ? 'RIGHT' : 'LEFT');
      } else {
        move(dy > 0 ? 'DOWN' : 'UP');
      }
    }
    touchStartRef.current = null;
  };

  return (
    <div 
      className="relative w-full h-full bg-[#050505] overflow-hidden"
      style={{ touchAction: 'none' }} // Explicitly disable browser touch behavior
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Dynamic Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#7000ff] blur-[150px] opacity-[0.15] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#ff007a] blur-[150px] opacity-[0.15] animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />
      <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] rounded-full bg-[#00f2ff] blur-[120px] opacity-[0.08] animate-pulse pointer-events-none" style={{ animationDelay: '2s' }} />
      
      {/* 3D Game Layer */}
      <GameScene tiles={gameState.tiles} />
      
      {/* UI Layer */}
      <Overlay gameState={gameState} onRestart={initGame} />
    </div>
  );
};

export default App;
