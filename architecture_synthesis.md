# Architecture Synthesis

By analyzing the seven proposed product directions, we can identify common needs and define a flexible architectural foundation that avoids premature abstraction while maximizing reusability.

## 1. Systems Common to Multiple Directions

The following systems appear repeatedly across almost all directions (excluding the Experimental Physics Puzzle, which requires a complete rewrite):
- **Core Simulation Logic:** Grid management, static bumper representation, and instant deterministic path calculation (`createTrail`).
- **Board/Level State Representation:** A data structure that defines the `size` and the exact placement/orientation of bumpers.
- **Rendering Layer (PixiJS):** Visualizing the grid, indicators, bumpers, ball, and trail animations.
- **Input Handling:** Clicking indicators along the boundary to make a guess.
- **Serialization/Deserialization:** Moving board states to and from strings/JSON (needed for Sandbox, Adventure, Daily, and Roguelite).

## 2. Direction-Specific Systems

These systems are unique to one or a very small subset of directions and should not pollute the core foundation:
- **Physics Engine (Tick-based collisions):** Specific to Experimental Physics.
- **Meta-Map/Node Graph Traversal:** Specific to Roguelite and Adventure.
- **Shop/Currency/Relic Systems:** Specific to Roguelite.
- **Over-time Analytics & Streak Tracking:** Specific to Brain Training.
- **Real-time Global Timer & Combos:** Specific to Arcade Score-Attack.
- **Timezone/Date based Seed Generation:** Specific to Daily Puzzle.
- **WYSIWYG Grid Editor:** Specific to Sandbox/Level Creator.

## 3. Smallest Architecture Foundation

The smallest foundation that enables directions 1 through 6 is the **Decoupled Level Engine**. 

Currently, the `config` dictates random generation parameters, and the game loop immediately plays that config. By decoupling **Level Definition** (what is on the board) from **Level Generation** (how the board got there), we unlock almost all directions:
- **Sandbox/Adventure:** Can inject a Level Definition explicitly.
- **Roguelite/Daily/Brain Training:** Can inject a Level Definition procedurally using the PRNG.

The foundation must simply accept a `LevelDefinition` and a `UserGuess`, returning a `SimulationResult` and driving the PixiJS `Renderer`.

## 4. Premature Abstractions

Abstractions that should **not** be built yet, as they are not justified universally:
- **Tick-based Simulation:** Do not refactor the instant `createTrail` logic into a real-time game loop. It is only needed by Experimental Physics.
- **Generic Entity Component System (ECS):** Do not abstract bumpers into generic "entities" yet. The simulation is fast precisely because it relies on a simple 2D array of string unions.
- **Abstract Rule Engine:** Do not create a generic ruleset parser (e.g., trying to script win conditions). Hardcoding win conditions (guess == exit) within the specific Game Mode layer is sufficient for now.
- **Complex UI Theming Systems:** Keep the CSS/Tailwind simple. Do not build a massive skinning engine until an Adventure or Sandbox mode explicitly requires it.

## 5. Untouched Current Repository Parts

The following components from the existing repository should remain entirely untouched:
- **`src/logic/trail.ts` & `src/logic/grid.ts`:** The fundamental pure math calculating the ball path.
- **`src/util.ts`:** Directional helpers (`opposite`, `moveFromDirection`, `bumperTurn`).
- **PixiJS Primitive Drawing (`src/display/ball.ts`, `src/display/bumper.ts`):** The code that draws basic shapes.
- **`seedrandom` Dependency:** The core of the deterministic generation.

## 6. Architecture Evolution

**Current Architecture:**
Tightly coupled: URL Hash → Config → Procedural Game Generation → React State Machine (Phase) + PixiJS Rendering.

**↓ Evolves Into ↓**

**Foundation Layer:**
- Pure Level Simulation (Grid + Pathing).
- Pure Rendering (PixiJS Canvas taking a Level State + Trail).
- Deterministic Utilities (PRNG, Math).

**↓ Enables ↓**

**Game Mode Layer (The "Loop"):**
- Manages the Phase (Memorize → Guess → Animate).
- Handles specific scoring math, round increments, or timer ticks.
- Defines how the next `LevelDefinition` is acquired (procedural vs. loaded).

**↓ Driven By ↓**

**Product-Specific Systems (The "Meta"):**
- Map traversal (Roguelite).
- Level Editors (Sandbox).
- Analytics Dashboards (Brain Training).
- Daily Seed calculations (Challenge).

## 7. Architectural Boundaries

- **Simulation:** Pure functions. Takes a `Grid` and `Start Position`, outputs a `Trail`. Has no concept of time, rendering, or winning/losing.
- **Board/Level Definition:** A serializable schema defining grid dimensions, bumper positions, and start position. It is static data.
- **Randomness:** Isolated to generators. Consumes a Seed, outputs a `Board/Level Definition`.
- **Rules:** The logic that compares a player's `Guess` to the `Simulation Result` to determine a local win/loss boolean.
- **Scoring:** Calculates point values (e.g., `combo * size * 10`) based on the rule outcome.
- **Session:** Temporary state holding the current active run (e.g., lives remaining, current score, current node in a Roguelite, current active timer).
- **Progression:** Meta-game state across sessions (e.g., highest world unlocked, total XP, win streak).
- **Persistence:** The adapter layer saving Session/Progression to LocalStorage, URL Hash, or a Backend.
- **Rendering:** PixiJS layer. Strictly a visual reflection of the Board Definition and Simulation Trail. Emits simple UI events (e.g., "indicator clicked").
- **UI:** React layer (HTML/CSS). Handles menus, HUDs, transition screens, and meta-game wrappers (shops, maps, editors).

## 8. Foundation Component Consumption by Direction

| Direction | Core Simulation | PRNG | Level Definition (Static) | PixiJS Renderer | React Phase Loop |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **1. Brain Training** | ✅ | ✅ | ❌ | ✅ | ✅ |
| **2. Arcade Score-Attack**| ✅ | ✅ | ❌ | ✅ | ✅ (Modified for speed) |
| **3. Roguelite Puzzle** | ✅ | ✅ | ❌ | ✅ | ✅ |
| **4. Adventure/Progression**| ✅ | ❌ | ✅ | ✅ | ✅ |
| **5. Daily Puzzle** | ✅ | ✅ (Date-seeded) | ❌ | ✅ | ✅ |
| **6. Sandbox/Creator** | ✅ | ❌ | ✅ | ✅ | ✅ (Plus Editor State) |
| **7. Experimental Physics**| ❌ | ✅ | ✅ | ✅ (Visuals only) | ❌ |

*(Note: ✅ = Fully Consumes, ❌ = Replaces or Bypasses)*
