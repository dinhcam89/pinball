$projectContent = @"
# Project Identity
Open Pinball Recall

## Current Purpose
A game to train working memory, acting as a ripoff from Lumosity's Pinball Recall.

## Original Gameplay Concept
Memorize the position and direction of bumpers in a grid and guess the place where a ball will exit the grid given the place where it enters.

## Current Technology Stack
- TypeScript: Main programming language for logic and React.
- React: Used for UI, state management, configuration, and app initialization.
- PixiJS: Used for rendering the board, bumpers, and ball animations.
- TailwindCSS: Used for styling the HTML elements (React UI).
- Parcel: The bundler and development server.
- Vitest: Testing framework used for unit tests.
- seedrandom: Provides deterministic PRNG based on a seed for reproducibility.

## Current Supported Platform
Browser (web application).

## Repository Constraints
No backend, no database. Client-side only. State is stored in React and URL hash for persistence across sessions.

## Current Capabilities
- Grid sizes ranging from 4x4 to 7x7.
- Adaptive difficulty adjustment based on hits/misses.
- Practice mode (fixed difficulty, tracks successes/failures).
- Custom configuration via URL hash.
"@

$architectureContent = @"
# Architecture

## Source Tree
- `src/app`: React components for the UI, settings, and main canvas wrapper.
- `src/config`: Configuration logic, resolving config from URL hash.
- `src/display`: PixiJS rendering code for the board, ball, bumpers, and trail.
- `src/logic`: Game logic, trail generation, grid management, and round progress.
- `src/audio`: Sound effects loading and playing.

## Application Architecture
The application is a purely client-side React app.
- Entry point: `src/main.tsx` mounts `src/app/App.tsx`.
- Configuration (URL hash based) drives the initialization of the game state.

## Game Architecture
The game state is determined deterministically from a configuration (seed, size, bumperCount).
- `src/logic/game.ts` creates the game object.
- `seedrandom` ensures that given a seed, the grid and bumpers are the same.
- State is essentially stateless functions calculating the path based on the grid.

