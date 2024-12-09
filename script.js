const Gameboard = (() => {
    let board = Array(9).fill('');

    return {
        getBoard: () => board,
        resetBoard: () => board.fill(''),
        makeMove: (index, marker) => 
            board[index] === '' ? (board[index] = marker, true) : false
    };
})();

const Player = (name, marker) => ({ name, marker });

const GameController = (() => {
    let players = [];
    let currentPlayer;
    let gameOver = false;

    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]  
    ];

    return {
        initGame: (player1Name, player2Name) => {
            players = [
                Player(player1Name, 'X'),
                Player(player2Name, 'O')
            ];
            currentPlayer = players[0];
            Gameboard.resetBoard();
            gameOver = false;
        },

        playRound: (index) => {
            if (gameOver) return false;

            const board = Gameboard.getBoard();
            
            if (Gameboard.makeMove(index, currentPlayer.marker)) {
                const result = winPatterns.reduce((winner, pattern) => {
                    const [a, b, c] = pattern;
                    return (board[a] && board[a] === board[b] && board[a] === board[c]) 
                        ? board[a] 
                        : winner;
                }, null);

                const isTie = board.every(cell => cell !== '');

                if (result) {
                    gameOver = true;
                    return result;
                }

                if (isTie) {
                    gameOver = true;
                    return 'tie';
                }

                currentPlayer = currentPlayer === players[0] ? players[1] : players[0];
                return null;
            }
            return false;
        },

        getCurrentPlayer: () => currentPlayer,
        isGameOver: () => gameOver
    };
})();

const DisplayController = (() => {
    const $ = selector => document.querySelector(selector);
    const boardElement = $('#game-board');
    const statusElement = $('#game-status');
    const startButton = $('#start-game');
    const restartButton = $('#restart-game');
    const player1Input = $('#player1-name');
    const player2Input = $('#player2-name');

    const renderBoard = () => {
        boardElement.innerHTML = Gameboard.getBoard()
            .map((cell, index) => `
                <div class="board-cell" data-index="${index}">
                    ${cell}
                </div>
            `).join('');

        boardElement.querySelectorAll('.board-cell')
            .forEach(cell => cell.addEventListener('click', handleCellClick));
    };

    const handleCellClick = (e) => {
        const index = parseInt(e.target.dataset.index);
        const result = GameController.playRound(index);
        renderBoard();
        updateStatus(result);
    };

    const updateStatus = (result) => {
        const statusMessages = {
            'tie': "It's a tie!",
            'default': () => {
                const currentPlayer = GameController.getCurrentPlayer();
                return result 
                    ? `${currentPlayer.name} wins!`
                    : `${currentPlayer.name}'s turn`;
            }
        };

        statusElement.textContent = result === 'tie' 
            ? statusMessages['tie']
            : statusMessages['default']();

        restartButton.style.display = result ? 'block' : 'none';
    };

    const initEventListeners = () => {
        startButton.addEventListener('click', () => {
            const player1Name = player1Input.value || 'Player 1';
            const player2Name = player2Input.value || 'Player 2';
            
            GameController.initGame(player1Name, player2Name);
            
            $('#player-setup').style.display = 'none';
            boardElement.style.display = 'grid';
            renderBoard();
            updateStatus();
        });

        restartButton.addEventListener('click', () => {
            $('#player-setup').style.display = 'block';
            boardElement.style.display = 'none';
            statusElement.textContent = '';
            restartButton.style.display = 'none';
            
            player1Input.value = '';
            player2Input.value = '';
        });
    };

    return {
        init: () => {
            initEventListeners();
            boardElement.style.display = 'none';
        }
    };
})();

document.addEventListener('DOMContentLoaded', DisplayController.init);