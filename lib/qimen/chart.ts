// 移植自 airbate/Numerologist_skills/qimen-dunjia/scripts/qimen_cli.py
// build_chart 函数（第 316-419 行），输出 JSON 结构与 Python 完全对齐。
import { Solar } from "lunar-typescript";
import {
  JU_TABLE,
  YANG_TERMS,
  EARTH_STEM_ORDER,
  ROTATION_RING,
  STAR_RING,
  DOOR_RING,
  GOD_RING_YANG,
  GOD_RING_YIN,
  XUNSHOU_TO_HIDDEN_YI,
  PALACE_INFO,
  GRID_ORDER,
} from "./constants";
import {
  rotateToStart,
  computeYuan,
  computeEarthPlate,
  findStemPalace,
  hostedPalace,
  splitBranchPair,
  branchToPalace,
} from "./rules";

export interface QimenChart {
  dun_type: "阳遁" | "阴遁";
  yuan: "上元" | "中元" | "下元";
  ju_number: number;
  xunshou: string;
  hidden_yi: string;
  kongwang: string[];
  kongwang_palaces: number[];
  time_stem_visible: string;
  zhifu: { star: string; palace: number };
  zhishi: { door: string; palace: number };
  active_jie: string;
  active_jie_started_at: string;
  next_jie: string | null;
  next_jie_at: string | null;
  grid_order: number[];
  palaces: Array<{
    palace: number;
    name: string;
    direction: string;
    trigram: string;
    element: string;
    earth_stem: string | undefined;
    sky_stem: string | undefined;
    star: string;
    door: string | null;
    god: string | null;
    is_center: boolean;
    hosts_center: boolean;
    hosting_note: string | null;
  }>;
  warnings: string[];
}

