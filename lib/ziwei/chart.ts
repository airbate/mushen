import { astro } from 'iztro';

export interface ZiweiChart {
  solarDate: string;
  solarTime: string;
  gender: 'male' | 'female';
  mingGong: string;
  shenGong: string;
  palaces: Array<{
    index: number;
    name: string;
    isBodyPalace: boolean;
    isOriginalPalace: boolean;
    heavenlyStem: string;
    majorStars: Array<{ name: string; brightness: string; mutagen?: string }>;
    minorStars: Array<{ name: string; type: string }>;
  }>;
}

function toTimeIndex(hour: number): number {
  // 子时 23-1 = 0, 丑 1-3 = 1, ... 子 1-23 = 0 ... 未 13-15 = 7
  // 公式: (hour + 1) / 2 floor, mod 12; 23 -> 0, 0 -> 0, 1 -> 1
  if (hour === 23) return 0;
  return Math.floor((hour + 1) / 2);
}

export function buildZiweiChart(input: {
  solarDate: string;
  hour: number;
  minute?: number;
  gender: 'male' | 'female';
}) {
  const { solarDate, hour, minute = 0, gender } = input;
  const [y, m, d] = solarDate.split('-').map(Number);
  const tIndex = toTimeIndex(hour);

  const astrolabe = astro.bySolar(
    `${y}-${m}-${d}`,
    tIndex,
    gender,
    true,
    'zh-CN',
  ) as any;

  const palaces = astrolabe.palaces.map((p: any, i: number) => ({
    index: i,
    name: String(p.name),
    isBodyPalace: Boolean(p.isBodyPalace),
    isOriginalPalace: Boolean(p.isOriginalPalace),
    heavenlyStem: String(p.heavenlyStem ?? ''),
    majorStars: (p.majorStars ?? []).map((s: any) => ({
      name: String(s.name),
      brightness: String(s.brightness ?? ''),
      mutagen: s.mutagen ? String(s.mutagen) : undefined,
    })),
    minorStars: (p.minorStars ?? []).map((s: any) => ({
      name: String(s.name),
      type: String(s.type ?? ''),
    })),
  }));

  return {
    solarDate,
    solarTime: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
    gender,
    mingGong: String(astrolabe.mingGong),
    shenGong: String(astrolabe.shenGong ?? ''),
    palaces,
  };
}