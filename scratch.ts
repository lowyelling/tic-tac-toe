import { createGame, getWinner, makeMove } from "./src/tic-tac-toe.ts";

let state = createGame();
console.log("start:", state);

state = makeMove(state, 0); // X
state = makeMove(state, 4); // O
state = makeMove(state, 1); // X
state = makeMove(state, 3); // O
state = makeMove(state, 2); // X wins

console.log("final:", state);
console.log("winner:", getWinner(state));
