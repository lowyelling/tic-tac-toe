import { useState, useEffect, useRef } from "react";
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

const gameListStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(3,100px)",
  justifyContent: "center",
  alignItems: "center",
  gap: "5px",
  width: "fit-content",
  margin: "20px auto",
  maxWidth: "330px"
} as const

const gameItemStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  border: "1px solid black",
  height: "100px",
  width: "100px",
  boxSizing: "border-box",
  curser: "pointer"
} as const 

function App() {
  const [gameList, setGameList] = useState<GameState[]>([])
  const [gameState, setGameState] = useState<GameState | null>(null)
  const gameStateRef = useRef(gameState) // the box is created once
  gameStateRef.current = gameState // gameState is always up-to-date, no re-render trigger
  // freely write to the box


  // Lobby polling - get game list
  function fetchGameList(){
    fetch('api/games', {
      method: 'GET'})
      .then(response => response.json())
      .then(data => (
        console.log("hi I'm polling gameList"),
        setGameList(data)))
      .catch(error => console.error('Error:', error))
  }

  useEffect( () => {
    if (gameState) return // in game, skip lobby polling
      fetchGameList()
      const interval = setInterval(fetchGameList, 1000) // return every second
      return ()=> clearInterval(interval)
    }
  , [gameState?.id]) // poll lobby only when not in a game

  // Gameview polling - get moves 

  function fetchMoves(){
    fetch('api/games', {method: 'GET'})
      .then(response => (
          response.json())
        )
      .then((data: GameState[]) => {
        const id = gameStateRef.current?.id
        if (!id) return
        console.log("hi I'm polling moves")
        const currentGame = data.find(game => game.id === id) // interval reads latest gameState without useEffect needing to know about it!
        setGameState(currentGame ?? null)
     })
      .catch(error => console.error('Error:', error))
  }

   useEffect( () => {
    if (!gameState) return // not in game, skip
    const interval = setInterval(
        () => fetchMoves(),
        1000 // return every second
      )
    return ()=> clearInterval(interval)
    }
  , [gameState?.id]) // removed gameState as second parameter/dependency array for useEffect...double bind here
  // interval needs gameState to prevent stale closures
  // but with gameState included, the effect restarts every time it changes


   function handleNewGame(){
    fetch('api/create', {
      method: 'POST'})
      .then(response => (
        response.json()
      ))
      .then(data => (
        setGameState(data),
        setGameList([...gameList, data])
        )) 
      .catch(error => console.error('Error:', error))
  }

  function handleCellClick(index: number){
     fetch('api/move', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ id: gameState?.id, position: index })
    })
      .then(response => response.json())
      .then(data => setGameState(data)) 
      .catch(error => console.error('Error:', error))
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
        <button onClick={()=> {setGameState(null), fetchGameList()}}>Back to lobby</button>
        </>
    ) : (
      // LobbyView - gameState is null
      <>
        <h1>Tic Tac Toe Lobby</h1> 
        { gameList.length === 0 ? (
          // No games - show start game text
          <>
            <p>No existing games!</p>
            <p>Start a new game :)</p>
          </>
        ) : (
          // Games exist - show list of games
          <>
            <div style={gameListStyle}>
              {gameList.map(function(game, index){
                return (
                  <div 
                    key={game.id} 
                    onClick={()=> setGameState(game)}
                    style={gameItemStyle}
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
