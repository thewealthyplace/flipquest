export const USDM_ADDRESS = "0x765DE816845861e75A25fCA122bb6898B8B1282a" as const;
export const FLIPQUEST_ADDRESS = "0x716A834EF74bf30C1788B482C46056aaa9E7f5A7" as `0x${string}`;

export const DIFFICULTIES = [
  { name: "Classic",   pairs: 8,  cols: 4, rows: 4, baseScore: 1000, label: "4×4" },
  { name: "Challenge", pairs: 10, cols: 5, rows: 4, baseScore: 2000, label: "5×4" },
] as const;

export const MOVE_PENALTY = 20;

/// Card face icons: SVG path (24x24 viewBox) + accent color, indexed by symbol id.
export const SYMBOLS = [
  { path: "M13 2 L4.6 13.6 H10.4 L9.4 22 L19.4 9.6 H13.4 Z", color: "#FCFF52" },
  { path: "M12 2 L14.9 8.6 22 9.3 16.7 14.1 18.2 21.2 12 17.5 5.8 21.2 7.3 14.1 2 9.3 9.1 8.6 Z", color: "#B28CFF" },
  { path: "M12 21 C6 15.5 3 12.5 3 8.9 3 6.2 5.1 4 7.7 4 9.4 4 10.9 4.9 12 6.3 13.1 4.9 14.6 4 16.3 4 18.9 4 21 6.2 21 8.9 21 12.5 18 15.5 12 21 Z", color: "#FF7A9E" },
  { path: "M12 2 L22 12 L12 22 L2 12 Z", color: "#56DF7C" },
  { path: "M12 3 L22 21 H2 Z", color: "#FFB347" },
  { path: "M12 2 L21 7 V17 L12 22 L3 17 V7 Z", color: "#6EC9FF" },
  { path: "M12 2 A10 10 0 1 1 11.99 2 Z", color: "#FCF6F1" },
  { path: "M9 3 H15 V9 H21 V15 H15 V21 H9 V15 H3 V9 H9 Z", color: "#F65E5E" },
  { path: "M21 12.8 A9 9 0 1 1 11.2 3 A7 7 0 0 0 21 12.8 Z", color: "#E8D9FF" },
  { path: "M12 2 C12 2 5 10 5 15 A7 7 0 0 0 19 15 C19 10 12 2 12 2 Z", color: "#59E6D0" },
] as const;

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
  return Math.max(0, d.baseScore - extra * MOVE_PENALTY);
}

export function isPerfect(moves: number, difficulty: number): boolean {
  return moves === DIFFICULTIES[difficulty].pairs;
}

export function shortAddr(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

/// Deterministic avatar symbol pick from an address, so the same wallet
/// always renders the same icon across leaderboard/profile.
export function avatarSymbolFor(addr: string) {
  let h = 0;
  for (let i = 2; i < addr.length; i++) h = (Math.imul(h, 31) + addr.charCodeAt(i)) | 0;
  return SYMBOLS[Math.abs(h) % SYMBOLS.length];
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
    name: "startGames", type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "difficulties", type: "uint8[]" }],
    outputs: [{ name: "gameIds", type: "uint256[]" }, { name: "seeds", type: "bytes32[]" }],
  },
  {
    name: "finishGames", type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "gameIds", type: "uint256[]" }, { name: "movesArr", type: "uint16[]" }],
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
    name: "games", type: "function", stateMutability: "view",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [
      { name: "player",     type: "address" },
      { name: "seed",       type: "bytes32" },
      { name: "difficulty", type: "uint8" },
      { name: "startTime",  type: "uint32" },
      { name: "moves",      type: "uint16" },
      { name: "completed",  type: "bool" },
    ],
  },
  {
    name: "players", type: "function", stateMutability: "view",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [{ name: "", type: "address" }],
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
