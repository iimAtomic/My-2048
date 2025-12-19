
import { useState, useEffect, useCallback } from 'react';
import { Direction, TileData, GameState } from '../types';
import { GRID_SIZE } from '../constants';

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useGameLogic = () => {
  const [gameState, setGameState] = useState<GameState>({
    tiles: [],
    score: 0,
    bestScore: 0,
    gameOver: false,
    won: false,
  });

  const spawnTile = useCallback((tiles: TileData[]): TileData[] => {
    const occupied = new Set(tiles.map(t => `${t.row}-${t.col}`));
    const emptyPositions = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (!occupied.has(`${r}-${c}`)) {
          emptyPositions.push({ r, c });
        }
      }
    }

    if (emptyPositions.length === 0) return tiles;

    const randomPos = emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
    const newVal = Math.random() < 0.9 ? 2 : 4;
    
    return [
      ...tiles,
      {
        id: generateId(),
        value: newVal,
        row: randomPos.r,
        col: randomPos.c,
        isNew: true
      }
    ];
  }, []);

  const initGame = useCallback(() => {
    let initialTiles: TileData[] = [];
    initialTiles = spawnTile(initialTiles);
    initialTiles = spawnTile(initialTiles);
    setGameState(prev => ({
      ...prev,
      tiles: initialTiles,
      score: 0,
      gameOver: false,
      won: false,
      history: undefined
    }));
  }, [spawnTile]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const undo = useCallback(() => {
    setGameState(prev => {
      if (!prev.history) return prev;
      return {
        ...prev,
        tiles: prev.history.tiles,
        score: prev.history.score,
        gameOver: false,
        history: undefined
      };
    });
  }, []);

  const move = useCallback((direction: Direction) => {
    setGameState(prev => {
      if (prev.gameOver) return prev;

      const currentTilesClone = prev.tiles.map(t => ({ ...t }));
      const currentScore = prev.score;

      let newTiles: TileData[] = prev.tiles.map(t => ({ 
        ...t, 
        isNew: false, 
        isMerged: false,
        mergedFrom: undefined 
      }));
      
      let scoreInc = 0;
      let moved = false;
      const isReverse = direction === 'DOWN' || direction === 'RIGHT';
      const isVertical = direction === 'UP' || direction === 'DOWN';

      for (let i = 0; i < GRID_SIZE; i++) {
        let line: (TileData | null)[] = Array(GRID_SIZE).fill(null);
        for (let j = 0; j < GRID_SIZE; j++) {
          const r = isVertical ? j : i;
          const c = isVertical ? i : j;
          const tile = newTiles.find(t => t.row === r && t.col === c);
          line[j] = tile || null;
        }

        if (isReverse) line.reverse();
        let newLine: (TileData | null)[] = line.filter(t => t !== null);
        
        for (let j = 0; j < newLine.length - 1; j++) {
          const curr = newLine[j];
          const next = newLine[j + 1];
          if (curr && next && curr.value === next.value) {
            const mergedVal = curr.value * 2;
            scoreInc += mergedVal;
            const mergedTile: TileData = {
              id: generateId(),
              value: mergedVal,
              row: 0,
              col: 0,
              mergedFrom: [curr.id, next.id],
              isMerged: true
            };
            newLine[j] = mergedTile;
            newLine.splice(j + 1, 1);
            moved = true;
          }
        }

        while (newLine.length < GRID_SIZE) newLine.push(null);
        if (isReverse) newLine.reverse();

        newLine.forEach((tile, index) => {
          if (!tile) return;
          const r = isVertical ? index : i;
          const c = isVertical ? i : index;
          const originalTile = newTiles.find(t => t.id === tile.id);
          if (originalTile) {
            if (originalTile.row !== r || originalTile.col !== c) moved = true;
            originalTile.row = r;
            originalTile.col = c;
          } else {
            tile.row = r;
            tile.col = c;
            newTiles.push(tile);
            moved = true;
          }
        });
      }

      const mergedIds = new Set(newTiles.flatMap(t => t.mergedFrom || []));
      newTiles = newTiles.filter(t => !mergedIds.has(t.id));
      if (!moved) return prev;

      const updatedTiles = spawnTile(newTiles);
      const newScore = prev.score + scoreInc;
      
      const grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
      updatedTiles.forEach(t => grid[t.row][t.col] = t.value);
      
      let canMove = false;
      if (updatedTiles.length < GRID_SIZE * GRID_SIZE) {
        canMove = true;
      } else {
        for (let r = 0; r < GRID_SIZE; r++) {
          for (let c = 0; c < GRID_SIZE; c++) {
            if (r < GRID_SIZE - 1 && grid[r][c] === grid[r+1][c]) canMove = true;
            if (c < GRID_SIZE - 1 && grid[r][c] === grid[r][c+1]) canMove = true;
          }
        }
      }

      return {
        ...prev,
        tiles: updatedTiles,
        score: newScore,
        bestScore: Math.max(prev.bestScore, newScore),
        gameOver: !canMove,
        won: updatedTiles.some(t => t.value === 2048),
        history: {
          tiles: currentTilesClone,
          score: currentScore
        }
      };
    });
  }, [spawnTile]);

  return { gameState, move, initGame, undo };
};
