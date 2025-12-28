interface CharacterProps {
  color?: string;
}

export default function Character({ color = '#4ade80' }: CharacterProps) {
  return (
    <mesh position={[0, 0.75, 0]}>
      <capsuleGeometry args={[0.3, 0.9, 4, 16]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}
