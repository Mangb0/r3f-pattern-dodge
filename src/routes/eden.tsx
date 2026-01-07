import { useState, useCallback } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Canvas } from '@react-three/fiber';
import BackButton from '../components/back-button';
import RestartButton from '../components/ui/restart-button';
import CastBar from '../components/ui/cast-bar';
import MechanicIndicator from '../components/ui/mechanic-indicator';
import TimelineTimer from '../components/ui/timeline-timer';
import EdenScene, { type CastInfo, type MechanicInfo } from '../scenes/eden/eden-scene';

export const Route = createFileRoute('/eden')({
  component: EdenPage,
});

function EdenPage() {
  const [sceneKey, setSceneKey] = useState(0);
  const [currentCast, setCurrentCast] = useState<CastInfo | null>(null);
  const [currentMechanic, setCurrentMechanic] = useState<MechanicInfo | null>(null);
  const [timelineStart, setTimelineStart] = useState<number | null>(null);

  const handleRestart = () => {
    setSceneKey((prev) => prev + 1);
    setCurrentCast(null);
    setCurrentMechanic(null);
    setTimelineStart(null);
  };

  const handleCastStart = useCallback((cast: CastInfo) => {
    setCurrentCast(cast);
  }, []);

  const handleCastEnd = useCallback(() => {
    setCurrentCast(null);
  }, []);

  const handleMechanicChange = useCallback((mechanic: MechanicInfo | null) => {
    setCurrentMechanic(mechanic);
  }, []);

  const handleTimelineStart = useCallback((startTime: number) => {
    setTimelineStart(startTime);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <BackButton />
      <RestartButton onClick={handleRestart} />
      
      {/* 타임라인 타이머 */}
      <TimelineTimer
        isRunning={timelineStart !== null}
        startTime={timelineStart ?? undefined}
      />

      {/* 현재 기믹 표시 */}
      {currentMechanic && (
        <MechanicIndicator
          mechanicName={currentMechanic.name}
          description={currentMechanic.description}
          severity={currentMechanic.severity}
        />
      )}

      {/* 시전 바 */}
      {currentCast && (
        <CastBar
          key={`${currentCast.skillName}-${Date.now()}`}
          skillName={currentCast.skillName}
          bossName={currentCast.bossName}
          castTime={currentCast.castTime}
          color={currentCast.color}
        />
      )}

      <Canvas
        camera={{ position: [0, 5, 10], fov: 75 }}
        className="fixed! inset-0"
      >
        <EdenScene
          key={sceneKey}
          onCastStart={handleCastStart}
          onCastEnd={handleCastEnd}
          onMechanicChange={handleMechanicChange}
          onTimelineStart={handleTimelineStart}
        />
      </Canvas>
    </div>
  );
}
