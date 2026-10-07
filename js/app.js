document.addEventListener('DOMContentLoaded', () => {
  const game = new TicTacToeVariant(16, 3);

  // DOM Elements
  const boardEl = document.getElementById('board');
  const turnIndicatorEl = document.getElementById('turn-indicator');
  const currentPlayerTextEl = document.getElementById('current-player-text');
  const statusMessageEl = document.getElementById('status-message');
  const resetBtn = document.getElementById('reset-btn');

  // Scoreboard Elements
  const xRows3 = document.getElementById('x-rows-3');
  const xRows4 = document.getElementById('x-rows-4');
  const xRows5 = document.getElementById('x-rows-5');

  const oRows3 = document.getElementById('o-rows-3');
  const oRows4 = document.getElementById('o-rows-4');
  const oRows5 = document.getElementById('o-rows-5');

  function initBoardUI() {
    boardEl.innerHTML = '';

    for (let r = 0; r < game.boardSize; r++) {
      for (let c = 0; c < game.boardSize; c++) {
        const cellEl = document.createElement('div');
        cellEl.classList.add('cell');
        cellEl.dataset.r = r;
        cellEl.dataset.c = c;

        // Apply center 9x9 borders
        if (r === game.centerStart) cellEl.classList.add('center-top');
        if (r === game.centerEnd) cellEl.classList.add('center-bottom');
        if (c === game.centerStart) cellEl.classList.add('center-left');
        if (c === game.centerEnd) cellEl.classList.add('center-right');

        cellEl.addEventListener('click', () => handleCellClick(r, c));
        boardEl.appendChild(cellEl);
      }
    }

    renderUI();
  }

  function handleCellClick(r, c) {
    if (game.gameState === 'PLAYING') {
      const res = game.placePiece(r, c);
      if (!res.success) {
        console.log('Invalid placement:', res.message);
      }
    } else if (game.gameState === 'REMOVAL') {
      const res = game.removePiece(r, c);
      if (!res.success) {
        console.log('Invalid removal:', res.message);
      }
    }

    renderUI();
  }

  function renderUI() {
    // 1. Update Board Cells
    const validMoves = game.gameState === 'PLAYING' ? game.getValidMoves() : null;
    const removablePieces = game.gameState === 'REMOVAL' ? game.getRemovableOpponentPieces() : [];
    const removableMap = new Set(removablePieces.map(p => `${p.r},${p.c}`));

    for (let r = 0; r < game.boardSize; r++) {
      for (let c = 0; c < game.boardSize; c++) {
        const cellData = game.board[r][c];
        const cellEl = boardEl.children[r * game.boardSize + c];

        // Reset dynamic classes
        cellEl.className = 'cell';
        cellEl.innerText = '';

        // Re-apply center border classes
        if (r === game.centerStart) cellEl.classList.add('center-top');
        if (r === game.centerEnd) cellEl.classList.add('center-bottom');
        if (c === game.centerStart) cellEl.classList.add('center-left');
        if (c === game.centerEnd) cellEl.classList.add('center-right');

        // Pieces & row highlights
        if (cellData.player === 'X') {
          cellEl.innerText = 'X';
          cellEl.classList.add('piece-x');
        } else if (cellData.player === 'O') {
          cellEl.innerText = 'O';
          cellEl.classList.add('piece-o');
        }

        if (cellData.inRow5) cellEl.classList.add('in-row-5');
        else if (cellData.inRow4) cellEl.classList.add('in-row-4');
        else if (cellData.inRow3) cellEl.classList.add('in-row-3');

        // State specific highlights
        if (game.gameState === 'PLAYING' && validMoves && validMoves[r][c]) {
          cellEl.classList.add('valid-move');
        } else if (game.gameState === 'REMOVAL' && removableMap.has(`${r},${c}`)) {
          cellEl.classList.add('removable-piece');
        }
      }
    }

    // 2. Update Status & Turn Indicator
    statusMessageEl.innerText = game.statusMessage;

    if (game.gameState === 'REMOVAL') {
      turnIndicatorEl.className = 'turn-indicator removal-phase';
      currentPlayerTextEl.innerText = `Removal Phase (${game.currentPlayer})`;
    } else if (game.gameState === 'GAME_OVER') {
      turnIndicatorEl.className = `turn-indicator player-${game.winner.toLowerCase()}`;
      currentPlayerTextEl.innerText = `Winner: Player ${game.winner}`;
    } else {
      turnIndicatorEl.className = `turn-indicator player-${game.currentPlayer.toLowerCase()}`;
      currentPlayerTextEl.innerText = `Player ${game.currentPlayer}'s Turn`;
    }

    // 3. Update Scoreboard
    xRows3.innerText = game.players['X'].rowsOf3;
    xRows4.innerText = game.players['X'].rowsOf4;
    xRows5.innerText = game.players['X'].rowsOf5;

    oRows3.innerText = game.players['O'].rowsOf3;
    oRows4.innerText = game.players['O'].rowsOf4;
    oRows5.innerText = game.players['O'].rowsOf5;
  }

  resetBtn.addEventListener('click', () => {
    game.resetGame();
    renderUI();
  });

  initBoardUI();
});
