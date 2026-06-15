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