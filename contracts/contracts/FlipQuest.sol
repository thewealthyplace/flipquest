// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @notice FlipQuest — on-chain memory card matching game on Celo.
contract FlipQuest is Ownable, ReentrancyGuard {
    IERC20 public immutable usdm;

    uint8[2]  public pairsCount  = [8, 10];
    uint16[2] public baseScore   = [1000, 2000];
    uint16    public movePenalty = 20;

    struct Game { address player; bytes32 seed; uint8 difficulty; uint32 startTime; uint16 moves; bool completed; }
    struct PlayerStats { uint256 bestScore; uint32 gamesPlayed; uint32 gamesCompleted; }

    mapping(uint256 => Game)         public games;
    mapping(address => PlayerStats)  public stats;
    mapping(address => uint256[])    public playerGames;
    mapping(address => bool)         public hasPlayed;
    address[] public players;
    uint256   public totalGames;

    event GameStarted(uint256 indexed gameId, address indexed player, uint8 difficulty, bytes32 seed);
    event GameCompleted(uint256 indexed gameId, address indexed player, uint16 moves, uint256 score);

    constructor(address _usdm) Ownable(msg.sender) {
        usdm = IERC20(_usdm);
    }
}
