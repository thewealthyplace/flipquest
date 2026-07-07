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

    mapping(uint256 => Game)        public games;
    mapping(address => PlayerStats) public stats;
    mapping(address => uint256[])   public playerGames;
    mapping(address => bool)        public hasPlayed;
    address[] public players;
    uint256   public totalGames;

    event GameStarted(uint256 indexed gameId, address indexed player, uint8 difficulty, bytes32 seed);
    event GameCompleted(uint256 indexed gameId, address indexed player, uint16 moves, uint256 score);

    constructor(address _usdm) Ownable(msg.sender) { usdm = IERC20(_usdm); }

    /// @notice Start a new game. Returns gameId and seed that defines card positions.
    function startGame(uint8 difficulty) external returns (uint256 gameId, bytes32 seed) {
        require(difficulty < 2, "Invalid difficulty");
        gameId = totalGames++;
        seed = keccak256(abi.encodePacked(block.prevrandao, msg.sender, gameId, block.timestamp));
        games[gameId] = Game({
            player: msg.sender, seed: seed, difficulty: difficulty,
            startTime: uint32(block.timestamp), moves: 0, completed: false
        });
        playerGames[msg.sender].push(gameId);
        if (!hasPlayed[msg.sender]) {
            hasPlayed[msg.sender] = true;
            players.push(msg.sender);
        }
        stats[msg.sender].gamesPlayed++;
        emit GameStarted(gameId, msg.sender, difficulty, seed);
    }
}
