"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Report({
  chart,
  report,
  done,
  loading,
}: {
  chart: unknown | null;
  report: string;
  done: boolean;
  loading: boolean;
}) {
  if (!chart && !report) return null;

  return (
    <div className="space-y-6">
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