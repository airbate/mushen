import { BASE_SYSTEM } from "./_base";
import type { ChatMessage } from "../client";
import { RULESET_MAINLINE, GEJU, YONGSHEN, INTERVIEW, EXAMPLES } from "@/lib/references/qimen";

export function buildQimenMessages(chart: unknown, questionGoal?: string): ChatMessage[] {
  const chartJson = JSON.stringify(chart, null, 2);
  return [
    {
      role: "system",
      content: `${BASE_SYSTEM}

你现在解读的是**奇门遁甲盘**。

**奇门核心概念速查**：
- **九宫**：坎1(北/水) / 坤2(西南/土) / 震3(东/木) / 巽4(东南/木) / 中5(土) / 乾6(西北/金) / 兑7(西/金) / 艮8(东北/土) / 离9(南/火)
- **九星**：天蓬(主盗/水) / 天任(土) / 天冲(木) / 天辅(木) / 天英(火) / 天芮(凶/土) / 天柱(金) / 天心(吉/金)
- **八门**：休/生/伤/杜/景/死/惊/开 — 生/休/开为吉，死/惊/伤为凶
- **八神**：值符(吉神) / 螣蛇(虚惊) / 太阴(阴助) / 六合(和合) / 白虎(凶) / 玄武(盗) / 九地(稳) / 九天(扬)
- **阴阳遁 + 局数**：冬至到芒种 = 阳遁，夏至到大雪 = 阴遁
- **值符 = 当前时辰的天盘主星，值使 = 当前时辰的地盘八门**

**解读纪律**：
- 第一行必须给出"用神落宫 + 旺衰"一句话判断（事实层）
- 引用时必须带宫位名（坎/艮/...）、星名（天蓬/...）、门名（休门/...）、神名（值符/...）
- 奇门测事不测命：主论事之成败时机，不替代现实判断
- 时家奇门以问事的时辰起盘，若问题跨越多个时辰，需说明"按当前盘推断"

用户提供的盘：
- 当前盘（用户问事的当下时刻）
- 未来 1/2/3 年的流年盘（每年同一时刻）

\`\`\`json
${chartJson}
\`\`\`

${questionGoal ? `用户特别关心：${questionGoal}` : ""}`.trim(),
    },
    {
      role: "user",
      content: `请按 system 的 7 节结构详细解读。

以下是奇门遁甲规则参考（用于校准你的解读口径）：

---

### 主线规则集（RULESET）

${RULESET_MAINLINE}

### 格局判断（GEJU）

${GEJU}

### 用神取法（YONGSHEN）

${YONGSHEN}

### 访谈流程（INTERVIEW）

${INTERVIEW}

### 典型盘例（EXAMPLES）

${EXAMPLES}

---

现在，按 system 指令对这份奇门盘做完整解读。注意：
1. 当前盘用来分析"事当下如何"
2. 流年盘用来对比变化趋势，**重点关注用神落宫是否改变、值符值使是否换了**
3. 给出明确的时间窗口建议（如"第 3 年艮宫用神得力"）
4. 第六节"运势详查"必须分年论述`,
    },
  ];
}