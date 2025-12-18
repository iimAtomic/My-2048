
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface TileData {
  id: string;
  value: number;
  row: number;
  col: number;
  mergedFrom?: string[];
  isNew?: boolean;
}

export interface GameState {
  tiles: TileData[];
  score: number;
  bestScore: number;
  gameOver: boolean;
  won: boolean;
}
