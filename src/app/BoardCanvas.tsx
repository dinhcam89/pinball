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
  bumperGrid: (pixi.Graphics | 'nothing')[][]
  journey: number
  shake: number
  baseX: number
  baseY: number
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
      container.addChild(board, trail, bumpers, ball, errorDisk, successDisk)
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
        baseX: 0,
        baseY: 0,
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
            if (scene.journey % 1 >= 0.5 && mark.in !== opposite(mark.out) && !mark.revealed) {
              bellSound.play()
              let bumper = scene.bumperGrid[mark.y - 1][mark.x - 1]
              if (bumper !== 'nothing') {
                bumper.visible = true
                // Bumper pulse
                bumper.scale.set(1.4)
              }
              mark.revealed = true
              scene.shake = 150 // 150ms screen shake
            }
            let prog = scene.journey % 1
            // Ease out/in for smooth motion
            let easedProg = prog < 0.5 ? 2 * prog * prog : -1 + (4 - 2 * prog) * prog
            let diff = Math.abs(easedProg - 0.5)
            
            let direction = prog < 0.5 ? mark.in : mark.out
            let move = moveFromDirection(direction)
            scene.ball.x = (mark.x + 0.5 + move.x * diff) * scene.layout.side
            scene.ball.y = (mark.y + 0.5 + move.y * diff) * scene.layout.side
            
            // Ball squash and stretch based on speed
            let speed = Math.abs(prog - 0.5) * 2 // 1 at edges, 0 at center
            let stretch = 1.0 + (1 - speed) * 0.3
            let squash = 1.0 - (1 - speed) * 0.2
            if (move.x !== 0) {
              scene.ball.scale.set(stretch, squash)
            } else {
              scene.ball.scale.set(squash, stretch)
            }
            
            // Screen shake apply
            if (scene.shake > 0) {
              scene.shake -= ticker.elapsedMS
              scene.container.x = scene.baseX + (Math.random() - 0.5) * 8
              scene.container.y = scene.baseY + (Math.random() - 0.5) * 8
            } else {
              scene.container.x = scene.baseX
              scene.container.y = scene.baseY
            }
            
            // Bumper scale recovery
            let bumper = scene.bumperGrid[mark.y - 1]?.[mark.x - 1]
            if (bumper !== 'nothing' && bumper && bumper.scale.x > 1.0) {
                bumper.scale.x = Math.max(1.0, bumper.scale.x - ticker.elapsedMS * 0.002)
                bumper.scale.y = Math.max(1.0, bumper.scale.y - ticker.elapsedMS * 0.002)
            }

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
