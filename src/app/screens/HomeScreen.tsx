import { useNavigation } from '../NavigationContext'
import { updateConfigHash } from '../../config/locationHash'
import { getConfig } from '../../config/config'
import { newSeed } from '../../config/config'
import * as Switch from '@radix-ui/react-switch'
import { SettingsDialog, SettingsValues } from '../SettingsDialog'
import { startNewSession } from '../../config/locationHash'
import { useState, useEffect } from 'react'

export function HomeScreen() {
  const { navigate } = useNavigation()
  const [config, setConfig] = useState(() => getConfig(window.location))
  const [name, setName] = useState('')

  useEffect(() => {
    setName(localStorage.getItem('playerName') || '')
  }, [])

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
    localStorage.setItem('playerName', e.target.value)
  }

  let startNewGame = () => {
    if (!config.practiceMode) {
      updateConfigHash(window.location, {
        remaining: config.roundCount,
        score: 0,
        seed: newSeed(),
      })
    }
    navigate('game')
  }

  let applySettings = (settings: SettingsValues) => {
    startNewSession(window.location, {
      ...settings,
      bumperCount: Math.min(settings.bumperCount, settings.size ** 2),
      seed: settings.seed || newSeed(),
    })
    setConfig(getConfig(window.location))
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center">
      <div className="w-full max-w-md p-10 bg-surface rounded-3xl shadow-soft">
        <h2 className="text-4xl font-extrabold tracking-tight mb-2 text-foreground">Play Now</h2>
        <p className="text-muted mb-8 text-sm">Memorize the bumpers. Predict the exit.</p>
        
        <div className="mb-6">
          <input 
            type="text" 
            value={name} 
            onChange={handleNameChange} 
            className="w-full bg-background border border-gray-200 rounded-full px-4 py-3 text-foreground outline-none focus:border-primary transition-colors text-center font-semibold"
            placeholder="Enter your name"
          />
        </div>
        
        <button
          className="w-full rounded-full bg-primary px-6 py-4 font-bold text-lg text-primary-foreground hover:bg-primary-hover shadow-md transition-all active:scale-95 mb-6"
          onClick={startNewGame}
        >
          Start Game
        </button>

        <div className="flex justify-center items-center gap-4 text-sm font-medium text-muted mt-8 mb-6 bg-background rounded-2xl p-4 shadow-inner-soft">
          <label className="flex items-center gap-3 cursor-pointer">
            <Switch.Root
              className="relative h-7 w-12 rounded-full bg-slate-300 outline-none data-[state=checked]:bg-primary transition-colors"
              checked={config.practiceMode}
              onCheckedChange={(checked) =>
                applySettings({ ...(config as any), practiceMode: checked })
              }
            >
              <Switch.Thumb className="block h-6 w-6 translate-x-0.5 rounded-full bg-surface shadow-sm transition-transform data-[state=checked]:translate-x-5" />
            </Switch.Root>
            Practice mode
          </label>
        </div>
        
        <div className="mt-2">
          <SettingsDialog config={config as any} onApply={applySettings} showSetupTrigger={true} />
        </div>
      </div>
    </div>
  )
}
