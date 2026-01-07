import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import type { Group } from 'three';

interface BossProps {
  name: string;
  color?: string;
  position?: [number, number, number];
  targetPosition?: [number, number, number]; // 이동 목표 위치
  moveSpeed?: number; // 이동 속도
  spawnDelay?: number;
  onSpawned?: () => void;
  onArrived?: () => void; // 목표 도착 콜백
}

const tempVec = new Vector3();

export default function Boss({
  name: _name,
  color = '#60a5fa',
  position = [0, 1, -5],
  targetPosition,
  moveSpeed = 5,
  spawnDelay = 0,
  onSpawned,
  onArrived,
}: BossProps) {
  const groupRef = useRef<Group>(null);
  const [isSpawned, setIsSpawned] = useState(spawnDelay === 0);
  const [scale, setScale] = useState(spawnDelay === 0 ? 1 : 0);
  const [hasArrived, setHasArrived] = useState(false);

  // 스폰 딜레이
  useEffect(() => {
    if (spawnDelay > 0) {
      const timer = setTimeout(() => {
        setIsSpawned(true);
        onSpawned?.();
      }, spawnDelay);
      return () => clearTimeout(timer);
    }
  }, [spawnDelay, onSpawned]);

  // targetPosition 변경 시 도착 상태 리셋
  useEffect(() => {
    setHasArrived(false);
  }, [targetPosition]);

  // 스폰 애니메이션 + 이동
  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // 스폰 애니메이션
    if (isSpawned && scale < 1) {
      setScale((prev) => Math.min(prev + delta * 2, 1));
    }

    // 목표 위치로 이동
    if (targetPosition && !hasArrived) {
      const current = groupRef.current.position;
      tempVec.set(targetPosition[0], targetPosition[1], targetPosition[2]);

      const distance = current.distanceTo(tempVec);
      if (distance < 0.1) {
        current.copy(tempVec);
        setHasArrived(true);
        onArrived?.();
      } else {
        const direction = tempVec.sub(current).normalize();
        current.add(direction.multiplyScalar(moveSpeed * delta));
      }
    }
  });

  if (!isSpawned && scale === 0) return null;

  return (
    <group ref={groupRef} position={position}>
      {/* 보스 본체 (캡슐 - 캐릭터보다 크게) */}
      <mesh scale={scale}>
        <capsuleGeometry args={[0.5, 1.5, 4, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* 보스 이름 표시 (나중에 Text 컴포넌트로 교체 가능) */}
      <mesh position={[0, 2.5, 0]} scale={scale}>
        <planeGeometry args={[2, 0.5]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>
    </group>
  );
}
