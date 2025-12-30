import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import type { Mesh } from "three";
import { useKeyboard } from "../hooks/use-keyboard";

interface CharacterProps {
  color?: string;
  speed?: number;
  onMeshReady?: (mesh: Mesh) => void;
}

const direction = new Vector3();
const frontVector = new Vector3();
const sideVector = new Vector3();

export default function Character({
  color = "#4ade80",
  speed = 5,
  onMeshReady,
}: CharacterProps) {
  const meshRef = useRef<Mesh>(null);
  const keys = useKeyboard();
  const { camera } = useThree();

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    const moveSpeed = speed * delta;

    // 카메라가 바라보는 방향 확인
    camera.getWorldDirection(direction);
    direction.y = 0;
    direction.normalize();

    // 이동 벡터 초기화
    frontVector.set(0, 0, 0);
    sideVector.set(0, 0, 0);

    // 카메라 방향 기준 이동
    if (keys.current.has("w")) frontVector.add(direction);
    if (keys.current.has("s")) frontVector.sub(direction);

    const right = new Vector3()
      .crossVectors(new Vector3(0, 1, 0), direction)
      .normalize();
    if (keys.current.has("a")) sideVector.add(right);
    if (keys.current.has("d")) sideVector.sub(right);

    const moveDirection = frontVector.add(sideVector);
    if (moveDirection.length() > 0) {
      moveDirection.normalize();
      meshRef.current.position.x += moveDirection.x * moveSpeed;
      meshRef.current.position.z += moveDirection.z * moveSpeed;
    }
  });

  const handleRef = (node: Mesh | null) => {
    meshRef.current = node;
    if (node && onMeshReady) {
      onMeshReady(node);
    }
  };

  return (
    <mesh ref={handleRef} position={[0, 0.75, 0]}>
      <capsuleGeometry args={[0.3, 0.9, 4, 16]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}
