
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface TileData {
  id: string;
  value: number;
  row: number;
  col: number;
  mergedFrom?: string[];
  isNew?: boolean;
  isMerged?: boolean;
}

export interface GameState {
  tiles: TileData[];
  score: number;
  bestScore: number;
  gameOver: boolean;
  won: boolean;
  history?: {
    tiles: TileData[];
    score: number;
  };
}

export type MultiplayerStatus = 'idle' | 'searching' | 'waiting' | 'ready' | 'countdown' | 'playing' | 'ended';

export interface MultiplayerState {
  roomCode: string | null;
  status: MultiplayerStatus;
  isHost: boolean;
  opponentScore: number;
  opponentReady: boolean;
  localReady: boolean;
  winner: 'local' | 'opponent' | null;
  error: string | null;
}
