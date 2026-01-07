import { useState, useEffect } from 'react';

interface TimelineTimerProps {
  /** 타이머 시작 여부 */
  isRunning: boolean;
  /** 시작 시간 (timestamp) */
  startTime?: number;
}

export default function TimelineTimer({
  isRunning,
  startTime,
}: TimelineTimerProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isRunning || !startTime) {
      setElapsed(0);
      return;
    }

    const interval = setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, 100);

    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  const seconds = Math.floor(elapsed / 1000);
  const minutes = Math.floor(seconds / 60);
  const displaySeconds = seconds % 60;
  const milliseconds = Math.floor((elapsed % 1000) / 100);

  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-none">
      <div className="bg-black/70 border border-gray-600 rounded-lg px-4 py-2 backdrop-blur-sm">
        <div className="text-xs text-gray-400 mb-1">Timeline</div>
        <div className="text-2xl font-mono text-white tabular-nums">
          {String(minutes).padStart(2, '0')}:{String(displaySeconds).padStart(2, '0')}.{milliseconds}
        </div>
      </div>
    </div>
  );
}

