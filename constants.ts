
export const GRID_SIZE = 4;
export const CELL_SIZE = 1.1;
export const BOARD_PADDING = 0.1;
export const BOARD_SIZE = GRID_SIZE * CELL_SIZE + BOARD_PADDING * 2;

export const TILE_COLORS: Record<number, string> = {
  2: '#00f2ff',   // Neon Cyan
  4: '#7000ff',   // Deep Purple
  8: '#ff007a',   // Neon Pink
  16: '#ff5c00',  // Neon Orange
  32: '#00ff85',  // Neon Green
  64: '#00d1ff',  // Sky Blue
  128: '#ff00ff', // Magenta
  256: '#ffee00', // Neon Yellow
  512: '#ff3d00', // Bright Red
  1024: '#00ffcc',// Seafoam
  2048: '#ffffff',// Pure White Glow
};

export const TILE_TEXT_COLORS: Record<number, string> = {
  2: '#000000',
  4: '#ffffff',
  8: '#ffffff',
  16: '#ffffff',
  32: '#000000',
  64: '#ffffff',
  128: '#ffffff',
  256: '#000000',
  512: '#ffffff',
  1024: '#000000',
  2048: '#000000',
};

export const getTilePosition = (row: number, col: number) => {
  const offset = (GRID_SIZE - 1) * CELL_SIZE / 2;
  return [
    col * CELL_SIZE - offset,
    0.2, // height
    row * CELL_SIZE - offset
  ] as [number, number, number];
};
