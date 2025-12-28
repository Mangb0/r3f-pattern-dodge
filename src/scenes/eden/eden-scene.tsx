import { OrbitControls } from '@react-three/drei';
import Character from '../../components/character';
import EdenGround from './eden-ground';

export default function EdenScene() {
  return (
    <>
      <color attach="background" args={['#ffffff']} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <Character />
      <EdenGround />
      <OrbitControls />
    </>
  );
}
