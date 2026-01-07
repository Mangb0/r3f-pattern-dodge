import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';

interface AoeCircleProps {
  position: [number, number, number];
  radius?: number;
  color?: string;
  duration?: number; // 표시 시간 (ms)
  delay?: number; // 폭발까지 시간 (ms)
  onExplode?: () => void;
}

export default function AoeCircle({
  position,
  radius = 3,
  color = '#ff4444',
  duration = 2000,
  delay = 1500,
  onExplode,
}: AoeCircleProps) {
  const meshRef = useRef<Mesh>(null);
  const [phase, setPhase] = useState<'warning' | 'exploding' | 'done'>('warning');
  const [opacity, setOpacity] = useState(0.3);
  const startTime = useRef(Date.now());

  useEffect(() => {
    // 폭발 타이머
    const explodeTimer = setTimeout(() => {
      setPhase('exploding');
      onExplode?.();
    }, delay);

    // 사라지는 타이머
    const doneTimer = setTimeout(() => {
      setPhase('done');
    }, duration);

    return () => {
      clearTimeout(explodeTimer);
      clearTimeout(doneTimer);
    };
  }, [delay, duration, onExplode]);

  useFrame(() => {
    if (phase === 'warning') {
      // 경고 단계: 깜빡이는 효과
      const elapsed = Date.now() - startTime.current;
      const progress = elapsed / delay;
      // 시간이 지날수록 더 빠르게 깜빡임
      const blinkSpeed = 3 + progress * 10;
      setOpacity(0.2 + Math.sin(elapsed * blinkSpeed * 0.01) * 0.15 + progress * 0.3);
    } else if (phase === 'exploding') {
      // 폭발 단계: 밝게 번쩍
      setOpacity(0.8);
    }
  });

  if (phase === 'done') return null;

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[position[0], 0.01, position[2]]}
    >
      <circleGeometry args={[radius, 32]} />
      <meshBasicMaterial
        color={phase === 'exploding' ? '#ffffff' : color}
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </mesh>
  );
}
