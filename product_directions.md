# Future Product Directions

Based on the existing repository and simulation analysis, the following product directions explore how the core mechanics can be expanded. They are presented as independent possibilities.

---

## 1. Enhanced Brain Training Game

Focuses on maximizing the cognitive exercise aspect of the original concept, expanding into a suite of structured mental workouts.

### CORE LOOP
Select workout → memorize bumper layout → guess trajectory under time constraints → view detailed metrics/results → earn progression (streaks/XP) → next day/challenge.

### REUSE
The core simulation, deterministic PRNG, adaptive difficulty, and the overall UI phase progression (memorize → guess → review) can be heavily reused.

### NEW SYSTEMS
- **Analytics Engine:** Track memory retention rates, reaction times, and performance over time.
- **Progression System:** Streaks, daily goals, XP, and badges.
- **New Cognitive Modes:** Reverse recall (see exit, guess start), flashing bumpers (bumpers appear briefly then disappear one by one).

### ARCHITECTURE IMPACT
Requires a persistence layer (e.g., local storage or a lightweight backend) beyond the URL hash to track historical performance data.

### MVP
Add local storage tracking for reaction time and win streaks across multiple sessions, alongside a basic graph visualizing performance.

### DEVELOPMENT PHASES
1. Integrate local storage data persistence.
2. Build analytics dashboard UI.
3. Implement daily goals and streak tracking.
4. Introduce 1-2 new cognitive modes.

### RISKS
- **Technical:** Storing growing historical data in the browser safely.
- **Gameplay:** Without variety, players may churn quickly if it feels too repetitive.

### CONTENT REQUIREMENTS
Very low. Relies on systemic depth (metrics) rather than new assets or level design.

### LONG-TERM EXTENSION
Could evolve into a platform with multiple distinct mini-games sharing the same unified brain-training profile and scoring mechanics.

---

## 2. Arcade Score-Attack Puzzle

Transforms the puzzle into a fast-paced, high-stress action game prioritizing quick thinking and combo-building.

### CORE LOOP
Rapidly presented boards → guess trajectory quickly → correct guesses build multiplier/extend timer → incorrect guess drops combo/loses life → game over on timer/lives run out → submit high score.

### REUSE
The grid, bumper rendering, and instant simulation logic are perfectly suited for fast generation. The adaptive difficulty logic can be repurposed for escalating waves.

### NEW SYSTEMS
- **Timer/Combo Engine:** Global round timer, combo multipliers for quick consecutive answers.
- **Visual Juice:** Screen shake, particle effects on high combos, dramatic music.
- **Leaderboards:** Local or global high-score tables.

### ARCHITECTURE IMPACT
The React/PixiJS coupling in `BoardCanvas.tsx` will need optimization to handle very rapid resets and transitions without memory leaks or stutter. The UI state machine needs a "frenzy" loop.

### MVP
A time-attack mode where the player has 60 seconds to solve as many boards as possible, with a combo multiplier for fast answers.

### DEVELOPMENT PHASES
1. Implement the combo multiplier and scoring math.
2. Add the global timer and time-attack game loop.
3. Overhaul PixiJS animations for speed and visual feedback ("juice").
4. Add local high score persistence.

### RISKS
- **Technical:** Rapid instantiation of PixiJS scenes could cause GC (Garbage Collection) pauses.
- **Gameplay:** Time pressure might frustrate players whose working memory requires steady focus.

### CONTENT REQUIREMENTS
Low to moderate. Requires new visual effects, sound effects, and upbeat music tracks to sell the arcade feel.

### LONG-TERM EXTENSION
Global leaderboards, seasonal tournaments, and special "mutator" weeks (e.g., invisible ball).

---

## 3. Roguelite Pinball Puzzle

A run-based progression game where players navigate a map, collect game-altering relics, and face increasingly complex puzzle encounters.

### CORE LOOP
Select node on map → encounter puzzle board with specific mutators → solve puzzle → gain currency/relic → choose next path → fight "boss" board → win/lose run.

