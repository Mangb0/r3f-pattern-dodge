import { useState, useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";

interface EnrageProps {
  /** 시전 시간 (ms) */
  castTime?: number;
  onComplete?: () => void;
}

export default function Enrage({ castTime = 5000, onComplete }: EnrageProps) {
  const [phase, setPhase] = useState<"cast" | "explode" | "done">("cast");
  const [opacity, setOpacity] = useState(0);
  const [intensity, setIntensity] = useState(0);
  const [ringSize, setRingSize] = useState(30);
  const [ringOpacity, setRingOpacity] = useState(1);
  const timeRef = useRef(0);

  useEffect(() => {
    const explodeTimer = setTimeout(() => {
      setPhase("explode");
      onComplete?.();
    }, castTime);

    const doneTimer = setTimeout(() => {
      setPhase("done");
    }, castTime + 2000);

    return () => {
      clearTimeout(explodeTimer);
      clearTimeout(doneTimer);
    };
  }, [castTime, onComplete]);

  useFrame((_, delta) => {
    timeRef.current += delta;

    if (phase === "cast") {
      const progress = (timeRef.current * 1000) / castTime;
      setOpacity(progress * 0.6);
      setIntensity(progress);
    } else if (phase === "explode") {
      setOpacity(1);
      setIntensity(1);
      setRingSize((prev) => prev + delta * 20);
      setRingOpacity((prev) => Math.max(prev - delta, 0));
    }
  });

  if (phase === "done") return null;

  return (
    <group>
      {/* 전체 화면 빙결/어둠 효과 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[60, 64]} />
        <meshBasicMaterial
          color={phase === "explode" ? "#ffffff" : "#001133"}
          transparent
          opacity={opacity}
          depthWrite={false}
        />
      </mesh>

      {/* 중앙 에너지 집중 */}
      <mesh position={[0, 5 * intensity, 0]}>
        <sphereGeometry args={[3 * intensity, 32, 32]} />
        <meshBasicMaterial
          color="#00ccff"
          transparent
          opacity={0.6 * intensity}
        />
      </mesh>

      {/* 파동 링 */}
      {phase === "cast" && (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
            <ringGeometry args={[10 * intensity, 12 * intensity, 64]} />
            <meshBasicMaterial
              color="#0066ff"
              transparent
              opacity={0.5}
              depthWrite={false}
            />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
            <ringGeometry args={[20 * intensity, 22 * intensity, 64]} />
            <meshBasicMaterial
              color="#0044cc"
              transparent
              opacity={0.4}
              depthWrite={false}
            />
          </mesh>
        </>
      )}

      {/* 폭발 효과 */}
      {phase === "explode" && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
          <ringGeometry args={[ringSize, ringSize + 5, 64]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={ringOpacity}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}
