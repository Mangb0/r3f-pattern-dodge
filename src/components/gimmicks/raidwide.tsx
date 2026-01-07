import { useState, useEffect } from 'react';

interface RaidwideProps {
  duration?: number; // 이펙트 지속 시간 (ms)
  color?: string;
  onComplete?: () => void;
}

export default function Raidwide({
  duration = 500,
  color = '#ff4444',
  onComplete,
}: RaidwideProps) {
  const [opacity, setOpacity] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    // 페이드 인
    setOpacity(0.6);

    // 페이드 아웃
    const fadeOutTimer = setTimeout(() => {
      setOpacity(0);
    }, duration * 0.6);

    // 완료
    const doneTimer = setTimeout(() => {
      setIsDone(true);
      onComplete?.();
    }, duration);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(doneTimer);
    };
  }, [duration, onComplete]);

  if (isDone) return null;

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
      <circleGeometry args={[50, 64]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </mesh>
  );
}
