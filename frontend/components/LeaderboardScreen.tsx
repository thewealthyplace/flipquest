"use client";
import { useState } from "react";
import { useAccount } from "wagmi";
import { shortAddr, avatarSymbolFor } from "@/lib/contracts";
import { useLeaderboard, GameRecord } from "@/lib/useOnChainStats";

function Tab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={
        "font-body font-semibold text-[13px] py-2 px-5.5 rounded-full cursor-pointer border transition-colors " +
        (active ? "border-yellow/55 bg-yellow/10 text-yellow" : "border-cream/10 bg-transparent text-cream/60")
      }
    >
      {children}
    </button>
  );
}

export default function LeaderboardScreen() {
  const { address } = useAccount();
  const [tab, setTab] = useState<"classic" | "challenge">("classic");
  const { isLoading, topClassic, topChallenge } = useLeaderboard();
  const rows: GameRecord[] = tab === "classic" ? topClassic : topChallenge;

  return (
    <section className="w-full max-w-[560px] px-3.5 sm:px-6 pt-5 sm:pt-9 pb-16">
      <div className="font-display font-extrabold text-2xl sm:text-3xl text-center anim-rise">
        LEADER<span className="text-yellow">BOARD</span>
      </div>
      <div className="flex justify-center gap-2 mt-4.5 anim-rise" style={{ animationDelay: ".08s" }}>
        <Tab active={tab === "classic"} onClick={() => setTab("classic")}>Classic</Tab>
        <Tab active={tab === "challenge"} onClick={() => setTab("challenge")}>Challenge</Tab>
      </div>
      <div className="mt-5.5 flex flex-col gap-2 anim-rise" style={{ animationDelay: ".15s" }}>
        {isLoading ? (
          <div className="text-center py-10 text-cream/45 text-sm">Loading on-chain scores…</div>
        ) : rows.length === 0 ? (
          <div className="text-center py-10 text-cream/45 text-sm">No games yet — be the first!</div>
        ) : (
          rows.map((row, i) => {
            const icon = avatarSymbolFor(row.player);
            const isMe = row.player.toLowerCase() === address?.toLowerCase();
            return (
              <div
                key={row.player}
                className="flex items-center gap-3.5 py-3 px-4 rounded-2xl border"
                style={{
                  background: i === 0 ? "rgba(252,255,82,0.07)" : isMe ? "rgba(252,246,241,0.06)" : "rgba(252,246,241,0.03)",
                  borderColor: i === 0 ? "rgba(252,255,82,0.35)" : "rgba(252,246,241,0.08)",
                }}
              >
                <div className="font-display font-extrabold text-[15px] w-8" style={{ color: i === 0 ? "#FCFF52" : i === 1 ? "#E8D9FF" : i === 2 ? "#FFB347" : "rgba(252,246,241,0.4)" }}>
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="w-8.5 h-8.5 rounded-[11px] flex items-center justify-center shrink-0" style={{ background: icon.color }}>
                  <svg width="16" height="16" viewBox="0 0 24 24"><path d={icon.path} fill="#0B120B" /></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                    {shortAddr(row.player)} {isMe && <span className="text-yellow text-xs">(you)</span>}
                  </div>
                </div>
                {row.perfect && (
                  <span className="text-[10px] font-mono text-green border border-green/40 rounded-full py-0.5 px-2 shrink-0">PERFECT</span>
                )}
                <div className="font-display font-extrabold text-base text-yellow">{row.score.toLocaleString()}</div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
