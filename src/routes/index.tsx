import { createFileRoute, Link } from "@tanstack/react-router";
import { bosses } from "../constants/bosses";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-light text-white tracking-wider mb-4">
          Pattern Dodge
        </h1>
        <p className="text-gray-400 text-lg">Select a boss to begin</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {bosses.map((boss) => (
          <Link
            key={boss.id}
            to={boss.path}
            className="group relative block p-6 rounded-2xl border border-white/10
                       bg-white/5 backdrop-blur-sm transition-all duration-300
                       hover:border-white/30 hover:bg-white/10 hover:scale-105"
          >
            <div
              className="absolute top-4 right-4 w-3 h-3 rounded-full"
              style={{ backgroundColor: boss.previewColor }}
            />
            <h3 className="text-2xl font-medium text-white">{boss.name}</h3>
          </Link>
        ))}
      </div>
    </div>
  );
}
