"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import QimenChart from "./QimenChart";
import type { QimenChart as QimenChartType } from "@/lib/qimen/chart";

function getQimenCurrent(c: unknown): QimenChartType | null {
  if (!c || typeof c !== "object") return null;
  const obj = c as any;
  if (obj.current && typeof obj.current === "object" && "dun_type" in obj.current) {
    return obj.current as QimenChartType;
  }
  if ("dun_type" in obj && "palaces" in obj) {
    return obj as QimenChartType;
  }
  return null;
}

export default function Report({
  skill,
  chart,
  report,
  done,
  loading,
}: {
  skill?: "ziwei" | "bazi" | "qimen";
  chart: unknown | null;
  report: string;
  done: boolean;
  loading: boolean;
}) {
  if (!chart && !report) return null;

  return (
    <div className="space-y-6">
      {skill === "qimen" && (() => {
        const cur = getQimenCurrent(chart);
        return cur ? <QimenChart chart={cur} /> : null;
      })()}

      {chart ? (
        <details className="bg-ink-50 border border-ink-100 rounded p-4">
          <summary className="cursor-pointer text-sm text-ink-500 hover:text-ink-700">
            查看命盘 JSON
          </summary>
          <pre className="mt-3 text-xs overflow-auto max-h-96 bg-paper p-3 rounded">
            {JSON.stringify(chart, null, 2)}
          </pre>
        </details>
      ) : null}

      {(report || loading) && (
        <article className="prose prose-stone max-w-none bg-paper p-6 rounded-lg border border-ink-100">
          {report ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{String(report)}</ReactMarkdown>
          ) : (
            <p className="text-ink-500">解读中…</p>
          )}
          {loading && !done && (
            <span className="inline-block w-2 h-4 bg-cinnabar ml-0.5 animate-pulse" />
          )}
        </article>
      )}
    </div>
  );
}