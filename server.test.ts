import { beforeEach, describe, expect, it } from "vitest"
import request from "supertest"
import { app, resetGamesforTest } from "./server.ts"
// import { GameState } from "./src/tic-tac-toe.ts" // don't need to use it if prefer in-line Type annotation for the map callback parameter

beforeEach(()=>{
    resetGamesforTest()
})

// ---------------------------------------------------------------------------
// create new game
// ---------------------------------------------------------------------------
describe("createGame", () => {
    it("creates a brand new game", async () => {
        const response = await request(app).post("/api/create").send()
        expect(response.status).toBe(201)
        expect(response.body.id).toBeDefined()
        // expect(response.body.currentPlayer).toBe("X") // not needed due to repeating game logic tests from TTT test
        // expect(response.body.board).toEqual([null, null, null, null, null, null, null, null, null]) // not needed due to repeating game logic tests from TTT test
    })
    
    it("returns different id", async () => {
        const a = await request(app).post("/api/create").send()
        const b = await request(app).post("/api/create").send()
        expect(a.body.id).not.toBe(b.body.id)
    })
})


// ---------------------------------------------------------------------------
// get game list
// ---------------------------------------------------------------------------
describe("getGameList", () => {
    it("returns single game from list", async () => {
        const created = await request(app).post("/api/create").send()
        const response = await request(app).get("/api/games") // don't need send on a GET request
        expect(response.status).toBe(200)
        expect(response.body.length).toBe(1)
        expect(response.body[0].id).toBe(created.body.id)
    })
    it("returns multiple games", async () => {
        const a = await request(app).post("/api/create").send()
        const b = await request(app).post("/api/create").send()
        const response = await request(app).get("/api/games")

        const ids = response.body.map(function(game: {id: string}){
            return game.id
        })

        expect(ids).toContain(a.body.id)
        expect(ids).toContain(b.body.id)

        // same thing below, just importing GameState - treat response.body as an array of GameState, then map their ids
        // const ids = (response.body as GameState[]).map(function(game){
        //     return game.id
        // })
    })
})


// ---------------------------------------------------------------------------
// make move
// ---------------------------------------------------------------------------


// SAVE FOR AFTER GAME LIST AND MAKE MOVE ARE DONE
// ---------------------------------------------------------------------------
// reset same game - 
// ---------------------------------------------------------------------------
// describe("resetGame", () => {
//     it("resets the same game")
// })


// from TTT test file
// describe("createGame", () => {
//   it("returns an empty board", () => {
//     const game = createGame();
//     expect(game.board).toEqual([null, null, null, null, null, null, null, null, null]);
//   });

//   it("starts with X as the current player", () => {
//     const game = createGame();
//     expect(game.currentPlayer).toBe("X");
//   });
// });