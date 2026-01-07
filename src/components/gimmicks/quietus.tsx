import { useState, useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";

interface QuietusProps {
  /** 시전 시간 (ms) */
  castTime?: number;
  /** 지속 시간 (ms) */
  duration?: number;
  onComplete?: () => void;
}

export default function Quietus({
  castTime = 2000,
  duration = 3000,
  onComplete,
}: QuietusProps) {
  const [phase, setPhase] = useState<"cast" | "explode" | "done">("cast");
  const [opacity, setOpacity] = useState(0);
  const [waveSize, setWaveSize] = useState(20);
  const timeRef = useRef(0);

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

  useFrame((_, delta) => {
    timeRef.current += delta;

    if (phase === "cast") {
      setOpacity(0.2 + Math.sin(timeRef.current * 4) * 0.1);
    } else if (phase === "explode") {
      setOpacity((prev) => Math.min(prev + delta * 2, 0.8));
      setWaveSize(20 + Math.sin(timeRef.current * 10) * 5);
    }
  });

  if (phase === "done") return null;

  return (
    <group>
      {/* 전체 화면 어둠 효과 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[50, 64]} />
        <meshBasicMaterial
          color={phase === "explode" ? "#220033" : "#110022"}
          transparent
          opacity={opacity}
          depthWrite={false}
        />
      </mesh>

      {/* 중앙 에너지 파동 */}
      {phase === "explode" && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[waveSize, waveSize + 5, 64]} />
          <meshBasicMaterial
            color="#9900ff"
            transparent
            opacity={0.6}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}
