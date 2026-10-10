// Fun default usernames for guests who don't pick one ("BouquetinFougueux482").
// All nouns are masculine so the adjective always agrees; 2–30 characters,
// the same bounds the profile enforces.
const ANIMALS = [
  "Bouquetin",
  "Chamois",
  "Isard",
  "Aigle",
  "Renard",
  "Lynx",
  "Blaireau",
  "Gypaete",
  "Tetras",
  "Yeti",
  "Sherpa",
  "Mulet",
];

const ADJECTIVES = [
  "Fougueux",
  "Zen",
  "Turbo",
  "Matinal",
  "Costaud",
  "Fringant",
  "Petillant",
  "Tetu",
  "Infatigable",
  "Ruse",
  "Poetique",
  "Galvanise",
];

const pick = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

export function randomPseudo(): string {
  const n = Math.floor(100 + Math.random() * 900);
  return `${pick(ANIMALS)}${pick(ADJECTIVES)}${n}`;
}

export const PSEUDO_MIN = 2;
export const PSEUDO_MAX = 30;
