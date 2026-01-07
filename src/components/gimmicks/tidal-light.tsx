import { useState, useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";

interface TidalLightProps {
  /** 시작 방향: 'east' 또는 'west' */
  direction: "east" | "west";
  /** 시전 시간 (ms) */
  castTime?: number;
  /** 지속 시간 (ms) */
  duration?: number;
  /** 폭 */
  width?: number;
  onExplode?: () => void;
}

export default function TidalLight({
  direction,
  castTime = 2000,
  duration = 3000,
  width = 20,
  onExplode,
}: TidalLightProps) {
  const [phase, setPhase] = useState<"cast" | "explode" | "done">("cast");
  const [opacity, setOpacity] = useState(0);
  const [sweepProgress, setSweepProgress] = useState(0);
  const timeRef = useRef(0);

  // 방향에 따른 시작/끝 위치
  const startX = direction === "east" ? -20 : 20;
  const endX = direction === "east" ? 20 : -20;

  useEffect(() => {
    const explodeTimer = setTimeout(() => {
      setPhase("explode");
      onExplode?.();
    }, castTime);

    const doneTimer = setTimeout(() => {
      setPhase("done");
    }, duration);

    return () => {
      clearTimeout(explodeTimer);
      clearTimeout(doneTimer);
    };
  }, [castTime, duration, onExplode]);

  useFrame((_, delta) => {
    timeRef.current += delta;

    if (phase === "cast") {
      setOpacity(0.3 + Math.sin(timeRef.current * 6) * 0.2);
    } else if (phase === "explode") {
      // 스윕 효과
      setSweepProgress((prev) => Math.min(prev + delta * 2, 1));
      setOpacity(0.8);
    }
  });

  if (phase === "done") return null;

  const currentX = startX + (endX - startX) * sweepProgress;

  return (
    <group>
      {/* 예고 영역 (전체) */}
      {phase === "cast" && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <planeGeometry args={[40, width]} />
          <meshBasicMaterial
            color="#00ffff"
            transparent
            opacity={opacity}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* 스윕 라인 */}
      {phase === "explode" && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[currentX, 0.03, 0]}>
          <planeGeometry args={[2, width]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.9}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* 통과한 영역 */}
      {phase === "explode" && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[(startX + currentX) / 2, 0.02, 0]}
        >
          <planeGeometry args={[Math.abs(currentX - startX), width]} />
          <meshBasicMaterial
            color="#00ffff"
            transparent
            opacity={0.4}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}
