# fetchMoves Stale Closure: Three Approaches

## Diagram 1: No useRef — Stale Closure Bug

The effect runs when `gameState?.id` becomes `"abc"`. Inside `fetchMoves`, `gameState` is captured from that render. But `fetchMoves` is defined in component scope and closes over the `gameState` from the render when the effect ran — it's stale on subsequent ticks.

```mermaid
sequenceDiagram
    participant R as React render
    participant E as useEffect
    participant I as setInterval
    participant F as fetchMoves()
    participant S as Server

    Note over R: Render #1: gameState = {id:"abc", board:[null x 9]}
    R->>E: gameState?.id changed (-> "abc"), run effect
    Note over E: closure captures gameState<br/>from Render #1

    E->>I: create interval

    Note over I: 1s tick
    I->>F: call fetchMoves()
    Note over F: gameState.id is "abc" (correct!)
    F->>S: GET /api/games
    S-->>F: [{id:"abc", board:["X", null x 8]}]
    F->>R: setGameState({id:"abc", board:["X",...]})

    Note over R: Render #2: gameState = {id:"abc", board:["X",...]}
    Note over R: gameState?.id still "abc"<br/>effect does NOT re-run<br/>interval keeps old closure

    Note over I: 1s tick
    I->>F: call fetchMoves()
    Note over F: gameState is STALE<br/>still sees Render #1's value:<br/>{id:"abc", board:[null x 9]}
    F->>S: GET /api/games
    S-->>F: [{id:"abc", board:["X","O", null x 7]}]
    Note over F: finds game by stale gameState.id<br/>(works by luck — id hasn't changed)<br/>but any logic using gameState.board<br/>would see the WRONG board

    Note over I,S: stale closure persists for lifetime of interval
```

**The bug**: `fetchMoves` closes over `gameState` from the render when the effect created the interval. On subsequent ticks, `gameState` inside the closure is frozen at that old value. It happens to work for `id` (which doesn't change), but the closure is fundamentally stale.

---

## Diagram 2: useRef — Escape the Closure

`gameStateRef.current` is mutated on every render, so the interval callback always reads the latest value regardless of when it was created.

```mermaid
sequenceDiagram
    participant R as React render
    participant Ref as gameStateRef
    participant E as useEffect
    participant I as setInterval
    participant F as fetchMoves()
    participant S as Server

    Note over R: Render #1: gameState = {id:"abc", board:[null x 9]}
    R->>Ref: ref.current = {id:"abc", board:[null x 9]}
    R->>E: gameState?.id changed (-> "abc"), run effect
    E->>I: create interval

    Note over I: 1s tick
    I->>F: call fetchMoves()
    F->>Ref: read ref.current
    Ref-->>F: {id:"abc", board:[null x 9]} (fresh!)
    F->>S: GET /api/games
    S-->>F: [{id:"abc", board:["X", null x 8]}]
    F->>R: setGameState({id:"abc", board:["X",...]})

    Note over R: Render #2: gameState = {id:"abc", board:["X",...]}
    R->>Ref: ref.current = {id:"abc", board:["X",...]}
    Note over R: gameState?.id still "abc"<br/>effect does NOT re-run<br/>same interval continues

    Note over I: 1s tick
    I->>F: call fetchMoves()
    F->>Ref: read ref.current
    Ref-->>F: {id:"abc", board:["X",...]} (fresh!)
    Note over F: ref always has latest value<br/>because React updates it every render
    F->>S: GET /api/games
    S-->>F: [{id:"abc", board:["X","O", null x 7]}]
    F->>R: setGameState(updated)

    Note over R: Render #3
    R->>Ref: ref.current = latest

    Note over I,S: same interval, always fresh via ref
```

**How it works**: The ref is a mutable box that lives outside React's render cycle. Writing `gameStateRef.current = gameState` on every render keeps it fresh. The interval callback reads from the box instead of its stale closure.

---

## Diagram 3: Stable gameId — No Ref Needed

Key insight: the only thing `fetchMoves` needs from `gameState` is the `id`. And `id` doesn't change within the effect's lifetime (the effect re-runs when `gameState?.id` changes). So just capture `id` directly.

```mermaid
sequenceDiagram
    participant R as React render
    participant E as useEffect
    participant I as setInterval
    participant S as Server

    Note over R: Render #1: gameState = {id:"abc", board:[null x 9]}
    R->>E: gameState?.id changed (-> "abc"), run effect
    Note over E: const id = gameState.id<br/>captures "abc" (a primitive string)

    E->>I: create interval with id="abc" in closure

    Note over I: 1s tick
    I->>S: GET /api/games
    Note over I: uses captured id = "abc" to find game
    S-->>I: [{id:"abc", board:["X", null x 8]}]
    I->>R: setGameState({id:"abc", board:["X",...]})

    Note over R: Render #2: gameState = {id:"abc", board:["X",...]}
    Note over R: gameState?.id still "abc"<br/>effect does NOT re-run

    Note over I: 1s tick
    I->>S: GET /api/games
    Note over I: id is "abc" in closure<br/>NOT stale — it's the correct value!<br/>id genuinely hasn't changed
    S-->>I: [{id:"abc", board:["X","O", null x 7]}]
    I->>R: setGameState(updated)

    Note over I: 1s tick
    I->>S: GET /api/games
    Note over I: id still "abc" — still correct!
    S-->>I: latest game data
    I->>R: setGameState(updated)

    Note over R,S: if user leaves game: gameState?.id becomes undefined<br/>effect re-runs, interval is cleared, lobby takes over

    Note over I,S: closure IS stale on gameState...<br/>but it only captured id, which is CORRECT<br/>for the entire lifetime of this effect
```

**Why this works**: The closure _is_ technically stale (it captured Render #1's scope). But it only uses `id`, which is a primitive that doesn't change until the effect is torn down and re-created. The "staleness" is harmless because the captured value is guaranteed to be correct.

---

## Side-by-Side Summary

```mermaid
flowchart TD
    subgraph A["1: No useRef (stale)"]
        A1["fetchMoves closes over<br/>gameState from Render #1"]
        A2["interval ticks, gameState<br/>is frozen at old value"]
        A3["works by luck for .id<br/>but closure is fundamentally stale"]
        A1 --> A2 --> A3
    end

    subgraph B["2: useRef (not stale)"]
        B1["ref.current updated<br/>every render"]
        B2["interval reads ref.current<br/>instead of closed-over variable"]
        B3["always fresh, but React<br/>can't see the dependency"]
        B1 --> B2 --> B3
    end

    subgraph C["3: Capture id (no ref needed)"]
        C1["const id = gameState.id<br/>captured at effect creation"]
        C2["interval uses id (primitive)<br/>which never changes"]
        C3["closure is stale but<br/>captured value is correct"]
        C1 --> C2 --> C3
    end
```
