interface RestartButtonProps {
  onClick: () => void;
}

export default function RestartButton({ onClick }: RestartButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-2
                 rounded-full bg-black border border-white/20
                 text-white transition-all hover:bg-white/20 cursor-pointer"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
      <span>Restart</span>
    </button>
  );
}
