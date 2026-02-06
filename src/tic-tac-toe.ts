export type Player = "X" | "O";

export type Cell = Player | null;

// Board is a 3x3 grid, represented as a 9-element array.
// Indices map to positions:
//  0 | 1 | 2
//  ---------
//  3 | 4 | 5
//  ---------
//  6 | 7 | 8

export type Board = [Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell];

export type GameState = {
  id: string;
  board: Board;
  currentPlayer: Player;
};

const WINNING_LINES: [number, number, number][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]

export function createGame(id: string): GameState {
  return {
    id: id, //or shorthand: id,
    board: [null, null, null, null, null, null, null, null, null],
    currentPlayer: "X",
  };
}

export function makeMove(state: GameState, position: number): GameState {
  // check if game is already won - once getWinner function was complete, it worked
  if (getWinner(state)) {
    throw new Error("Game is already over")
  }
  
  // position parameter validation 
  if (!Number.isInteger(position)) {
    throw new Error("Position must be an integer")
  }

  if (position < 0 || position > 8) {
    throw new Error("Position must be between 0 and 8")
  }

  // position occupancy check 
  if (state.board[position] !== null) {
    throw new Error("Position is already occupied")
  }

  // place the move on the board without mutating state
  const nextBoard: Board = [...state.board]
  nextBoard[position] = state.currentPlayer
  
  // define nextState and switch the player
  const nextState: GameState = {
    id: state.id,
    board: nextBoard,
    currentPlayer: state.currentPlayer === "X" ? "O" : "X",
  }

  return nextState
}

export function getWinner(state: GameState): Player | null {
  for (const [a, b, c] of WINNING_LINES) {
    const cell = state.board[a];
    if (cell && cell === state.board[b] && cell === state.board[c]) {
      return cell;
    }
  }

  return null;
}
