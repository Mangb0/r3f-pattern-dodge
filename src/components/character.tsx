import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';
import { useKeyboard } from '../hooks/use-keyboard';

interface CharacterProps {
  color?: string;
  speed?: number;
}

export default function Character({ color = '#4ade80', speed = 5 }: CharacterProps) {
  const meshRef = useRef<Mesh>(null);
  const keys = useKeyboard();

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    const moveSpeed = speed * delta;
    const position = meshRef.current.position;

    if (keys.current.has('w')) position.z -= moveSpeed;
    if (keys.current.has('s')) position.z += moveSpeed;
    if (keys.current.has('a')) position.x -= moveSpeed;
    if (keys.current.has('d')) position.x += moveSpeed;
  });

  return (
    <mesh ref={meshRef} position={[0, 0.75, 0]}>
      <capsuleGeometry args={[0.3, 0.9, 4, 16]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}
