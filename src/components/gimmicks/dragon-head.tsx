import { useState, useEffect, useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";

interface DragonHeadProps {
  /** 시작 위치 */
  startPosition: [number, number, number];
  /** 끝 위치 (이동 목표) */
  endPosition: [number, number, number];
  /** 이동 시간 (ms) */
  moveTime?: number;
  /** 전체 표시 시간 (ms) */
  duration?: number;
  /** 충돌 시 생성되는 웅덩이 위치 콜백 */
  onPopped?: (position: [number, number, number]) => void;
  onComplete?: () => void;
}

export default function DragonHead({
  startPosition,
  endPosition,
  moveTime = 3000,
  duration = 4000,
  onPopped,
  onComplete,
}: DragonHeadProps) {
  const [phase, setPhase] = useState<"moving" | "popped" | "done">("moving");
  const [progress, setProgress] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const timeRef = useRef(0);

  // 이동 경로 계산
  const currentPosition = useMemo(() => {
    const x = startPosition[0] + (endPosition[0] - startPosition[0]) * progress;
    const y = 1.5 + Math.sin(progress * Math.PI) * 2; // 포물선 높이
    const z = startPosition[2] + (endPosition[2] - startPosition[2]) * progress;
    return [x, y, z] as [number, number, number];
  }, [startPosition, endPosition, progress]);

  // 타이밍 관리
  useEffect(() => {
    const popTimer = setTimeout(() => {
      setPhase("popped");
      // 현재 위치에 웅덩이 생성 알림
      const popPosition: [number, number, number] = [
        startPosition[0] + (endPosition[0] - startPosition[0]) * progress,
        0,
        startPosition[2] + (endPosition[2] - startPosition[2]) * progress,
      ];
      onPopped?.(popPosition);
    }, moveTime);

    const doneTimer = setTimeout(() => {
      setPhase("done");
      onComplete?.();
    }, duration);

    return () => {
      clearTimeout(popTimer);
      clearTimeout(doneTimer);
    };
  }, [
    moveTime,
    duration,
    startPosition,
    endPosition,
    progress,
    onPopped,
    onComplete,
  ]);

  // 애니메이션
  useFrame((_, delta) => {
    timeRef.current += delta;

    if (phase === "moving") {
      // 이동 진행
      setProgress((prev) => Math.min(prev + delta / (moveTime / 1000), 1));
      setOpacity(0.9);
    } else if (phase === "popped") {
      // 터짐 효과
      setOpacity((prev) => Math.max(prev - delta * 2, 0));
    }
  });

  if (phase === "done") return null;

  return (
    <group position={currentPosition}>
      {/* 용 머리 본체 */}
      <mesh>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color={phase === "popped" ? "#ffffff" : "#ff4444"}
          transparent
          opacity={opacity}
        />
      </mesh>

      {/* 눈 (장식) */}
      <mesh position={[0.3, 0.3, 0.8]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshBasicMaterial color="#ffff00" />
      </mesh>
      <mesh position={[-0.3, 0.3, 0.8]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshBasicMaterial color="#ffff00" />
      </mesh>

      {/* 이동 경로 트레일 (이동 중에만) */}
      {phase === "moving" && (
        <mesh position={[0, -0.5, -1]} rotation={[Math.PI / 4, 0, 0]}>
          <coneGeometry args={[0.5, 2, 8]} />
          <meshBasicMaterial color="#ff6666" transparent opacity={0.5} />
        </mesh>
      )}

      {/* 터짐 이펙트 */}
      {phase === "popped" && (
        <mesh>
          <sphereGeometry args={[2 + (1 - opacity) * 3, 16, 16]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={opacity * 0.5}
          />
        </mesh>
      )}
    </group>
  );
}