### REUSE
The grid model, bumper simulation, and deterministic generation are preserved. The core memory mechanic remains the central "combat" system.

### NEW SYSTEMS
- **Meta-Map System:** Node traversal (Slay the Spire style).
- **Relic/Modifier System:** Items that alter logic (e.g., "Bumpers are visible for 1 extra second", "Ball passes through first bumper", "3 lives per puzzle").
- **Economy:** Currency gathered from puzzles to spend at shops.

### ARCHITECTURE IMPACT
Significant. The simulation core must be refactored to accept external modifiers/relics during path calculation. The React state must manage a complex overarching "Run" state rather than a single board config.

### MVP
A 10-node linear map where beating a puzzle grants a choice between two permanent modifiers that affect the rules of the remaining puzzles.

### DEVELOPMENT PHASES
1. Abstract simulation logic to accept mutators.
2. Build the meta-map and run state manager.
3. Design and implement 5-10 relics.
4. Implement currency and simple shops.

### RISKS
- **Technical:** Ensuring mutators interact cleanly with the purely deterministic trail calculation without causing infinite loops.
- **Gameplay:** Balancing difficulty so relics feel impactful without breaking the memory aspect.

### CONTENT REQUIREMENTS
High. Requires map UI, relic icons, diverse mutator logic, and progressive difficulty balancing.

### LONG-TERM EXTENSION
Daily seeded runs, diverse characters (starting with different modifiers), and unlockable permanent meta-progression.

---

## 4. Adventure/Progression Game

A curated, level-based journey through themed worlds, introducing new mechanics gradually through hand-crafted puzzles rather than purely procedural ones.

### CORE LOOP
Select unlocked level → read narrative/mechanic prompt → solve pre-designed puzzle(s) → unlock next level/world map node.

### REUSE
The underlying logic and rendering are reused, but the random generation is bypassed in favor of loaded level data.

### NEW SYSTEMS
- **Level Loader:** Parsing level data (JSON/strings) into grid state.
- **Overworld Map:** Visual map with unlockable paths.
- **New Obstacles:** Pre-placed walls, color-coded bumpers, or multi-ball levels introduced sequentially.

### ARCHITECTURE IMPACT
`seedrandom` generation is replaced by a level-parsing pipeline. The configuration must support explicit grid data structures rather than just size/count parameters.

### MVP
A campaign of 20 hand-crafted levels stringed together with a simple level-select screen and progress saving.

### DEVELOPMENT PHASES
1. Create a JSON schema for level definitions.
2. Build the level loader and bypass procedural generation.
3. Create the level-select UI and save system.
4. Hand-craft 20 levels.

### RISKS
- **Technical:** Low technical risk.
- **Gameplay:** Hand-crafting puzzles that are neither trivially easy nor impossibly hard without random generation is difficult.

### CONTENT REQUIREMENTS
High. Relies heavily on level design, narrative elements, and potentially distinct visual themes for different "worlds."

### LONG-TERM EXTENSION
Community-driven level expansions, branching storylines, and DLC worlds.

---

## 5. Challenge/Daily Puzzle Game

Focuses on a shared community experience, drawing inspiration from Wordle, where everyone plays the exact same puzzle setup each day.

### CORE LOOP
Open app → play today's unique global puzzle → see global statistics/comparison → share results to social media (emoji grid) → wait for tomorrow.

### REUSE
Almost 100% of the current architecture. The deterministic `seedrandom` behavior is perfectly aligned with this model.

### NEW SYSTEMS
- **Daily Seed Generator:** Uses the current date to generate a universal seed.
- **Social Sharing:** Generating shareable text/emoji blocks of the player's performance.
- **Global Stats:** (Optional) Backend to track global success rates.

### ARCHITECTURE IMPACT
Minimal. Needs to decouple the seed from the URL hash and instead derive it from the local timezone date.

### MVP
A mode that automatically sets the seed to `YYYY-MM-DD`, locks difficulty to a standard 5x5, and provides a "Share" button that copies performance emojis to the clipboard.

