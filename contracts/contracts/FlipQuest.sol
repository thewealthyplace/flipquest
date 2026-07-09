// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @notice FlipQuest — on-chain memory card matching game on Celo.
/// Board is seeded from block.prevrandao — provably fair, unique per game.
/// Score formula: baseScore - movePenalty * max(0, moves - minPairs).
contract FlipQuest is Ownable, ReentrancyGuard {
    IERC20 public immutable usdm;

    uint8[2]  public pairsCount  = [8, 10];
    uint16[2] public baseScore   = [1000, 2000];
    uint16    public movePenalty = 20;
    uint8     public constant MAX_BATCH = 10;

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

    function startGame(uint8 difficulty) external returns (uint256 gameId, bytes32 seed) {
        (gameId, seed) = _startGame(difficulty);
    }

    /// @notice Batch-open a session of games in a single transaction — one signature
    ///         for the whole session instead of one per game.
    function startGames(uint8[] calldata difficulties) external returns (uint256[] memory gameIds, bytes32[] memory seeds) {
        require(difficulties.length > 0 && difficulties.length <= MAX_BATCH, "Invalid batch size");
        gameIds = new uint256[](difficulties.length);
        seeds = new bytes32[](difficulties.length);
        for (uint256 i = 0; i < difficulties.length; i++) {
            (gameIds[i], seeds[i]) = _startGame(difficulties[i]);
        }
    }

    function finishGame(uint256 gameId, uint16 moves) external nonReentrant {
        _finishGame(gameId, moves);
    }

    /// @notice Batch-submit results for a session of games in a single transaction.
    function finishGames(uint256[] calldata gameIds, uint16[] calldata movesArr) external nonReentrant {
        require(gameIds.length == movesArr.length, "Length mismatch");
        require(gameIds.length > 0 && gameIds.length <= MAX_BATCH, "Invalid batch size");
        for (uint256 i = 0; i < gameIds.length; i++) {
            _finishGame(gameIds[i], movesArr[i]);
        }
    }

    function _startGame(uint8 difficulty) internal returns (uint256 gameId, bytes32 seed) {
        require(difficulty < 2, "Invalid difficulty");
        gameId = totalGames++;
        seed = keccak256(abi.encodePacked(block.prevrandao, msg.sender, gameId, block.timestamp));
        games[gameId] = Game({ player: msg.sender, seed: seed, difficulty: difficulty,
            startTime: uint32(block.timestamp), moves: 0, completed: false });
        playerGames[msg.sender].push(gameId);
        if (!hasPlayed[msg.sender]) { hasPlayed[msg.sender] = true; players.push(msg.sender); }
        stats[msg.sender].gamesPlayed++;
        emit GameStarted(gameId, msg.sender, difficulty, seed);
    }

    function _finishGame(uint256 gameId, uint16 moves) internal {
        Game storage game = games[gameId];
        require(game.player == msg.sender, "Not your game");
        require(!game.completed, "Already completed");
        uint8 minMoves = pairsCount[game.difficulty];
        require(moves >= minMoves, "Impossible move count");
        require(moves <= 500, "Move count too high");
        game.completed = true; game.moves = moves;
        stats[msg.sender].gamesCompleted++;
        uint256 score;
        uint16 base = baseScore[game.difficulty];
        if (moves <= minMoves) { score = base; }
        else {
            uint256 penalty = uint256(moves - minMoves) * movePenalty;
            score = penalty >= base ? 0 : base - penalty;
        }
        if (score > stats[msg.sender].bestScore) { stats[msg.sender].bestScore = score; }
        emit GameCompleted(gameId, msg.sender, moves, score);
    }

    function getTopPlayers(uint256 limit) external view returns (address[] memory top, uint256[] memory scores) {
        uint256 count = players.length < limit ? players.length : limit;
        top = new address[](count); scores = new uint256[](count);
        address[] memory sorted = new address[](players.length);
        for (uint256 i = 0; i < players.length; i++) sorted[i] = players[i];
        for (uint256 i = 0; i < players.length; i++)
            for (uint256 j = i + 1; j < players.length; j++)
                if (stats[sorted[j]].bestScore > stats[sorted[i]].bestScore) {
                    address tmp = sorted[i]; sorted[i] = sorted[j]; sorted[j] = tmp;
                }
        for (uint256 i = 0; i < count; i++) { top[i] = sorted[i]; scores[i] = stats[sorted[i]].bestScore; }
    }

    function getPlayerGames(address player) external view returns (uint256[] memory) {
        return playerGames[player];
    }

    function totalPlayers() external view returns (uint256) { return players.length; }
}
