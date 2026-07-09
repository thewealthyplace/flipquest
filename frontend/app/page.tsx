"use client";
import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useSwitchChain } from "wagmi";
import { celo } from "wagmi/chains";
import { parseEventLogs } from "viem";
import Header, { Screen } from "@/components/Header";
import Home from "@/components/Home";
import GameScreen from "@/components/GameScreen";
import WinScreen from "@/components/WinScreen";
import LeaderboardScreen from "@/components/LeaderboardScreen";
import ProfileScreen from "@/components/ProfileScreen";
import { FLIPQUEST_ADDRESS, FLIPQUEST_ABI } from "@/lib/contracts";

interface ActiveGame { gameId: bigint; seed: `0x${string}`; difficulty: number }
type TxState = "idle" | "pending" | "done";

export default function Page() {
  const { isConnecting, isConnected, chainId: walletChainId } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { switchChainAsync } = useSwitchChain();

  const [screen, setScreen] = useState<Screen>("home");
  const [starting, setStarting] = useState<number | null>(null);
  const [activeGame, setActiveGame] = useState<ActiveGame | null>(null);
  const [result, setResult] = useState<{ difficulty: number; moves: number } | null>(null);
  const [txState, setTxState] = useState<TxState>("idle");
  const [txHash, setTxHash] = useState<string>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isConnected) {
      setScreen("home"); setActiveGame(null); setResult(null); setTxState("idle"); setTxHash(undefined); setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]);

  async function ensureCeloChain() {
    if (walletChainId !== celo.id) {
      try {
        await switchChainAsync({ chainId: celo.id });
      } catch {
        throw new Error("Please switch your wallet to the Celo network to play.");
      }
    }
  }

  function describeError(err: unknown): string {
    const msg = err instanceof Error ? err.message : String(err);
    if (/celo network/i.test(msg)) return msg;
    if (/rejected|denied|User rejected/i.test(msg)) return "Request rejected in wallet.";
    return "Something went wrong. Please try again.";
  }

  async function handleSelectMode(difficulty: number) {
    setStarting(difficulty);
    setError(null);
    try {
      await ensureCeloChain();
      const hash = await writeContractAsync({
        address: FLIPQUEST_ADDRESS, abi: FLIPQUEST_ABI, chainId: celo.id,
        functionName: "startGame", args: [difficulty],
      });
      const { waitForTransactionReceipt } = await import("wagmi/actions");
      const { wagmiConfig } = await import("@/lib/wagmi");
      const receipt = await waitForTransactionReceipt(wagmiConfig, { hash });
      const logs = parseEventLogs({ abi: FLIPQUEST_ABI, eventName: "GameStarted", logs: receipt.logs });
      if (logs.length === 0) throw new Error("GameStarted event not found");
      const { gameId, seed } = logs[0].args as { gameId: bigint; seed: `0x${string}`; difficulty: number };
      setActiveGame({ gameId, seed, difficulty });
      setTxState("idle"); setTxHash(undefined);
      setScreen("game");
    } catch (err) {
      console.error(err);
      setError(describeError(err));
    } finally {
      setStarting(null);
    }
  }

  function handleWin(moves: number) {
    if (!activeGame) return;
    setResult({ difficulty: activeGame.difficulty, moves });
    setScreen("win");
  }

  function handleQuit() {
    setActiveGame(null);
    setScreen("home");
  }

  async function handleSubmit() {
    if (!activeGame || !result) return;
    setTxState("pending");
    setError(null);
    try {
      await ensureCeloChain();
      const hash = await writeContractAsync({
        address: FLIPQUEST_ADDRESS, abi: FLIPQUEST_ABI, chainId: celo.id,
        functionName: "finishGame", args: [activeGame.gameId, result.moves],
      });
      setTxHash(hash);
      setTxState("done");
    } catch (err) {
      console.error(err);
      setError(describeError(err));
      setTxState("idle");
    }
  }

  function handlePlayAgain() {
    if (!activeGame) { setScreen("home"); return; }
    handleSelectMode(activeGame.difficulty);
  }

  if (isConnecting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <p className="text-cream/50 text-sm font-body">Connecting wallet…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center overflow-x-hidden">
      <Header screen={screen} onNav={setScreen} />

      {error && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-[90vw] flex items-center gap-3 py-3 px-4 rounded-2xl bg-red/10 border border-red/40 anim-rise">
          <span className="text-sm text-red font-body">{error}</span>
          <button onClick={() => setError(null)} className="text-red/70 hover:text-red text-sm cursor-pointer">✕</button>
        </div>
      )}

      {screen === "home" && <Home onSelectMode={handleSelectMode} starting={starting} />}

      {screen === "game" && activeGame && (
        <GameScreen
          key={activeGame.gameId.toString()}
          seed={activeGame.seed}
          difficulty={activeGame.difficulty}
          onWin={handleWin}
          onQuit={handleQuit}
        />
      )}

      {screen === "win" && result && (
        <WinScreen
          difficulty={result.difficulty}
          moves={result.moves}
          txState={txState}
          txHash={txHash}
          onSubmit={handleSubmit}
          onPlayAgain={handlePlayAgain}
          onLeaderboard={() => setScreen("board")}
        />
      )}

      {screen === "board" && <LeaderboardScreen />}

      {screen === "profile" && <ProfileScreen onGoHome={() => setScreen("home")} />}
    </div>
  );
}
