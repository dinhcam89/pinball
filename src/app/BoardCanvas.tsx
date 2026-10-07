import * as pixi from 'pixi.js'
import { AdvancedBloomFilter } from 'pixi-filters'
import { useEffect, useRef } from 'react'
import { PinballConfig } from '../config/config'
import { drawStartArrow } from '../display/arrow'
import { drawBall } from '../display/ball'
import { drawBoard } from '../display/board'
import { drawBumperContainerAndFillGrid } from '../display/bumper'
import { drawDisk } from '../display/disk'
import { getLayout } from '../display/layout'
import { drawTrail } from '../display/trail'
import { createGrid } from '../logic/grid'
import { moveFromDirection, opposite } from '../util'
import { bellSound } from '../audio/sound'

interface BoardCanvasProps {
  config: PinballConfig
  game: Game
  phase: Phase
  guess?: Position
  onGuess: (position: Position) => void
  onResolved: (victory: boolean) => void
}

interface Scene {
  app: pixi.Application
  boardGame: Game
  layout: ReturnType<typeof getLayout>
  container: pixi.Container
  bumpers: pixi.Container
  startArrow: pixi.Graphics
  trail: pixi.Container
  ball: pixi.Graphics
  errorDisk: pixi.Graphics
  successDisk: pixi.Graphics
  bumperGrid: (pixi.Container | 'nothing')[][]
  journey: number
  shake: number
  baseX: number
  baseY: number
  particles: pixi.Graphics[]
  particleContainer: pixi.Container
  glowTime: number
  animate?: (ticker: pixi.Ticker) => void
}

