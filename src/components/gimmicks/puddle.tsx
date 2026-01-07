import { useState, useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";

interface PuddleProps {
  position: [number, number, number];
  /** 표시 지속 시간 (ms) */
  duration?: number;
  /** 반경 */
  radius?: number;
  /** 픽업 시 콜백 */
  onPickedUp?: () => void;
}

export default function Puddle({
  position,
  duration = 8000,
  radius = 2,
}: PuddleProps) {
  const [phase, setPhase] = useState<"active" | "pickedUp" | "expired">(
    "active"
  );
  const [opacity, setOpacity] = useState(0);
  const [pulseScale, setPulseScale] = useState(0);
  const [waveScale, setWaveScale] = useState(1);
  const timeRef = useRef(0);

  // 타이밍 관리
  useEffect(() => {
    const expireTimer = setTimeout(() => {
      if (phase === "active") {
        setPhase("expired");
      }
    }, duration);

    return () => {
      clearTimeout(expireTimer);
    };
  }, [duration, phase]);

  // 애니메이션
  useFrame((_, delta) => {
    timeRef.current += delta;

    if (phase === "active") {
      // 생성 애니메이션
      setOpacity((prev) => Math.min(prev + delta * 2, 0.7));
      setPulseScale((prev) => Math.min(prev + delta * 2, 1));

      // 펄스 효과
      const pulse = 1 + Math.sin(timeRef.current * 4) * 0.1;
      setPulseScale(pulse);

      // 물결 효과
      setWaveScale(1 + Math.sin(timeRef.current * 6) * 0.2);
    } else if (phase === "pickedUp" || phase === "expired") {
      // 사라지는 애니메이션
      setOpacity((prev) => Math.max(prev - delta * 3, 0));
    }
  });

  if (opacity <= 0 && (phase === "pickedUp" || phase === "expired"))
    return null;

  return (
    <group position={position}>
      {/* 메인 웅덩이 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[pulseScale, pulseScale, 1]}>
        <circleGeometry args={[radius, 32]} />
        <meshBasicMaterial
          color={phase === "active" ? "#4488ff" : "#888888"}
          transparent
          opacity={opacity}
          depthWrite={false}
        />
      </mesh>

      {/* 내부 하이라이트 */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, 0]}
        scale={[pulseScale, pulseScale, 1]}
      >
        <circleGeometry args={[radius * 0.5, 16]} />
        <meshBasicMaterial
          color="#88ccff"
          transparent
          opacity={opacity * 0.8}
          depthWrite={false}
        />
      </mesh>

      {/* 외곽 링 */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
        scale={[pulseScale, pulseScale, 1]}
      >
        <ringGeometry args={[radius - 0.2, radius, 32]} />
        <meshBasicMaterial
          color="#00ccff"
          transparent
          opacity={opacity}
          depthWrite={false}
        />
      </mesh>

      {/* 물결 효과 (active 상태에서만) */}
      {phase === "active" && (
        <>
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.03, 0]}
            scale={[waveScale, waveScale, 1]}
          >
            <ringGeometry args={[radius * 0.7, radius * 0.75, 32]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={0.3}
              depthWrite={false}
            />
          </mesh>
        </>
      )}
    </group>
  );
}
