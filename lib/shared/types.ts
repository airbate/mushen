export type Skill = 'ziwei' | 'bazi' | 'qimen';

export interface BaseInput {
  skill: Skill;
  /** YYYY-M-D（公历） */
  solarDate: string;
  /** 0-23 */
  hour: number;
  /** 0-59 */
  minute?: number;
  /** IANA timezone，默认 Asia/Shanghai */
  timezone?: string;
  /** 用户额外关注点（可选） */
  questionGoal?: string;
}

export interface ZiweiInput extends BaseInput {
  skill: 'ziwei';
  gender: 'male' | 'female';
}

export interface BaziInput extends BaseInput {
  skill: 'bazi';
  gender: 'male' | 'female';
}

export interface QimenInput extends BaseInput {
  skill: 'qimen';
  /** 公历 solar / 农历 lunar / 当前 now */
  calendar?: 'solar' | 'lunar' | 'now';
  /** lunar 时是否闰月 */
  isLeapMonth?: boolean;
  /** 城市（仅显示用，不参与计算） */
  city?: string;
}

export type AnyInput = ZiweiInput | BaziInput | QimenInput;

export interface ChartPayload {
  skill: Skill;
  chart: unknown;
}