export function BoardCanvas({ config, game, phase, guess, onGuess, onResolved }: BoardCanvasProps) {
  let host = useRef<HTMLDivElement>(null)
  let onGuessRef = useRef(onGuess)
  let onResolvedRef = useRef(onResolved)
  let sceneRef = useRef<Scene | undefined>(undefined)
  let phaseRef = useRef(phase)
  let guessRef = useRef(guess)
  let applySceneRef = useRef<() => void>(() => undefined)
  onGuessRef.current = onGuess
  onResolvedRef.current = onResolved
  phaseRef.current = phase
  guessRef.current = guess

  useEffect(() => {
    let cancelled = false
    let app = new pixi.Application()
    let bumperGrid = createGrid<pixi.Graphics | 'nothing'>(config.size, 'nothing')
    let resize: () => void = () => undefined

    let initialize = async () => {
      await app.init({
        background: config.backgroundColor,
        antialias: true,
      })
      if (cancelled || !host.current) {
        try { app.destroy(true) } catch (e) {}
        return
      }
      host.current.replaceChildren(app.canvas)
      let layout = getLayout(window, app.canvas, config)
      let boardGame = { ...game, phase: phaseRef.current }
      let board = drawBoard(boardGame, config, layout, (position) => onGuessRef.current(position))
      let bumpers = drawBumperContainerAndFillGrid(config, layout, game.bumperArray, bumperGrid)
      let startArrow = drawStartArrow(
        config.ballColor,
        layout.ballStrokeWidth,
        layout.side,
        game.start,
      )
      let trail = drawTrail(config.trailDotColor, layout, game.trail)
      let ball = drawBall(config, layout, game)
      let errorDisk = drawDisk(
        config.errorDiskColor,
        layout.indicatorRadius - layout.indicatorStrokeWidth / 2,
      )
      let successDisk = drawDisk(config.successDiskColor, layout.ballRadius, layout.ballStrokeWidth)
      let container = new pixi.Container()
      board.addChildAt(startArrow, 0)
      let particleContainer = new pixi.Container()
      container.addChild(board, trail, bumpers, particleContainer, ball, errorDisk, successDisk)
            app.stage.addChild(container)

      let applyLayout = () => {
        let width = host.current?.clientWidth ?? window.innerWidth
        let height = host.current?.clientHeight ?? window.innerHeight
        app.renderer.resize(width, height)
        let nextLayout = getLayout(window, app.canvas, config)
        let scale = nextLayout.boardSize / layout.boardSize
        container.scale.set(scale)
        container.x = nextLayout.boardBase.x
        container.y = nextLayout.boardBase.y
        if (sceneRef.current) {
          sceneRef.current.baseX = nextLayout.boardBase.x
          sceneRef.current.baseY = nextLayout.boardBase.y
        }
      }
      resize = applyLayout
      window.addEventListener('resize', resize)
      applyLayout()

      let scene: Scene = {
        app,
        boardGame,
        layout,
        container,
        bumpers,
        startArrow,
        trail,
        ball,
        errorDisk,
        successDisk,
        bumperGrid,
        journey: 0,
        shake: 0,
        baseX: container.x,
        baseY: container.y,
        particles: [],
        particleContainer,
        glowTime: 0,
      }
      sceneRef.current = scene
      applySceneRef.current = () => {
        let currentPhase = phaseRef.current
        let currentGuess = guessRef.current
        scene.boardGame.phase = currentPhase
        if (scene.animate) {
          scene.app.ticker.remove(scene.animate)
          scene.animate = undefined
        }

        // Clean up physical juice state on phase transitions
        scene.shake = 0
        scene.container.x = scene.baseX
        scene.container.y = scene.baseY
        scene.particles = []
        scene.particleContainer.removeChildren()
        scene.ball.scale.set(1, 1)

        let showResult = ['result', 'end', 'review'].includes(currentPhase)
        scene.bumpers.visible = ['bumperView', 'result', 'end', 'review'].includes(currentPhase)
        scene.startArrow.visible = ['guess', 'result', 'end', 'review'].includes(currentPhase)
        scene.trail.visible = showResult
        scene.ball.visible = showResult
        scene.errorDisk.visible = false
        scene.successDisk.visible = false
        if (currentPhase === 'end' || currentPhase === 'review') {
          scene.journey = game.trail.length
          scene.trail.children.forEach((child) => (child.visible = true))
          let target = game.trail[game.trail.length - 1]
          scene.ball.x = (target.x + 0.5) * scene.layout.side
          scene.ball.y = (target.y + 0.5) * scene.layout.side
          scene.bumpers.children.forEach((bumper) => (bumper.visible = true))
          if (currentGuess) {
            let victory = target.x === currentGuess.x && target.y === currentGuess.y
            let disk = victory ? scene.successDisk : scene.errorDisk
            disk.x = scene.layout.side * (currentGuess.x + 0.5)
            disk.y = scene.layout.side * (currentGuess.y + 0.5)
            disk.visible = true
          }
        } else if (currentPhase === 'result') {
          scene.journey = 0
          scene.bumpers.children.forEach((bumper) => (bumper.visible = false))
          scene.trail.children.forEach((child) => (child.visible = false))
          scene.animate = (ticker) => {
            scene.journey += (ticker.elapsedMS * 0.006 * config.ballSpeed) / 100
            scene.glowTime += ticker.elapsedMS

            let finalMarkIndex = game.trail.length - 1
            if (scene.journey >= finalMarkIndex + 0.5) {
              scene.journey = finalMarkIndex + 0.5
              let target = game.trail[finalMarkIndex]
              scene.ball.x = (target.x + 0.5) * scene.layout.side
              scene.ball.y = (target.y + 0.5) * scene.layout.side
              scene.trail.children[finalMarkIndex * 2].visible = true
              scene.app.ticker.remove(scene.animate!)
              scene.animate = undefined
              onResolvedRef.current(target.x === currentGuess?.x && target.y === currentGuess?.y)
              return
            }
            let mark = game.trail[scene.journey | 0]
            if (!mark) {
              scene.app.ticker.remove(scene.animate!)
              scene.animate = undefined
              let target = game.trail[game.trail.length - 1]
              onResolvedRef.current(target.x === currentGuess?.x && target.y === currentGuess?.y)
              return
            }

            // ── Bumper reveal + impact effects ──
            if (scene.journey % 1 >= 0.5 && mark.in !== opposite(mark.out) && !mark.revealed) {
              bellSound.play()
              let bumper = scene.bumperGrid[mark.y - 1][mark.x - 1]
              if (bumper !== 'nothing') {
                bumper.visible = true
                bumper.scale.set(1.5)
              }
              mark.revealed = true
              

              // Spawn soft ripple
              let p = new pixi.Graphics()
              p.circle(0, 0, scene.layout.side * 0.4).stroke({ color: config.bumperColor, width: 2, alpha: 0.5 })
              p.x = scene.ball.x
              p.y = scene.ball.y
              ;(p as any)._vx = 0
              ;(p as any)._vy = 0
              ;(p as any)._life = 1.0
              ;(p as any)._isRipple = true
              scene.particleContainer.addChild(p)
              scene.particles.push(p)
            }

            // ── Smooth cubic ease (ease-in-out) ──
            let prog = scene.journey % 1
            let t = prog < 0.5 ? 4 * prog * prog * prog : 1 - Math.pow(-2 * prog + 2, 3) / 2
            let diff = Math.abs(t - 0.5)

            let direction = prog < 0.5 ? mark.in : mark.out
            let move = moveFromDirection(direction)
            let bx = (mark.x + 0.5 + move.x * diff) * scene.layout.side
            let by = (mark.y + 0.5 + move.y * diff) * scene.layout.side
            scene.ball.x = bx
            scene.ball.y = by

            // ── Squash & stretch ──
            let speed2 = Math.abs(prog - 0.5) * 2
            let stretch = 1.0 + (1 - speed2) * 0.18
            let squash = 1.0 - (1 - speed2) * 0.12
            if (move.x !== 0) {
              scene.ball.scale.set(stretch, squash)
            } else {
              scene.ball.scale.set(squash, stretch)
            }



            // ── Bumper scale decay ──
            let bumperAtMark = scene.bumperGrid[mark.y - 1]?.[mark.x - 1]
            if (bumperAtMark !== 'nothing' && bumperAtMark && bumperAtMark.scale.x > 1.0) {
              bumperAtMark.scale.x = Math.max(1.0, bumperAtMark.scale.x - ticker.elapsedMS * 0.004)
              bumperAtMark.scale.y = Math.max(1.0, bumperAtMark.scale.y - ticker.elapsedMS * 0.004)
            }

            // ── Update particles ──
            scene.particles = scene.particles.filter((p) => {
              ;(p as any)._life -= ticker.elapsedMS * 0.002
              if ((p as any)._life <= 0) {
                scene.particleContainer.removeChild(p)
                return false
              }
              if ((p as any)._isRipple) {
                let scale = 1.0 + (1.0 - (p as any)._life) * 1.5
                p.scale.set(scale)
                p.alpha = (p as any)._life
              }
              return true
            })



            // ── Trail dots ──
            if (scene.journey % 1 >= 0.25) {
              scene.trail.children[(scene.journey | 0) * 2].visible = true
            }
            if (scene.journey % 1 >= 0.75) {
              scene.trail.children[(scene.journey | 0) * 2 + 1].visible = true
            }
          }
          scene.app.ticker.add(scene.animate)
        }
      }
      applySceneRef.current()
    }

    initialize()
    return () => {
      cancelled = true
      window.removeEventListener('resize', resize)
      if (sceneRef.current?.app === app) {
        sceneRef.current = undefined
      }
      try { app.destroy(true) } catch (e) {}
    }
  }, [config, game])

  useEffect(() => applySceneRef.current(), [phase, guess])

  return <div ref={host} className="h-full w-full" />
}
