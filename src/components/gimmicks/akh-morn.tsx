import { useState, useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";

interface AkhMornProps {
  /** 북쪽 라이트파티 위치 */
  northPosition: [number, number, number];
  /** 남쪽 라이트파티 위치 */
  southPosition: [number, number, number];
  /** 히트 횟수 (첫번째: 4, 이후 증가) */
  hits?: number;
  color?: string;
  /** 시전 시간 (ms) */
  castTime?: number;
  /** 전체 표시 시간 (ms) */
  duration?: number;
  /** 쉐어 반경 */
  radius?: number;
  onComplete?: () => void;
}

export default function AkhMorn({
  northPosition,
  southPosition,
  hits = 4,
  color = "#ff4444",
  castTime = 2000,
  duration = 4000,
  radius = 4,
  onComplete,
}: AkhMornProps) {
  const [phase, setPhase] = useState<"cast" | "hits" | "done">("cast");
  const [currentHit, setCurrentHit] = useState(0);
  const [opacity, setOpacity] = useState(0);
  const [pulseScale, setPulseScale] = useState(1);
  const timeRef = useRef(0);
  const hitIntervalRef = useRef<number | null>(null);

  // 타이밍 관리
  useEffect(() => {
    // 시전 완료 후 히트 시작
    const castTimer = setTimeout(() => {
      setPhase("hits");
      // 히트 애니메이션 (각 히트 간격: 500ms)
      let hitCount = 0;
      hitIntervalRef.current = window.setInterval(() => {
        hitCount++;
        setCurrentHit(hitCount);
        if (hitCount >= hits) {
          if (hitIntervalRef.current) {
            clearInterval(hitIntervalRef.current);
          }
        }
      }, 400);
    }, castTime);

    const doneTimer = setTimeout(() => {
      setPhase("done");
      onComplete?.();
    }, duration);

    return () => {
      clearTimeout(castTimer);
      clearTimeout(doneTimer);
      if (hitIntervalRef.current) {
        clearInterval(hitIntervalRef.current);
      }
    };
  }, [castTime, duration, hits, onComplete]);

  // 애니메이션
  useFrame((_, delta) => {
    timeRef.current += delta;

    if (phase === "cast") {
      // 시전 중 점멸
      setOpacity(0.4 + Math.sin(timeRef.current * 8) * 0.2);
      setPulseScale(1);
    } else if (phase === "hits") {
      // 히트 시 펄스 효과
      const hitPulse = 1 + Math.sin(timeRef.current * 15) * 0.15;
      setPulseScale(hitPulse);
      setOpacity(0.7);
    }
  });

  if (phase === "done") return null;

  const ShareMarker = ({
    position,
  }: {
    position: [number, number, number];
  }) => (
    <group position={position}>
      {/* 쉐어 원형 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[pulseScale, pulseScale, 1]}>
        <circleGeometry args={[radius, 32]} />
        <meshBasicMaterial
          color={phase === "hits" && currentHit > 0 ? "#ffffff" : color}
          transparent
          opacity={opacity}
          depthWrite={false}
        />
      </mesh>

      {/* 테두리 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[radius - 0.2, radius, 32]} />
        <meshBasicMaterial
          color="#ffff00"
          transparent
          opacity={opacity * 0.8}
          depthWrite={false}
        />
      </mesh>

      {/* 히트 카운터 표시 (세로 빔) */}
      {phase === "hits" && (
        <mesh position={[0, 2, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 4, 8]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.6 + Math.sin(timeRef.current * 20) * 0.3}
          />
        </mesh>
      )}
    </group>
  );

  return (
    <group>
      <ShareMarker position={northPosition} />
      <ShareMarker position={southPosition} />
    </group>
  );
}
