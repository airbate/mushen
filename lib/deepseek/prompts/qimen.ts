import { BASE_SYSTEM, chartUserPrompt } from "./_base";
import type { ChatMessage } from "../client";

export function buildQimenMessages(chart: unknown, questionGoal?: string): ChatMessage[] {
  return [
    {
      role: "system",
      content: `${BASE_SYSTEM}

你现在解读的是奇门遁甲盘，重点关注：
- 阴阳遁、几局、值符值使落宫
- 用神（看问什么事就找哪个宫 / 哪个星 / 哪门最相关）
- 空亡、马星、反吟、伏吟
- 旺衰与五行生克

引用时务必带上宫位（如"坎一宫"）、星名（如"天蓬"）、门名（如"休门"）、神名（如"值符"）、天地盘天干。

输出要求：
- 第一行必须给出"用神落宫 + 旺衰"的一句话判断（这是事实层，方便巡检）
- 然后按标准格式输出解读
- 强调"奇门测事不测命"，主论事之成败时机，不替代现实判断`,
    },
    { role: "user", content: chartUserPrompt(chart, questionGoal) },
  ];
}