export enum Permissions {
  ALL = "ALL",
  BYPASS_MAINTENANCE = "BYPASS_MAINTENANCE",
  BYPASS_RESTRICTIONS_FEATURE = "BYPASS_RESTRICTIONS_FEATURE",
  BYPASS_DISABLED_FEATURE = "BYPASS_DISABLED_FEATURE",
  BYPASS_ANONYMOUS = "BYPASS_ANONYMOUS",
  BYPASS_DISABLED_TIP_RECEIVING = "BYPASS_DISABLED_TIP_RECEIVING",
  BYPASS_HIDDEN_STATS = "BYPASS_HIDDEN_STATS",
  BYPASS_LOCKED_CHANNEL = "BYPASS_LOCKED_CHANNEL",
  BYPASS_CHAT_MIN_LENGTH = "BYPASS_CHAT_MIN_LENGTH",
  BYPASS_CHAT_MAX_LENGTH = "BYPASS_CHAT_MAX_LENGTH",
  BYPASS_CHAT_EDIT = "BYPASS_CHAT_EDIT",
  BYPASS_CHAT_COOLDOWN = "BYPASS_CHAT_COOLDOWN",
  BYPASS_CHAT_ROLE_REQUIREMENT = "BYPASS_CHAT_ROLE_REQUIREMENT",
  MUTE_USERS = "MUTE_USERS",
}

export type UserWallet = { balance: number };

export type UserStats = {
  wager: number;
  profit: number;
  won: number;
  lost: number;
  tipSent: number;
  tipReceived: number;
};

export type UserSettings = {
  hiddenStats: boolean;
  anonymousMode: boolean;
  receiveTips: boolean;
};

export type UserFairness = {
  clientSeed: string;
  nonce: number;
};

export type UserLinkedDiscord = {
  id: string;
  username: string;
  nickname?: string | null;
  avatar?: string | null;
} | null;

export type User = {
  _id: string;
  username: string;
  robloxId: number;
  nickname?: string | null;
  avatar: string;
  xp: number;
  roles: string[];
  wallet: UserWallet;
  stats: UserStats;
  settings: UserSettings;
  fairness: UserFairness;
  linkedDiscord: UserLinkedDiscord;
  joined: string;
  lastActive: string;
};

export type Role = {
  _id: string;
  color?: string;
  icon?: string;
  permissions: Permissions[];
  priority: number;
};

export type Game = { name: string; enabled: boolean };

export type ChatChannel = {
  icon: string;
  cooldown: { enabled: boolean; time: number };
  requriment: Record<string, any>;
  default: boolean;
  locked: boolean;
};

export type Site = {
  roles: Role[];
  chat: { default: { channels: Record<string, ChatChannel> } };
};