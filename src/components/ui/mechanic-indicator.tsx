interface MechanicIndicatorProps {
  /** 현재 기믹 이름 */
  mechanicName: string;
  /** 기믹 설명 (힌트) */
  description?: string;
  /** 위험도 색상 */
  severity?: 'info' | 'warning' | 'danger';
}

const severityColors = {
  info: {
    bg: 'bg-blue-500/20',
    border: 'border-blue-400/50',
    text: 'text-blue-300',
    glow: 'shadow-blue-500/30',
  },
  warning: {
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-400/50',
    text: 'text-yellow-300',
    glow: 'shadow-yellow-500/30',
  },
  danger: {
    bg: 'bg-red-500/20',
    border: 'border-red-400/50',
    text: 'text-red-300',
    glow: 'shadow-red-500/30',
  },
};

export default function MechanicIndicator({
  mechanicName,
  description,
  severity = 'warning',
}: MechanicIndicatorProps) {
  const colors = severityColors[severity];

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div
        className={`
          px-6 py-3 rounded-lg border backdrop-blur-sm
          ${colors.bg} ${colors.border}
          shadow-lg ${colors.glow}
          animate-pulse
        `}
      >
        <div className={`text-lg font-bold tracking-wide ${colors.text}`}>
          ⚠️ {mechanicName}
        </div>
        {description && (
          <div className="text-sm text-gray-300 mt-1">
            {description}
          </div>
        )}
      </div>
    </div>
  );
}

