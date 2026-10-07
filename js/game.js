/**
 * TicTacToeVariant - Core Game Logic
 */
class TicTacToeVariant {
  constructor(boardSize = 16, centerSize = 3) {
    this.boardSize = boardSize;
    this.centerSize = centerSize;

    // Calculate 0-indexed bounds for the center square
    this.centerStart = Math.floor((this.boardSize - this.centerSize) / 2);
    this.centerEnd = this.centerStart + this.centerSize - 1;

    this.resetGame();
  }

  resetGame() {
    this.board = [];
    for (let r = 0; r < this.boardSize; r++) {
      const row = [];
      for (let c = 0; c < this.boardSize; c++) {
        row.push({
          player: null,
          inRow3: false,
          inRow4: false,
          inRow5: false
        });
      }
      this.board.push(row);
    }

    this.players = {
      'X': { player: 'X', firstMoveMade: false, rowsOf3: 0, rowsOf4: 0, rowsOf5: 0 },
      'O': { player: 'O', firstMoveMade: false, rowsOf3: 0, rowsOf4: 0, rowsOf5: 0 }
    };

    this.currentPlayer = 'X';
    this.gameState = 'PLAYING'; // 'PLAYING', 'REMOVAL', 'GAME_OVER'
    this.removalsPending = 0;
    this.winner = null;
    this.statusMessage = `Player X's turn to place initial piece in the center ${this.centerSize}x${this.centerSize} area.`;
  }

  isInCenter(r, c) {
    return (
      r >= this.centerStart &&
      r <= this.centerEnd &&
      c >= this.centerStart &&
      c <= this.centerEnd
    );
  }

  getOpponent(player = this.currentPlayer) {
    return player === 'X' ? 'O' : 'X';
  }

  /**
   * Returns a 2D boolean array of valid move locations for the given player.
   */
  getValidMoves(player = this.currentPlayer) {
    const valid = Array.from({ length: this.boardSize }, () =>
      Array(this.boardSize).fill(false)
    );

    const playerData = this.players[player];

    if (!playerData.firstMoveMade) {
      for (let r = this.centerStart; r <= this.centerEnd; r++) {
        for (let c = this.centerStart; c <= this.centerEnd; c++) {
          if (this.board[r][c].player === null) {
            valid[r][c] = true;
          }
        }
      }
      return valid;
    }

    // Find all cells occupied by this player
    const playerCells = [];
    for (let r = 0; r < this.boardSize; r++) {
      for (let c = 0; c < this.boardSize; c++) {
        if (this.board[r][c].player === player) {
          playerCells.push({ r, c });
        }
      }
    }

    // A cell is valid if it is empty and Chebyshev distance <= 2 from any of player's cells
    for (let r = 0; r < this.boardSize; r++) {
      for (let c = 0; c < this.boardSize; c++) {
        if (this.board[r][c].player !== null) continue;

        for (const cell of playerCells) {
          const dr = Math.abs(r - cell.r);
          const dc = Math.abs(c - cell.c);
          if (dr <= 2 && dc <= 2 && !(dr === 0 && dc === 0)) {
            valid[r][c] = true;
            break;
          }
        }
      }
    }

    return valid;
  }

  /**
   * Returns an array of coordinates {r, c} for opponent pieces that can be removed.
   */
  getRemovableOpponentPieces(player = this.currentPlayer) {
    const opponent = this.getOpponent(player);
    const removable = [];

    for (let r = 0; r < this.boardSize; r++) {
      for (let c = 0; c < this.boardSize; c++) {
        const cell = this.board[r][c];
        if (
          cell.player === opponent &&
          !cell.inRow3 &&
          !cell.inRow4 &&
          !cell.inRow5
        ) {
          removable.push({ r, c });
        }
      }
    }

    return removable;
  }

  /**
   * Places a piece at (r, c) for the current player.
   */
  placePiece(r, c) {
    if (this.gameState !== 'PLAYING') {
      return { success: false, message: 'Game is not in placement state.' };
    }

    const validMoves = this.getValidMoves(this.currentPlayer);
    if (!validMoves[r][c]) {
      return { success: false, message: 'Invalid move position.' };
    }

    // Place piece
    const player = this.currentPlayer;
    this.board[r][c].player = player;
    this.players[player].firstMoveMade = true;

    // Check lines formed by this move
    const newRows3Count = this.checkAndMarkLines(r, c, player);

    // Check win condition for current player
    if (this.checkWinCondition(player)) {
      this.gameState = 'GAME_OVER';
      this.winner = player;
      this.statusMessage = `Player ${player} wins! 🎉`;
      return { success: true, winner: player };
    }

    // Handle removal phase if rows of 3 were formed
    if (newRows3Count > 0) {
      const removablePieces = this.getRemovableOpponentPieces(player);
      if (removablePieces.length > 0) {
        this.gameState = 'REMOVAL';
        this.removalsPending = newRows3Count;
        this.statusMessage = `Player ${player} formed ${newRows3Count} row(s) of 3! Select ${newRows3Count} opponent piece(s) to remove.`;
        return { success: true, state: 'REMOVAL' };
      } else {
        this.statusMessage = `Player ${player} formed row(s) of 3, but opponent has no removable pieces. Removal phase skipped.`;
      }
    }

    // Switch turn
    this.switchTurn();
    return { success: true, state: 'PLAYING' };
  }

