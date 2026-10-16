import { Rarities } from "./item";
import type { Rank } from "./user";

export interface SiteSettings {
  maintenance: boolean;
}

export interface SiteConfig {
  ranks: Rank[];
  games: unknown[];
  rarities: Rarities[],
  settings: SiteSettings;
  chat: unknown;
}