import { useState, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';

interface SpiritTakerProps {
  /** Oracle 위치 */
  bossPosition: [number, number, number];
  /** 점프 타겟 위치 (랜덤 플레이어) */
  targetPosition: [number, number, number];
  color?: string;
  /** 폭발까지 시간 (ms) */
  delay?: number;
  /** 전체 표시 시간 (ms) */
  duration?: number;
  /** AOE 반경 */
  radius?: number;
  onExplode?: () => void;
}

export default function SpiritTaker({
  bossPosition,
  targetPosition,
  color = '#cc00ff',
  delay = 1500,
  duration = 2000,
  radius = 5,
  onExplode,
}: SpiritTakerProps) {
  const [phase, setPhase] = useState<'warning' | 'jump' | 'explode' | 'done'>('warning');
  const [opacity, setOpacity] = useState(0);
  const [jumpProgress, setJumpProgress] = useState(0);
  const timeRef = useRef(0);

  // 타이밍 관리
  useEffect(() => {
    // 점프 시작 (전체 시간의 50%)
    const jumpTimer = setTimeout(() => {
      setPhase('jump');
    }, delay * 0.5);

    // 폭발
    const explodeTimer = setTimeout(() => {
      setPhase('explode');
      onExplode?.();
    }, delay);

    const doneTimer = setTimeout(() => {
      setPhase('done');
    }, duration);

    return () => {
      clearTimeout(jumpTimer);
      clearTimeout(explodeTimer);
      clearTimeout(doneTimer);
    };
  }, [delay, duration, onExplode]);

  // 애니메이션
  useFrame((_, delta) => {
    timeRef.current += delta;

    if (phase === 'warning') {
      // 타겟 마커 점멸
      setOpacity(0.4 + Math.sin(timeRef.current * 10) * 0.3);
    } else if (phase === 'jump') {
      // 점프 진행
      setJumpProgress((prev) => Math.min(prev + delta * 2.5, 1));
      setOpacity(0.6);
    } else if (phase === 'explode') {
      setOpacity(0.9);
    }
  });

  if (phase === 'done') return null;

  // 점프 중 Oracle 위치 계산 (포물선)
  const currentX = bossPosition[0] + (targetPosition[0] - bossPosition[0]) * jumpProgress;
  const currentZ = bossPosition[2] + (targetPosition[2] - bossPosition[2]) * jumpProgress;
  const jumpHeight = Math.sin(jumpProgress * Math.PI) * 5; // 포물선 높이

  return (
    <group>
      {/* 타겟 위치 경고 마커 */}
      <group position={[targetPosition[0], 0.02, targetPosition[2]]}>
        {/* 외곽 링 */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius - 0.3, radius, 32]} />
          <meshBasicMaterial
            color={phase === 'explode' ? '#ffffff' : color}
            transparent
            opacity={opacity}
            depthWrite={false}
          />
        </mesh>

        {/* 내부 원 (산개 표시) */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <circleGeometry args={[radius * 0.3, 16]} />
          <meshBasicMaterial
            color={phase === 'explode' ? '#ffffff' : '#ff00ff'}
            transparent
            opacity={opacity * 0.7}
            depthWrite={false}
          />
        </mesh>

        {/* X 표시 - 산개 경고 */}
        {phase === 'warning' && (
          <>
            <mesh rotation={[-Math.PI / 2, 0, Math.PI / 4]} position={[0, 0.02, 0]}>
              <planeGeometry args={[0.3, radius * 1.5]} />
              <meshBasicMaterial color="#ff0000" transparent opacity={0.8} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, -Math.PI / 4]} position={[0, 0.02, 0]}>
              <planeGeometry args={[0.3, radius * 1.5]} />
              <meshBasicMaterial color="#ff0000" transparent opacity={0.8} />
            </mesh>
          </>
        )}
      </group>

      {/* 점프 중인 Oracle 표시 */}
      {phase === 'jump' && (
        <mesh position={[currentX, 2 + jumpHeight, currentZ]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial color="#9933ff" transparent opacity={0.9} />
        </mesh>
      )}

      {/* 폭발 AOE */}
      {phase === 'explode' && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[targetPosition[0], 0.04, targetPosition[2]]}
        >
          <circleGeometry args={[radius, 32]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.8}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}

