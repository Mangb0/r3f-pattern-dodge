import { useState, useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";

type HourglassType = "yellow" | "purple" | "untethered";

interface HourglassProps {
  position: [number, number, number];
  type: HourglassType;
  /** 폭발까지의 딜레이 (ms) */
  delay?: number;
  /** 전체 표시 시간 (ms) */
  duration?: number;
  /** 폭발 반경 */
  radius?: number;
  onExplode?: () => void;
}

export default function Hourglass({
  position,
  type,
  delay = 5000,
  duration = 6000,
  radius = 8,
  onExplode,
}: HourglassProps) {
  const [phase, setPhase] = useState<"warning" | "explode" | "done">("warning");
  const [opacity, setOpacity] = useState(0);
  const [pulseScale, setPulseScale] = useState(1);
  const [tetheredOpacity, setTetheredOpacity] = useState(0.6);
  const timeRef = useRef(0);

  // 타입별 색상
  const colors = {
    yellow: { main: "#ffcc00", glow: "#fff000" },
    purple: { main: "#9933ff", glow: "#cc66ff" },
    untethered: { main: "#666666", glow: "#999999" },
  };

  const color = colors[type];

  // 타이밍 관리
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

  // 애니메이션
  useFrame((_, delta) => {
    timeRef.current += delta;

    if (phase === "warning") {
      // 점멸 효과 + 펄스
      const progress = (timeRef.current * 1000) / delay;
      const blinkSpeed = 4 + progress * 6;
      setOpacity(0.4 + Math.sin(timeRef.current * blinkSpeed) * 0.2);
      setPulseScale(1 + Math.sin(timeRef.current * 3) * 0.05);
      setTetheredOpacity(0.6 + Math.sin(timeRef.current * 8) * 0.3);
    } else if (phase === "explode") {
      setOpacity(0.9);
      setPulseScale(1.3);
    }
  });

  if (phase === "done") return null;

  return (
    <group position={position}>
      {/* 바닥 폭발 범위 표시 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[pulseScale, pulseScale, 1]}>
        <circleGeometry args={[radius, 32]} />
        <meshBasicMaterial
          color={phase === "explode" ? "#ffffff" : color.main}
          transparent
          opacity={opacity * 0.5}
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
          opacity={opacity * 0.8}
          depthWrite={false}
        />
      </mesh>

      {/* 모래시계 본체 (간단한 다이아몬드 형태) */}
      <group position={[0, 2, 0]}>
        {/* 상단 콘 */}
        <mesh position={[0, 1, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[1.2, 2, 4]} />
          <meshBasicMaterial
            color={color.main}
            transparent
            opacity={phase === "explode" ? 0.9 : 0.7}
          />
        </mesh>

        {/* 하단 콘 */}
        <mesh position={[0, -1, 0]}>
          <coneGeometry args={[1.2, 2, 4]} />
          <meshBasicMaterial
            color={color.main}
            transparent
            opacity={phase === "explode" ? 0.9 : 0.7}
          />
        </mesh>

        {/* 중앙 연결부 */}
        <mesh>
          <sphereGeometry args={[0.3, 8, 8]} />
          <meshBasicMaterial color={color.glow} transparent opacity={0.9} />
        </mesh>
      </group>

      {/* 테더 표시 (purple 타입만) */}
      {type === "purple" && phase === "warning" && (
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 3, 8]} />
          <meshBasicMaterial
            color="#9933ff"
            transparent
            opacity={tetheredOpacity}
          />
        </mesh>
      )}
    </group>
  );
}
