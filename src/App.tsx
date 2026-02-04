import { useState } from "react";
import { createGame, makeMove, getWinner } from "./tic-tac-toe";
import "./App.css"; 

const boardStyle = {
  display: "flex",
  flexWrap: "wrap",
  width: "300px",
  border: "1px solid black"
} as const;

const cellStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100px",
  boxSizing: "border-box",
  border: "1px solid black",
  width: "33.33%",
  textAlign: "center"
} as const;

function App() {
  let [gameState, setGameState] = useState(getInitialGame())

  function Cell( {cell, index}: { cell: string | null, index: number} ) {
    return (
      <div style={cellStyle} onClick={() => setGameState(makeMove(gameState, index))}>{cell || "_"}</div>
    )
  }

  return  (
  <>
  <h1>Tic Tac Toe</h1>
  <div style={boardStyle}>
    {gameState.board.map((cell, index) => (
      <Cell 
        key={index}
        cell={cell}
        index={index}
      /> 
    ))}
    </div>
    
    <div> 
      {getWinner(gameState) ? 
      (<div>Winner: {getWinner(gameState)}</div>) : (<div>Current player: {gameState.currentPlayer}</div>)
      }
    </div>

    <button onClick={()=> setGameState(createGame())}>Start new game</button>

    {/* <div>Current player: {gameState.currentPlayer}</div>
    <div> 
      {getWinner(gameState) &&
        <div>Winner: {getWinner(gameState)}</div>
      }
    </div> */}
    </>
  )

function getInitialGame() {
  let initialGameState = createGame()
  return initialGameState
}
}

export default App;
