
import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
// Fix: Use animated proxy from @react-spring/three for intrinsic elements to resolve TypeScript errors
import { animated } from '@react-spring/three';
import * as THREE from 'three';

interface ShipProps {
  speed: number;
  y: number;
  z: number;
  color: string;
}

const Ship: React.FC<ShipProps> = ({ speed, y, z, color }) => {
  const meshRef = useRef<THREE.Group>(null);
  const [startX] = useState(() => (Math.random() > 0.5 ? -25 : 25));
  const direction = startX < 0 ? 1 : -1;

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.position.x += speed * delta * direction;
      // Reset position when out of bounds
      if (Math.abs(meshRef.current.position.x) > 30) {
        meshRef.current.position.x = startX;
      }
    }
  });

  return (
    // Fix: use animated.group to resolve JSX errors for intrinsic elements
    <animated.group ref={meshRef} position={[startX, y, z]}>
      <Float speed={5} rotationIntensity={0.5} floatIntensity={0.5}>
        {/* Fix: use animated.group to resolve JSX errors for intrinsic elements */}
        <animated.group rotation={[0, direction === 1 ? Math.PI / 2 : -Math.PI / 2, 0]}>
          {/* Ship Body */}
          {/* Fix: use animated proxy for mesh and geometries */}
          <animated.mesh>
            <animated.coneGeometry args={[0.2, 0.8, 3]} />
            <animated.meshStandardMaterial 
              color={color} 
              emissive={color} 
              emissiveIntensity={2} 
              wireframe 
            />
          </animated.mesh>
          {/* Wings/Engine Glow */}
          {/* Fix: use animated proxy for mesh, boxGeometry and meshStandardMaterial */}
          <animated.mesh position={[0, -0.3, 0]}>
            <animated.boxGeometry args={[0.6, 0.1, 0.1]} />
            <animated.meshStandardMaterial color={color} emissive={color} emissiveIntensity={5} />
          </animated.mesh>
          {/* Engine Trail */}
          <Sparkles 
            count={10} 
            scale={0.5} 
            size={1.5} 
            speed={2} 
            color={color} 
            position={[0, -0.5, 0]} 
          />
        </animated.group>
      </Float>
    </animated.group>
  );
};

const BackgroundShips: React.FC = () => {
  const ships = useMemo(() => [
    { id: 1, speed: 4, y: 5, z: -15, color: '#00f2ff' },
    { id: 2, speed: 3, y: 8, z: -20, color: '#7000ff' },
    { id: 3, speed: 6, y: -2, z: -18, color: '#ff007a' },
    { id: 4, speed: 2, y: 12, z: -25, color: '#00ff85' },
  ], []);

  return (
    // Fix: use animated.group to resolve JSX errors for intrinsic elements
    <animated.group>
      {ships.map((ship) => (
        <Ship key={ship.id} {...ship} />
      ))}
    </animated.group>
  );
};

export default BackgroundShips;
