```mermaid
flowchart TB
  B[Browser] -->|HTTP Story 1: load files| SV
  B -->|HTTP Story 2: fetch JSON| C

  C[React Client App] -->|JSON over HTTP| SV

  subgraph SV[Server]
    FD[Frontend delivery]
    API[API routes]
    FD --- API
    API --> ST
    API --> ENG
  end

  subgraph ST[Storage]
    MAP[games Map id to GameState]
  end

  subgraph ENG[Game Engine]
    CG[createGame]
    MM[makeMove]
    GW[getWinner]
  end
```

Legend:
- HTTP Story 1 = Browser loads HTML/CSS/JS (Vite in dev, dist in prod)
- HTTP Story 2 = Client fetches JSON from /api/*
- API routes:
  - GET /api/games
  - POST /api/create
  - POST /api/move
- Storage is in-memory Map (wiped on restart)
- Winner is derived via getWinner, not stored