import { useState, useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";

interface MornAfahProps {
  /** 쉐어 위치 (중앙) */
  position: [number, number, number];
  color?: string;
  /** 시전 시간 (ms) */
  castTime?: number;
  /** 전체 표시 시간 (ms) */
  duration?: number;
  /** 쉐어 반경 */
  radius?: number;
  onComplete?: () => void;
}

export default function MornAfah({
  position,
  color = "#ff8800",
  castTime = 2000,
  duration = 3000,
  radius = 6,
  onComplete,
}: MornAfahProps) {
  const [phase, setPhase] = useState<"cast" | "explode" | "done">("cast");
  const [opacity, setOpacity] = useState(0);
  const [scale, setScale] = useState(0.5);
  const [beamOpacity, setBeamOpacity] = useState(0.3);
  const timeRef = useRef(0);

  // 타이밍 관리
  useEffect(() => {
    const explodeTimer = setTimeout(() => {
      setPhase("explode");
    }, castTime);

    const doneTimer = setTimeout(() => {
      setPhase("done");
      onComplete?.();
    }, duration);

    return () => {
      clearTimeout(explodeTimer);
      clearTimeout(doneTimer);
    };
  }, [castTime, duration, onComplete]);

  // 애니메이션
  useFrame((_, delta) => {
    timeRef.current += delta;

    if (phase === "cast") {
      // 시전 중 크기 증가 + 점멸
      setOpacity(0.4 + Math.sin(timeRef.current * 6) * 0.2);
      setScale((prev) => Math.min(prev + delta * 0.3, 1));
      setBeamOpacity(0.3 + Math.sin(timeRef.current * 8) * 0.2);
    } else if (phase === "explode") {
      setOpacity(0.9);
      setScale(1.2);
    }
  });

  if (phase === "done") return null;

  return (
    <group position={position}>
      {/* 메인 쉐어 원형 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[scale, scale, 1]}>
        <circleGeometry args={[radius, 32]} />
        <meshBasicMaterial
          color={phase === "explode" ? "#ffffff" : color}
          transparent
          opacity={opacity}
          depthWrite={false}
        />
      </mesh>

      {/* 내부 원 (집합 위치 표시) */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, 0]}
        scale={[scale, scale, 1]}
      >
        <circleGeometry args={[radius * 0.3, 16]} />
        <meshBasicMaterial
          color="#ffff00"
          transparent
          opacity={opacity * 0.8}
          depthWrite={false}
        />
      </mesh>

      {/* 외곽 링 */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
        scale={[scale, scale, 1]}
      >
        <ringGeometry args={[radius - 0.3, radius, 32]} />
        <meshBasicMaterial
          color="#ff4400"
          transparent
          opacity={opacity * 0.6}
          depthWrite={false}
        />
      </mesh>

      {/* 수직 빔 (집합 강조) */}
      {phase === "cast" && (
        <mesh position={[0, 3, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 6, 8]} />
          <meshBasicMaterial color={color} transparent opacity={beamOpacity} />
        </mesh>
      )}
    </group>
  );
}
