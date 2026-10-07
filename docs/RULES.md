# Tic-Tac-Toe Variant Game Rules

## Overview
This game is a strategic grid-based Tic-Tac-Toe variant played on a configurable board. Players alternate turns placing their marks (`X` for Player 1, `O` for Player 2), expanding their territory, and attempting to form scoring rows while removing enemy pieces.

---

## 1. Board Setup
- **Board Dimensions**: Default is a **16x16 grid** (easily configurable in code).
- **Center Region**: The middle **3x3 square** is highlighted on the board UI (configurable via `centerSize`).
  - For a 16x16 grid with a 3x3 center, this spans rows 6 to 8 and columns 6 to 8 (0-indexed).

---

## 2. Placement Rules
- **Player 1 (`X`) goes first**, followed by **Player 2 (`O`)**.
- **First Move Constraint**:
  - Both Player 1 and Player 2 **must** place their initial piece inside the central 3x3 square.
- **Subsequent Move Constraint**:
  - After their first move, each player must place new pieces within a distance of $\le 2$ squares (Chebyshev distance, including horizontal, vertical, and diagonal directions) of any of their own existing pieces on the board.
  - This means there can be **at most 1 empty square** between the new piece and an existing piece belonging to the active player.

---

## 3. Line & Row Detection Rules
- Lines are checked in **4 directions**:
  1. Horizontal
  2. Vertical
  3. Diagonal (Top-Left to Bottom-Right)
  4. Anti-Diagonal (Bottom-Left to Top-Right)
- **Longest Variant Rule**:
  - When a piece is placed, contiguous lines of pieces are evaluated. Only the longest line length created or extended by the move applies for that line segment.
  - For example, a contiguous line of 4 pieces counts strictly as a row of 4 (it does not count as both a row of 3 and a row of 4). A line of 5 pieces counts strictly as a row of 5.
- **Multi-Row Formations**:
  - A single placed piece can simultaneously form multiple distinct rows across different directions (e.g. an intersection of horizontal and vertical lines). All newly formed rows are counted.
- **Tracking & Double Counting**:
  - Board positions track whether they are part of tracked rows so that identical line segments are not double counted.

---

## 4. Piece Removal Mechanics
- **Trigger**: When a player forms one or more new **rows of 3**, they enter a Removal Phase.
- **Multi-Removal**:
  - If a single move creates $K$ new rows of 3, the player can remove up to $K$ opponent pieces (1 piece per newly formed row of 3).
- **Removal Restrictions**:
  - A piece belonging to the opponent **CANNOT** be removed if it is currently part of any completed row of 3, row of 4, or row of 5.
- **Automatic Skip**:
  - If the opponent has no removable pieces on the board (or no pieces at all), the removal phase is automatically skipped with an informational message.

---

## 5. Win Conditions
A player instantly wins the game upon achieving either:
1. **3 Rows of 4**
2. **1 Row of 5**

---

## 6. Recommended Data Structures
- **Board Representation**: A 2D array of size $N \times N$, where each cell contains:
  ```json
  {
    "player": "X" | "O" | null,
    "inRow3": boolean,
    "inRow4": boolean,
    "inRow5": boolean
  }
  ```
- **Player State**:
  ```json
  {
    "player": "X" | "O",
    "firstMoveMade": boolean,
    "rowsOf3Count": number,
    "rowsOf4Count": number,
    "rowsOf5Count": number
  }
  ```
- **Valid Move Array**: A 2D boolean array of size $N \times N$ computed for the active player showing all valid empty target cells.
