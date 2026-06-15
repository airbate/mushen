import { BASE_SYSTEM, chartUserPrompt } from "./_base";
import type { ChatMessage } from "../client";

export function buildBaziMessages(chart: unknown, questionGoal?: string): ChatMessage[] {
  return [
    { role: "system", content: BASE_SYSTEM + "\n\n你现在解读的是四柱八字命盘。重点关注日主强弱、五行分布、十神配置、大运走向。引用时务必带上年柱/月柱/日柱/时柱名称与天干地支。" },
    { role: "user", content: chartUserPrompt(chart, questionGoal) },
  ];
}