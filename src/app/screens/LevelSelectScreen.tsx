import { useNavigation } from '../NavigationContext'

export function LevelSelectScreen() {
  const { navigate } = useNavigation()

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center">
      <div className="w-full max-w-md p-10 bg-surface rounded-3xl shadow-soft">
        <h2 className="text-3xl font-extrabold mb-4 text-foreground">Level Select</h2>
        <p className="text-muted mb-8 leading-relaxed">
          The level progression system is coming in the next phase! 
          For now, use the Home screen to play procedurally generated boards.
        </p>
        <button
          className="rounded-full bg-primary px-8 py-3 font-bold text-primary-foreground hover:bg-primary-hover shadow-md transition-all active:scale-95"
          onClick={() => navigate('home')}
        >
          Return Home
        </button>
      </div>
    </div>
  )
}
