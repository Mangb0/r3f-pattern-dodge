const ARENA_RADIUS = 20;

export default function EdenGround() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <circleGeometry args={[ARENA_RADIUS, 64]} />
      <meshStandardMaterial color="#4a4a5e" />
    </mesh>
  );
}
