import { number } from "motion";
import type { Permissions } from "./rank";

export interface UserWallet {
  balance: number;
}

export interface UserStats {
  wager: number;
  profit: number;
  won: number;
  lost: number;
  tipSent: number;
  tipReceived: number;
}

export interface UserSettings {
  hiddenStats: boolean;
  anonymousMode: boolean;
  receiveTips: boolean;
}

export interface UserFairness {
  clientSeed: string;
  nonce: number;
}

export interface UserLinkedDiscord {
  id: string;
  username: string;
  nickname?: string | null;
  avatar?: string | null;
}

export interface User {
  _id: string;
  username: string;
  robloxId: number;
  nickname?: string | null;
  avatar: string;
  xp: number;
  ranks: string[];
  wallet: UserWallet;
  stats: UserStats;
  settings: UserSettings;
  fairness: UserFairness;
  linkedDiscord: UserLinkedDiscord | null;
  joined: string;
  lastActive: string;
}


export interface Inventory {
  value: number;
}