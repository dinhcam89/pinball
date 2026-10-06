import * as Switch from '@radix-ui/react-switch'
import { useEffect, useMemo, useState } from 'react'
import seedrandom from 'seedrandom'
import { errorSound, successSound } from '../../audio/sound'
import { getConfig, PinballConfig } from '../../config/config'
import { startNewSession, updateConfigHash } from '../../config/locationHash'
import { createGame } from '../../logic/game'
import { resolveRound } from '../../logic/round'
import { BoardCanvas } from '../BoardCanvas'
import { SettingsDialog, SettingsValues } from '../SettingsDialog'

let repositoryUrl = 'https://github.com/mathieucaroff/open-pinball-recall'

function newSeed() {
  return Math.random().toString(36).slice(2).toUpperCase()
}

function toSettings(config: PinballConfig): SettingsValues {
  return {
    size: config.size,
    bumperCount: config.bumperCount,
    baseBumperViewTimeMs: config.baseBumperViewTimeMs,
    perBumperViewTimeMs: config.perBumperViewTimeMs,
    ballSpeed: config.ballSpeed,
    roundCount: config.roundCount,
    practiceMode: config.practiceMode,
    seed: config.seed,
    pauseAfterSuccess: config.pauseAfterSuccess,
    pauseAfterFailure: config.pauseAfterFailure,
  }
}

import { useNavigation } from '../NavigationContext'

export function GameScreen() {
  const { navigate } = useNavigation()
  let [config, setConfig] = useState(() => getConfig(window.location))
  let [phase, setPhase] = useState<Phase>('bumperView')
  let [guess, setGuess] = useState<Position>()
  let [victory, setVictory] = useState<boolean>()
  let game = useMemo(() => createGame(config, seedrandom(config.seed), false), [config])

  useEffect(() => {
    let listener = () => setConfig(getConfig(window.location))
    window.addEventListener('hashchange', listener)
    return () => window.removeEventListener('hashchange', listener)
  }, [])

  useEffect(() => {
    if (phase !== 'bumperView') return
    let timeout = window.setTimeout(
      () => setPhase('guess'),
      config.baseBumperViewTimeMs + config.perBumperViewTimeMs * config.bumperCount,
    )
    return () => window.clearTimeout(timeout)
  }, [phase, config])

  let start = () => {
    setGuess(undefined)
    setVictory(undefined)
    setPhase('bumperView')
  }

  let startNewGame = () => {
    if (!config.practiceMode) {
      updateConfigHash(window.location, {
        remaining: config.roundCount,
        score: 0,
        seed: newSeed(),
      })
      setConfig(getConfig(window.location))
    }
    start()
  }

  let applySettings = (settings: SettingsValues) => {
    startNewSession(window.location, {
      ...settings,
      bumperCount: Math.min(settings.bumperCount, settings.size ** 2),
      seed: settings.seed || newSeed(),
    })
    setPhase('introduction')
  }

  let advance = () => {
    if (victory === undefined) return
    if (config.practiceMode) {
      updateConfigHash(window.location, {
        successCount: config.successCount + (victory ? 1 : 0),
        failureCount: config.failureCount + (victory ? 0 : 1),
        seed: newSeed(),
      })
      start()
      return
    }
    let progress = resolveRound(config, victory)
    if (progress.isGameOver) {
      updateConfigHash(window.location, {
        remaining: progress.remaining,
        score: progress.score,
      })
      navigate('result')
      return
    }
    updateConfigHash(window.location, {
      size: progress.size,
      bumperCount: progress.bumperCount,
      remaining: progress.remaining,
      score: progress.score,
      seed: newSeed(),
    })
    start()
  }

  let finish = (nextVictory: boolean) => {
    if (phase !== 'result') return
    setVictory(nextVictory)
    nextVictory ? successSound.play() : errorSound.play()
    setPhase(
      nextVictory && !config.pauseAfterSuccess ? 'resultEnd' : nextVictory ? 'end' : 'review',
    )
  }

  useEffect(() => {
    if (phase !== 'resultEnd') return
    let timeout = window.setTimeout(advance, 1000)
    return () => window.clearTimeout(timeout)
  }, [phase, victory, config])

  let attempts = config.successCount + config.failureCount
  let round = config.roundCount - config.remaining + 1

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="absolute inset-0">
        <BoardCanvas
          config={config}
          game={game}
          phase={phase === 'resultEnd' ? 'end' : phase}
          guess={guess}
          onGuess={(position: Position) => {
            if (phase === 'guess') {
              setGuess(position)
              setPhase('result')
            }
          }}
          onResolved={finish}
        />
      </div>
      {!['introduction', 'score', 'playAgain'].includes(phase) && (
        <header className="pointer-events-none fixed left-4 right-16 top-4 z-10 flex justify-between items-start text-center text-xs font-semibold sm:text-sm">
          <div className="flex gap-2">
            <button 
              className="pointer-events-auto rounded-full bg-surface/90 px-4 py-2 text-foreground shadow-sm backdrop-blur transition-all active:scale-95 hover:bg-gray-50 flex items-center gap-2"
              onClick={() => navigate('home')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              Home
            </button>
            {!config.practiceMode && (
              <div className="rounded-full bg-surface/90 px-4 py-2 text-foreground shadow-sm backdrop-blur flex items-center justify-center">
                Round {config.successCount + config.failureCount + 1}
              </div>
            )}
          </div>

          {config.practiceMode ? (
            <>
              <div className="rounded bg-error/90 px-4 py-2 text-error-foreground shadow-sm rounded-full">
                <div>Misses</div>
                <div>
                  {config.failureCount} / {attempts}
                </div>
              </div>
              <div className="rounded bg-success/90 px-4 py-2 text-success-foreground shadow-sm rounded-full">
                <div>Hits</div>
                <div>
                  {config.successCount} / {attempts}
                </div>
              </div>
            </>
          ) : (
            <>
              
              <div className="rounded bg-surface/90 px-4 py-2 text-foreground shadow-sm rounded-full backdrop-blur">
                Score {config.score}
              </div>
            </>
          )}
        </header>
      )}

      

      {phase === 'review' && (
        <section className="fixed inset-x-4 bottom-5 z-10 flex items-center justify-center gap-4 rounded-md bg-surface/90 p-4 shadow-soft rounded-2xl backdrop-blur-sm">
          <strong className="text-error-foreground">Incorrect</strong>
          <button
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
            onClick={advance}
          >
            Next round
          </button>
        </section>
      )}
      {phase === 'end' && victory && (
        <section className="fixed inset-x-4 bottom-5 z-10 text-center">
          <button
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
            onClick={advance}
          >
            Next round
          </button>
        </section>
      )}
      
    </main>
  )
}
