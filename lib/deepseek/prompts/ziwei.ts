import { BASE_SYSTEM } from "./_base";
import type { ChatMessage } from "../client";
import { CALCULATION, STARS, SIHUA, PATTERNS } from "@/lib/references/ziwei";

export function buildZiweiMessages(chart: unknown, questionGoal?: string): ChatMessage[] {
  return [
    {
      role: "system",
      content: `${BASE_SYSTEM}

你现在解读的是**紫微斗数本命盘**。

**紫微核心概念速查（已为你整理）**：
- 命宫主星：决定人的根本气质（紫微/天府/太阳/武曲/天同/廉贞/天机/七杀/破军/贪狼/巨门/天相/天梁 等 14 主星）
- 四化：化禄=机缘、化权=掌控、化科=名声、化忌=纠结
- 十二宫：命宫、兄弟、夫妻、子女、财帛、疾厄、迁移、交友（奴仆）、官禄（事业）、田宅、福德、父母
- 三方四正：与本宫形成 120°/180° 的宫位共同影响

**解读纪律**：
- 引用宫位必须带具体宫名（如"命宫紫微七杀"）
- 引用星曜必须带具体星名（如"贪狼化禄"）
- 解释四化要落到具体事务（化禄不一定"有钱"，要看落在哪个宫）
- 推运六的依据：出生年份的天干决定生年四化

用户提供的命盘 JSON：
\`\`\`json
${JSON.stringify(chart, null, 2)}
\`\`\`

${questionGoal ? `用户特别关心：${questionGoal}` : ""}`.trim(),
    },
    {
      role: "user",
      content: `请按 system 的 7 节结构详细解读。

以下是紫微斗数经典规则参考（用于校准你的解读口径，不需逐字引用）：

---

### 排盘口径（CALCULATION）

${CALCULATION}

### 主星特性（STARS）

${STARS}

### 四化规则（SIHUA）

${SIHUA}

### 格局判定（PATTERNS）

${PATTERNS}

---

现在，请按 system 指令详细解读这份命盘。`,
    },
  ];
}