import { useState, useEffect } from "react";
import { type GameState, getWinner } from "./tic-tac-toe";
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
  const [gameList, setGameList] = useState<GameState[]>([])
  const [gameState, setGameState] = useState<GameState | null>(null)
  // console.log('gameList:', gameList)

  useEffect(() => {
     fetch('http://localhost:3000/api/games', {
      method: 'GET'})
      .then(response => response.json())
      .then(data => setGameList(data)) 
      .catch(error => console.error('Error:', error))
  },[])

   function handleNewGame(){
    fetch('http://localhost:3000/api/create', {
      method: 'POST'})
      // .then(response => {console.log('response:', response); return response.json()})
      .then(response => (
        console.log('response:', response), // a bit unusual format, but works
        response.json()
      ))
      .then(data => (
        console.log('data:', data),
        setGameState(data),
        setGameList([...gameList, data])
        )) 
      .catch(error => console.error('Error:', error))
  }

  function handleCellClick(index: number){
     //setGameState(makeMove(gameState, index))
     fetch('http://localhost:3000/api/move', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ id: gameState?.id, position: index })
    })
      .then(response => response.json())
      .then(data => setGameState(data)) 
      .catch(error => console.error('Error:', error))
     // console.log('gameState:', gameState) // async - new value not immediately available
  }

  function Cell( {cell, index}: { cell: string | null, index: number} ) {
    return (
      <div style={cellStyle} onClick={() => handleCellClick(index)}>
        {cell || " "}
      </div>
    )
  }

  return  (
    <>
    { gameState ? (
      // GameView - gameState exists
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
            (<div>Winner: {getWinner(gameState)}</div>) 
          : 
            (<div>Current player: {gameState.currentPlayer}</div>)
          }
        </div>

        <button onClick={()=> handleNewGame()}>Start new game</button>
        <br />
        <br />
        <button onClick={()=> setGameState(null)}>Back to lobby</button>
        </>
    ) : (
      // LobbyView - gameState is null
      <>
        <h1>Lobby</h1> 
        { gameList.length === 0 ? (
          // No games - show start game text
          <>
            <p>No existing games!</p>
            <p>Start a new game :)</p>
          </>
        ) : (
          // There are games, so show buttons with the games
          <>
            <h3>Game List</h3>
            <div>
              {gameList.map(function(game, index){
                return (
                  <div 
                    key={game.id} 
                    onClick={()=> setGameState(game)}
                  >
                    <p>Game {index+1}</p>
                  </div>
                )
                })
              }
            </div>
          </>
        )}
        <button onClick={()=> handleNewGame()}>Start new game</button>
      </>
      )}
    </>
  )

}

export default App;
