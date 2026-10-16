interface Giveaway {
  id: string;
  _id?: string;
  starter: { _id: string; username: string; avatar?: string; ranks?: any[]; anonymous?: boolean };
  item: { _id: string; item: string; value: number; image: string };
  endsAt: string;
  participants: number;
  joined?: boolean;
  status?: string;
  winner?: { _id: string; username: string; avatar?: string; ranks?: any[]; anonymous?: boolean } | null;
  endedAt?: string;
}