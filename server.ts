import express from "express";
import ViteExpress from "vite-express";
import { createGame, makeMove, getWinner } from "./src/tic-tac-toe";
import { randomUUID } from "crypto"

export const app = express();
const PORT = 3000;

app.use(express.json())

const games = new Map<string, ReturnType<typeof createGame>>()
// without Typescript, would be new Map<string, game>()

export function resetGamesforTest(){
    games.clear()
}

function createGameInGames(){
    let id = randomUUID()
    // need a loop to quickly check we haven't repeated an id, but can add later
    const game = createGame(id)
    games.set(id, game)
    return game
}

// let game = createGame() // make game upon initialization

function createGameHandler(request: express.Request, response: express.Response){
    const game = createGameInGames()
    response.status(201).json(game)
}

function moveHandler(request: express.Request, response: express.Response){
    const { id, position } = request.body ?? {}
    const game = games.get(id)
    if (!game){
        response.status(404).json({"error": "Game not found"})
        return
    }
    const nextGame = makeMove(game, position)
    games.set(id, game)
    response.json(nextGame)
}

// Create new game
app.post('/api/create', createGameHandler)


// Get games from server 
app.get("/api/games", (request, response) => {
   response.json(Array.from(games.values()))
})


// // Post move to server  
app.post("/api/move", moveHandler)

// // Reset game - to be rewritten!! need to separate game creation from game reset
// app.post('/api/game/reset', (request, response) => {
//   game = createGame()
//   response.json(game)
// })

if (process.env.NODE_ENV !== "test"){
    ViteExpress.listen(app, PORT, () => 
        console.log(`Server is listening on port ${PORT}`))
}
