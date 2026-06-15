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
        <details className="bg-ink-50/60 border border-ink-100 rounded p-4">
          <summary className="cursor-pointer text-sm text-ink-500 hover:text-ink-700 select-none">
            ▸ 查看命盘 JSON
          </summary>
          <pre className="mt-3 text-xs overflow-auto max-h-96 bg-paper p-3 rounded border border-ink-100 font-mono">
            {JSON.stringify(chart, null, 2)}
          </pre>
        </details>
      ) : null}

      {(report || loading) && (
        <article
          className="relative bg-paper border border-ink-200 rounded-md shadow-sm px-8 py-10 md:px-12 md:py-14 font-serif"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(194,59,46,0.04), transparent 40%), radial-gradient(circle at 80% 70%, rgba(58,125,93,0.04), transparent 40%)",
          }}
        >
          {/* 朱砂竖印装饰条 */}
          <div className="absolute left-0 top-10 bottom-10 w-1 bg-gradient-to-b from-cinnabar/0 via-cinnabar/40 to-cinnabar/0 hidden md:block" />

          {report ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={mdComponents}
            >
              {String(report)}
            </ReactMarkdown>
          ) : (
            <p className="text-ink-500 italic">解读中…</p>
          )}
          {loading && !done && (
            <span className="inline-block w-2 h-4 bg-cinnabar ml-0.5 animate-pulse align-middle" />
          )}

          {/* 文末落款 */}
          {done && (
            <div className="mt-12 pt-6 border-t border-ink-100 flex items-center justify-end gap-3">
              <span className="font-brush text-cinnabar text-2xl tracking-widest">mushen</span>
              <span className="text-xs text-ink-400 font-serif">· 赛博半仙</span>
            </div>
          )}
        </article>
      )}
    </div>
  );
}

// 中式书页风格的 markdown 组件
const mdComponents = {
  h2: ({ children, ...rest }: any) => (
    <h2
      className="font-brush text-3xl text-ink-900 mt-10 mb-5 pb-3 border-b border-cinnabar/30 flex items-baseline gap-3 first:mt-0"
      {...rest}
    >
      <span className="text-cinnabar text-xl">❖</span>
      <span>{children}</span>
    </h2>
  ),
  h3: ({ children, ...rest }: any) => (
    <h3
      className="font-serif text-xl font-semibold text-ink-700 mt-7 mb-3 flex items-baseline gap-2"
      {...rest}
    >
      <span className="text-cinnabar">·</span>
      <span>{children}</span>
    </h3>
  ),
  p: ({ children, ...rest }: any) => (
    <p
      className="text-ink-700 leading-loose text-[15.5px] my-4 indent-8 text-justify"
      style={{ lineHeight: "1.95" }}
      {...rest}
    >
      {children}
    </p>
  ),
  ul: ({ children, ...rest }: any) => (
    <ul className="my-4 space-y-2 pl-2" {...rest}>
      {children}
    </ul>
  ),
  ol: ({ children, ...rest }: any) => (
    <ol className="my-4 space-y-2 pl-2 list-decimal list-inside marker:text-cinnabar marker:font-semibold" {...rest}>
      {children}
    </ol>
  ),
  li: ({ children, ...rest }: any) => (
    <li
      className="text-ink-700 leading-loose text-[15.5px] flex gap-2"
      style={{ lineHeight: "1.95" }}
      {...rest}
    >
      <span className="text-cinnabar shrink-0 select-none mt-0.5">▸</span>
      <span className="flex-1 text-justify">{children}</span>
    </li>
  ),
  strong: ({ children, ...rest }: any) => (
    <strong
      className="font-semibold text-ink-900 px-1 rounded"
      style={{ backgroundColor: "rgba(194, 59, 46, 0.08)" }}
      {...rest}
    >
      {children}
    </strong>
  ),
  em: ({ children, ...rest }: any) => (
    <em className="italic text-ink-700 not-italic font-medium" style={{ color: "#9d2b20" }} {...rest}>
      {children}
    </em>
  ),
  blockquote: ({ children, ...rest }: any) => (
    <blockquote
      className="my-6 pl-5 pr-4 py-3 border-l-4 italic text-ink-700"
      style={{
        lineHeight: "1.9",
        borderColor: "rgba(194, 59, 46, 0.5)",
        backgroundColor: "rgba(194, 59, 46, 0.05)",
      }}
      {...rest}
    >
      {children}
    </blockquote>
  ),
  hr: ({ ...rest }: any) => (
    <div className="my-8 flex items-center gap-3 text-cinnabar/40" {...rest}>
      <span className="flex-1 h-px bg-gradient-to-r from-transparent via-cinnabar/30 to-transparent" />
      <span className="text-sm">❀</span>
      <span className="flex-1 h-px bg-gradient-to-r from-transparent via-cinnabar/30 to-transparent" />
    </div>
  ),
  code: ({ children, ...rest }: any) => (
    <code className="font-mono text-[0.9em] bg-ink-100 text-ink-900 px-1.5 py-0.5 rounded" {...rest}>
      {children}
    </code>
  ),
  a: ({ children, href, ...rest }: any) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-cinnabar underline decoration-cinnabar/40 decoration-1 underline-offset-4 hover:decoration-cinnabar transition-colors"
      {...rest}
    >
      {children}
    </a>
  ),
};