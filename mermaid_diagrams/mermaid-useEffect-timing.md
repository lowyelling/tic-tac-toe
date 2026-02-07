# useEffect + setInterval Timing Diagrams

## Diagram 1: The Problem — `[gameState]` as dependency (interval churn)

Every poll returns a new object reference, so React tears down and re-creates the interval every second.

```mermaid
sequenceDiagram
    participant R as React
    participant E as useEffect
    participant I as setInterval
    participant S as Server

    R->>E: mount, gameState = null
    E->>I: create interval #1

    Note over I: 1s tick
    I->>S: fetchMoves()
    S-->>R: setState(newObject1)
    Note over R: gameState changed!<br/>(new object ref)
    R->>E: cleanup: clearInterval #1
    R->>E: re-run effect
    E->>I: create interval #2

    Note over I: 1s tick
    I->>S: fetchMoves()
    S-->>R: setState(newObject2)
    Note over R: gameState changed again!<br/>(another new object ref)
    R->>E: cleanup: clearInterval #2
    R->>E: re-run effect
    E->>I: create interval #3

    Note over I,S: ...repeats forever: create, fire once, destroy, create...
```

**Problem**: The interval never survives more than one tick. React sees a "new" dependency every time because `{id:"abc", board:[...]}  !== {id:"abc", board:[...]}` (different object references).

---

## Diagram 2: The Escape Hatch — `[]` deps + useRef guard

The interval is created once and lives forever. It peeks at `gameStateRef.current` to decide what to do.

```mermaid
sequenceDiagram
    participant R as React
    participant E as useEffect
    participant I as setInterval
    participant Ref as gameStateRef
    participant S as Server

    R->>E: mount, gameState = null
    E->>I: create interval (lives forever)
    R->>Ref: ref.current = null

    Note over I: 1s tick
    I->>Ref: read ref.current
    Ref-->>I: null (not in game)
    I->>S: fetchGameList()
    S-->>R: setGameList(...)

    Note over R: user clicks a game
    R->>Ref: ref.current = {id:"abc",...}

    Note over I: 1s tick
    I->>Ref: read ref.current
    Ref-->>I: {id:"abc",...} (in game!)
    I->>S: fetchMoves()
    S-->>R: setGameState(updated)
    R->>Ref: ref.current = updated

    Note over I: 1s tick (same interval!)
    I->>Ref: read ref.current
    Ref-->>I: still {id:"abc",...}
    I->>S: fetchMoves()

    Note over I,S: ...same interval lives on, ref always fresh...
```

**Tradeoff**: Works, but React has no visibility into dependencies. The ref is a "backdoor" — React doesn't know the interval cares about gameState. You're managing the lifecycle yourself.

---

## Diagram 3: The Insight — `[gameState?.id]` as dependency (stable primitive)

The interval is re-created only at meaningful transitions (null <-> "abc-123"), not on every poll.

```mermaid
sequenceDiagram
    participant R as React
    participant LE as Lobby useEffect
    participant GE as Game useEffect
    participant LI as Lobby interval
    participant GI as Game interval
    participant S as Server

    R->>LE: mount, gameState?.id = undefined
    LE->>LI: create lobby interval

    Note over LI: 1s tick
    LI->>S: fetchGameList()
    S-->>R: setGameList(...)
    Note over R: gameState?.id still undefined<br/>effect does NOT re-run

    Note over LI: 1s tick
    LI->>S: fetchGameList()
    Note over LI,S: ...lobby interval keeps ticking undisturbed...

    Note over R: user clicks game
    R->>R: setGameState({id:"abc",...})
    Note over R: gameState?.id: undefined -> "abc"<br/>BOTH effects re-run

    R->>LE: cleanup: clearInterval lobby
    R->>LE: re-run: gameState exists, early return
    Note over LE: lobby polling stopped

    R->>GE: re-run: gameState exists, create interval
    GE->>GI: create game interval

    Note over GI: 1s tick
    GI->>S: fetchMoves()
    S-->>R: setGameState({id:"abc", board:[X,...]})
    Note over R: gameState?.id still "abc"<br/>effects do NOT re-run

    Note over GI: 1s tick
    GI->>S: fetchMoves()
    Note over GI,S: ...game interval keeps ticking undisturbed...

    Note over R: user clicks "Back to lobby"
    R->>R: setGameState(null)
    Note over R: gameState?.id: "abc" -> undefined<br/>BOTH effects re-run

    R->>GE: cleanup: clearInterval game
    R->>GE: re-run: gameState is null, early return
    Note over GE: game polling stopped

    R->>LE: cleanup (no-op, was early return)
    R->>LE: re-run: gameState null, create interval
    LE->>LI: create lobby interval
    Note over LE: lobby polling resumed
```

**Why it works**: `gameState?.id` is a string/undefined — a primitive. It evaluates to the same value across polls (`"abc" === "abc"`), so React doesn't see a change. It only changes at real transitions: joining a game (`undefined` -> `"abc"`) or leaving (`"abc"` -> `undefined`).

---

## Summary: When does the interval restart?

```mermaid
flowchart LR
    subgraph D1["[gameState]"]
        A1[Every poll] -->|new object ref| B1[Restart interval]
    end

    subgraph D2["[ ] + useRef"]
        A2[Never] -->|mount only| B2[One interval forever]
    end

    subgraph D3["[gameState?.id]"]
        A3[Join/leave game] -->|primitive changes| B3[Restart interval]
    end
```
