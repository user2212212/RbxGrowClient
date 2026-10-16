export interface Rarities {
  _id: string;
  color?: string;
}

export interface Item {
  _id: string;
  item: string;
  categorie: string;
  rarity: string;
  value: number;
  image: string;
  variants: {
    size?: string;
    mutation?: string;
  };
}