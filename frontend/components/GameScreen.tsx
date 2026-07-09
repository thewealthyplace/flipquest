"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { DIFFICULTIES, SYMBOLS, generateBoard, calcScore } from "@/lib/contracts";

interface Props {
  seed: `0x${string}`;
  difficulty: number;
  onWin: (moves: number) => void;
  onQuit: () => void;
}

export default function GameScreen({ seed, difficulty, onWin, onQuit }: Props) {
  const d = DIFFICULTIES[difficulty];
  const [deck] = useState(() => generateBoard(seed, d.pairs));
  const total = deck.length;

  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Record<number, boolean>>({});
  const [justMatched, setJustMatched] = useState<Record<number, boolean>>({});
  const [mismatch, setMismatch] = useState<Record<number, boolean>>({});
  const [locked, setLocked] = useState(false);
  const [moves, setMoves] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showStreak, setShowStreak] = useState(false);
  const [seconds, setSeconds] = useState(0);

  const finishedRef = useRef(false);
  const t1 = useRef<ReturnType<typeof setTimeout>>();
  const t2 = useRef<ReturnType<typeof setTimeout>>();
  const t3 = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const timer = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => {
      clearInterval(timer);
      clearTimeout(t1.current); clearTimeout(t2.current); clearTimeout(t3.current);
    };
  }, []);

  const flipCard = useCallback((idx: number) => {
    if (locked || matched[idx] || flipped.includes(idx) || flipped.length >= 2) return;
    const next = [...flipped, idx];
    if (next.length < 2) { setFlipped(next); return; }
    const [a, b] = next;
    const newMoves = moves + 1;
    if (deck[a] === deck[b]) {
      const newMatched = { ...matched, [a]: true, [b]: true };
      const newStreak = streak + 1;
      setFlipped([]); setMatched(newMatched); setJustMatched({ [a]: true, [b]: true });
      setMoves(newMoves); setStreak(newStreak); setShowStreak(newStreak >= 2);
      clearTimeout(t3.current);
      t3.current = setTimeout(() => { setShowStreak(false); setJustMatched({}); }, 1100);
      if (Object.keys(newMatched).length === total && !finishedRef.current) {
        finishedRef.current = true;
        t1.current = setTimeout(() => onWin(newMoves), 700);
      }
    } else {
      setFlipped(next); setMoves(newMoves); setLocked(true); setStreak(0);
      t2.current = setTimeout(() => {
        setFlipped([]); setLocked(false); setMismatch({ [a]: true, [b]: true });
        setTimeout(() => setMismatch({}), 450);
      }, 750);
    }
  }, [locked, matched, flipped, moves, streak, deck, total, onWin]);

  const found = Object.keys(matched).length / 2;
  const liveScore = calcScore(Math.max(moves, found), difficulty);
  const mm = Math.floor(seconds / 60), ss = seconds % 60;

  return (
    <section className="w-full max-w-[720px] px-3 sm:px-6 pt-3 sm:pt-6 pb-12 flex flex-col items-center relative">
      {showStreak && (
        <div
          className="fixed top-[18%] left-1/2 z-[60] anim-streak-pop pointer-events-none font-display font-black text-3xl sm:text-5xl text-yellow whitespace-nowrap"
          style={{ textShadow: "0 0 30px rgba(252,255,82,0.6)" }}
        >
          STREAK ×{streak}!
        </div>
      )}

      <div className="w-full flex items-center justify-between gap-2.5 mb-4 sm:mb-5">
        <button
          onClick={onQuit}
          className="flex items-center gap-1.5 bg-transparent border border-cream/15 text-cream/70 rounded-xl py-2 px-3.5 cursor-pointer font-body text-xs hover:border-cream/40 hover:text-cream transition-colors"
        >
          ← Quit
        </button>
        <div className="flex gap-2 sm:gap-3.5">
          <div className="text-center py-2 px-2.5 sm:px-4.5 rounded-2xl bg-cream/[0.04] border border-cream/[0.09]">
            <div className="font-mono text-[10px] tracking-wider text-cream/45">MOVES</div>
            <div className="font-display font-bold text-base sm:text-xl">{moves}</div>
          </div>
          <div className="text-center py-2 px-2.5 sm:px-4.5 rounded-2xl bg-cream/[0.04] border border-cream/[0.09]">
            <div className="font-mono text-[10px] tracking-wider text-cream/45">PAIRS</div>
            <div className="font-display font-bold text-base sm:text-xl">{found}/{d.pairs}</div>
          </div>
          <div className="text-center py-2 px-2.5 sm:px-4.5 rounded-2xl bg-yellow/[0.07] border border-yellow/30 anim-glow">
            <div className="font-mono text-[10px] tracking-wider text-yellow/70">SCORE</div>
            <div className="font-display font-bold text-base sm:text-xl text-yellow">{liveScore}</div>
          </div>
        </div>
        <div className="w-16 flex justify-end">
          <div className="font-mono text-[13px] text-cream/50">{mm}:{String(ss).padStart(2, "0")}</div>
        </div>
      </div>

      <div className="w-full grid gap-[7px] sm:gap-3" style={{ gridTemplateColumns: `repeat(${d.cols}, 1fr)` }}>
        {deck.map((sym, idx) => {
          const up = !!matched[idx] || flipped.includes(idx);
          const icon = SYMBOLS[sym % SYMBOLS.length];
          const anim = mismatch[idx] ? "is-shake" : justMatched[idx] ? "is-pulse" : "";
          return (
            <div key={idx} onClick={() => flipCard(idx)} className="cursor-pointer" style={{ perspective: "700px", aspectRatio: "3/4" }}>
              <div className={"card-flip " + (up ? "is-up " : "") + anim}>
                <div
                  className="card-face"
                  style={{ background: "linear-gradient(150deg,#182818,#101C10)", border: "1.5px solid rgba(252,255,82,0.22)" }}
                >
                  <span className="font-display font-black text-base sm:text-2xl" style={{ color: "rgba(252,255,82,0.3)" }}>F</span>
                </div>
                <div
                  className="card-face back"
                  style={{
                    background: matched[idx] ? "rgba(252,255,82,0.10)" : "linear-gradient(150deg,#1E2E1E,#141F14)",
                    border: `1.5px solid ${matched[idx] ? "rgba(252,255,82,0.5)" : "rgba(252,246,241,0.18)"}`,
                  }}
                >
                  <svg width="52%" height="52%" viewBox="0 0 24 24"><path d={icon.path} fill={icon.color} /></svg>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 sm:mt-6 flex items-center gap-2 opacity-55">
        <svg width="12" height="12" viewBox="0 0 24 24"><path d="M12 2 L21 7 V17 L12 22 L3 17 V7 Z" fill="none" stroke="#FCFF52" strokeWidth="2" /></svg>
        <span className="font-mono text-[11px] text-cream/70">prevrandao {seed.slice(0, 10)}…{seed.slice(-6)}</span>
      </div>
    </section>
  );
}