export function buildQimenChart(input: {
  solarDate: string; // YYYY-M-D
  hour: number;
  minute?: number;
}): QimenChart {
  const { solarDate, hour, minute = 0 } = input;
  const [y, m, d] = solarDate.split("-").map(Number);
  const solar = Solar.fromYmdHms(y, m, d, hour, minute, 0);
  const lunar = solar.getLunar() as any;

  const warnings: string[] = [];

  // 节气：lunar-typescript 用 getPrevJieQi 返回 JieQi 对象
  const prev = lunar.getPrevJieQi();
  const next = lunar.getNextJieQi();
  const currentJieName: string = prev.getName();
  const dunType: "阳遁" | "阴遁" =
    YANG_TERMS.has(currentJieName) ? "阳遁" : "阴遁";

  // 日柱干支精确（带早晚子时修正的 lunar_python 用 getDayInGanZhiExact，
  // lunar-typescript 自身默认即修正过早晚子时，直接用 getDayInGanZhi）
  const dayGanzhi: string = lunar.getDayInGanZhi();
  const yuan = computeYuan(dayGanzhi);
  const juNumber = JU_TABLE[dunType][currentJieName][yuan];

  const earthStems = EARTH_STEM_ORDER[dunType];
  const earthPlate = computeEarthPlate(dunType, juNumber, earthStems);

  const timeGanzhi = lunar.getTimeInGanZhi();
  const timeGan = lunar.getTimeGan();
  const timeXun = lunar.getTimeXun();
  const timeXunkong = lunar.getTimeXunKong();
  const hiddenYi = XUNSHOU_TO_HIDDEN_YI[timeXun];
  if (!hiddenYi) {
    throw new Error(`xunshou_to_hidden_yi: unknown xun ${timeXun}`);
  }
  const visibleTimeGan = timeGan === "甲" ? hiddenYi : timeGan;
  if (timeGan === "甲") {
    warnings.push(`时干为甲，按旬首所遁之仪 ${hiddenYi} 入盘。`);
  }

  const xunshouRawPalace = findStemPalace(earthPlate, hiddenYi);
  const timeRawPalace = findStemPalace(earthPlate, visibleTimeGan);
  const xunshouPalace = hostedPalace(xunshouRawPalace);
  const timePalace = hostedPalace(timeRawPalace);

  if (xunshouRawPalace === 5 || timeRawPalace === 5) {
    warnings.push("本规则集中宫相关判断一律寄坤处理。");
  }

  let palaceOrder: number[];
  let starOrder: string[];
  let doorOrder: string[];
  let godOrder: string[];
  let outerEarth: string[];

  if (dunType === "阳遁") {
    palaceOrder = rotateToStart(ROTATION_RING, timePalace);
    starOrder = rotateToStart(
      STAR_RING,
      STAR_RING[ROTATION_RING.indexOf(xunshouPalace)],
    );
    doorOrder = rotateToStart(
      DOOR_RING,
      DOOR_RING[ROTATION_RING.indexOf(xunshouPalace)],
    );
    godOrder = GOD_RING_YANG;
    outerEarth = ROTATION_RING.map((p) => earthPlate[p]);
  } else {
    const reverseRing = [...ROTATION_RING].reverse();
    const reverseStarRing = [...STAR_RING].reverse();
    const reverseDoorRing = [...DOOR_RING].reverse();
    palaceOrder = rotateToStart(reverseRing, timePalace);
    starOrder = rotateToStart(
      reverseStarRing,
      STAR_RING[ROTATION_RING.indexOf(xunshouPalace)],
    );
    doorOrder = rotateToStart(
      reverseDoorRing,
      DOOR_RING[ROTATION_RING.indexOf(xunshouPalace)],
    );
    godOrder = GOD_RING_YIN;
    outerEarth = reverseRing.map((p) => earthPlate[p]);
  }

  const skyStartStem =
    xunshouRawPalace !== 5 ? hiddenYi : earthPlate[xunshouPalace];
  const skyOrder = rotateToStart(outerEarth, skyStartStem);

  const starMap = new Map(palaceOrder.map((p, i) => [p, starOrder[i]]));
  const doorMap = new Map(palaceOrder.map((p, i) => [p, doorOrder[i]]));
  const godMap = new Map(palaceOrder.map((p, i) => [p, godOrder[i]]));
  const skyMap = new Map(palaceOrder.map((p, i) => [p, skyOrder[i]]));

  const zhifu = { star: starMap.get(timePalace)!, palace: timePalace };
  const zhishi = { door: doorMap.get(timePalace)!, palace: timePalace };

  // 节气时间（lunar-typescript 的 getSolar() 返回 Solar 对象）
  const prevSolar = prev.getSolar() as any;
  const nextSolar = next ? (next.getSolar() as any) : null;
  const activeJieAt = prevSolar.toYmdHms();
  const nextJieAt = nextSolar ? nextSolar.toYmdHms() : null;

  const kongwangBranches = splitBranchPair(timeXunkong);
  const kongwangPalaces = branchToPalace(kongwangBranches);

  const palaces = Object.keys(PALACE_INFO)
    .map((k) => Number(k))
    .sort((a, b) => a - b)
    .map((p) => {
      const info = PALACE_INFO[p];
      return {
        palace: p,
        name: info.name,
        direction: info.direction,
        trigram: info.trigram,
        element: info.element,
        earth_stem: earthPlate[p],
        sky_stem: skyMap.get(p),
        star: p === 5 ? "天禽" : starMap.get(p)!,
        door: p === 5 ? null : doorMap.get(p)!,
        god: p === 5 ? null : godMap.get(p)!,
        is_center: p === 5,
        hosts_center: p === 2,
        hosting_note: p === 2 || p === 5 ? "中宫寄坤" : null,
      };
    });

  return {
    dun_type: dunType,
    yuan,
    ju_number: juNumber,
    xunshou: timeXun,
    hidden_yi: hiddenYi,
    kongwang: kongwangBranches,
    kongwang_palaces: kongwangPalaces,
    time_stem_visible: visibleTimeGan,
    zhifu,
    zhishi,
    active_jie: currentJieName,
    active_jie_started_at: activeJieAt,
    next_jie: next ? next.getName() : null,
    next_jie_at: nextJieAt,
    grid_order: GRID_ORDER,
    palaces,
    warnings,
  };
}