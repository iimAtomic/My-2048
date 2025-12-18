
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, Float, Stars, Sparkles } from '@react-three/drei';
import { BOARD_SIZE, GRID_SIZE, CELL_SIZE, TILE_COLORS } from '../constants';
import Tile3D from './Tile3D';
import { TileData } from '../types';

interface GameSceneProps {
  tiles: TileData[];
}

const GameScene: React.FC<GameSceneProps> = ({ tiles }) => {
  return (
    <Canvas shadows dpr={[1, 2]}>
      <PerspectiveCamera makeDefault position={[0, 9, 7]} fov={40} />
      <OrbitControls 
        enablePan={false} 
        enableZoom={false} 
        maxPolarAngle={Math.PI / 2.2} 
        minPolarAngle={Math.PI / 6}
      />
      
      <color attach="background" args={['#050505']} />
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={1} fade speed={1} />
      <Sparkles count={40} scale={10} size={2} speed={0.4} color="#00f2ff" />

      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={2} color="#7000ff" />
      <pointLight position={[-10, 5, -10]} intensity={1.5} color="#ff007a" />
      <spotLight position={[0, 15, 0]} angle={0.5} penumbra={1} intensity={2} castShadow color="#00f2ff" />

      <Environment preset="night" />

      {/* Game Board */}
      <group position={[0, -0.2, 0]}>
        {/* Base Plate with glow edge */}
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[BOARD_SIZE + 0.2, BOARD_SIZE + 0.2]} />
          <meshStandardMaterial color="#111" roughness={0.5} metalness={0.9} />
        </mesh>
        
        {/* Outer Glow Ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
          <ringGeometry args={[BOARD_SIZE/1.5, BOARD_SIZE/1.5 + 0.1, 32]} />
          <meshBasicMaterial color="#7000ff" transparent opacity={0.3} />
        </mesh>

        {/* Grid Cells */}
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
          const r = Math.floor(i / GRID_SIZE);
          const c = i % GRID_SIZE;
          const offset = (GRID_SIZE - 1) * CELL_SIZE / 2;
          return (
            <mesh 
              key={i} 
              position={[c * CELL_SIZE - offset, 0.01, r * CELL_SIZE - offset]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[0.95, 0.95]} />
              <meshStandardMaterial color="#222" transparent opacity={0.6} roughness={0.1} />
            </mesh>
          );
        })}
      </group>

      {/* Tiles */}
      {tiles.map(tile => (
        <Tile3D key={tile.id} tile={tile} />
      ))}

      <ContactShadows 
        position={[0, -0.21, 0]} 
        opacity={0.6} 
        scale={12} 
        blur={2.5} 
        far={5} 
        color="#000"
      />
      
      {/* Dynamic Colorful Background Objects */}
      <Float speed={3} rotationIntensity={2} floatIntensity={1}>
          <mesh position={[-6, 4, -8]} scale={1.2}>
            <torusKnotGeometry args={[1, 0.3, 128, 16]} />
            <meshStandardMaterial color="#7000ff" emissive="#7000ff" emissiveIntensity={0.5} wireframe />
          </mesh>
      </Float>
      
      <Float speed={2} rotationIntensity={1} floatIntensity={2}>
          <mesh position={[7, 2, -10]} scale={0.8}>
            <dodecahedronGeometry />
            <meshStandardMaterial color="#ff007a" emissive="#ff007a" emissiveIntensity={0.5} wireframe />
          </mesh>
      </Float>

      <Float speed={4} rotationIntensity={0.5} floatIntensity={3}>
          <mesh position={[0, -2, -15]} scale={2}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial color="#00f2ff" emissive="#00f2ff" emissiveIntensity={0.2} transparent opacity={0.1} wireframe />
          </mesh>
      </Float>
    </Canvas>
  );
};

export default GameScene;
