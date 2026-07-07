"use client";
import { useAccount, useReadContract } from "wagmi";
import { FLIPQUEST_ADDRESS, FLIPQUEST_ABI } from "@/lib/contracts";

export default function Leaderboard() {
  const { address } = useAccount();

  const { data: topData, refetch } = useReadContract({
    address: FLIPQUEST_ADDRESS, abi: FLIPQUEST_ABI, functionName: "getTopPlayers",
    args: [10n],
    query: { refetchInterval: 30000 },
  });
  const { data: myStats } = useReadContract({
    address: FLIPQUEST_ADDRESS, abi: FLIPQUEST_ABI, functionName: "stats",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
  const { data: totalGamesCount } = useReadContract({
    address: FLIPQUEST_ADDRESS, abi: FLIPQUEST_ABI, functionName: "totalGames",
  });
  const { data: totalPlayersCount } = useReadContract({
    address: FLIPQUEST_ADDRESS, abi: FLIPQUEST_ABI, functionName: "totalPlayers",
  });

  const topAddrs  = topData ? (topData as readonly unknown[])[0] as string[] : [];
  const topScores = topData ? (topData as readonly unknown[])[1] as bigint[] : [];
  const myBest    = myStats ? Number((myStats as readonly unknown[])[0]) : 0;
  const myPlayed  = myStats ? Number((myStats as readonly unknown[])[1]) : 0;
  const myWon     = myStats ? Number((myStats as readonly unknown[])[2]) : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-900 rounded-2xl p-3 text-center">
          <p className="text-xs text-gray-500">Total Games</p>
          <p className="text-xl font-bold text-gray-300">{totalGamesCount?.toString() ?? "0"}</p>
        </div>
        <div className="bg-gray-900 rounded-2xl p-3 text-center">
          <p className="text-xs text-gray-500">Players</p>
          <p className="text-xl font-bold text-gray-300">{totalPlayersCount?.toString() ?? "0"}</p>
        </div>
      </div>

      {myPlayed > 0 && (
        <div className="bg-purple-900/20 border border-purple-800 rounded-2xl p-4 grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xs text-gray-500">Best</p>
            <p className="text-xl font-bold text-purple-400">{myBest}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Played</p>
            <p className="text-xl font-bold text-gray-300">{myPlayed}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Completed</p>
            <p className="text-xl font-bold text-gray-300">{myWon}</p>
          </div>
        </div>
      )}

      <div className="bg-gray-900 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
          <p className="text-sm font-semibold text-white">Top Players</p>
          <button onClick={() => refetch()} className="text-xs text-gray-500 hover:text-gray-300">
            Refresh
          </button>
        </div>
        {topAddrs.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500 text-sm">
            No games yet — be the first!
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {topAddrs.map((addr, i) => (
              <div
                key={addr}
                className={
                  "flex items-center gap-3 px-4 py-3 " +
                  (addr.toLowerCase() === address?.toLowerCase() ? "bg-gray-800/50" : "")
                }
              >
                <span className="text-xs text-gray-500 w-6 text-center font-mono">
                  {i + 1}.
                </span>
                <p className="flex-1 text-sm font-mono text-gray-300">
                  {addr.slice(0, 6)}...{addr.slice(-4)}
                  {addr.toLowerCase() === address?.toLowerCase() && (
                    <span className="ml-1 text-xs text-purple-400">(you)</span>
                  )}
                </p>
                <p className="text-white font-bold">
                  {topScores[i]?.toString() ?? "0"}{" "}
                  <span className="text-xs text-gray-400">pts</span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-gray-900 rounded-2xl p-4 text-xs text-gray-400 space-y-1">
        <p className="font-semibold text-white text-sm">Scoring guide</p>
        <p>Classic (4x4): up to 1,000 pts — 20 pts per extra move</p>
        <p>Challenge (5x4): up to 2,000 pts — 20 pts per extra move</p>
        <p>Perfect game: match every pair on first attempt</p>
        <p>Scores are on-chain and permanent</p>
      </div>
    </div>
  );
}
