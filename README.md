# mushen · 赛博半仙

An AI-driven Chinese astrology reader — 紫微斗数 · 奇门遁甲 · 四柱八字.

Built on top of [airbate/Numerologist_skills](https://github.com/airbate/Numerologist_skills).

🌐 **Live**: https://mushen-o4pqevcue-airbates-projects.vercel.app

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind
- Vercel Serverless Functions (Node runtime, maxDuration=60s)
- DeepSeek API (OpenAI-compatible) for AI interpretation
- `iztro` — 紫微斗数排盘
- `lunar-typescript` — 通用农历 + 自算八字四柱/十神
- 自写奇门排盘规则（从 Python `qimen_cli.py` 移植，常量表逐字对齐）

## Local dev

```bash
npm install
cp .env.example .env.local         # 填入 DEEPSEEK_API_KEY
npm run dev
```

打开 http://localhost:3000

## Features

- **紫微斗数**：本命盘 + AI 解读
- **奇门遁甲**：九宫盘可视化（地盘 / 天盘 / 九星 / 八门 / 八神）+ AI 解读
- **四柱八字**：四柱十神 + 大运 + AI 解读
- DeepSeek 流式输出（Markdown）
- 命盘 JSON 可展开查看

### 奇门九宫盘

奇门遁甲的解读报告顶部会渲染一个 3×3 传统九宫盘：

```
┌──────┬──────┬──────┐
│ 巽四 │ 离九 │ 坤二 │
├──────┼──────┼──────┤
│ 震三 │  中  │ 兑七 │
├──────┼──────┼──────┤
│ 艮八 │ 坎一 │ 乾六 │
└──────┴──────┴──────┘
```

每个宫位显示：
- 宫位名 + 方位 + 五行着色
- **神**（值符/螣蛇/...）
- **天盘天干**
- **九星**（主星，加粗）
- **八门**（按吉凶配色：生/休/开=绿，伤/死/惊=红，杜/景=中性）
- **地盘天干**
- 值符/值使落宫右上角有红色徽章
- 中宫标注「寄坤」

## Deploy

```bash
npx vercel deploy --prod
```

环境变量在 Vercel Dashboard → Project → Settings → Environment Variables 配 `DEEPSEEK_API_KEY`。

## Architecture

```
[表单] → POST /api/interpret (Node runtime)
         ↓
       switch(skill)
       ├─ ziwei  → iztro
       ├─ bazi   → lunar-typescript 自算
       └─ qimen  → lunar-typescript + 自写排盘规则
         ↓
       chart JSON 喂 DeepSeek prompt (system + user)
         ↓
       OpenAI SDK stream: true →  SSE 流式响应
         ↓
[react-markdown] 增量渲染 + 命盘 JSON 可展开查看
```

## License

MIT