export type CoinflipSide = "HEADS" | "TAILS";

export interface CoinflipUser {
  _id: string;
  username: string;
  avatar: string;
  ranks: string[];
  anonymous: boolean;
}

export interface CoinflipItem {
  _id: string;
  item: string;
  categorie: string;
  rarity: string;
  value: number;
  image: string;
}

export interface CoinflipPlayer {
  user: CoinflipUser | null;
  items: CoinflipItem[];
  side: CoinflipSide;
  totalValue: number;
  chance: number;
}

export interface CoinflipWinner {
  user: CoinflipUser | null;
  side: CoinflipSide;
  items: CoinflipItem[];
}

export interface Coinflip {
  _id: string;
  players: {
    creator: CoinflipPlayer;
    joiner: CoinflipPlayer | null;
  };
  winner: CoinflipWinner | null;
  requirement: {
    minimumValue: number;
    maximumValue: number;
    maximumItems: number | null;
  };
  fairness: {
    serverSeedHash: string;
    creatorClientSeed: string;
    creatorNonce: number;
    roll: number | null;
  };
  endedAt: string | null;
  createdAt: string;
}