import { useState, useEffect } from 'react';

interface CastBarProps {
  /** 시전 중인 스킬 이름 */
  skillName: string;
  /** 시전 시간 (ms) */
  castTime: number;
  /** 시전 완료 콜백 */
  onComplete?: () => void;
  /** 보스 이름 */
  bossName?: string;
  /** 색상 테마 */
  color?: string;
}

export default function CastBar({
  skillName,
  castTime,
  onComplete,
  bossName = 'Boss',
  color = '#ff6b6b',
}: CastBarProps) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / castTime) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        clearInterval(interval);
        setIsComplete(true);
        onComplete?.();
      }
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [castTime, onComplete]);

  if (isComplete) return null;

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div className="flex flex-col items-center gap-1">
        {/* 보스 이름 */}
        <div className="text-sm text-gray-400 font-medium tracking-wide">
          {bossName}
        </div>
        
        {/* 스킬 이름 */}
        <div className="text-xl text-white font-bold tracking-wider drop-shadow-lg">
          {skillName}
        </div>

        {/* 시전 바 */}
        <div className="relative w-80 h-6 mt-1">
          {/* 배경 */}
          <div className="absolute inset-0 bg-black/70 border border-gray-600 rounded-sm" />
          
          {/* 진행 바 */}
          <div
            className="absolute top-0.5 left-0.5 bottom-0.5 rounded-sm transition-all duration-75"
            style={{
              width: `calc(${progress}% - 4px)`,
              background: `linear-gradient(180deg, ${color} 0%, ${color}99 50%, ${color}66 100%)`,
              boxShadow: `0 0 10px ${color}66`,
            }}
          />

          {/* 시간 표시 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs text-white font-mono drop-shadow-md">
              {((castTime - (progress / 100) * castTime) / 1000).toFixed(1)}s
            </span>
          </div>

          {/* 테두리 광택 효과 */}
          <div className="absolute inset-0 border border-white/10 rounded-sm pointer-events-none" />
        </div>
      </div>
    </div>
  );
}

