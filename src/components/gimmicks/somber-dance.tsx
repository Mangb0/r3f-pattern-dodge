import { useState, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';

interface SomberDanceProps {
  type: 'far' | 'close'; // 첫번째(멀리) or 두번째(가까이)
  bossPosition: [number, number, number]; // Oracle 위치
  targetPosition: [number, number, number]; // 탱커 위치 (탱버 대상)
  color?: string;
  delay?: number; // 폭발까지 시간 (ms)
  duration?: number; // 전체 표시 시간 (ms)
  aoeRadius?: number; // 탱버 AoE 반경
  onExplode?: () => void;
}

export default function SomberDance({
  type,
  bossPosition,
  targetPosition,
  color = '#ff6600',
  delay = 1500,
  duration = 2000,
  aoeRadius = 4,
  onExplode,
}: SomberDanceProps) {
  const [phase, setPhase] = useState<'warning' | 'jump' | 'explode' | 'done'>('warning');
  const [opacity, setOpacity] = useState(0);
  const [jumpProgress, setJumpProgress] = useState(0);
  const timeRef = useRef(0);

  // 타이밍 관리
  useEffect(() => {
    // 점프 시작
    const jumpTimer = setTimeout(() => {
      setPhase('jump');
    }, delay * 0.6);

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
      setOpacity(0.4 + Math.sin(timeRef.current * 8) * 0.2);
    } else if (phase === 'jump') {
      setJumpProgress((prev) => Math.min(prev + delta * 3, 1));
      setOpacity(0.6);
    } else if (phase === 'explode') {
      setOpacity(0.9);
    }
  });

  if (phase === 'done') return null;

  // 현재 Oracle 위치 (점프 중이면 보간)
  const currentX = bossPosition[0] + (targetPosition[0] - bossPosition[0]) * jumpProgress;
  const currentZ = bossPosition[2] + (targetPosition[2] - bossPosition[2]) * jumpProgress;

  return (
    <group>
      {/* 타겟 위치 표시 (탱커가 서야 할 곳) */}
      <group position={[targetPosition[0], 0.03, targetPosition[2]]}>
        {/* 타겟 마커 */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[aoeRadius - 0.3, aoeRadius, 32]} />
          <meshBasicMaterial
            color={type === 'far' ? '#00ffff' : '#ff00ff'}
            transparent
            opacity={0.8}
            depthWrite={false}
          />
        </mesh>

        {/* 타입 표시 - 멀리/가까이 */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <circleGeometry args={[1, 16]} />
          <meshBasicMaterial
            color={type === 'far' ? '#00ffff' : '#ff00ff'}
            transparent
            opacity={0.6}
          />
        </mesh>
      </group>

      {/* Oracle 점프 궤적 */}
      {phase === 'jump' && (
        <mesh position={[currentX, 2 + Math.sin(jumpProgress * Math.PI) * 3, currentZ]}>
          <sphereGeometry args={[0.8, 16, 16]} />
          <meshBasicMaterial color="#9933ff" transparent opacity={0.8} />
        </mesh>
      )}

      {/* 폭발 AoE */}
      {phase === 'explode' && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[targetPosition[0], 0.04, targetPosition[2]]}>
          <circleGeometry args={[aoeRadius, 32]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={opacity}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* 경고 텍스트 영역 - 멀리/가까이 표시 */}
      <mesh position={[targetPosition[0], 3, targetPosition[2]]}>
        <planeGeometry args={[3, 1]} />
        <meshBasicMaterial
          color={type === 'far' ? '#00ffff' : '#ff00ff'}
          transparent
          opacity={phase === 'warning' ? 0.5 : 0}
        />
      </mesh>
    </group>
  );
}
