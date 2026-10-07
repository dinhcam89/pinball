import * as pixi from 'pixi.js'
import { PinballConfig } from '../config/config'
import { LayoutInfo } from './layout'

export function drawBall(config: PinballConfig, layout: LayoutInfo, stand: Game) {
  let g = new pixi.Graphics()

  // Outer glow halo
  g.circle(0, 0, layout.ballRadius * 1.55)
    .fill({ color: config.ballColor, alpha: 0.12 })

  // Mid glow ring
  g.circle(0, 0, layout.ballRadius * 1.25)
    .fill({ color: config.ballColor, alpha: 0.2 })

  // Core ball
  g.circle(0, 0, layout.ballRadius)
    .fill(config.ballColor)
    .stroke({ color: 0xffffff, width: layout.ballStrokeWidth })

  // Inner specular highlight
  g.circle(-layout.ballRadius * 0.25, -layout.ballRadius * 0.25, layout.ballRadius * 0.3)
    .fill({ color: 0xffffff, alpha: 0.5 })

  return g
}
