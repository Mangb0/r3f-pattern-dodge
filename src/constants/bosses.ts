import type { BossConfig } from "../types/boss";

export const bosses: BossConfig[] = [
  {
    id: "eden",
    name: "Eden",
    path: "/eden",
    previewColor: "#4ade80",
  },
];

export function getBossById(id: string): BossConfig | undefined {
  return bosses.find((b) => b.id === id);
}

export function getBossByPath(path: string): BossConfig | undefined {
  return bosses.find((b) => b.path === path);
}
