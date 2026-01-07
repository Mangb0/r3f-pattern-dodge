import { useState, useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";

interface UnholyDarknessProps {
  position: [number, number, number];
  /** 시전 시간 (ms) */
  castTime?: number;
  /** 지속 시간 (ms) */
  duration?: number;
  /** 반경 */
  radius?: number;
  onExplode?: () => void;
}

export default function UnholyDarkness({
  position,
  castTime = 2000,
  duration = 3000,
  radius = 6,
  onExplode,
}: UnholyDarknessProps) {
  const [phase, setPhase] = useState<"cast" | "explode" | "done">("cast");
  const [opacity, setOpacity] = useState(0);
  const [scale, setScale] = useState(0.5);
  const [coreY, setCoreY] = useState(0.5);
  const timeRef = useRef(0);

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
      setOpacity(0.4 + Math.sin(timeRef.current * 8) * 0.2);
      setScale((prev) => Math.min(prev + delta * 0.3, 1));
      setCoreY(0.5 + Math.sin(timeRef.current * 4) * 0.3);
    } else if (phase === "explode") {
      setOpacity(0.9);
      setScale(1.3);
    }
  });

  if (phase === "done") return null;

  return (
    <group position={position}>
      {/* 메인 원형 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[scale, scale, 1]}>
        <circleGeometry args={[radius, 32]} />
        <meshBasicMaterial
          color={phase === "explode" ? "#ffffff" : "#440066"}
          transparent
          opacity={opacity}
          depthWrite={false}
        />
      </mesh>

      {/* 외곽 링 */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, 0]}
        scale={[scale, scale, 1]}
      >
        <ringGeometry args={[radius - 0.3, radius, 32]} />
        <meshBasicMaterial
          color="#9900ff"
          transparent
          opacity={opacity * 0.8}
          depthWrite={false}
        />
      </mesh>

      {/* 중앙 코어 */}
      <mesh position={[0, coreY, 0]}>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshBasicMaterial
          color="#9900ff"
          transparent
          opacity={phase === "explode" ? 0.9 : 0.6}
        />
      </mesh>
    </group>
  );
}
