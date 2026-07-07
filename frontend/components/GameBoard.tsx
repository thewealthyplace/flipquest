"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import {
  FLIPQUEST_ADDRESS, FLIPQUEST_ABI,
  DIFFICULTIES, CARD_SYMBOLS, CARD_COLORS,
  generateBoard, calcScore,
} from "@/lib/contracts";

interface Props {
  gameId: bigint;
  seed: `0x${string}`;
  difficulty: number;
  onComplete: (score: number, moves: number) => void;
}

export default function GameBoard({ gameId, seed, difficulty, onComplete }: Props) {
  const d     = DIFFICULTIES[difficulty];
  const board = generateBoard(seed, d.pairs);
  const total = board.length;

  const [flipped, setFlipped]     = useState<number[]>([]);
  const [matched, setMatched]     = useState<Set<number>>(new Set());
  const [locked, setLocked]       = useState(false);
  const [moveCount, setMoveCount] = useState(0);
  const [elapsed, setElapsed]     = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const timerRef      = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAt     = useRef(Date.now());
  const submittingRef = useRef(false);

  const { writeContractAsync } = useWriteContract();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    timerRef.current = setInterval(
      () => setElapsed(Math.floor((Date.now() - startedAt.current) / 1000)),
      1000,
    );
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const handleCardClick = useCallback(
    (idx: number) => {
      if (locked || matched.has(idx) || flipped.includes(idx) || flipped.length === 2) return;
      const next = [...flipped, idx];
      setFlipped(next);
      if (next.length === 2) {
        const [a, b] = next;
        const newMoves = moveCount + 1;
        setMoveCount(newMoves);
        setLocked(true);
        if (board[a] === board[b]) {
          setTimeout(() => {
            setMatched(prev => { const s = new Set(prev); s.add(a); s.add(b); return s; });
            setFlipped([]);
            setLocked(false);
          }, 400);
        } else {
          setTimeout(() => { setFlipped([]); setLocked(false); }, 900);
        }
      }
    },
    [locked, matched, flipped, moveCount, board],
  );

  // Submit when all cards matched
  useEffect(() => {
    if (matched.size === total && total > 0 && !submittingRef.current) {
      submittingRef.current = true;
      setSubmitting(true);
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      const moves = Math.max(moveCount, d.pairs);
      writeContractAsync({
        address: FLIPQUEST_ADDRESS, abi: FLIPQUEST_ABI,
        functionName: "finishGame", args: [gameId, moves],
      })
        .then(hash => {
          setTxHash(hash);
          onComplete(calcScore(moves, difficulty), moves);
        })
        .catch(() => {
          onComplete(calcScore(moves, difficulty), moves);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matched.size, total]);

  function formatTime(s: number) {
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  }

  const previewScore = calcScore(Math.max(moveCount, d.pairs), difficulty);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-gray-900 rounded-2xl px-4 py-3">
        <div className="text-center">
          <p className="text-[10px] text-gray-500">Moves</p>
          <p className="text-lg font-bold text-white">{moveCount}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-gray-500">Pairs</p>
          <p className="text-lg font-bold text-purple-400">{matched.size / 2} / {d.pairs}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-gray-500">Score</p>
          <p className="text-lg font-bold text-white">{previewScore}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-gray-500">Time</p>
          <p className="text-lg font-bold text-gray-300">{formatTime(elapsed)}</p>
        </div>
      </div>

      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${d.cols}, 1fr)` }}
      >
        {board.map((value, idx) => {
          const isFlipped = flipped.includes(idx) || matched.has(idx);
          const isMatched = matched.has(idx);
          return (
            <div
              key={idx}
              className="flip-card aspect-square cursor-pointer select-none"
              onClick={() => handleCardClick(idx)}
            >
              <div className={"flip-card-inner" + (isFlipped ? " is-flipped" : "")}>
                <div
                  className={
                    "flip-card-front border " +
                    (isMatched
                      ? "bg-purple-900/30 border-purple-700"
                      : "bg-gray-800 border-gray-700")
                  }
                >
                  <span className="text-gray-600 font-bold text-lg select-none">?</span>
                </div>
                <div
                  className={
                    "flip-card-back border " +
                    (isMatched
                      ? "bg-purple-900/40 border-purple-600"
                      : "bg-gray-700 border-purple-400")
                  }
                >
                  <span className={"text-2xl font-bold select-none " + CARD_COLORS[value]}>
                    {CARD_SYMBOLS[value]}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {submitting && (
        <div className="bg-gray-900 rounded-2xl p-4 text-center">
          <p className="text-sm text-purple-300 animate-pulse">
            {isConfirming ? "Confirming on-chain..." : "Submitting score..."}
          </p>
        </div>
      )}
    </div>
  );
}
