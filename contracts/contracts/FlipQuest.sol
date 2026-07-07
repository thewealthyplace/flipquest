// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @notice FlipQuest — on-chain memory card matching game on Celo.
/// Block randomness seeds the board. Score penalises extra moves beyond perfect.
contract FlipQuest is Ownable, ReentrancyGuard {
    IERC20 public immutable usdm;

    // Difficulty 0: Classic  4x4 = 8 pairs, base 1000 pts
    // Difficulty 1: Challenge 5x4 = 10 pairs, base 2000 pts
    uint8[2]  public pairsCount = [8, 10];
    uint16[2] public baseScore  = [1000, 2000];
    uint16    public movePenalty = 20;

    struct Game {
        address player;
        bytes32 seed;
        uint8   difficulty;
        uint32  startTime;
        uint16  moves;
        bool    completed;
    }

    struct PlayerStats {
        uint256 bestScore;
        uint32  gamesPlayed;
        uint32  gamesCompleted;
    }

    constructor(address _usdm) Ownable(msg.sender) {
        usdm = IERC20(_usdm);
    }
}
