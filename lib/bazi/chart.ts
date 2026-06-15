import { Solar } from 'lunar-typescript';

const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 十神关系：以日干为"我"，按五行生克 + 阴阳判定
// 比肩/劫财/食神/伤官/偏财/正财/七杀/偏官/正印/偏印
function tenGod(dayMaster: string, other: string): string {
  const dmEl = element(dayMaster);
  const oEl = element(other);
  const dmYin = HEAVENLY_STEMS.indexOf(dayMaster) % 2 === 1; // 奇数 = 阴
  const oYin = HEAVENLY_STEMS.indexOf(other) % 2 === 1;
  const sameYin = dmYin === oYin;

  if (dmEl === oEl) {
    return sameYin ? '比肩' : '劫财';
  }
  // 我生 = 食伤
  const generates: Record<string, string> = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' };
  if (generates[dmEl] === oEl) {
    return sameYin ? '食神' : '伤官';
  }
  // 我克 = 财
  const overcomes: Record<string, string> = { 木: '土', 火: '金', 土: '水', 金: '木', 水: '火' };
  if (overcomes[dmEl] === oEl) {
    return sameYin ? '偏财' : '正财';
  }
  // 克我 = 官杀
  if (overcomes[oEl] === dmEl) {
    return sameYin ? '七杀' : '正官';
  }
  // 生我 = 印
  if (generates[oEl] === dmEl) {
    return sameYin ? '偏印' : '正印';
  }
  return '—';
}

function element(stem: string): string {
  const i = HEAVENLY_STEMS.indexOf(stem);
  if (i < 0) return '—';
  // 0甲1乙=木, 2丙3丁=火, 4戊5己=土, 6庚7辛=金, 8壬9癸=水
  return ['木', '木', '火', '火', '土', '土', '金', '金', '水', '水'][i];
}

function branchElement(branch: string): string {
  const m: Record<string, string> = {
    子: '水', 亥: '水',
    寅: '木', 卯: '木',
    巳: '火', 午: '火',
    申: '金', 酉: '金',
    辰: '土', 戌: '土', 丑: '土', 未: '土',
  };
  return m[branch] ?? '—';
}

export interface BaziChart {
  solarDate: string;
  solarTime: string;
  gender: 'male' | 'female';
  pillars: {
    year:  { ganzhi: string; stem: string; branch: string; stemElement: string; branchElement: string };
    month: { ganzhi: string; stem: string; branch: string; stemElement: string; branchElement: string };
    day:   { ganzhi: string; stem: string; branch: string; stemElement: string; branchElement: string };
    hour:  { ganzhi: string; stem: string; branch: string; stemElement: string; branchElement: string };
  };
  dayMaster: string;
  dayMasterElement: string;
  tenGods: Record<string, string>;
  elementCount: Record<string, number>;
  dayun: Array<{
    startAge: number;
    ganzhi: string;
    stem: string;
    branch: string;
  }>;
}

function pillar(l: any, field: 'Year' | 'Month' | 'Day' | 'Time', dayMaster: string) {
  const gz = l[`get${field}InGanZhi`]() as string;
  const stem = gz[0];
  const branch = gz[1];
  return {
    ganzhi: gz,
    stem,
    branch,
    stemElement: element(stem),
    branchElement: branchElement(branch),
    tenGod: tenGod(dayMaster, stem),
  };
}

export function buildBaziChart(input: {
  solarDate: string;
  hour: number;
  minute?: number;
  gender: 'male' | 'female';
}): BaziChart {
  const { solarDate, hour, minute = 0, gender } = input;
  const [y, m, d] = solarDate.split('-').map(Number);
  const solar = Solar.fromYmdHms(y, m, d, hour, minute, 0);
  const lunar = solar.getLunar();

  const yp = pillar(lunar, 'Year', '');
  const mp = pillar(lunar, 'Month', '');
  const dp = pillar(lunar, 'Day', '');
  const hp = pillar(lunar, 'Time', '');

  const dayMaster = dp.stem;
  // 重新算十神（基于日主）
  [yp, mp, hp].forEach((p: any) => {
    p.tenGod = tenGod(dayMaster, p.stem);
  });

  const elementCount: Record<string, number> = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  [yp, mp, dp, hp].forEach((p) => {
    elementCount[p.stemElement]++;
    elementCount[p.branchElement]++;
  });

  // 大运：阳男阴女顺排，阴男阳女逆排；起运年龄粗略按出生日到节气天数 / 3
  const yGan = yp.stem;
  const yangGan = '甲丙戊庚壬';
  const isYangYear = yangGan.includes(yGan);
  const isMale = gender === 'male';
  const shun = (isYangYear && isMale) || (!isYangYear && !isMale);

  // 简化：直接列出接下来 8 步大运，每步 10 年
  const monthGZ = mp.ganzhi;
  const monthStemIdx = HEAVENLY_STEMS.indexOf(mp.stem);
  const monthBranchIdx = EARTHLY_BRANCHES.indexOf(mp.branch);
  const dayun: BaziChart['dayun'] = [];
  for (let i = 1; i <= 8; i++) {
    const stemIdx = (monthStemIdx + (shun ? i : -i) + 10) % 10;
    const branchIdx = (monthBranchIdx + (shun ? i : -i) + 12) % 12;
    const stem = HEAVENLY_STEMS[stemIdx];
    const branch = EARTHLY_BRANCHES[branchIdx];
    dayun.push({
      startAge: i * 10,
      ganzhi: stem + branch,
      stem,
      branch,
    });
  }

  const tenGods: Record<string, string> = {
    年柱: yp.tenGod,
    月柱: mp.tenGod,
    时柱: hp.tenGod,
  };

  return {
    solarDate,
    solarTime: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
    gender,
    pillars: {
      year:  yp,
      month: mp,
      day:   dp,
      hour:  hp,
    },
    dayMaster,
    dayMasterElement: element(dayMaster),
    tenGods,
    elementCount,
    dayun,
  };
}