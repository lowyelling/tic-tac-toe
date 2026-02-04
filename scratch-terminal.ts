import readline from "node:readline";
import { createGame, getWinner, makeMove } from "./src/tic-tac-toe.ts";
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
let state = createGame();
const renderBoard = () => {
  const cells = state.board.map((cell) => cell ?? " ");
  console.log(`\n ${cells[0]} | ${cells[1]} | ${cells[2]}`);
  console.log("---+---+---");
  console.log(` ${cells[3]} | ${cells[4]} | ${cells[5]}`);
  console.log("---+---+---");
  console.log(` ${cells[6]} | ${cells[7]} | ${cells[8]}\n`);
};
const ask = () => {
  renderBoard();
  rl.question("Enter move (0-8): ", (answer) => {
    const position = Number(answer.trim());
    try {
      state = makeMove(state, position);
      console.log("move ok:", position);
      const winner = getWinner(state);
      if (winner) {
        console.log("winner:", winner);
        rl.close();
        return;
      }
      const isDraw = state.board.every((cell) => cell !== null);
      if (isDraw) {
        console.log("draw!");
        rl.close();
        return;
      }
    } catch (error) {
      console.log("error:", (error as Error).message);
    }
    ask();
  });
};
ask();