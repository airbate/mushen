"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Report from "@/components/Report";

type Skill = "ziwei" | "bazi" | "qimen";

function ResultForm() {
  const params = useSearchParams();
  const initial = (params.get("skill") as Skill | null) ?? "ziwei";

  const [skill, setSkill] = useState<Skill>(initial);
  const [date, setDate] = useState("1990-05-15");
  const [time, setTime] = useState("14:30");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [questionGoal, setQuestionGoal] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chart, setChart] = useState<unknown | null>(null);
  const [report, setReport] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const s = params.get("skill");
    if (s === "ziwei" || s === "bazi" || s === "qimen") setSkill(s);
  }, [params]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setChart(null);
    setReport("");
    setDone(false);

    const [y, m, d] = date.split("-").map(Number);
    const [H, M] = time.split(":").map(Number);
    const body: Record<string, unknown> = {
      skill,
      solarDate: `${y}-${m}-${d}`,
      hour: H,
      minute: M,
    };
    if (skill === "ziwei" || skill === "bazi") body.gender = gender;
    if (questionGoal.trim()) body.questionGoal = questionGoal.trim();

    try {
      const res = await fetch("/api/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error ?? "请求失败");
      }
      if (!res.body) throw new Error("无响应流");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { done: rDone, value } = await reader.read();
        if (rDone) break;
        buf += decoder.decode(value, { stream: true });

        let idx;
        while ((idx = buf.indexOf("\n\n")) >= 0) {
          const rawEvent = buf.slice(0, idx);
          buf = buf.slice(idx + 2);

          const lines = rawEvent.split("\n");
          let event = "message";
          let data = "";
          for (const line of lines) {
            if (line.startsWith("event: ")) event = line.slice(7).trim();
            else if (line.startsWith("data: ")) data += line.slice(6);
          }
          if (event === "chart") {
            try {
              const parsed = JSON.parse(data);
              setChart(parsed.chart);
            } catch {}
          } else if (event === "token") {
            try {
              const token = JSON.parse(data);
              setReport((prev) => prev + token);
            } catch {}
          } else if (event === "done") {
            setDone(true);
          } else if (event === "error") {
            try {
              const err = JSON.parse(data);
              setError(err.message ?? "DeepSeek 调用失败");
            } catch {}
          }
        }
      }
    } catch (e: any) {
      setError(e?.message ?? "未知错误");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="flex gap-2 mb-6">
        {(["ziwei", "qimen", "bazi"] as Skill[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSkill(s)}
            className={`px-4 py-2 rounded-full text-sm border transition-colors ${
              skill === s
                ? "bg-ink-900 text-paper border-ink-900"
                : "bg-paper text-ink-700 border-ink-200 hover:border-ink-500"
            }`}
          >
            {s === "ziwei" ? "紫微斗数" : s === "qimen" ? "奇门遁甲" : "四柱八字"}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="space-y-4 mb-8 bg-ink-50 p-6 rounded-lg border border-ink-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="公历出生日期">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-3 py-2 border border-ink-200 rounded bg-paper"
            />
          </Field>
          <Field label="出生时辰（24 小时制）">
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              className="w-full px-3 py-2 border border-ink-200 rounded bg-paper"
            />
          </Field>
          {(skill === "ziwei" || skill === "bazi") && (
            <Field label="性别">
              <div className="flex gap-2">
                {(["male", "female"] as const).map((g) => (
                  <label key={g} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value={g}
                      checked={gender === g}
                      onChange={() => setGender(g)}
                    />
                    <span className="text-sm">{g === "male" ? "男" : "女"}</span>
                  </label>
                ))}
              </div>
            </Field>
          )}
          <Field label="特别想关注的事（可选）" className="md:col-span-2">
            <input
              type="text"
              value={questionGoal}
              onChange={(e) => setQuestionGoal(e.target.value)}
              placeholder={skill === "qimen" ? "如：这次面试能不能成" : "如：未来三年的事业走向"}
              className="w-full px-3 py-2 border border-ink-200 rounded bg-paper"
            />
          </Field>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-cinnabar text-paper font-serif rounded hover:bg-cinnabar-light disabled:opacity-50 transition-colors"
        >
          {loading ? "正在起盘 + 解读…" : "起盘"}
        </button>
      </form>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      <Report chart={chart} report={report} done={done} loading={loading} />
    </>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-sm text-ink-500 mb-2">{label}</label>
      {children}
    </div>
  );
}

export default function ResultPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/" className="text-sm text-ink-500 hover:text-ink-700 underline">
        ← 返回首页
      </Link>
      <h1 className="font-serif text-3xl text-ink-900 mt-4 mb-8">起一盘</h1>
      <Suspense fallback={<p className="text-ink-500">加载中…</p>}>
        <ResultForm />
      </Suspense>
    </main>
  );
}