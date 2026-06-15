"use client";

import type { QimenChart } from "@/lib/qimen/chart";

const GRID_ORDER = [4, 9, 2, 3, 5, 7, 8, 1, 6];

// 五行颜色（克制，不要太花）
const ELEMENT_COLOR: Record<string, string> = {
  木: "#3a7d5d",
  火: "#c0392b",
  土: "#a17c4a",
  金: "#7d6a3a",
  水: "#1c4b7d",
};

export default function QimenChart({ chart }: { chart: QimenChart }) {
  const palacesByIndex: Record<number, QimenChart["palaces"][number]> = {};
  chart.palaces.forEach((p) => {
    palacesByIndex[p.palace] = p;
  });

  return (
    <div className="bg-paper p-4 rounded-lg border border-ink-100">
      <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
        <h3 className="font-serif text-lg text-ink-900">
          {chart.dun_type} · {chart.yuan} · {chart.ju_number}局
        </h3>
        <div className="text-xs text-ink-500 space-x-3">
          <span>值符 <b className="text-ink-700">{chart.zhifu.star}</b> 落 <b className="text-cinnabar">{palacesByIndex[chart.zhifu.palace]?.name}</b></span>
          <span>值使 <b className="text-ink-700">{chart.zhishi.door}</b> 落 <b className="text-cinnabar">{palacesByIndex[chart.zhishi.palace]?.name}</b></span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1 max-w-2xl mx-auto aspect-square">
        {GRID_ORDER.map((idx) => {
          const p = palacesByIndex[idx];
          if (!p) return <div key={idx} className="aspect-square bg-ink-50/50 rounded" />;
          return (
            <PalaceCell key={idx} p={p} isZhifu={p.palace === chart.zhifu.palace} isZhishi={p.palace === chart.zhishi.palace} />
          );
        })}
      </div>

      {chart.kongwang.length > 0 && (
        <div className="mt-3 text-xs text-ink-500 text-center">
          空亡：<span className="text-ink-700 font-mono">{chart.kongwang.join("、")}</span>
          {chart.kongwang_palaces.length > 0 && (
            <span className="ml-2">
              （{chart.kongwang_palaces.map((n) => palacesByIndex[n]?.name).filter(Boolean).join("、")}）
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function PalaceCell({
  p,
  isZhifu,
  isZhishi,
}: {
  p: QimenChart["palaces"][number];
  isZhifu: boolean;
  isZhishi: boolean;
}) {
  const isCenter = p.is_center;
  const elColor = ELEMENT_COLOR[p.element] ?? "#5a4f3a";

  return (
    <div
      className={`relative aspect-square border rounded p-1.5 flex flex-col text-xs ${
        isCenter
          ? "bg-ink-50/40 border-ink-100"
          : "bg-paper border-ink-200"
      } ${isZhifu || isZhishi ? "ring-2 ring-cinnabar/40" : ""}`}
    >
      {/* 宫位名 + 方向 */}
      <div className="flex items-baseline justify-between text-[10px] text-ink-500 mb-0.5">
        <span className="font-serif font-medium" style={{ color: elColor }}>{p.name}</span>
        <span>{p.direction}·{p.trigram}</span>
      </div>

      {isCenter ? (
        <div className="flex-1 flex items-center justify-center text-ink-500 text-[10px] leading-tight text-center">
          中宫<br/>寄坤
        </div>
      ) : (
        <>
          {/* 神 */}
          {p.god && (
            <div className="text-[10px] text-cinnabar font-medium truncate">
              {p.god}
            </div>
          )}
          {/* 天盘 */}
          <div className="flex items-center justify-between text-[10px] mt-0.5">
            <span className="text-ink-500">天</span>
            <span className="font-mono text-ink-700">{p.sky_stem ?? "—"}</span>
          </div>
          {/* 星 + 门 */}
          <div className="flex-1 flex items-center justify-center gap-1 my-0.5">
            {p.star && (
              <span className="font-serif text-sm font-semibold text-ink-900">
                {p.star}
              </span>
            )}
            {p.door && (
              <span className={`text-[10px] px-1 py-px rounded ${doorColor(p.door)}`}>
                {p.door}
              </span>
            )}
          </div>
          {/* 地盘 */}
          <div className="flex items-center justify-between text-[10px] mt-0.5">
            <span className="text-ink-500">地</span>
            <span className="font-mono text-ink-700">{p.earth_stem ?? "—"}</span>
          </div>
        </>
      )}

      {(isZhifu || isZhishi) && (
        <div className="absolute -top-1 -right-1 text-[8px] bg-cinnabar text-paper px-1 rounded">
          {isZhifu ? "值符" : "值使"}
        </div>
      )}
    </div>
  );
}

function doorColor(door: string): string {
  // 八门分类着色：生/开/休 = 吉，伤/死/惊 = 凶，杜/景 = 中
  if (["开门", "休门", "生门"].includes(door)) return "bg-emerald-100 text-emerald-700";
  if (["死门", "惊门", "伤门"].includes(door)) return "bg-red-100 text-red-700";
  return "bg-ink-100 text-ink-700";
}