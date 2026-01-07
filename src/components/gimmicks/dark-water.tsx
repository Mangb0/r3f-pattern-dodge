import { useState, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';

interface DarkWaterProps {
  /** 쉐어 중심 위치 */
  position: [number, number, number];
  color?: string;
  /** 폭발까지 시간 (ms) */
  delay?: number;
  /** 전체 표시 시간 (ms) */
  duration?: number;
  /** 쉐어 반경 */
  radius?: number;
  onExplode?: () => void;
}

export default function DarkWater({
  position,
  color = '#4466ff',
  delay = 2000,
  duration = 2500,
  radius = 4,
  onExplode,
}: DarkWaterProps) {
  const [phase, setPhase] = useState<'warning' | 'explode' | 'done'>('warning');
  const [opacity, setOpacity] = useState(0);
  const [pulseScale, setPulseScale] = useState(1);
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
      // 점멸 + 펄스 효과
      setOpacity(0.4 + Math.sin(timeRef.current * 6) * 0.2);
      setPulseScale(1 + Math.sin(timeRef.current * 4) * 0.1);
    } else if (phase === 'explode') {
      setOpacity(0.9);
      setPulseScale(1.2);
    }
  });

  if (phase === 'done') return null;

  // 화살표 방향 (4방향 - 모여라 표시)
  const arrowAngles = [0, Math.PI / 2, Math.PI, -Math.PI / 2];

  return (
    <group position={[position[0], 0, position[2]]}>
      {/* 메인 쉐어 영역 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} scale={pulseScale}>
        <circleGeometry args={[radius, 32]} />
        <meshBasicMaterial
          color={phase === 'explode' ? '#ffffff' : color}
          transparent
          opacity={opacity * 0.5}
          depthWrite={false}
        />
      </mesh>

      {/* 외곽 링 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} scale={pulseScale}>
        <ringGeometry args={[radius - 0.3, radius, 32]} />
        <meshBasicMaterial
          color={phase === 'explode' ? '#ffffff' : '#00aaff'}
          transparent
          opacity={opacity}
          depthWrite={false}
        />
      </mesh>

      {/* 중앙 모여라 표시 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <circleGeometry args={[0.8, 16]} />
        <meshBasicMaterial
          color={phase === 'explode' ? '#ffffff' : '#00ffff'}
          transparent
          opacity={phase === 'warning' ? 0.8 : 1}
        />
      </mesh>

      {/* 화살표들 (모여라 방향 표시) */}
      {phase === 'warning' && arrowAngles.map((angle, i) => (
        <group key={i} rotation={[0, angle, 0]}>
          {/* 화살표 몸통 */}
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.03, -radius * 0.6]}
          >
            <planeGeometry args={[0.4, radius * 0.4]} />
            <meshBasicMaterial
              color="#00ffff"
              transparent
              opacity={opacity}
            />
          </mesh>
          {/* 화살표 머리 */}
          <mesh
            rotation={[-Math.PI / 2, 0, Math.PI / 4]}
            position={[0, 0.04, -radius * 0.35]}
          >
            <planeGeometry args={[0.6, 0.6]} />
            <meshBasicMaterial
              color="#00ffff"
              transparent
              opacity={opacity}
            />
          </mesh>
        </group>
      ))}

      {/* 물결 효과 (여러 개의 확장하는 링) */}
      {phase === 'warning' && [0.3, 0.6, 0.9].map((offset, i) => {
        const waveScale = 1 + ((timeRef.current * 0.5 + offset) % 1) * 0.5;
        const waveOpacity = 0.3 * (1 - ((timeRef.current * 0.5 + offset) % 1));
        return (
          <mesh
            key={i}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.01, 0]}
            scale={waveScale}
          >
            <ringGeometry args={[radius * 0.8, radius, 32]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={waveOpacity}
              depthWrite={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}

