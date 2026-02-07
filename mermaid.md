```mermaid
flowchart TB
  B["Browser<br/>(platform runtime)"] -->|"HTTP Story #1<br/>GET / + GET /assets/*<br/>HTML/CSS/JS"| SV
  B -->|"HTTP Story #2<br/>fetch JSON to /api/*"| C

  C["React Client (App.tsx)<br/>Lobby + Game views<br/>state: gameList, gameState<br/>polling w/ useRef"] -->|"JSON over HTTP"| SV

  subgraph SV["Server (Express + ViteExpress)"]
    FD["Frontend delivery<br/>Dev: Vite middleware<br/>Prod: express.static('dist')"]
    API["API routes<br/>GET /api/games<br/>POST /api/create<br/>POST /api/move"]
    FD --- API
    API -->|"function calls"| ST
    API -->|"function calls"| ENG
  end

  subgraph ST["Storage"]
    MAP["games: Map&lt;id, GameState&gt;<br/>(in-memory; wiped on restart)"]
  end

  subgraph ENG["Game Engine (pure logic)"]
    CG["createGame(id)"]
    MM["makeMove(state, position)"]
    GW["getWinner(state)<br/>(derived; not stored)"]
  end