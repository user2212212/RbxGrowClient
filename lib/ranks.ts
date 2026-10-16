import { Rank } from "@/types/rank";

export const getRank = (ranks: Rank[] | undefined, userRanks: string[] | undefined): Rank | null => {
  if (!ranks || !userRanks?.length) return null;
  return ranks.filter((r) => userRanks.includes(r._id)).sort((a, b) => b.priority - a.priority)[0] ?? null;
};

export const getRankColor = (color: Rank["color"]): React.CSSProperties => {
  if (color?.starts && color?.ends) {
    return {
      backgroundImage: `linear-gradient(90deg, ${color.starts}, ${color.ends})`,
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
    };
  }
  if (color?.static) return { color: color.static };
  return { color: "#fff" };
};