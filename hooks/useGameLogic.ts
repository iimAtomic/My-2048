
import { useState, useEffect, useCallback } from 'react';
import { Direction, TileData, GameState } from '../types';
import { GRID_SIZE } from '../constants';

const createEmptyGrid = () => Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));

export const useGameLogic = () => {
  const [gameState, setGameState] = useState<GameState>({
    tiles: [],
    score: 0,
    bestScore: 0,
    gameOver: false,
    won: false,
  });

  const generateId = () => Math.random().toString(36).substr(2, 9);

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
      won: false
    }));
  }, [spawnTile]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const move = useCallback((direction: Direction) => {
    setGameState(prev => {
      if (prev.gameOver) return prev;

      let newTiles: TileData[] = prev.tiles.map(t => ({ ...t, isNew: false, mergedFrom: undefined }));
      let scoreInc = 0;
      let moved = false;

      const isReverse = direction === 'DOWN' || direction === 'RIGHT';
      const isVertical = direction === 'UP' || direction === 'DOWN';

      for (let i = 0; i < GRID_SIZE; i++) {
        let line: (TileData | null)[] = Array(GRID_SIZE).fill(null);
        
        // Extract line
        for (let j = 0; j < GRID_SIZE; j++) {
          const r = isVertical ? j : i;
          const c = isVertical ? i : j;
          const tile = newTiles.find(t => t.row === r && t.col === c);
          line[j] = tile || null;
        }

        if (isReverse) line.reverse();

        // Compress
        let newLine: (TileData | null)[] = line.filter(t => t !== null);
        
        // Merge
        for (let j = 0; j < newLine.length - 1; j++) {
          const curr = newLine[j];
          const next = newLine[j + 1];
          if (curr && next && curr.value === next.value) {
            const mergedVal = curr.value * 2;
            scoreInc += mergedVal;
            const mergedTile: TileData = {
              id: generateId(),
              value: mergedVal,
              row: 0, // temp
              col: 0, // temp
              mergedFrom: [curr.id, next.id]
            };
            newLine[j] = mergedTile;
            newLine.splice(j + 1, 1);
            moved = true;
          }
        }

        // Fill remaining with null
        while (newLine.length < GRID_SIZE) newLine.push(null);
        if (isReverse) newLine.reverse();

        // Update positions back to tiles array
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
            // It's a newly merged tile
            tile.row = r;
            tile.col = c;
            newTiles.push(tile);
            moved = true;
          }
        });
      }

      // Filter out merged parents
      const mergedIds = new Set(newTiles.flatMap(t => t.mergedFrom || []));
      newTiles = newTiles.filter(t => !mergedIds.has(t.id));

      if (!moved) return prev;

      const updatedTiles = spawnTile(newTiles);
      const newScore = prev.score + scoreInc;
      
      // Game Over Check
      let gameOver = false;
      if (updatedTiles.length === GRID_SIZE * GRID_SIZE) {
        gameOver = true;
        // Check if any merges possible
        const directions: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
        for (const dir of directions) {
             // Simplify: if any neighbors have same value
        }
        // Basic check for full board and no adjacent matches
        const grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
        updatedTiles.forEach(t => grid[t.row][t.col] = t.value);
        
        let canMove = false;
        for (let r = 0; r < GRID_SIZE; r++) {
          for (let c = 0; c < GRID_SIZE; c++) {
            if (r < GRID_SIZE - 1 && grid[r][c] === grid[r+1][c]) canMove = true;
            if (c < GRID_SIZE - 1 && grid[r][c] === grid[r][c+1]) canMove = true;
          }
        }
        if (!canMove) gameOver = true;
        else gameOver = false;
      }

      return {
        ...prev,
        tiles: updatedTiles,
        score: newScore,
        bestScore: Math.max(prev.bestScore, newScore),
        gameOver,
        won: updatedTiles.some(t => t.value === 2048)
      };
    });
  }, [spawnTile]);

  return { gameState, move, initGame };
};
