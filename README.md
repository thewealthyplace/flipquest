# FlipQuest

On-chain memory card matching game on Celo. Find all pairs in as few moves as possible.

## How it works

Each game seeds the board from block.prevrandao — provably random, unique per game.
Play entirely off-chain (no gas per card flip), then submit your final move count when done.
Score is penalised 20 pts for every move beyond the theoretical minimum.

## Difficulty

| Mode      | Grid | Pairs | Max Score |
|-----------|------|-------|-----------|
| Classic   | 4x4  | 8     | 1,000 pts |
| Challenge | 5x4  | 10    | 2,000 pts |

A perfect game means matching every pair on the very first attempt.

## Scoring formula

  score = baseScore - 20 x max(0, moves - pairs)

## Stack

- Frontend: Next.js 14, TailwindCSS, wagmi v2, viem
- Contracts: Solidity 0.8.20, Hardhat, OpenZeppelin
- Chain: Celo mainnet (chainId 42220)

## Setup

  cd contracts && npm install
  npx hardhat run scripts/deploy.ts --network celo
  # Paste deployed address into frontend/lib/contracts.ts -> FLIPQUEST_ADDRESS
  cd ../frontend && npm install && npm run dev

## MiniPay

Auto-connects wallet via window.ethereum. No connect button. Mainnet only.
