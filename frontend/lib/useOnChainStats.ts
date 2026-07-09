import { useMemo } from "react";
import { useReadContract, useReadContracts } from "wagmi";
import { FLIPQUEST_ADDRESS, FLIPQUEST_ABI, calcScore, isPerfect } from "@/lib/contracts";

export interface GameRecord {
  gameId: number;
  player: string;
  difficulty: number;
  startTime: number;
  moves: number;
  completed: boolean;
  score: number;
  perfect: boolean;
}

function toRecord(gameId: number, data: readonly unknown[]): GameRecord | null {
  const [player, , difficulty, startTime, moves, completed] = data as [
    string, `0x${string}`, number, number, number, boolean,
  ];
  if (!completed) return null;
  return {
    gameId, player, difficulty, startTime, moves, completed,
    score: calcScore(moves, difficulty),
    perfect: isPerfect(moves, difficulty),
  };
}

/// Fetches every completed game on-chain and ranks players per difficulty.
/// Fine for a fresh contract with a modest game count — batched via Multicall3.
export function useLeaderboard() {
  const { data: totalGames } = useReadContract({
    address: FLIPQUEST_ADDRESS, abi: FLIPQUEST_ABI, functionName: "totalGames",
  });
  const n = totalGames ? Number(totalGames) : 0;

  const { data: gamesData, isLoading } = useReadContracts({
    contracts: Array.from({ length: n }, (_, i) => ({
      address: FLIPQUEST_ADDRESS, abi: FLIPQUEST_ABI, functionName: "games", args: [BigInt(i)],
    })),
    query: { enabled: n > 0 },
  });

  return useMemo(() => {
    const records: GameRecord[] = [];
    (gamesData ?? []).forEach((r, i) => {
      if (r.status === "success") {
        const rec = toRecord(i, r.result as unknown as readonly unknown[]);
        if (rec) records.push(rec);
      }
    });

    function topFor(difficulty: number, limit: number) {
      const bestByPlayer = new Map<string, GameRecord>();
      for (const rec of records) {
        if (rec.difficulty !== difficulty) continue;
        const existing = bestByPlayer.get(rec.player);
        if (!existing || rec.score > existing.score) bestByPlayer.set(rec.player, rec);
      }
      return [...bestByPlayer.values()].sort((a, b) => b.score - a.score).slice(0, limit);
    }

    return {
      isLoading: isLoading && n > 0,
      topClassic: topFor(0, 10),
      topChallenge: topFor(1, 10),
      totalGames: n,
      totalPlayers: new Set(records.map(r => r.player)).size,
    };
  }, [gamesData, isLoading, n]);
}

/// Fetches a single player's full game history from chain, for the profile screen.
export function usePlayerHistory(address: `0x${string}` | undefined) {
  const { data: gameIds } = useReadContract({
    address: FLIPQUEST_ADDRESS, abi: FLIPQUEST_ABI, functionName: "getPlayerGames",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
  const ids = useMemo(() => (gameIds as readonly bigint[] | undefined) ?? [], [gameIds]);

  const { data: gamesData, isLoading } = useReadContracts({
    contracts: ids.map(id => ({
      address: FLIPQUEST_ADDRESS, abi: FLIPQUEST_ABI, functionName: "games", args: [id],
    })),
    query: { enabled: ids.length > 0 },
  });

  return useMemo(() => {
    const records: GameRecord[] = [];
    (gamesData ?? []).forEach((r, i) => {
      if (r.status === "success") {
        const rec = toRecord(Number(ids[i]), r.result as unknown as readonly unknown[]);
        if (rec) records.push(rec);
      }
    });
    records.sort((a, b) => b.startTime - a.startTime);

    const bestFor = (difficulty: number) => {
      const scores = records.filter(r => r.difficulty === difficulty).map(r => r.score);
      return scores.length ? Math.max(...scores) : 0;
    };

    return {
      isLoading: isLoading && ids.length > 0,
      history: records,
      bestClassic: bestFor(0),
      bestChallenge: bestFor(1),
      perfectCount: records.filter(r => r.perfect).length,
    };
  }, [gamesData, isLoading, ids]);
}
