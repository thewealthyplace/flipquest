import type { Metadata, Viewport } from "next";
import { Unbounded, Sora, Space_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const unbounded = Unbounded({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"], variable: "--font-unbounded" });
const sora = Sora({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-sora" });
const spaceMono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-space-mono" });

export const metadata: Metadata = {
  title: "FlipQuest",
  description: "On-chain memory card game on Celo.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${unbounded.variable} ${sora.variable} ${spaceMono.variable}`}>
      <body className="font-body">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
