"use client";
import { useAccount, useConnect } from "wagmi";
import { DIFFICULTIES } from "@/lib/contracts";

interface Props {
  onSelectMode: (difficulty: number) => void;
  starting: number | null;
}

export default function Home({ onSelectMode, starting }: Props) {
  const { isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();

  return (
    <section className="w-full max-w-[1060px] px-3.5 sm:px-7 pb-16 flex flex-col items-center">
      <div className="flex flex-col items-center text-center pt-8 sm:pt-16 anim-rise">
        <div className="relative w-[120px] h-[120px] sm:w-[168px] sm:h-[168px] mb-6">
          <div className="absolute left-[2%] top-[12%] w-[58%] h-[76%] rounded-[18px] anim-float flex items-center justify-center"
               style={{ background: "linear-gradient(150deg,#152415,#0E1A0E)", border: "2px solid rgba(252,255,82,0.4)", boxShadow: "0 18px 40px rgba(0,0,0,0.5)" }}>
            <svg width="46%" height="46%" viewBox="0 0 24 24"><path d="M13 2 L4.6 13.6 H10.4 L9.4 22 L19.4 9.6 H13.4 Z" fill="#FCFF52" /></svg>
          </div>
          <div className="absolute right-0 top-0 w-[60%] h-[80%] rounded-[18px] bg-yellow anim-float2 flex items-center justify-center"
               style={{ boxShadow: "0 22px 48px rgba(252,255,82,0.22)" }}>
            <span className="font-display font-black text-4xl sm:text-5xl text-ink" style={{ transform: "scaleX(-1)" }}>F</span>
          </div>
        </div>
        <h1 className="font-display font-black text-3xl sm:text-6xl leading-[1.05] tracking-tight">
          FLIP<span className="text-yellow">QUEST</span>
        </h1>
        <p className="mt-4 max-w-[440px] text-sm sm:text-base leading-relaxed text-cream/65">
          Flip. Match. Win on-chain. A memory duel against the blockchain itself — every board provably seeded by Celo&apos;s randomness.
        </p>
        <div className="flex items-center gap-2 mt-4 py-2 px-3.5 rounded-full bg-yellow/[0.07] border border-dashed border-yellow/30">
          <svg width="14" height="14" viewBox="0 0 24 24"><path d="M12 2 L21 7 V17 L12 22 L3 17 V7 Z" fill="none" stroke="#FCFF52" strokeWidth="2" /></svg>
          <span className="font-mono text-[10px] sm:text-xs text-yellow">seeded by block.prevrandao · Celo mainnet</span>
        </div>
      </div>

      {!isConnected && (
        <div className="w-full max-w-[440px] mt-10 sm:mt-14 anim-rise flex flex-col items-center gap-3.5" style={{ animationDelay: ".15s" }}>
          {isPending ? (
            <div className="w-full flex items-center justify-center gap-3 font-display font-bold text-sm text-yellow bg-yellow/[0.08] border-[1.5px] border-dashed border-yellow/45 rounded-2xl py-4.5 px-4">
              <span className="w-4 h-4 border-[2.5px] border-yellow/25 border-t-yellow rounded-full anim-spin inline-block" />
              CONNECTING VIA MINIPAY…
            </div>
          ) : (
            <button
              onClick={() => connect({ connector: connectors[0] })}
              className="w-full font-display font-extrabold text-sm sm:text-base text-ink bg-yellow border-none rounded-2xl py-4.5 cursor-pointer transition-transform hover:-translate-y-1"
            >
              CONNECT WALLET TO PLAY
            </button>
          )}
          <div className="text-xs text-cream/45 text-center">MiniPay auto-connects · Celo mainnet only · no signup</div>
        </div>
      )}

      {isConnected && (
        <div className="flex flex-wrap gap-4.5 justify-center w-full mt-10 sm:mt-14 anim-rise" style={{ animationDelay: ".15s" }}>
          {DIFFICULTIES.map((d, i) => {
            const accent = i === 0 ? "#FCFF52" : "#B28CFF";
            const accentClass = i === 0 ? "text-yellow" : "text-purple";
            const isStarting = starting === i;
            return (
              <div
                key={d.name}
                onClick={() => !starting && onSelectMode(i)}
                className={"flex-1 min-w-[280px] max-w-[420px] rounded-[22px] p-6 pb-5 relative overflow-hidden transition-all " + (starting ? "opacity-70" : "cursor-pointer hover:-translate-y-1")}
                style={{
                  background: `linear-gradient(155deg, ${accent}1a, ${accent}05)`,
                  border: `2px solid ${accent}59`,
                }}
              >
                <div className="absolute -right-4.5 -top-4.5 font-display font-black text-[110px] pointer-events-none" style={{ color: `${accent}0f` }}>
                  {d.label}
                </div>
                <div className={"font-mono text-[11px] tracking-[2px] " + accentClass}>{d.name.toUpperCase()}</div>
                <div className="font-display font-extrabold text-2xl sm:text-3xl mt-2">{d.label}</div>
                <div className="flex gap-4 mt-3.5 text-sm text-cream/60">
                  <span>{d.pairs} pairs</span><span>·</span>
                  <span className={"font-semibold " + accentClass}>{d.baseScore.toLocaleString()} pts max</span>
                </div>
                <div className="mt-4.5 inline-flex items-center gap-2 font-display font-bold text-[13px] text-ink rounded-xl py-2.5 px-5" style={{ background: accent }}>
                  {isStarting ? "STARTING…" : `PLAY ${d.name.toUpperCase()}`} {!isStarting && <span className="text-[15px]">→</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="w-full max-w-[880px] mt-12 sm:mt-16 anim-rise" style={{ animationDelay: ".3s" }}>
        <div className="font-display font-bold text-base sm:text-lg text-center mb-5">How it <span className="text-yellow">works</span></div>
        <div className="grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))" }}>
          {[
            { n: "01 — SEED", body: <>Each game draws its board from <span className="font-mono text-cream">block.prevrandao</span> — provably random, unique every game. No two boards alike.</> },
            { n: "02 — PLAY", body: <>Flip cards and find every pair, entirely off-chain. Zero gas per flip. Fewer moves = higher score.</> },
            { n: "03 — SUBMIT", body: <>Submit your final move count in one transaction. <span className="font-mono text-cream">−20 pts</span> for every move past the minimum. Perfect games score the max.</> },
          ].map(step => (
            <div key={step.n} className="rounded-[18px] p-5 bg-cream/[0.03] border border-cream/[0.08]">
              <div className="font-mono font-bold text-xs text-yellow mb-2.5">{step.n}</div>
              <div className="text-[13.5px] leading-relaxed text-cream/70">{step.body}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
