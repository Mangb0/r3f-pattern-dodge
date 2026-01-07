import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';

interface NpcMarkerProps {
  position: [number, number, number];
  color?: string;
  label?: string; // MT, ST, H1, H2, D1~D4
  size?: number;
}

export default function NpcMarker({
  position,
  color = '#44ff44',
  label: _label,
  size = 0.4,
}: NpcMarkerProps) {
  const meshRef = useRef<Mesh>(null);

  // 위아래 부유 애니메이션
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <group position={[position[0], 0, position[2]]}>
      {/* 바닥 원형 마커 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[size * 0.8, size, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.8} />
      </mesh>

      {/* NPC 표시 (다이아몬드 모양) */}
      <mesh ref={meshRef} position={[0, position[1], 0]} rotation={[0, Math.PI / 4, 0]}>
        <octahedronGeometry args={[size * 0.6]} />
        <meshStandardMaterial color={color} transparent opacity={0.9} />
      </mesh>

      {/* 수직선 */}
      <mesh position={[0, position[1] / 2, 0]}>
        <cylinderGeometry args={[0.03, 0.03, position[1], 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} />
      </mesh>
    </group>
  );
}
