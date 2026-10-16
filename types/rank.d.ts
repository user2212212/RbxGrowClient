export interface RankRewards {
  items: string[];
}

export interface RankRequirements {
  xp: number;
}

export interface RankColor {
  static?: string;
  starts?: string;
  ends?: string;
}

export interface Rank {
  _id: string;
  color?: RankColor;
  icon?: string;
  permissions: string[];
  rewards: RankRewards;
  requirements: RankRequirements;
  priority: number;
}
