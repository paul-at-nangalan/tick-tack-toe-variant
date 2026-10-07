const assert = require('assert');
const TicTacToeVariant = require('../js/game.js');

function runTests() {
  console.log("Running TicTacToeVariant core logic tests...");

  // Test 1: Board initialization & Center bounds
  const game = new TicTacToeVariant(16, 3);
  assert.strictEqual(game.centerStart, 6);
  assert.strictEqual(game.centerEnd, 8);
  assert.strictEqual(game.isInCenter(6, 6), true);
  assert.strictEqual(game.isInCenter(8, 8), true);
  assert.strictEqual(game.isInCenter(5, 6), false);

  // Test 2: First move restriction for both players
  const validXFirst = game.getValidMoves('X');
  assert.strictEqual(validXFirst[6][6], true);
  assert.strictEqual(validXFirst[0][0], false);

  // Player X places in center (7, 7)
  const res1 = game.placePiece(7, 7);
  assert.strictEqual(res1.success, true);
  assert.strictEqual(game.currentPlayer, 'O');

  // Player O must place in center (6, 6)
  const validOFirst = game.getValidMoves('O');
  assert.strictEqual(validOFirst[6][6], true);
  assert.strictEqual(validOFirst[0][0], false);

  const res2 = game.placePiece(6, 6);
  assert.strictEqual(res2.success, true);
  assert.strictEqual(game.currentPlayer, 'X');

  // Test 3: Second move distance <= 2 requirement for X
  const validXSecond = game.getValidMoves('X');
  // (7, 7) is X's piece. (7, 9) has dr=0, dc=2 -> valid
  assert.strictEqual(validXSecond[7][9], true);
  // (7, 10) has dr=0, dc=3 -> invalid
  assert.strictEqual(validXSecond[7][10], false);

  // Test 4: Row of 3 and Removal Phase
  game.resetGame();
  // Center is (6..8, 6..8).
  // X: (7,5) - wait, initial move must be in center (6..8, 6..8)
  // X: (7,7), O: (6,6), X: (7,8), O: (6,7)
  game.placePiece(7, 7); // X in center
  game.placePiece(6, 6); // O in center
  game.placePiece(7, 8); // X
  game.placePiece(6, 7); // O

  // Now X places (7, 9) -> forms row of 3 for X at (7,7), (7,8), (7,9)
  const res3 = game.placePiece(7, 9);
  assert.strictEqual(res3.state, 'REMOVAL');
  assert.strictEqual(game.players['X'].rowsOf3, 1);

  // Check removable opponent pieces: O pieces at (6,6) and (6,7) are not in any row -> removable
  const removable = game.getRemovableOpponentPieces('X');
  assert.strictEqual(removable.length, 2);

  // Try removing (6,6)
  const resRem = game.removePiece(6, 6);
  assert.strictEqual(resRem.success, true);
  assert.strictEqual(game.board[6][6].player, null);
  assert.strictEqual(game.currentPlayer, 'O');

  // Test 5: Pieces in row of 3 cannot be removed
  game.resetGame();
  // Set up O to have a row of 3
  game.placePiece(7, 7); // X in center
  game.placePiece(6, 6); // O in center
  game.placePiece(9, 9); // X
  game.placePiece(6, 7); // O
  game.placePiece(10, 10); // X
  const oRow3Res = game.placePiece(6, 8); // O -> O forms row of 3 at (6,6),(6,7),(6,8)
  assert.strictEqual(oRow3Res.state, 'REMOVAL');

  // O removes X piece at (10,10)
  const oRemRes = game.removePiece(10, 10);
  assert.strictEqual(oRemRes.success, true);
  assert.strictEqual(game.currentPlayer, 'X');

  // Now X places pieces to form row of 3 for X at (7,7),(7,8),(7,9)
  game.placePiece(7, 8); // X
  game.placePiece(4, 4); // O places piece at (4,4)
  const xRow3Res = game.placePiece(7, 9); // X forms row of 3
  assert.strictEqual(xRow3Res.state, 'REMOVAL');

  // Attempting to remove O's piece at (6,6) should fail because it's part of O's row of 3
  const failRemove = game.removePiece(6, 6);
  assert.strictEqual(failRemove.success, false);
  assert.strictEqual(failRemove.message.includes('cannot remove') || failRemove.message.includes('Cannot remove'), true);

  // X removes O's piece at (4,4) which is NOT in a row of 3
  const validRemove = game.removePiece(4, 4);
  assert.strictEqual(validRemove.success, true);

  // Test 6: Win condition - 1 row of 5
  game.resetGame();
  game.placePiece(7, 7); // X in center
  game.placePiece(6, 6); // O in center
  game.placePiece(7, 8); // X
  game.placePiece(6, 7); // O

  // X forms row of 3 at (7,9)
  game.placePiece(7, 9); // X
  if (game.gameState === 'REMOVAL') {
    game.removePiece(6, 6); // X removes O's piece at (6,6)
  }

  game.placePiece(6, 8); // O
  game.placePiece(7, 10); // X forms row of 4 at (7,10)
  game.placePiece(6, 9); // O
  const winRes = game.placePiece(7, 11); // X forms row of 5 at (7,11)!
  assert.strictEqual(winRes.winner, 'X');
  assert.strictEqual(game.gameState, 'GAME_OVER');

  console.log("All tests passed successfully!");
}

runTests();
