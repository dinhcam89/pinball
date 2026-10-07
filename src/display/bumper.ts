import * as pixi from 'pixi.js'
import { PinballConfig } from '../config/config'
import { LayoutInfo } from './layout'

function drawBumper(direction: BumperDirection, color: number, layout: LayoutInfo) {
  let { bumperWidth, bumperHeight, side } = layout

  let g = new pixi.Container() as pixi.Container & pixi.Graphics

  // Outer glow
  let glow = new pixi.Graphics()
  glow.roundRect(-bumperWidth / 2 - 4, -bumperHeight / 2 - 4, bumperWidth + 8, bumperHeight + 8, side / 6)
    .fill({ color, alpha: 0.3 })

  // Core bumper
  let core = new pixi.Graphics()
  core.roundRect(-bumperWidth / 2, -bumperHeight / 2, bumperWidth, bumperHeight, side / 8)
    .fill(color)
    .stroke({ width: side / 14, color: 0xffffff, alpha: 0.6 })

  g.addChild(glow, core)
  g.rotation = Math.PI / 4
  if (direction === 'diagonalUp') {
    g.rotation *= -1
  }
  g.x = side / 2
  g.y = side / 2
  return g
}

export function drawBumperContainerAndFillGrid(
  config: PinballConfig,
  layout: LayoutInfo,
  bumperArray: Bumper[],
  bumperGrid: (pixi.Container | 'nothing')[][],
) {
  let c = new pixi.Container()

  bumperArray.forEach((bumper) => {
    let g = drawBumper(bumper.direction, config.bumperColor, layout)
    g.x += layout.side * (bumper.x + 1)
    g.y += layout.side * (bumper.y + 1)
    c.addChild(g)
    bumperGrid[bumper.y][bumper.x] = g
  })

  return c
}
