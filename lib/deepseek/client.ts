import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY ?? "",
  baseURL: "https://api.deepseek.com/v1",
});

export const DEEPSEEK_MODEL = "deepseek-chat"; // V3，2026-06 仍可用，量足便宜

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function* streamChat(
  messages: ChatMessage[],
  opts?: { signal?: AbortSignal },
): AsyncGenerator<string, void, unknown> {
  if (!process.env.DEEPSEEK_API_KEY) {
    throw new Error("DEEPSEEK_API_KEY 未配置");
  }
  const stream = await client.chat.completions.create(
    {
      model: DEEPSEEK_MODEL,
      messages,
      stream: true,
      temperature: 0.4,
      top_p: 0.9,
    },
    { signal: opts?.signal },
  );

  for await (const chunk of stream as any) {
    const delta = chunk.choices?.[0]?.delta?.content;
    if (delta) yield delta;
  }
}