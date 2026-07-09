"use client";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { shortAddr } from "@/lib/contracts";

export type Screen = "home" | "game" | "win" | "board" | "profile";

interface Props {
  screen: Screen;
  onNav: (screen: Screen) => void;
}

export default function Header({ screen, onNav }: Props) {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const navItem = (label: string, target: Screen, active: boolean) => (
    <button
      key={label}
      onClick={() => onNav(target)}
      className={
        "font-body font-semibold text-[11px] sm:text-[13px] px-3 sm:px-4 py-2 rounded-full border transition-colors " +
        (active
          ? "border-yellow/55 bg-yellow/10 text-yellow"
          : "border-cream/10 bg-transparent text-cream/65 hover:text-cream")
      }
    >
      {label}
    </button>
  );

  return (
    <header className="w-full max-w-[1060px] flex items-center justify-between gap-3 px-3.5 sm:px-7 py-3 sm:py-5 sticky top-0 z-40 backdrop-blur-xl bg-ink/70 border-b border-cream/[0.07]">
      <div onClick={() => onNav("home")} className="flex items-center gap-2.5 cursor-pointer shrink-0">
        <div className="w-[34px] h-[34px]" style={{ perspective: "300px" }}>
          <div className="relative w-full h-full anim-logo-flip" style={{ transformStyle: "preserve-3d" }}>
            <div className="absolute inset-0 flex items-center justify-center rounded-[9px] bg-yellow font-display font-black text-[17px] text-ink" style={{ backfaceVisibility: "hidden" }}>F</div>
            <div className="absolute inset-0 flex items-center justify-center rounded-[9px] bg-ink border-2 border-yellow font-display font-black text-[15px] text-yellow" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>Q</div>
          </div>
        </div>
        <div className="font-display font-extrabold text-sm sm:text-lg tracking-wide">
          FLIP<span className="text-yellow">QUEST</span>
        </div>
      </div>

      {isConnected ? (
        <>
          <nav className="flex items-center gap-1 sm:gap-2">
            {navItem("Play", "home", screen === "home" || screen === "game" || screen === "win")}
            {navItem("Ranks", "board", screen === "board")}
            {navItem("Me", "profile", screen === "profile")}
          </nav>
          <div className="flex items-center gap-2 py-1.5 pl-3 pr-1.5 rounded-full bg-green/[0.09] border border-green/25 shrink-0">
            <span className="w-[7px] h-[7px] rounded-full bg-green" style={{ boxShadow: "0 0 8px #56DF7C" }} />
            <span className="font-mono text-[10px] sm:text-xs text-green/80">{address ? shortAddr(address) : ""}</span>
            <button
              onClick={() => disconnect()}
              title="Disconnect wallet"
              className="flex items-center justify-center w-5 h-5 rounded-full text-green/60 hover:text-red hover:bg-red/10 transition-colors cursor-pointer"
            >
              <svg width="11" height="11" viewBox="0 0 24 24"><path d="M6 6 L18 18 M18 6 L6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg>
            </button>
          </div>
        </>
      ) : isPending ? (
        <div className="flex items-center gap-2 font-mono text-[10px] sm:text-xs text-yellow border-[1.5px] border-dashed border-yellow/45 rounded-full py-2.5 px-4">
          <span className="w-3 h-3 border-2 border-yellow/25 border-t-yellow rounded-full anim-spin inline-block" />
          connecting…
        </div>
      ) : (
        <button
          onClick={() => connect({ connector: connectors[0] })}
          className="font-display font-bold text-[10px] sm:text-xs text-ink bg-yellow border-none rounded-full py-2.5 px-4 sm:px-5 cursor-pointer transition-transform hover:-translate-y-0.5"
        >
          CONNECT WALLET
        </button>
      )}
    </header>
  );
}