## Gameplay Architecture
- **Board Model**: Grid of size x size (`src/logic/grid.ts`).
- **Bumper Model**: Diagonal walls (`/` or `\`) causing 90 degree turns.
- **Ball Model**: Moving entity that travels step-by-step through the grid.
- **Trajectory Simulation**: Handled entirely ahead of time in `src/logic/trail.ts` giving an array of steps.
- **Answer Evaluation**: React compares user's guess (indicator clicked) with the last step of the trail.

## Rendering Architecture (PixiJS)
- **Pixi Application**: Created within a `useEffect` inside `src/app/BoardCanvas.tsx`.
- **Board Rendering**: `src/display/board.ts` draws grid lines and indicators.
- **Bumpers/Ball**: Drawn via separate module files (`src/display/bumper.ts`, `src/display/ball.ts`).
- **Animation Loop**: A ticker is added when the phase is 'result'. The trail array is traversed using elapsed time to interpolate ball position.
- **Separation**: Rendering state is well separated. `BoardCanvas.tsx` completely recreates the PIXI app on resize or game config changes. However, PixiJS and React logic are coupled at `BoardCanvas.tsx`.

## Data Flow & State Flow
- `URL Hash` -> `config` (React State)
- `config` -> `createGame()`
- `game` -> `BoardCanvas` (PixiJS scene update)
- `User Click` -> `onGuess` callback -> `phase = result` -> PixiJS animation starts
- `Animation End` -> `onResolved` -> `phase = review/end` -> Updates Score/URL Hash

## Randomness Flow
- Generated at start via `seedrandom(config.seed)`.
- Used to place bumpers and select the start position.
- Seeds are persisted in the URL hash, making games reproducible.
"@

$gameplayContent = @"
# Gameplay

## Game Loop
1. **Introduction**: Start screen.
2. **Bumper View**: The bumpers are displayed for a few seconds.
3. **Guess**: Bumpers disappear, the start arrow appears. Player must click an indicator on the edge to guess the exit.
4. **Result**: The ball animation plays, tracing the path.
5. **Review / End**: Success or failure is displayed.
6. **Next Round**: Difficulty and score are adjusted, moving to the next round.

## Board Generation
A grid is created based on the current configuration `size`. Bumpers are placed randomly using the PRNG. The generation repeats if the path hits fewer than 2 bumpers.

## Bumper Rules
Bumpers are diagonals. A ball hitting a bumper turns 90 degrees depending on the bumper's orientation.

## Ball Behavior
Travels in a straight line, changing direction instantaneously upon hitting a bumper. Exits the board on the outer edges.

## Answer Evaluation
Checks if the X and Y coordinates of the selected indicator match the final path coordinates.

## Scoring
Score = size * bumperCount * 10 (awarded on victory).

## Difficulty
Adjusted in `resolveRound` based on win/loss. If won, bumper count increases. If lost, bumper count decreases (by 3). If bumper count exceeds max for the size, size increases.

## Practice Mode
Maintains fixed difficulty, tracking only successCount and failureCount instead of score and round.
"@

$aiContextContent = @"
# AI Context

## Current Phase
Repository analysis / foundation

## Existing Systems
- Game Logic: Grid, Trail simulation, Random generation.
- Rendering: PixiJS visualization of board and animations.
- UI/App: React wrapper, URL state management.
- Configuration: Hash-based config injection.

## Known Technical Debt
- **React/Pixi Coupling** (MEDIUM): `BoardCanvas.tsx` manages both the React lifecycle and the PixiJS imperative logic.
- **Hardcoded Gameplay Values** (LOW): Scoring math (`size * bumperCount * 10`), layout dimensions, and timing logic are deeply embedded in specific files rather than centralized.
- **Coupling of Application State and URL** (MEDIUM): `config.ts` and `locationHash.ts` heavily bind the application state to the URL hash for persistence.

## Current Constraints
- Purely client-side architecture.
- PixiJS handles all in-game rendering, React handles HUD and meta-states.
- The game is completely deterministic given a configuration seed.

## Current Development Goal
Prepare the repository for controlled AI-assisted development.

## Next Decision
Choose the future product direction.
"@

$developmentContent = @"
# Development

## Commands
- **Install**: `bun install` or `npm install`
- **Development**: `npm run dev` (Runs Parcel)
- **Build**: `npm run build`
- **Test**: `npm run test` (Runs Vitest)
- **Typecheck**: `npm run typecheck`
- **Formatting**: `npm run format`

## Important Development Conventions
- Use `npm run dev` to serve locally.
- Tests are co-located next to implementation files (e.g., `game.test.ts`).
- React functional components with hooks.
- PixiJS v8 used imperatively inside `useEffect`.
"@

$roadmapContent = @"
# Roadmap

- **Phase 0 — Repository Understanding**
  Status: In Progress
- **Phase 1 — Product Direction**
  Status: Not Started
- **Phase 2 — Architecture Preparation**
  Status: Not Started
- **Phase 3 — Core Development**
  Status: Not Started
- **Phase 4 — Content and Polish**
  Status: Not Started
"@

$docsPath = "\\wsl.localhost\Ubuntu-22.04\home\cam\projects\open-pinball-recall\docs"

$projectContent | Out-File -FilePath "$docsPath\PROJECT.md" -Encoding utf8
$architectureContent | Out-File -FilePath "$docsPath\ARCHITECTURE.md" -Encoding utf8
$gameplayContent | Out-File -FilePath "$docsPath\GAMEPLAY.md" -Encoding utf8
$aiContextContent | Out-File -FilePath "$docsPath\AI_CONTEXT.md" -Encoding utf8
$developmentContent | Out-File -FilePath "$docsPath\DEVELOPMENT.md" -Encoding utf8
$roadmapContent | Out-File -FilePath "$docsPath\ROADMAP.md" -Encoding utf8

Write-Output "Docs created successfully."
