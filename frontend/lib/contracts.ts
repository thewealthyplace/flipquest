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

/// Derive a shuffled card deck from the on-chain seed using a seeded LCG.
export function generateBoard(seed: `0x${string}`, pairs: number): number[] {
  const deck: number[] = [];
  for (let i = 0; i < pairs; i++) deck.push(i, i);
  let state = BigInt(seed);
  function next(): bigint {
    state = (state * 6364136223846793005n + 1442695040888963407n) & ((1n << 64n) - 1n);
    return state;
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Number(next() % BigInt(i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function calcScore(moves: number, difficulty: number): number {
  const d = DIFFICULTIES[difficulty];
  const extra = Math.max(0, moves - d.pairs);
  return Math.max(0, d.baseScore - extra * 20);
}

export const FLIPQUEST_ABI = [
  {
    name: "startGame", type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "difficulty", type: "uint8" }],
    outputs: [{ name: "gameId", type: "uint256" }, { name: "seed", type: "bytes32" }],
  },
  {
    name: "finishGame", type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "gameId", type: "uint256" }, { name: "moves", type: "uint16" }],
    outputs: [],
  },
  {
    name: "getTopPlayers", type: "function", stateMutability: "view",
    inputs: [{ name: "limit", type: "uint256" }],
    outputs: [{ name: "top", type: "address[]" }, { name: "scores", type: "uint256[]" }],
  },
  {
    name: "getPlayerGames", type: "function", stateMutability: "view",
    inputs: [{ name: "player", type: "address" }],
    outputs: [{ name: "", type: "uint256[]" }],
  },
  {
    name: "stats", type: "function", stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [
      { name: "bestScore", type: "uint256" },
      { name: "gamesPlayed", type: "uint32" },
      { name: "gamesCompleted", type: "uint32" },
    ],
  },
  {
    name: "totalGames", type: "function", stateMutability: "view",
    inputs: [], outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "totalPlayers", type: "function", stateMutability: "view",
    inputs: [], outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "GameStarted", type: "event",
    inputs: [
      { name: "gameId",     type: "uint256",  indexed: true  },
      { name: "player",     type: "address",  indexed: true  },
      { name: "difficulty", type: "uint8",    indexed: false },
      { name: "seed",       type: "bytes32",  indexed: false },
    ],
  },
  {
    name: "GameCompleted", type: "event",
    inputs: [
      { name: "gameId", type: "uint256", indexed: true  },
      { name: "player", type: "address", indexed: true  },
      { name: "moves",  type: "uint16",  indexed: false },
      { name: "score",  type: "uint256", indexed: false },
    ],
  },
] as const;
