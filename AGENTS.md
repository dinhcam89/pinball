# Open Pinball Recall — AI Agent Instructions

## 1. Project

This repository contains Open Pinball Recall, a browser-based Pinball Recall game.

The original game focuses on working-memory gameplay:

1. The player observes a board containing bumpers.
2. The player memorizes bumper positions and directions.
3. A ball enters the board.
4. The player predicts where the ball will exit.
5. The game evaluates the answer and adjusts difficulty.

The project is implemented as a web application using the existing repository stack.

The current implementation is the source of truth for how the game actually works.

---

# 2. Mission of the Agent

The AI agent is responsible for helping evolve this project into a larger and maintainable game while preserving existing functionality unless a task explicitly changes it.

The agent must prioritize:

1. Correctness
2. Understanding the existing code
3. Minimal safe changes
4. Architectural consistency
5. Testability
6. Maintainability
7. Clear documentation

Do not optimize for producing large amounts of code.

---

# 3. Source of Truth

Before working on a non-trivial task, consult the relevant documents:

* `docs/PROJECT.md`
* `docs/ARCHITECTURE.md`
* `docs/GAMEPLAY.md`
* `docs/AI_CONTEXT.md`
* `docs/DEVELOPMENT.md`
* `docs/ROADMAP.md`
* `docs/decisions/`

These documents describe the intended project architecture and development direction.

However:

## Code vs Documentation

If documentation conflicts with the actual implementation:

1. Treat the code as the current implementation.
2. Identify the discrepancy.
3. Do not silently rewrite the code to match documentation.
4. Do not silently rewrite architecture.
5. Report the inconsistency.
6. Update documentation only when appropriate for the current task.

---

# 4. Mandatory Development Workflow

For every non-trivial task:

ANALYZE
→ PLAN
→ IMPLEMENT
→ VERIFY
→ DOCUMENT

## ANALYZE

Before editing:

* inspect relevant source files
* inspect related tests
* search for existing implementations
* identify dependencies
* identify current architecture
* identify possible side effects

Do not assume that a new abstraction is necessary.

---

## PLAN

Before implementation, produce a concise plan containing:

* objective
* current behavior
* desired behavior
* files/components involved
* implementation approach
* risks
* verification strategy

For small, obvious changes the agent may proceed directly.

For architectural or cross-cutting changes, stop after the plan and request approval.

---

## IMPLEMENT

Implement only the approved scope.

Prefer small, incremental changes.

Reuse existing abstractions.

Do not perform unrelated refactoring.

---

## VERIFY

After implementation:

* run relevant tests
* run TypeScript checks
* run formatting checks
* run build when appropriate
* inspect the final diff
* verify that existing behavior was preserved

Never claim a command was executed if it was not actually executed.

---

## DOCUMENT

If the change modifies:

* architecture
* gameplay rules
* game state
* randomness
* persistence
* public APIs
* development workflow

update the appropriate documentation.

---

# 5. Scope Control

The requested task defines the allowed scope.

Do NOT automatically:

* refactor unrelated code
* rename unrelated files
* rewrite working systems
* replace libraries
* introduce a new framework
* change the build system
* redesign the UI
* change gameplay rules
* modify assets unrelated to the task
* fix unrelated bugs

If an unrelated issue is discovered, report:

## OUT OF SCOPE

Do not fix it automatically.

---

# 6. Dependency Rules

The current project uses an existing web stack including:

* TypeScript
* React
* PixiJS
* Parcel
* TailwindCSS
* Vitest
* seedrandom

Do not replace or introduce major dependencies without explicit justification.

Before adding a dependency:

1. Search the existing repository.
2. Determine whether existing functionality can solve the problem.
3. Explain why the dependency is necessary.
4. Explain its impact on bundle size, maintenance, and platform compatibility.

---

# 7. Game Architecture Rules

The project should maintain a reasonable separation between:

### Game Logic

Rules, simulation, scoring, state transitions and gameplay decisions.

### Rendering

PixiJS rendering, sprites, graphics, animations and visual effects.

### UI

Menus, HUD, controls, settings and React components.

### Audio

Sound effects and music.

### Data

Configuration, level definitions, gameplay parameters and persistence.

