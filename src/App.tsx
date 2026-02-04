import { useState } from "react";
import { createGame, makeMove, getWinner } from "./tic-tac-toe";

function App() {
  let [gameState, setGameState] = useState(getInitialGame())

  // TODO: display the gameState, and call `makeMove` when a player clicks a button
  return  (
    <>
      <table>
        <tr>
          <td onClick={() => setGameState(makeMove(gameState, 0))}>{gameState.board[0] || "_"}</td>
          <td onClick={() => setGameState(makeMove(gameState, 1))}>{gameState.board[1] || "_"}</td>
          <td onClick={() => setGameState(makeMove(gameState, 2))}>{gameState.board[2] || "_"}</td>
        </tr>
        <tr>
          <td onClick={() => setGameState(makeMove(gameState, 3))}>{gameState.board[3] || "_"}</td>
          <td onClick={() => setGameState(makeMove(gameState, 4))}>{gameState.board[4] || "_"}</td>
          <td onClick={() => setGameState(makeMove(gameState, 5))}>{gameState.board[5] || "_"}</td> 
        </tr>
         <tr>
         <td onClick={() => setGameState(makeMove(gameState, 6))}>{gameState.board[6] || "_"}</td>
         <td onClick={() => setGameState(makeMove(gameState, 7))}>{gameState.board[7] || "_"}</td>
         <td onClick={() => setGameState(makeMove(gameState, 8))}>{gameState.board[8] || "_"}</td>
         </tr>
      </table>
      <div>Current player: {gameState.currentPlayer}</div>
      {getWinner(gameState) &&
        <div>Winner: {getWinner(gameState)} </div>
      }
    </>
  )
  
}

function getInitialGame() {
  let initialGameState = createGame()
  // initialGameState = makeMove(initialGameState, 3)
  // initialGameState = makeMove(initialGameState, 0)
  return initialGameState
}

export default App;
