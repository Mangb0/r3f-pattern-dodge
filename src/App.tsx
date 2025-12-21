import { Canvas } from "@react-three/fiber";

export default function App() {
  return (
    <div className="w-screen h-screen">
      <div className="size-6 bg-green-500">asddd</div>
      <Canvas className="w-full h-full">
        <mesh>
          <boxGeometry />
          <meshStandardMaterial />
        </mesh>
      </Canvas>
    </div>
  );
}
