import * as pixi from 'pixi.js'
import { PinballConfig } from '../config/config'
import { LayoutInfo } from './layout'

export function drawBoard(
  game: Game,
  config: PinballConfig,
  layout: LayoutInfo,
  clickCallback: (position: Position) => void,
) {
  let board = new pixi.Graphics()
  board.rect(0, 0, layout.boardSize, layout.boardSize).fill(config.boardColor)

  let { size } = config
  let size1 = size + 1
  let { side } = layout

  // Indicators
  Array.from({ length: size }, (_, k) => {
    board.addChild(createIndicator(game, config, layout, k + 1, 0, clickCallback))
    board.addChild(createIndicator(game, config, layout, k + 1, size1, clickCallback))
    board.addChild(createIndicator(game, config, layout, 0, k + 1, clickCallback))
    board.addChild(createIndicator(game, config, layout, size1, k + 1, clickCallback))
  })

  // Slates with neon border
  Array.from({ length: size }, (_, ky) => {
    Array.from({ length: size }, (_, kx) => {
      const sx = (kx + 1) * side
      const sy = (ky + 1) * side
      // Slate fill
      board.rect(sx, sy, side - 2, side - 2).fill(config.slateColor)
    })
  })



  return board
}

export function createIndicator(
  game: Game,
  config: PinballConfig,
  layout: LayoutInfo,
  x: number,
  y: number,
  callback: (p: Position) => void,
) {
  let { side, indicatorRadius: radius } = layout

  let g = new pixi.Graphics()

  let drawCircle = (color: number, lit = false) => {
    g.clear()
    if (lit) {
      // Outer glow ring when lit
      g.circle(0, 0, radius * 1.6).fill({ color, alpha: 0.2 })
      g.circle(0, 0, radius * 1.2).fill({ color, alpha: 0.3 })
    }
    g.circle(0, 0, radius)
      .fill(color)
      .stroke({ color: config.indicatorStrokeColor, width: layout.indicatorStrokeWidth })
    if (lit) {
      // Inner specular
      g.circle(-radius * 0.2, -radius * 0.2, radius * 0.25).fill({ color: 0xffffff, alpha: 0.6 })
    }
  }

  drawCircle(config.indicatorColor)
  g.x = Math.floor(side / 2) + x * side
  g.y = Math.floor(side / 2) + y * side

  g.eventMode = 'static'
  g.hitArea = new pixi.Circle(0, 0, radius)

  g.on('mouseover', () => {
    if (game.phase === 'guess') {
      drawCircle(config.indicatorLitColor, true)
    }
  })

  g.on('mouseout', () => {
    if (['result', 'end'].includes(game.phase)) return
    drawCircle(config.indicatorColor)
  })

  g.on('pointerdown', () => {
    if (game.phase === 'guess') {
      drawCircle(config.indicatorLitColor, true)
    }
    callback({ x, y })
  })

  return g
}
