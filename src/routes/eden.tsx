import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/eden")({
  component: EdenPage,
});

function EdenPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Link
        to="/"
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2
                   rounded-full bg-white/10 backdrop-blur-sm border border-white/20
                   text-white transition-all hover:bg-white/20"
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
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        <span>Back</span>
      </Link>

      <div className="flex items-center justify-center min-h-screen">
        <h1 className="text-4xl font-light">Eden</h1>
      </div>
    </div>
  );
}
