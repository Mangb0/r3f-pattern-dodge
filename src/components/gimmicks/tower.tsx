import { useState, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';

interface TowerProps {
  position: [number, number, number];
  radius?: number;
  color?: string;
  delay?: number; // 폭발까지 시간 (ms)
  duration?: number; // 전체 표시 시간 (ms)
  onExplode?: () => void;
}

export default function Tower({
  position,
  radius = 3,
  color = '#ffcc00',
  delay = 3000,
  duration = 3500,
  onExplode,
}: TowerProps) {
  const [phase, setPhase] = useState<'warning' | 'explode' | 'done'>('warning');
  const [pulseScale, setPulseScale] = useState(1);
  const [height, setHeight] = useState(0);
  const timeRef = useRef(0);

  // 타이밍 관리
  useEffect(() => {
    const explodeTimer = setTimeout(() => {
      setPhase('explode');
      onExplode?.();
    }, delay);

    const doneTimer = setTimeout(() => {
      setPhase('done');
    }, duration);

    return () => {
      clearTimeout(explodeTimer);
      clearTimeout(doneTimer);
    };
  }, [delay, duration, onExplode]);

  // 애니메이션
  useFrame((_, delta) => {
    timeRef.current += delta;

    if (phase === 'warning') {
      // 펄스 효과 (빠르게 점멸)
      setPulseScale(1 + Math.sin(timeRef.current * 6) * 0.1);
      // 타워 높이 상승
      setHeight((prev) => Math.min(prev + delta * 2, 4));
    }
  });

  if (phase === 'done') return null;

  return (
    <group position={position}>
      {/* 바닥 원형 표시 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[radius * 0.8, radius, 32]} />
        <meshBasicMaterial
          color={phase === 'explode' ? '#ffffff' : color}
          transparent
          opacity={phase === 'explode' ? 0.9 : 0.6}
          depthWrite={false}
        />
      </mesh>

      {/* 타워 기둥 (반투명 원통) */}
      <mesh position={[0, height / 2, 0]} scale={[pulseScale, 1, pulseScale]}>
        <cylinderGeometry args={[radius, radius, height, 32, 1, true]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.3}
          depthWrite={false}
          side={2} // DoubleSide
        />
      </mesh>

      {/* 상단 빛 효과 */}
      {height > 0.5 && (
        <mesh position={[0, height, 0]}>
          <sphereGeometry args={[radius * 0.3, 16, 16]} />
          <meshBasicMaterial
            color={phase === 'explode' ? '#ffffff' : color}
            transparent
            opacity={phase === 'explode' ? 1 : 0.7}
          />
        </mesh>
      )}
    </group>
  );
}
