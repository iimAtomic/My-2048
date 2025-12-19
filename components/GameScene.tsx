
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, Float, Stars, Sparkles } from '@react-three/drei';
// Fix: use animated proxy for intrinsic elements to resolve TypeScript errors
import { animated } from '@react-spring/three';
import { BOARD_SIZE, GRID_SIZE, CELL_SIZE, TILE_COLORS } from '../constants';
import Tile3D from './Tile3D';
import BackgroundShips from './BackgroundShips';
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
        enableRotate={false} // Désactive la rotation pour éviter que la plateforme ne tourne pendant le jeu
        maxPolarAngle={Math.PI / 2.2} 
        minPolarAngle={Math.PI / 6}
      />
      
      {/* Fix: use animated proxy for color element */}
      <animated.color attach="background" args={['#050505']} />
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={1} fade speed={1} />
      <Sparkles count={40} scale={15} size={2} speed={0.4} color="#00f2ff" />

      {/* Fix: use animated proxy for all light types */}
      <animated.ambientLight intensity={0.2} />
      <animated.pointLight position={[10, 10, 10]} intensity={2} color="#7000ff" />
      <animated.pointLight position={[-10, 5, -10]} intensity={1.5} color="#ff007a" />
      <animated.spotLight position={[0, 15, 0]} angle={0.5} penumbra={1} intensity={2} castShadow color="#00f2ff" />

      <Environment preset="night" />

      {/* Background Ambience: Space Ships */}
      <BackgroundShips />

      {/* Game Board */}
      <animated.group position={[0, -0.2, 0]}>
        {/* Base Plate with glow edge */}
        <animated.mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <animated.planeGeometry args={[BOARD_SIZE + 0.2, BOARD_SIZE + 0.2]} />
          <animated.meshStandardMaterial color="#111" roughness={0.5} metalness={0.9} />
        </animated.mesh>
        
        {/* Outer Glow Ring */}
        <animated.mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
          <animated.ringGeometry args={[BOARD_SIZE/1.5, BOARD_SIZE/1.5 + 0.1, 32]} />
          <animated.meshBasicMaterial color="#7000ff" transparent opacity={0.3} />
        </animated.mesh>

        {/* Grid Cells */}
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
          const r = Math.floor(i / GRID_SIZE);
          const c = i % GRID_SIZE;
          const offset = (GRID_SIZE - 1) * CELL_SIZE / 2;
          return (
            <animated.mesh 
              key={i} 
              position={[c * CELL_SIZE - offset, 0.01, r * CELL_SIZE - offset]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <animated.planeGeometry args={[0.95, 0.95]} />
              <animated.meshStandardMaterial color="#222" transparent opacity={0.6} roughness={0.1} />
            </animated.mesh>
          );
        })}
      </animated.group>

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
          <animated.mesh position={[-10, 6, -15]} scale={1.5}>
            <animated.torusKnotGeometry args={[1, 0.3, 128, 16]} />
            <animated.meshStandardMaterial color="#7000ff" emissive="#7000ff" emissiveIntensity={0.5} wireframe />
          </animated.mesh>
      </Float>
      
      <Float speed={2} rotationIntensity={1} floatIntensity={2}>
          <animated.mesh position={[12, 4, -20]} scale={1}>
            <animated.dodecahedronGeometry />
            <animated.meshStandardMaterial color="#ff007a" emissive="#ff007a" emissiveIntensity={0.5} wireframe />
          </animated.mesh>
      </Float>
    </Canvas>
  );
};

export default GameScene;
