import { useState, useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";

interface ReturnPointProps {
  position: [number, number, number];
  /** 되감기까지의 시간 (ms) */
  countdown?: number;
  /** 전체 표시 시간 (ms) */
  duration?: number;
  /** 반경 */
  radius?: number;
  /** 되감기 발동 시 콜백 */
  onRewind?: () => void;
}

export default function ReturnPoint({
  position,
  countdown = 6000,
  duration = 7000,
  radius = 2,
  onRewind,
}: ReturnPointProps) {
  const [phase, setPhase] = useState<"waiting" | "rewind" | "done">("waiting");
  const [opacity, setOpacity] = useState(0);
  const [rotationY, setRotationY] = useState(0);
  const [countdownProgress, setCountdownProgress] = useState(0);
  const timeRef = useRef(0);

  // 타이밍 관리
  useEffect(() => {
    const rewindTimer = setTimeout(() => {
      setPhase("rewind");
      onRewind?.();
    }, countdown);

    const doneTimer = setTimeout(() => {
      setPhase("done");
    }, duration);

    return () => {
      clearTimeout(rewindTimer);
      clearTimeout(doneTimer);
    };
  }, [countdown, duration, onRewind]);

  // 애니메이션
  useFrame((_, delta) => {
    timeRef.current += delta;

    if (phase === "waiting") {
      // 생성 애니메이션 + 회전
      setOpacity((prev) => Math.min(prev + delta * 2, 0.8));
      setRotationY((prev) => prev + delta * 2);
      setCountdownProgress(Math.min((timeRef.current * 1000) / countdown, 1));
    } else if (phase === "rewind") {
      // 되감기 이펙트
      setOpacity(1);
      setRotationY((prev) => prev + delta * 10); // 빠른 회전
    }
  });

  if (phase === "done") return null;

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* 바닥 원형 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[radius, 32]} />
        <meshBasicMaterial
          color={phase === "rewind" ? "#00ffff" : "#6666ff"}
          transparent
          opacity={opacity * 0.5}
          depthWrite={false}
        />
      </mesh>

      {/* 진행 링 (카운트다운 표시) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry
          args={[
            radius - 0.3,
            radius,
            32,
            1,
            0,
            Math.PI * 2 * countdownProgress,
          ]}
        />
        <meshBasicMaterial
          color="#00ffff"
          transparent
          opacity={opacity}
          depthWrite={false}
        />
      </mesh>

      {/* 시계 바늘 효과 */}
      <mesh
        position={[0, 0.5, 0]}
        rotation={[0, 0, -Math.PI * 2 * countdownProgress]}
      >
        <boxGeometry args={[0.1, 0.1, radius * 0.8]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={opacity} />
      </mesh>

      {/* 수직 빔 */}
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 4, 8]} />
        <meshBasicMaterial
          color={phase === "rewind" ? "#00ffff" : "#8888ff"}
          transparent
          opacity={opacity * 0.6}
        />
      </mesh>

      {/* 되감기 이펙트 (rewind 상태에서만) */}
      {phase === "rewind" && (
        <mesh>
          <torusGeometry args={[radius * 1.5, 0.2, 8, 32]} />
          <meshBasicMaterial color="#00ffff" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}
