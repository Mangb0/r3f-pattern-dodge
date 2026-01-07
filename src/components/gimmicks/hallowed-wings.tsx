import { useState, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';

interface HallowedWingsProps {
  side: 'left' | 'right'; // 공격 방향
  color?: string;
  delay?: number; // 폭발까지 시간 (ms)
  duration?: number; // 전체 표시 시간 (ms)
  arenaRadius?: number;
  onExplode?: () => void;
}

export default function HallowedWings({
  side,
  color = '#ff4488',
  delay = 2000,
  duration = 2500,
  arenaRadius = 20,
  onExplode,
}: HallowedWingsProps) {
  const [phase, setPhase] = useState<'warning' | 'explode' | 'done'>('warning');
  const [opacity, setOpacity] = useState(0);
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
      // 점멸 효과
      setOpacity(0.3 + Math.sin(timeRef.current * 8) * 0.2);
    } else if (phase === 'explode') {
      setOpacity(0.8);
    }
  });

  if (phase === 'done') return null;

  // 반쪽 영역 위치 계산
  const xOffset = side === 'left' ? -arenaRadius / 2 : arenaRadius / 2;

  return (
    <group>
      {/* 반쪽 영역 표시 */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[xOffset, 0.04, 0]}
      >
        <planeGeometry args={[arenaRadius, arenaRadius * 2]} />
        <meshBasicMaterial
          color={phase === 'explode' ? '#ffffff' : color}
          transparent
          opacity={opacity}
          depthWrite={false}
        />
      </mesh>

      {/* 경계선 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <planeGeometry args={[0.3, arenaRadius * 2]} />
        <meshBasicMaterial
          color={phase === 'explode' ? '#ffffff' : '#ffff00'}
          transparent
          opacity={phase === 'warning' ? 0.8 : 1}
        />
      </mesh>
    </group>
  );
}