### DEVELOPMENT PHASES
1. Add Daily Mode toggle/routing.
2. Implement date-based seed logic.
3. Build the share-to-clipboard formatting.
4. Add basic UI lockouts (can only play once per day).

### RISKS
- **Technical:** Timezone manipulation and spoofing if done purely client-side.
- **Gameplay:** Without varied difficulty, it may alienate beginners (too hard) or veterans (too easy).

### CONTENT REQUIREMENTS
Extremely low. Primarily UI and share-text formatting.

### LONG-TERM EXTENSION
Global backend for true leaderboards, tracking historical daily performance, and implementing "Past Puzzles" archives.

---

## 6. Sandbox/Level Creator

Transforms the game into a platform for user-generated content, focusing on creation, sharing, and solving community puzzles.

### CORE LOOP
Enter editor → place bumpers/obstacles → test puzzle → generate shareable URL → share with friends → play friend's URL.

### REUSE
The core simulation handles the puzzle validation. The URL hash state management is already perfectly positioned for sharing stringified level data.

### NEW SYSTEMS
- **Level Editor UI:** Drag-and-drop or click-to-cycle grid editing.
- **Serialization Engine:** Compressing a grid into a short URL string.
- **Validation Engine:** Ensuring a level is solvable (has an exit) before sharing.

### ARCHITECTURE IMPACT
Needs a new UI phase (`editing`) where clicking the board mutates the grid state rather than guessing an exit. The `config` state needs to support direct grid injection.

### MVP
A toggle to enter "Edit Mode," allowing clicking on grid cells to cycle between empty, `/`, and `\`, and a button to copy the resulting layout as a URL hash.

### DEVELOPMENT PHASES
1. Expand URL config to parse direct grid definitions.
2. Build the Editor UI and cell-click mutation logic.
3. Add serialization to Base64/Hash for sharing.
4. Implement "Test Play" flow.

### RISKS
- **Technical:** URL length limits if boards get too large, requiring tighter binary packing or a database.
- **Gameplay:** Trolls creating visually impossible or intentionally frustrating layouts.

### CONTENT REQUIREMENTS
Low for the developer, as the community provides the content. Requires robust UI/UX design for the editor.

### LONG-TERM EXTENSION
Backend server for browsing, rating, and searching community-made levels ("Pinball Maker").

---

## 7. Experimental Physics Puzzle

Abandons the instant, turn-based simulation in favor of continuous, tick-based physics, changing it from a memory game to a timing/physics game.

### CORE LOOP
Observe moving obstacles → release ball at the correct time → watch physics simulation → ball hits goal/fails → adjust and try again.

### REUSE
The visual assets, PixiJS setup, and grid concepts can be reused.

### NEW SYSTEMS
- **Physics Engine:** Real-time tick evaluation (gravity, momentum, bouncing).
- **Moving Elements:** Bumpers that rotate, walls that slide.
- **Timing Mechanic:** Player controls *when* or *how hard* the ball is launched rather than guessing the exit.

### ARCHITECTURE IMPACT
Complete redesign of the core simulation. The `createTrail` instant-evaluation logic must be thrown out. Logic and Rendering must be synchronized on a real-time game loop tick.

### MVP
A single board with a moving obstacle and a button to launch the ball, using simple bounding-box physics to reach a static target.

### DEVELOPMENT PHASES
1. Rip out the static `createTrail` logic.
2. Implement a basic physics loop (update positions, check collisions per frame).
3. Add dynamic obstacles (rotators, sliders).
4. Redesign win/loss conditions based on targets rather than exits.

### RISKS
- **Technical:** Extremely high. Requires writing or integrating a 2D physics engine.
- **Gameplay:** Changes the fundamental genre of the game from memory puzzle to action timing, alienating the original premise.

### CONTENT REQUIREMENTS
High. Requires completely new puzzle designs tailored for physics and timing rather than static routing.

### LONG-TERM EXTENSION
Complex Rube Goldberg machines, fluid dynamics, and multiplayer races.
