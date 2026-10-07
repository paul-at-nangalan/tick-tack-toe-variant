const assert = require('assert');
const TicTacToeVariant = require('../js/game.js');

function runTests() {
  console.log("Running TicTacToeVariant core logic tests...");

  // Test 1: Board initialization & Center bounds
  const game = new TicTacToeVariant(16, 9);
  assert.strictEqual(game.centerStart, 3);
  assert.strictEqual(game.centerEnd, 11);
  assert.strictEqual(game.isInCenter(3, 3), true);
  assert.strictEqual(game.isInCenter(11, 11), true);
  assert.strictEqual(game.isInCenter(2, 3), false);

  // Test 2: First move restriction for both players
  const validXFirst = game.getValidMoves('X');
  assert.strictEqual(validXFirst[3][3], true);
  assert.strictEqual(validXFirst[0][0], false);

  // Player X places in center (5, 5)
  const res1 = game.placePiece(5, 5);
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
  // (5, 5) is X's piece. (5, 7) has dr=0, dc=2 -> valid
  assert.strictEqual(validXSecond[5][7], true);
  // (5, 8) has dr=0, dc=3 -> invalid
  assert.strictEqual(validXSecond[5][8], false);

  // Test 4: Row of 3 and Removal Phase
  game.resetGame();
  // X: (5,5), O: (3,3), X: (5,6), O: (3,4)
  game.placePiece(5, 5); // X
  game.placePiece(3, 3); // O
  game.placePiece(5, 6); // X
  game.placePiece(3, 4); // O

  // Now X places (5, 7) -> forms row of 3 for X at (5,5), (5,6), (5,7)
  const res3 = game.placePiece(5, 7);
  assert.strictEqual(res3.state, 'REMOVAL');
  assert.strictEqual(game.players['X'].rowsOf3, 1);

  // Check removable opponent pieces: O pieces at (3,3) and (3,4) are not in any row -> removable
  const removable = game.getRemovableOpponentPieces('X');
  assert.strictEqual(removable.length, 2);

  // Try removing (3,3)
  const resRem = game.removePiece(3, 3);
  assert.strictEqual(resRem.success, true);
  assert.strictEqual(game.board[3][3].player, null);
  assert.strictEqual(game.currentPlayer, 'O');

  // Test 5: Pieces in row of 3 cannot be removed
  game.resetGame();
  // Set up O to have a row of 3
  game.placePiece(5, 5); // X
  game.placePiece(3, 3); // O
  game.placePiece(7, 7); // X
  game.placePiece(3, 4); // O
  game.placePiece(8, 8); // X
  const oRow3Res = game.placePiece(3, 5); // O -> O forms row of 3 at (3,3),(3,4),(3,5)
  assert.strictEqual(oRow3Res.state, 'REMOVAL');

  // O removes X piece at (8,8)
  const oRemRes = game.removePiece(8, 8);
  assert.strictEqual(oRemRes.success, true);
  assert.strictEqual(game.currentPlayer, 'X');

  // Now X places pieces to form row of 3 for X at (5,5),(5,6),(5,7)
  game.placePiece(5, 6); // X
  game.placePiece(2, 2); // O places piece at (2,2)
  const xRow3Res = game.placePiece(5, 7); // X forms row of 3
  assert.strictEqual(xRow3Res.state, 'REMOVAL');

  // Attempting to remove O's piece at (3,3) should fail because it's part of O's row of 3
  const failRemove = game.removePiece(3, 3);
  assert.strictEqual(failRemove.success, false);
  assert.strictEqual(failRemove.message.includes('cannot remove') || failRemove.message.includes('Cannot remove'), true);

  // X removes O's piece at (2,2) which is NOT in a row of 3
  const validRemove = game.removePiece(2, 2);
  assert.strictEqual(validRemove.success, true);

  // Test 6: Win condition - 1 row of 5
  game.resetGame();
  game.placePiece(5, 5); // X
  game.placePiece(3, 3); // O
  game.placePiece(5, 6); // X
  game.placePiece(3, 4); // O

  // X forms row of 3 at (5,7)
  game.placePiece(5, 7); // X
  if (game.gameState === 'REMOVAL') {
    game.removePiece(3, 3); // X removes O's piece at (3,3)
  }

  game.placePiece(3, 5); // O
  game.placePiece(5, 8); // X forms row of 4 at (5,8)
  game.placePiece(3, 6); // O
  const winRes = game.placePiece(5, 9); // X forms row of 5 at (5,9)!
  assert.strictEqual(winRes.winner, 'X');
  assert.strictEqual(game.gameState, 'GAME_OVER');

  console.log("All tests passed successfully!");
}

runTests();
