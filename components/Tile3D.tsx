
import React, { useRef } from 'react';
import { useSpring, animated, config } from '@react-spring/three';
import { Text, RoundedBox } from '@react-three/drei';
import { getTilePosition, TILE_COLORS, TILE_TEXT_COLORS } from '../constants';
import { TileData } from '../types';

interface Tile3DProps {
  tile: TileData;
}

const Tile3D: React.FC<Tile3DProps> = ({ tile }) => {
  const position = getTilePosition(tile.row, tile.col);

  const { pos, scale, color, emissiveIntensity } = useSpring({
    pos: position,
    scale: tile.isNew ? [1.05, 1.05, 1.05] : [1, 1, 1],
    color: TILE_COLORS[tile.value] || '#3c3a32',
    emissiveIntensity: tile.value >= 128 ? 1.5 : 0.6,
    from: {
      scale: tile.isNew ? [0.1, 0.1, 0.1] : [1, 1, 1],
      emissiveIntensity: 0,
    },
    config: { ...config.stiff, precision: 0.0001 }
  });

  return (
    <animated.group position={pos} scale={scale}>
      <RoundedBox args={[1, 0.4, 1]} radius={0.12} smoothness={4}>
        <animated.meshStandardMaterial 
          color={color} 
          roughness={0.1} 
          metalness={0.8}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
        />
      </RoundedBox>
      <Text
        position={[0, 0.22, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={tile.value > 100 ? 0.35 : 0.5}
        color={TILE_TEXT_COLORS[tile.value] || '#f9f6f2'}
        font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        {tile.value}
      </Text>
      
      {/* Light glow for high value tiles */}
      {tile.value >= 64 && (
        <pointLight color={TILE_COLORS[tile.value]} intensity={tile.value / 256} distance={2} position={[0, 0.5, 0]} />
      )}
    </animated.group>
  );
};

export default Tile3D;
