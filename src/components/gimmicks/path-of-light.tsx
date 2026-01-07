import { useState, useEffect, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { BufferGeometry, Float32BufferAttribute } from 'three';

interface PathOfLightProps {
  /** Oracle 위치 */
  bossPosition: [number, number, number];
  /** 타겟 방향 (플레이어 위치) */
  targetPosition: [number, number, number];
  color?: string;
  /** 폭발까지 시간 (ms) */
  delay?: number;
  /** 전체 표시 시간 (ms) */
  duration?: number;
  /** 부채꼴 각도 (라디안) - 기본 90도 */
  coneAngle?: number;
  /** 부채꼴 반경 */
  radius?: number;
  onExplode?: () => void;
}

// 부채꼴 Geometry 생성 함수
function createConeGeometry(radius: number, angle: number, segments: number = 32): BufferGeometry {
  const geometry = new BufferGeometry();
  const positions: number[] = [];
  const indices: number[] = [];
  
  // 중심점 추가
  positions.push(0, 0, 0);
  
  // 부채꼴 호 상의 점들 추가
  const halfAngle = angle / 2;
  for (let i = 0; i <= segments; i++) {
    const theta = -halfAngle + (angle * i) / segments;
    positions.push(
      Math.sin(theta) * radius,
      0,
      Math.cos(theta) * radius
    );
  }
  
  // 삼각형 인덱스 생성 (중심에서 호로 연결)
  for (let i = 1; i <= segments; i++) {
    indices.push(0, i, i + 1);
  }
  
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  
  return geometry;
}

export default function PathOfLight({
  bossPosition,
  targetPosition,
  color = '#ffff00',
  delay = 2000,
  duration = 2500,
  coneAngle = Math.PI / 2, // 90도
  radius = 25,
  onExplode,
}: PathOfLightProps) {
  const [phase, setPhase] = useState<'warning' | 'explode' | 'done'>('warning');
  const [opacity, setOpacity] = useState(0);
  const timeRef = useRef(0);

  // 보스에서 타겟 방향으로의 각도 계산
  const angle = useMemo(() => {
    const dx = targetPosition[0] - bossPosition[0];
    const dz = targetPosition[2] - bossPosition[2];
    return Math.atan2(dx, dz);
  }, [bossPosition, targetPosition]);

  // 부채꼴 geometry 생성
  const coneGeometry = useMemo(() => {
    return createConeGeometry(radius, coneAngle, 32);
  }, [radius, coneAngle]);

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

  // cleanup geometry on unmount
  useEffect(() => {
    return () => {
      coneGeometry.dispose();
    };
  }, [coneGeometry]);

  // 애니메이션
  useFrame((_, delta) => {
    timeRef.current += delta;

    if (phase === 'warning') {
      // 점멸 효과 - 시간이 지날수록 빨라짐
      const progress = (timeRef.current * 1000) / delay;
      const blinkSpeed = 6 + progress * 8;
      setOpacity(0.3 + Math.sin(timeRef.current * blinkSpeed) * 0.15);
    } else if (phase === 'explode') {
      setOpacity(0.9);
    }
  });

  if (phase === 'done') return null;

  return (
    <group position={[bossPosition[0], 0.03, bossPosition[2]]} rotation={[0, angle, 0]}>
      {/* 메인 부채꼴 영역 */}
      <mesh geometry={coneGeometry}>
        <meshBasicMaterial
          color={phase === 'explode' ? '#ffffff' : color}
          transparent
          opacity={opacity}
          depthWrite={false}
          side={2} // DoubleSide
        />
      </mesh>

      {/* 테두리 효과 */}
      <mesh geometry={coneGeometry}>
        <meshBasicMaterial
          color={phase === 'explode' ? '#ffffff' : '#ff8800'}
          transparent
          opacity={opacity * 0.3}
          depthWrite={false}
          wireframe
          side={2}
        />
      </mesh>

      {/* 시작점 마커 (Oracle 위치) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[2, 16]} />
        <meshBasicMaterial
          color={phase === 'explode' ? '#ffffff' : '#9933ff'}
          transparent
          opacity={phase === 'warning' ? 0.6 : 0.9}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
