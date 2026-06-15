// 移植自 qimen_cli.py 的纯函数规则
import { JIAZI, ROTATION_RING, BRANCH_TO_PALACE } from "./constants";

export function rotateToStart<T>(arr: T[], start: T): T[] {
  const idx = arr.indexOf(start);
  if (idx < 0) {
    throw new Error(`rotate_to_start: element ${start} not in ring`);
  }
  return [...arr.slice(idx), ...arr.slice(0, idx)];
}

export function computeYuan(dayGanzhi: string): "上元" | "中元" | "下元" {
  const idx = JIAZI.indexOf(dayGanzhi);
  if (idx < 0) throw new Error(`compute_yuan: invalid ganzhi ${dayGanzhi}`);
  return ["上元", "中元", "下元"][(Math.floor(idx / 5)) % 3] as "上元" | "中元" | "下元";
}

export function computeEarthPlate(
  dunType: "阳遁" | "阴遁",
  juNumber: number,
  earthStems: string[],
): Record<number, string> {
  const rotated = rotateToStart([1, 2, 3, 4, 5, 6, 7, 8, 9], juNumber);
  const out: Record<number, string> = {};
  rotated.forEach((p, i) => {
    out[p] = earthStems[i];
  });
  return out;
}

export function findStemPalace(earthPlate: Record<number, string>, stem: string): number {
  for (const [palace, s] of Object.entries(earthPlate)) {
    if (s === stem) return Number(palace);
  }
  throw new Error(`find_stem_palace: stem ${stem} not found in earth plate`);
}

export function hostedPalace(palace: number): number {
  return palace === 5 ? 2 : palace;
}

export function splitBranchPair(text: string): string[] {
  return text.split("");
}

export function branchToPalace(branches: string[]): number[] {
  return Array.from(
    new Set(
      branches
        .filter((b) => b in BRANCH_TO_PALACE)
        .map((b) => BRANCH_TO_PALACE[b]),
    ),
  ).sort((a, b) => a - b);
}

export { ROTATION_RING };