import { useState, useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";

type DebuffType = "water" | "aero" | "eruption" | "blizzard";

interface DarkDebuffProps {
  position: [number, number, number];
  type: DebuffType;
  /** 폭발까지 시간 (ms) */
  delay?: number;
  /** 전체 지속 시간 (ms) */
  duration?: number;
  /** 반경 */
  radius?: number;
  onExplode?: () => void;
}

const DEBUFF_COLORS: Record<DebuffType, { main: string; glow: string }> = {
  water: { main: "#0066cc", glow: "#00aaff" },
  aero: { main: "#00cc66", glow: "#00ff88" },
  eruption: { main: "#cc3300", glow: "#ff6600" },
  blizzard: { main: "#6699ff", glow: "#99ccff" },
};

export default function DarkDebuff({
  position,
  type,
  delay = 3000,
  duration = 4000,
  radius = 5,
  onExplode,
}: DarkDebuffProps) {
  const [phase, setPhase] = useState<"warning" | "explode" | "done">("warning");
  const [opacity, setOpacity] = useState(0);
  const [pulseScale, setPulseScale] = useState(1);
  const [rotationY, setRotationY] = useState(0);
  const timeRef = useRef(0);

  const color = DEBUFF_COLORS[type];

  useEffect(() => {
    const explodeTimer = setTimeout(() => {
      setPhase("explode");
      onExplode?.();
    }, delay);

    const doneTimer = setTimeout(() => {
      setPhase("done");
    }, duration);

    return () => {
      clearTimeout(explodeTimer);
      clearTimeout(doneTimer);
    };
  }, [delay, duration, onExplode]);

  useFrame((_, delta) => {
    timeRef.current += delta;

    if (phase === "warning") {
      setOpacity(0.4 + Math.sin(timeRef.current * 6) * 0.2);
      setPulseScale(1 + Math.sin(timeRef.current * 3) * 0.1);
      setRotationY((prev) => prev + delta * 2);
    } else if (phase === "explode") {
      setOpacity(0.9);
      setPulseScale(1.4);
    }
  });

  if (phase === "done") return null;

  return (
    <group position={position}>
      {/* 메인 원형 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[pulseScale, pulseScale, 1]}>
        <circleGeometry args={[radius, 32]} />
        <meshBasicMaterial
          color={phase === "explode" ? "#ffffff" : color.main}
          transparent
          opacity={opacity * 0.6}
          depthWrite={false}
        />
      </mesh>

      {/* 외곽 링 */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, 0]}
        scale={[pulseScale, pulseScale, 1]}
      >
        <ringGeometry args={[radius - 0.3, radius, 32]} />
        <meshBasicMaterial
          color={color.glow}
          transparent
          opacity={opacity}
          depthWrite={false}
        />
      </mesh>

      {/* 디버프 타입별 아이콘 효과 */}
      {type === "water" && (
        <mesh position={[0, 0.5, 0]}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshBasicMaterial color={color.glow} transparent opacity={0.7} />
        </mesh>
      )}
      {type === "aero" && (
        <mesh position={[0, 0.5, 0]} rotation={[0, rotationY, 0]}>
          <torusGeometry args={[0.4, 0.1, 8, 16]} />
          <meshBasicMaterial color={color.glow} transparent opacity={0.7} />
        </mesh>
      )}
      {type === "eruption" && (
        <mesh position={[0, 0.3, 0]}>
          <coneGeometry args={[0.5, 1, 8]} />
          <meshBasicMaterial color={color.glow} transparent opacity={0.7} />
        </mesh>
      )}
      {type === "blizzard" && (
        <mesh position={[0, 0.5, 0]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.6, 0.6, 0.6]} />
          <meshBasicMaterial color={color.glow} transparent opacity={0.7} />
        </mesh>
      )}
    </group>
  );
}
