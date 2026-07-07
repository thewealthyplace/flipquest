"use client";
import { useState } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEventLogs } from "viem";
import { FLIPQUEST_ADDRESS, FLIPQUEST_ABI, DIFFICULTIES } from "@/lib/contracts";

interface Props {
  onGameStarted: (gameId: bigint, seed: `0x${string}`, difficulty: number) => void;
}

export default function GameLobby({ onGameStarted }: Props) {
  const { address } = useAccount();
  const [selectedDiff, setSelectedDiff] = useState(0);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const { data: playerStats } = useReadContract({
    address: FLIPQUEST_ADDRESS, abi: FLIPQUEST_ABI, functionName: "stats",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { writeContractAsync, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: txHash });

  const bestScore   = playerStats ? Number((playerStats as readonly unknown[])[0]) : 0;
  const gamesPlayed = playerStats ? Number((playerStats as readonly unknown[])[1]) : 0;
  const gamesWon    = playerStats ? Number((playerStats as readonly unknown[])[2]) : 0;

  async function handleStart() {
    try {
      const hash = await writeContractAsync({
        address: FLIPQUEST_ADDRESS, abi: FLIPQUEST_ABI,
        functionName: "startGame", args: [selectedDiff],
      });
      setTxHash(hash);
      const { waitForTransactionReceipt } = await import("wagmi/actions");
      const { wagmiConfig } = await import("@/lib/wagmi");
      const receipt = await waitForTransactionReceipt(wagmiConfig, { hash });
      const logs = parseEventLogs({ abi: FLIPQUEST_ABI, eventName: "GameStarted", logs: receipt.logs });
      if (logs.length === 0) throw new Error("GameStarted event not found");
      const { gameId, seed } = logs[0].args as { gameId: bigint; seed: `0x${string}`; difficulty: number };
      onGameStarted(gameId, seed, selectedDiff);
    } catch (err) {
      console.error(err);
    }
  }

  const busy = isPending || isConfirming;

  return (
    <div className="space-y-5">
      {gamesPlayed > 0 && (
        <div className="bg-gray-900 rounded-2xl p-4 grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-xs text-gray-500">Best Score</p>
            <p className="text-xl font-bold text-purple-400">{bestScore}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Played</p>
            <p className="text-xl font-bold text-gray-300">{gamesPlayed}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Completed</p>
            <p className="text-xl font-bold text-gray-300">{gamesWon}</p>
          </div>
        </div>
      )}

      <div>
        <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Difficulty</p>
        <div className="grid grid-cols-2 gap-3">
          {DIFFICULTIES.map((d, i) => (
            <button
              key={d.name}
              onClick={() => setSelectedDiff(i)}
              className={
                "rounded-2xl p-4 text-left border transition-all " +
                (selectedDiff === i
                  ? "border-purple-500 bg-purple-900/20"
                  : "border-gray-800 bg-gray-900 hover:border-gray-600")
              }
            >
              <p className="font-bold text-white">{d.name}</p>
              <p className="text-xs text-gray-400">{d.label} grid · {d.pairs} pairs</p>
              <p className="text-xs text-purple-400 mt-1">up to {d.baseScore} pts</p>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleStart}
        disabled={busy || !FLIPQUEST_ADDRESS}
        className="w-full py-4 bg-purple-700 hover:bg-purple-600 disabled:opacity-50 rounded-2xl font-bold text-white text-lg transition-colors"
      >
        {busy ? "Starting..." : "Start Game"}
      </button>

      <div className="bg-gray-900 rounded-2xl p-4 space-y-2">
        <p className="text-sm font-semibold text-white">How to play</p>
        <ul className="text-xs text-gray-400 space-y-1.5">
          <li>- Tap cards to flip them and find matching pairs</li>
          <li>- Match all pairs to complete the round</li>
          <li>- Fewer moves = higher score (base score minus 20 pts per extra move)</li>
          <li>- Board is seeded from the blockchain — provably fair</li>
          <li>- Score is saved on-chain</li>
        </ul>
      </div>

      <div className="bg-gray-900 rounded-2xl p-4">
        <p className="text-sm font-semibold text-white mb-2">Scoring</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {DIFFICULTIES.map(d => (
            <div key={d.name} className="bg-gray-800 rounded-xl p-3">
              <p className="text-white font-medium">{d.name}</p>
              <p className="text-gray-400">{d.pairs} pairs · max {d.baseScore} pts</p>
              <p className="text-purple-400">-20 pts per extra move</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
