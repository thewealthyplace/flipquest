"use client";
import { useMemo } from "react";
import { DIFFICULTIES, MOVE_PENALTY, calcScore, isPerfect } from "@/lib/contracts";

type TxState = "idle" | "pending" | "done";

interface Props {
  difficulty: number;
  moves: number;
  txState: TxState;
  txHash?: string;
  onSubmit: () => void;
  onPlayAgain: () => void;
  onLeaderboard: () => void;
}

interface Confetto { left: number; size: number; size2: number; color: string; radius: number; dur: string; delay: string }

export default function WinScreen({ difficulty, moves, txState, txHash, onSubmit, onPlayAgain, onLeaderboard }: Props) {
  const d = DIFFICULTIES[difficulty];
  const finalScore = calcScore(moves, difficulty);
  const penalty = d.baseScore - finalScore;
  const perfect = isPerfect(moves, difficulty);

  const confetti = useMemo<Confetto[]>(() => {
    const colors = ["#FCFF52", "#56DF7C", "#B28CFF", "#FF7A9E", "#6EC9FF", "#FCF6F1"];
    return Array.from({ length: 90 }, (_, i) => {
      const sz = 5 + Math.random() * 8;
      return {
        left: Math.round(Math.random() * 100),
        size: Math.round(sz), size2: Math.round(sz * (0.4 + Math.random() * 1.2)),
        color: colors[i % colors.length],
        radius: Math.random() > 0.5 ? 99 : 2,
        dur: (2.4 + Math.random() * 2.2).toFixed(2),
        delay: (Math.random() * 0.9).toFixed(2),
      };
    });
  }, []);

  return (
    <section className="w-full max-w-[520px] px-3.5 sm:px-6 pt-5 sm:pt-10 pb-16 flex flex-col items-center text-center relative">
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {confetti.map((c, i) => (
          <div
            key={i}
            className="absolute -top-5 anim-confetti"
            style={{
              left: `${c.left}%`, width: c.size, height: c.size2,
              background: c.color, borderRadius: c.radius,
              animationDuration: `${c.dur}s`, animationDelay: `${c.delay}s`,
            }}
          />
        ))}
      </div>

      {perfect && (
        <div className="anim-rise font-mono text-xs tracking-[3px] text-ink font-bold rounded-full py-2 px-4.5 mb-4.5" style={{ background: "linear-gradient(90deg,#FCFF52,#56DF7C)" }}>
          ★ PERFECT GAME ★
        </div>
      )}

      <div className="font-display font-black text-3xl sm:text-5xl leading-[1.05] anim-rise">
        YOU <span className="text-yellow">WON</span>
      </div>
      <div className="font-display font-black text-6xl sm:text-8xl text-yellow mt-3.5 anim-rise" style={{ textShadow: "0 0 50px rgba(252,255,82,0.35)", animationDelay: ".15s" }}>
        {finalScore.toLocaleString()}
      </div>
      <div className="font-mono text-xs tracking-[2px] text-cream/50 anim-rise" style={{ animationDelay: ".2s" }}>
        POINTS · {d.name.toUpperCase()} {d.label}
      </div>

      <div className="w-full mt-7 rounded-[18px] bg-cream/[0.04] border border-cream/[0.09] py-4.5 px-5 anim-rise" style={{ animationDelay: ".25s" }}>
        <div className="flex justify-between text-[13.5px] py-1.5 text-cream/75"><span>Base score</span><span className="font-mono">{d.baseScore.toLocaleString()}</span></div>
        <div className="flex justify-between text-[13.5px] py-1.5 text-cream/75"><span>Moves used</span><span className="font-mono">{moves} / {d.pairs} min</span></div>
        <div className="flex justify-between text-[13.5px] py-1.5" style={{ color: penalty > 0 ? "#F65E5E" : "rgba(252,246,241,0.75)" }}>
          <span>Move penalty (−{MOVE_PENALTY} × extra)</span><span className="font-mono">−{penalty}</span>
        </div>
        <div className="h-px bg-cream/10 my-2" />
        <div className="flex justify-between text-[15px] font-bold py-1.5"><span>Final</span><span className="font-mono text-yellow">{finalScore.toLocaleString()}</span></div>
      </div>

      <div className="w-full mt-5 anim-rise" style={{ animationDelay: ".3s" }}>
        {txState === "idle" && (
          <>
            <button
              onClick={onSubmit}
              className="w-full font-display font-extrabold text-[15px] text-ink bg-yellow border-none rounded-2xl py-4.5 cursor-pointer transition-transform hover:-translate-y-0.5"
            >
              SUBMIT SCORE ON-CHAIN
            </button>
            <div className="text-xs text-cream/45 mt-2.5">One transaction · signed via MiniPay</div>
          </>
        )}
        {txState === "pending" && (
          <div className="w-full flex items-center justify-center gap-3 font-display font-bold text-sm text-yellow bg-yellow/[0.08] border-[1.5px] border-dashed border-yellow/45 rounded-2xl py-4.5">
            <span className="w-4 h-4 border-[2.5px] border-yellow/25 border-t-yellow rounded-full anim-spin inline-block" />
            CONFIRMING ON CELO…
          </div>
        )}
        {txState === "done" && (
          <div className="w-full bg-green/[0.08] border-[1.5px] border-green/40 rounded-2xl py-4 px-4">
            <div className="flex items-center justify-center gap-2 font-display font-bold text-sm text-green">
              <svg width="18" height="18" viewBox="0 0 24 24"><path d="M4 12.5 L9.5 18 L20 6.5" fill="none" stroke="#56DF7C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
              SCORE RECORDED ON-CHAIN
            </div>
            {txHash && <div className="font-mono text-[11px] text-cream/50 mt-2">tx {txHash}</div>}
          </div>
        )}
      </div>

      <div className="flex gap-3 w-full mt-3.5 anim-rise" style={{ animationDelay: ".35s" }}>
        <button onClick={onPlayAgain} className="flex-1 font-display font-bold text-[13px] text-cream bg-transparent border-[1.5px] border-cream/20 rounded-2xl py-3.5 cursor-pointer hover:border-yellow/70 transition-colors">
          PLAY AGAIN
        </button>
        <button onClick={onLeaderboard} className="flex-1 font-display font-bold text-[13px] text-cream bg-transparent border-[1.5px] border-cream/20 rounded-2xl py-3.5 cursor-pointer hover:border-yellow/70 transition-colors">
          RANKS
        </button>
      </div>
    </section>
  );
}
