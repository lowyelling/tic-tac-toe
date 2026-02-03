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
  board: Board;
  currentPlayer: Player;
};

export function createGame(): GameState {
  return {
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
    board: nextBoard,
    currentPlayer: state.currentPlayer === "X" ? "O" : "X",
  }

  return nextState
}

export function getWinner(state: GameState): Player | null {

  // empty board - copied every function test case logic 
  if (state.board.every(cell => cell === null)) {
    return null
  }

  // All winning combinations - this is inefficient - can fix later
  // "detects winning with the top row"

  if (state.board[0] && state.board[0] === state.board[1] && state.board[1] === state.board[2]) {
    return state.board[0]
  }

  // "detects winning with the middle row"

  if (state.board[3] && state.board[3] === state.board[4] && state.board[4] === state.board[5]) {
    return state.board[3]
  }

  // "detects winning with the bottom row"
  if (state.board[6] && state.board[6] === state.board[7] && state.board[7] === state.board[8]) {
    return state.board[6]
  }
  // "detects winning with the left column"
  if (state.board[0] && state.board[0] === state.board[3] && state.board[3] === state.board[6]) {
    return state.board[0]
  }

  // "detects winning with the middle column"
  if (state.board[1] && state.board[1] === state.board[4] && state.board[4] === state.board[7]) {
    return state.board[1]
  }
  // "detects winning with the right column"
  if (state.board[2] && state.board[2] === state.board[5] && state.board[5] === state.board[8]) {
    return state.board[2]
  }
  // "detects winning with the 0-4-8 diagonal"
  if (state.board[0] && state.board[0] === state.board[4] && state.board[4] === state.board[8]) {
    return state.board[0]
  }
  // "detects winning with the 2-4-6 diagonal"
  if (state.board[2] && state.board[2] === state.board[4] && state.board[4] === state.board[6]) {
    return state.board[2]
  }

  // I thought I needed these checks, but they are redundant after checking the empty board and each winning combo.
  // If game is in progress aka no empty board, and there is no winning match, then we return null aka nobody won


  // // no one has won yet

  // // draw + full board
  // if (state.board.every(cell => cell !== null)) {
  //   return null
  // }

    return null
}