Do not unnecessarily couple these systems.

In particular:

* rendering should not own gameplay state
* React UI should not become the owner of core game simulation
* gameplay logic should not depend on visual implementation details
* game rules should not be duplicated in UI code

Follow the actual existing architecture until a deliberate architectural change is approved.

---

# 8. Deterministic Gameplay

This project contains gameplay involving generated board configurations and ball trajectories.

Randomness must be treated as part of the game system.

When randomness affects:

* board generation
* bumper placement
* difficulty
* gameplay outcomes
* replayability
* testing

prefer controlled/randomness mechanisms that can be reproduced when necessary.

Do not replace the existing random-number strategy casually.

If changing randomness, consider:

* reproducibility
* testing
* debugging
* difficulty balance
* replay support

---

# 9. Game State

Every important game state should have a clear owner.

Do not create multiple independent sources of truth.

Before adding state:

1. search for the existing state
2. determine who owns it
3. determine who reads it
4. determine who mutates it

Prefer explicit state transitions over implicit side effects.

---

# 10. Gameplay Rules

Gameplay rules should be centralized enough that they can be understood and tested independently of presentation.

Avoid implementing core game rules directly inside:

* PixiJS rendering code
* React components
* animation callbacks
* UI event handlers

unless the existing architecture explicitly follows that pattern.

---

# 11. PixiJS

PixiJS is responsible for rendering/game presentation where currently used.

Do not use PixiJS objects as the authoritative source of gameplay state unless that is explicitly part of the existing architecture.

Prefer:

Game State
→ Gameplay Logic
→ Rendering

rather than:

Rendering Object
→ implicit Gameplay State

---

# 12. React

React should primarily handle application/UI concerns.

Do not move core game simulation into React state merely because React state is convenient.

Avoid unnecessary React re-renders for high-frequency game updates.

---

# 13. Testing

Prefer deterministic tests for:

* board generation
* bumper placement
* ball trajectory calculation
* scoring
* difficulty adjustment
* game state transitions
* answer evaluation

Visual behavior should be tested separately where appropriate.

When adding a gameplay mechanic, consider whether the underlying rule can be tested without rendering the game.

---

# 14. Performance

Avoid unnecessary work inside high-frequency update loops.

Be particularly careful with:

* per-frame allocations
* unnecessary React updates
* repeated PixiJS object creation
* repeated geometry creation
* event listener leaks
* unnecessary random generation
* expensive calculations during rendering

Do not optimize prematurely.

Measure or identify a concrete bottleneck before making invasive performance changes.

---

# 15. Documentation Rules

Documentation should explain stable concepts, not every implementation detail.

Use:

`PROJECT.md`
→ product/project identity

`ARCHITECTURE.md`
→ technical architecture

`GAMEPLAY.md`
→ gameplay rules

`AI_CONTEXT.md`
→ current development state

`DEVELOPMENT.md`
→ development commands/workflow

`ROADMAP.md`
→ planned work

`decisions/ADR-*.md`
→ important architectural decisions

---

# 16. Architectural Decisions

Do not silently introduce major architectural decisions.

Examples:

* replacing the rendering architecture
* introducing a new state-management system
* introducing a new game engine
* changing the simulation model
* changing randomness architecture
* introducing multiplayer networking
* introducing persistence architecture

For such changes:

1. Analyze the current architecture.
2. Propose alternatives.
3. Explain trade-offs.
4. Create or update an ADR after approval.

---

# 17. Uncertainty

When requirements are ambiguous:

DO NOT invent product requirements silently.

Instead:

1. identify the ambiguity
2. describe the affected decision
3. propose reasonable options
4. ask for the minimum decision required

---

# 18. Final Response Format

After completing a task, report:

## Changed

What changed.

## Files

Files modified or created.

## Verification

Commands/tests/checks actually executed.

## Behavior

What behavior was verified.

## Risks

Known risks or limitations.

## Out of Scope

Issues intentionally not changed.

## Documentation

Documentation updated, if any.

---

# 19. Golden Rule

Before creating something new:

SEARCH.

Before changing architecture:

UNDERSTAND.

Before implementing:

PLAN.

Before declaring success:

VERIFY.

When uncertain:

STOP AND ASK.
