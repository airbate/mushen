import { BASE_SYSTEM, chartUserPrompt } from "./_base";
import type { ChatMessage } from "../client";

export function buildZiweiMessages(chart: unknown, questionGoal?: string): ChatMessage[] {
  return [
    { role: "system", content: BASE_SYSTEM + "\n\n你现在解读的是紫微斗数本命盘。重点关注命宫主星、四化、十二宫主要星曜组合。引用时务必带上宫位名与星曜名。" },
    { role: "user", content: chartUserPrompt(chart, questionGoal) },
  ];
}