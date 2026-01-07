import { useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsType } from "three-stdlib";
import type { Mesh } from "three";
import Character from "./character";

interface GameSceneProps {
  children?: ReactNode;
  backgroundColor?: string;
  onCharacterRef?: (mesh: Mesh | null) => void;
}

export default function GameScene({
  children,
  backgroundColor = "#ffffff",
  onCharacterRef,
}: GameSceneProps) {
  const controlsRef = useRef<OrbitControlsType>(null);
  const characterMeshRef = useRef<Mesh | null>(null);

  // 카메라 이동
  useFrame(({ camera }) => {
    if (controlsRef.current && characterMeshRef.current) {
      const target = controlsRef.current.target;
      const pos = characterMeshRef.current.position;

      const deltaX = pos.x - target.x;
      const deltaZ = pos.z - target.z;

      target.x += deltaX * 0.1;
      target.z += deltaZ * 0.1;
      camera.position.x += deltaX * 0.1;
      camera.position.z += deltaZ * 0.1;

      controlsRef.current.update();
    }
  });

  return (
    <>
      <color attach="background" args={[backgroundColor]} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <Character
        speed={6}
        onMeshReady={(mesh) => {
          characterMeshRef.current = mesh;
          onCharacterRef?.(mesh);
        }}
      />
      {children}
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enablePan={false}
        rotateSpeed={0.8}
        minDistance={5}
        maxDistance={20}
        maxPolarAngle={Math.PI / 2.2}
      />
    </>
  );
}
