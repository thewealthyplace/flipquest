"use client";
import { useState } from "react";
import { useAccount } from "wagmi";
import GameLobby from "@/components/GameLobby";
import GameBoard from "@/components/GameBoard";
import Leaderboard from "@/components/Leaderboard";

type Phase =
  | { tag: "lobby" }
  | { tag: "playing"; gameId: bigint; seed: `0x${string}`; difficulty: number }
  | { tag: "result"; score: number; moves: number; difficulty: number };

export default function Home() {
  const { isConnected, isConnecting, address } = useAccount();
  const [phase, setPhase] = useState<Phase>({ tag: "lobby" });
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  if (isConnecting) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3">
      <p className="text-gray-400 text-sm">Connecting wallet...</p>
    </div>
  );

  if (!isConnected) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3">
      <h1 className="text-2xl font-bold text-purple-400">FlipQuest</h1>
      <p className="text-gray-400 text-sm">Opening in MiniPay...</p>
    </div>
  );

  return (
    <div className="min-h-screen max-w-md mx-auto px-4 pb-8">
      <header className="pt-5 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-purple-400">FlipQuest</h1>
          <p className="text-xs text-gray-500">Memory card game · Celo</p>
        </div>
        <div className="flex items-center gap-2">
          {address && (
            <span className="text-[10px] text-gray-600 font-mono">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
          )}
          {phase.tag !== "playing" && (
            <button
              onClick={() => setShowLeaderboard(v => !v)}
              className="text-xs text-gray-400 border border-gray-700 px-3 py-1.5 rounded-lg"
            >
              {showLeaderboard ? "Back" : "Rankings"}
            </button>
          )}
        </div>
      </header>

      {showLeaderboard && phase.tag !== "playing" ? (
        <Leaderboard />
      ) : phase.tag === "lobby" ? (
        <GameLobby
          onGameStarted={(gameId, seed, difficulty) => {
            setPhase({ tag: "playing", gameId, seed, difficulty });
            setShowLeaderboard(false);
          }}
        />
      ) : phase.tag === "playing" ? (
        <GameBoard
          gameId={phase.gameId}
          seed={phase.seed}
          difficulty={phase.difficulty}
          onComplete={(score, moves) =>
            setPhase({ tag: "result", score, moves, difficulty: phase.difficulty })
          }
        />
      ) : (
        <div className="flex flex-col items-center gap-6 pt-12">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Final Score</p>
            <p className="text-5xl font-bold text-purple-400">{phase.score}</p>
            <p className="text-sm text-gray-400 mt-2">{phase.moves} moves</p>
          </div>
          <div className="w-full bg-gray-900 rounded-2xl p-4 text-center text-xs text-gray-500">
            Score saved on-chain
          </div>
          <button
            onClick={() => setPhase({ tag: "lobby" })}
            className="w-full py-3 bg-purple-700 hover:bg-purple-600 rounded-xl font-bold text-white"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}
