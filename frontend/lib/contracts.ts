export const USDM_ADDRESS = "0x765DE816845861e75A25fCA122bb6898B8B1282a" as const;
export const FLIPQUEST_ADDRESS = "" as `0x${string}`;

export const DIFFICULTIES = [
  { name: "Classic",   pairs: 8,  cols: 4, rows: 4, baseScore: 1000, label: "4x4" },
  { name: "Challenge", pairs: 10, cols: 5, rows: 4, baseScore: 2000, label: "5x4" },
] as const;

export const CARD_SYMBOLS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
export const CARD_COLORS = [
  "text-red-400",    "text-blue-400",   "text-green-400", "text-yellow-400",
  "text-purple-400", "text-pink-400",   "text-orange-400","text-cyan-400",
  "text-indigo-400", "text-teal-400",
];
