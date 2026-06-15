import { NextRequest } from "next/server";
import { buildZiweiChart } from "@/lib/ziwei/chart";
import { buildBaziChart } from "@/lib/bazi/chart";
import { buildQimenChart } from "@/lib/qimen/chart";
import { streamChat } from "@/lib/deepseek/client";
import { buildZiweiMessages } from "@/lib/deepseek/prompts/ziwei";
import { buildBaziMessages } from "@/lib/deepseek/prompts/bazi";
import { buildQimenMessages } from "@/lib/deepseek/prompts/qimen";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

interface RequestBody {
  skill: "ziwei" | "bazi" | "qimen";
  solarDate: string;
  hour: number;
  minute?: number;
  gender?: "male" | "female";
  questionGoal?: string;
  city?: string;
}

function validate(body: unknown): RequestBody {
  if (!body || typeof body !== "object") throw new Error("请求体为空");
  const b = body as Record<string, unknown>;
  const skill = b.skill as string;
  if (skill !== "ziwei" && skill !== "bazi" && skill !== "qimen") {
    throw new Error("skill 必须为 ziwei / bazi / qimen");
  }
  if (typeof b.solarDate !== "string" || !/^\d{4}-\d{1,2}-\d{1,2}$/.test(b.solarDate)) {
    throw new Error("solarDate 格式应为 YYYY-M-D");
  }
  const hour = Number(b.hour);
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
    throw new Error("hour 必须为 0-23 的整数");
  }
  const minute = b.minute !== undefined ? Number(b.minute) : 0;
  if (!Number.isInteger(minute) || minute < 0 || minute > 59) {
    throw new Error("minute 必须为 0-59 的整数");
  }
  if ((skill === "ziwei" || skill === "bazi") && b.gender !== "male" && b.gender !== "female") {
    throw new Error("紫微 / 八字需要指定 gender");
  }
  return {
    skill: skill as RequestBody["skill"],
    solarDate: b.solarDate as string,
    hour,
    minute,
    gender: b.gender as "male" | "female" | undefined,
    questionGoal: typeof b.questionGoal === "string" ? b.questionGoal : undefined,
    city: typeof b.city === "string" ? b.city : undefined,
  };
}

export async function POST(req: NextRequest) {
  let body: RequestBody;
  try {
    body = validate(await req.json());
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!process.env.DEEPSEEK_API_KEY) {
    return new Response(JSON.stringify({ error: "DEEPSEEK_API_KEY 未配置" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    let chart: unknown;
    let messages;
    if (body.skill === "ziwei") {
      chart = buildZiweiChart({
        solarDate: body.solarDate,
        hour: body.hour,
        minute: body.minute,
        gender: body.gender!,
      });
      messages = buildZiweiMessages(chart, body.questionGoal);
    } else if (body.skill === "bazi") {
      chart = buildBaziChart({
        solarDate: body.solarDate,
        hour: body.hour,
        minute: body.minute,
        gender: body.gender!,
      });
      messages = buildBaziMessages(chart, body.questionGoal);
    } else {
      // 奇门：当前盘 + 未来 3 个流年盘（每年同月同日同时）
      const [y, m, d] = body.solarDate.split("-").map(Number);
      const baseChart = buildQimenChart({
        solarDate: body.solarDate,
        hour: body.hour,
        minute: body.minute,
      });
      const yearCharts = [1, 2, 3].map((offset) => ({
        label: `${y + offset}年流年盘`,
        chart: buildQimenChart({
          solarDate: `${y + offset}-${m}-${d}`,
          hour: body.hour,
          minute: body.minute,
        }),
      }));
      chart = { current: baseChart, yearCharts };
      messages = buildQimenMessages(chart, body.questionGoal);
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // 先把命盘 JSON 作为首条 SSE 消息送给前端，前端可展示
        controller.enqueue(
          encoder.encode(`event: chart\ndata: ${JSON.stringify({ skill: body.skill, chart })}\n\n`),
        );
        try {
          for await (const delta of streamChat(messages, { signal: req.signal })) {
            controller.enqueue(
              encoder.encode(`event: token\ndata: ${JSON.stringify(delta)}\n\n`),
            );
          }
          controller.enqueue(encoder.encode(`event: done\ndata: {}\n\n`));
          controller.close();
        } catch (err: any) {
          if (err?.name === "AbortError") {
            controller.close();
            return;
          }
          controller.enqueue(
            encoder.encode(`event: error\ndata: ${JSON.stringify({ message: err?.message ?? "DeepSeek 调用失败" })}\n\n`),
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message ?? "服务器错误" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}