  /**
   * Removes an opponent piece at (r, c) during REMOVAL state.
   */
  removePiece(r, c) {
    if (this.gameState !== 'REMOVAL') {
      return { success: false, message: 'Game is not in removal state.' };
    }

    const opponent = this.getOpponent(this.currentPlayer);
    const cell = this.board[r][c];

    if (cell.player !== opponent) {
      return { success: false, message: 'Cell does not contain an opponent piece.' };
    }

    if (cell.inRow3 || cell.inRow4 || cell.inRow5) {
      return { success: false, message: 'Cannot remove a piece that is part of a row of 3, 4, or 5.' };
    }

    // Remove piece
    cell.player = null;
    cell.inRow3 = false;
    cell.inRow4 = false;
    cell.inRow5 = false;

    this.removalsPending--;

    const remainingRemovable = this.getRemovableOpponentPieces(this.currentPlayer);

    if (this.removalsPending > 0 && remainingRemovable.length > 0) {
      this.statusMessage = `Piece removed! Player ${this.currentPlayer} can select ${this.removalsPending} more piece(s) to remove.`;
      return { success: true, state: 'REMOVAL' };
    } else {
      if (this.removalsPending > 0) {
        this.statusMessage = `Piece removed! No more removable opponent pieces remaining.`;
      } else {
        this.statusMessage = `Removal complete.`;
      }
      this.removalsPending = 0;
      this.gameState = 'PLAYING';
      this.switchTurn();
      return { success: true, state: 'PLAYING' };
    }
  }

  switchTurn() {
    this.currentPlayer = this.getOpponent(this.currentPlayer);
    const player = this.currentPlayer;
    if (!this.players[player].firstMoveMade) {
      this.statusMessage = `Player ${player}'s turn to place initial piece in the center ${this.centerSize}x${this.centerSize} area.`;
    } else {
      this.statusMessage = `Player ${player}'s turn to place a piece.`;
    }
  }

  /**
   * Checks horizontal, vertical, and diagonal lines passing through (r, c).
   * Marks new rows and updates player scores.
   * Returns the number of NEW rows of 3 created.
   */
  checkAndMarkLines(r, c, player) {
    const directions = [
      { dr: 0, dc: 1 },  // Horizontal
      { dr: 1, dc: 0 },  // Vertical
      { dr: 1, dc: 1 },  // Diagonal \
      { dr: 1, dc: -1 }  // Anti-Diagonal /
    ];

    let newRowsOf3 = 0;

    for (const { dr, dc } of directions) {
      // Find full contiguous line of `player` pieces passing through (r, c)
      const lineCells = [{ r, c }];

      // Positive direction
      let step = 1;
      while (true) {
        const nr = r + dr * step;
        const nc = c + dc * step;
        if (
          nr >= 0 && nr < this.boardSize &&
          nc >= 0 && nc < this.boardSize &&
          this.board[nr][nc].player === player
        ) {
          lineCells.push({ r: nr, c: nc });
          step++;
        } else {
          break;
        }
      }

      // Negative direction
      step = 1;
      while (true) {
        const nr = r - dr * step;
        const nc = c - dc * step;
        if (
          nr >= 0 && nr < this.boardSize &&
          nc >= 0 && nc < this.boardSize &&
          this.board[nr][nc].player === player
        ) {
          lineCells.push({ r: nr, c: nc });
          step++;
        } else {
          break;
        }
      }

      const len = lineCells.length;

      // Longest variant evaluation
      if (len === 3) {
        const unflagged = lineCells.some(cell => !this.board[cell.r][cell.c].inRow3);
        if (unflagged) {
          for (const cell of lineCells) {
            this.board[cell.r][cell.c].inRow3 = true;
          }
          this.players[player].rowsOf3++;
          newRowsOf3++;
        }
      } else if (len === 4) {
        const unflagged = lineCells.some(cell => !this.board[cell.r][cell.c].inRow4);
        if (unflagged) {
          for (const cell of lineCells) {
            this.board[cell.r][cell.c].inRow3 = true;
            this.board[cell.r][cell.c].inRow4 = true;
          }
          this.players[player].rowsOf4++;
        }
      } else if (len >= 5) {
        const unflagged = lineCells.some(cell => !this.board[cell.r][cell.c].inRow5);
        if (unflagged) {
          for (const cell of lineCells) {
            this.board[cell.r][cell.c].inRow3 = true;
            this.board[cell.r][cell.c].inRow4 = true;
            this.board[cell.r][cell.c].inRow5 = true;
          }
          this.players[player].rowsOf5++;
        }
      }
    }

    return newRowsOf3;
  }

  checkWinCondition(player) {
    const p = this.players[player];
    return p.rowsOf4 >= 3 || p.rowsOf5 >= 1;
  }
}

// Support Node.js export for automated tests and browser window global
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TicTacToeVariant;
}
