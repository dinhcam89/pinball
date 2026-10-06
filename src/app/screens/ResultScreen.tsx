import { useNavigation } from '../NavigationContext'
import { getConfig } from '../../config/config'

export function ResultScreen() {
  const { navigate } = useNavigation()
  const config = getConfig(window.location)

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center">
      <div className="w-full max-w-md p-10 bg-surface rounded-3xl shadow-soft">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/30 text-success-foreground mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h2 className="text-3xl font-extrabold text-foreground mb-2">Round Complete</h2>
        <p className="text-sm font-semibold text-muted tracking-wide uppercase mb-6">Final Score</p>
        
        <div className="text-7xl font-black text-primary mb-10 tracking-tighter">
          {config.score}
        </div>

        <div className="flex flex-col gap-4">
          <button
            className="w-full rounded-full bg-primary px-6 py-4 font-bold text-primary-foreground hover:bg-primary-hover shadow-md transition-all active:scale-95"
            onClick={() => navigate('home')}
          >
            Play Again
          </button>
          <button
            className="w-full rounded-full bg-background px-6 py-4 font-bold text-foreground hover:bg-gray-100 transition-colors"
            onClick={() => navigate('levelSelect')}
          >
            Level Select
          </button>
        </div>
      </div>
    </div>
  )
}
