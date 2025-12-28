import { createFileRoute } from '@tanstack/react-router';
import { Canvas } from '@react-three/fiber';
import BackButton from '../components/back-button';
import EdenScene from '../scenes/eden/eden-scene';

export const Route = createFileRoute('/eden')({
  component: EdenPage,
});

function EdenPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <BackButton />
      <Canvas
        camera={{ position: [0, 5, 10], fov: 75 }}
        className="fixed! inset-0"
      >
        <EdenScene />
      </Canvas>
    </div>
  );
}
