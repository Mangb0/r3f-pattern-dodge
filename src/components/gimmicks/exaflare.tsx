import { useState, useEffect, useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";

type Direction = "north" | "south" | "east" | "west";

interface ExaflareProps {
  /** 시작 위치 */
  startPosition: [number, number, number];
  /** 이동 방향 */
  direction: Direction;
  /** 이동 속도 */
  speed?: number;
  /** 장판 개수 */
  count?: number;
  /** 각 장판 간격 시간 (ms) */
  interval?: number;
  /** 장판 반경 */
  radius?: number;
  /** 전체 지속 시간 (ms) */
  duration?: number;
  onComplete?: () => void;
}

export default function Exaflare({
  startPosition,
  direction,
  count = 5,
  interval = 500,
  radius = 3,
  duration = 5000,
  onComplete,
}: ExaflareProps) {
  const [activeAoes, setActiveAoes] = useState<
    {
      id: number;
      position: [number, number, number];
      phase: "warning" | "explode";
    }[]
  >([]);
  const [isDone, setIsDone] = useState(false);
  const timeRef = useRef(0);
  const spawnedRef = useRef(0);

  // 방향 벡터 계산
  const directionVector = useMemo(() => {
    switch (direction) {
      case "north":
        return [0, 0, -1];
      case "south":
        return [0, 0, 1];
      case "east":
        return [1, 0, 0];
      case "west":
        return [-1, 0, 0];
    }
  }, [direction]);

  // 타이밍 관리
  useEffect(() => {
    const doneTimer = setTimeout(() => {
      setIsDone(true);
      onComplete?.();
    }, duration);

    return () => {
      clearTimeout(doneTimer);
    };
  }, [duration, onComplete]);

  // 애니메이션 및 AOE 생성
  useFrame((_, delta) => {
    timeRef.current += delta;
    const elapsedMs = timeRef.current * 1000;

    // 새 AOE 생성
    const shouldSpawn = Math.floor(elapsedMs / interval);
    if (shouldSpawn > spawnedRef.current && spawnedRef.current < count) {
      const newId = spawnedRef.current;
      const offset = newId * 4; // 각 AOE 간 거리
      const newPosition: [number, number, number] = [
        startPosition[0] + directionVector[0] * offset,
        0,
        startPosition[2] + directionVector[2] * offset,
      ];

      setActiveAoes((prev) => [
        ...prev,
        { id: newId, position: newPosition, phase: "warning" },
      ]);
      spawnedRef.current++;

      // 일정 시간 후 폭발
      setTimeout(() => {
        setActiveAoes((prev) =>
          prev.map((aoe) =>
            aoe.id === newId ? { ...aoe, phase: "explode" } : aoe
          )
        );
      }, 800);

      // 폭발 후 제거
      setTimeout(() => {
        setActiveAoes((prev) => prev.filter((aoe) => aoe.id !== newId));
      }, 1200);
    }
  });

  if (isDone) return null;

  return (
    <group>
      {activeAoes.map((aoe) => (
        <group key={aoe.id} position={aoe.position}>
          {/* 경고 원 */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[radius, 32]} />
            <meshBasicMaterial
              color={aoe.phase === "explode" ? "#ffffff" : "#ff6600"}
              transparent
              opacity={aoe.phase === "explode" ? 0.9 : 0.5}
              depthWrite={false}
            />
          </mesh>

          {/* 외곽 링 */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
            <ringGeometry args={[radius - 0.2, radius, 32]} />
            <meshBasicMaterial
              color={aoe.phase === "explode" ? "#ffffff" : "#ffcc00"}
              transparent
              opacity={0.8}
              depthWrite={false}
            />
          </mesh>

          {/* 진행 방향 표시 (warning 상태일 때만) */}
          {aoe.phase === "warning" && (
            <mesh
              position={[
                directionVector[0] * (radius + 1),
                0.5,
                directionVector[2] * (radius + 1),
              ]}
              rotation={[
                0,
                Math.atan2(directionVector[0], directionVector[2]),
                0,
              ]}
            >
              <coneGeometry args={[0.5, 1.5, 4]} />
              <meshBasicMaterial color="#ff6600" transparent opacity={0.7} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}
