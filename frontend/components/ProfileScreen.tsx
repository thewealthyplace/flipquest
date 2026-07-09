"use client";
import { useAccount } from "wagmi";
import { usePlayerHistory } from "@/lib/useOnChainStats";

export default function ProfileScreen({ onGoHome }: { onGoHome: () => void }) {
  const { address } = useAccount();
  const { isLoading, history, bestClassic, bestChallenge, perfectCount } = usePlayerHistory(address);

  const avatarInitial = address ? address.slice(2, 4).toUpperCase() : "??";

  return (
    <section className="w-full max-w-[560px] px-3.5 sm:px-6 pt-5 sm:pt-9 pb-16">
      <div className="flex flex-col items-center anim-rise">
        <div className="w-[76px] h-[76px] rounded-[24px] flex items-center justify-center" style={{ background: "linear-gradient(140deg,#FCFF52,#56DF7C)", boxShadow: "0 14px 34px rgba(252,255,82,0.2)" }}>
          <span className="font-display font-black text-3xl text-ink">{avatarInitial}</span>
        </div>
        <div className="font-mono text-[13px] text-cream/70 mt-3.5">{address}</div>
        <div className="flex items-center gap-1.5 mt-2 text-[11px] text-green">
          <span className="w-1.5 h-1.5 rounded-full bg-green" />MiniPay · Celo mainnet
        </div>
      </div>

      <div className="grid gap-2.5 mt-6.5 anim-rise" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(110px,1fr))", animationDelay: ".1s" }}>
        <div className="text-center py-4 px-2 rounded-2xl bg-cream/[0.04] border border-cream/[0.09]">
          <div className="font-display font-extrabold text-xl sm:text-2xl">{history.length}</div>
          <div className="font-mono text-[10px] tracking-wider text-cream/45 mt-1">GAMES</div>
        </div>
        <div className="text-center py-4 px-2 rounded-2xl bg-yellow/[0.06] border border-yellow/25">
          <div className="font-display font-extrabold text-xl sm:text-2xl text-yellow">{bestClassic || "—"}</div>
          <div className="font-mono text-[10px] tracking-wider text-cream/45 mt-1">BEST 4×4</div>
        </div>
        <div className="text-center py-4 px-2 rounded-2xl bg-purple/[0.07] border border-purple/30">
          <div className="font-display font-extrabold text-xl sm:text-2xl text-purple">{bestChallenge || "—"}</div>
          <div className="font-mono text-[10px] tracking-wider text-cream/45 mt-1">BEST 5×4</div>
        </div>
        <div className="text-center py-4 px-2 rounded-2xl bg-green/[0.06] border border-green/25">
          <div className="font-display font-extrabold text-xl sm:text-2xl text-green">{perfectCount}</div>
          <div className="font-mono text-[10px] tracking-wider text-cream/45 mt-1">PERFECT</div>
        </div>
      </div>

      <div className="mt-7 anim-rise" style={{ animationDelay: ".18s" }}>
        <div className="font-display font-bold text-[15px] mb-3">Game history</div>
        {isLoading ? (
          <div className="text-center py-9 text-cream/45 text-[13.5px]">Loading on-chain history…</div>
        ) : history.length > 0 ? (
          <div className="flex flex-col gap-2">
            {history.map(h => (
              <div key={h.gameId} className="flex items-center gap-3 py-3 px-4 rounded-2xl bg-cream/[0.03] border border-cream/[0.08]">
                <span className="font-mono text-[11px] py-1 px-2.5 rounded-lg bg-cream/[0.06]" style={{ color: h.difficulty === 0 ? "#FCFF52" : "#B28CFF" }}>
                  {h.difficulty === 0 ? "4×4" : "5×4"}
                </span>
                <span className="flex-1 text-[12.5px] text-cream/55">
                  {h.moves} moves · {new Date(h.startTime * 1000).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </span>
                {h.perfect && <span className="text-xs">⭐</span>}
                <span className="font-display font-extrabold text-[15px] text-yellow">{h.score.toLocaleString()}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-9 px-5 rounded-2xl border-[1.5px] border-dashed border-cream/[0.14] text-cream/45 text-[13.5px]">
            No games yet. <span onClick={onGoHome} className="text-yellow cursor-pointer font-semibold underline">Play your first board →</span>
          </div>
        )}
      </div>
    </section>
  );
}
