import { ReactNode } from 'react'
import { useNavigation } from './NavigationContext'

export function AppShell({ children }: { children: ReactNode }) {
  const { screen, navigate } = useNavigation()

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-300">
      {screen !== 'game' && (
        <header className="px-6 py-5 bg-surface/80 backdrop-blur-md flex justify-between items-center z-50 sticky top-0 shadow-sm">
          <h1 className="font-extrabold tracking-tight text-2xl cursor-pointer text-primary" onClick={() => navigate('home')}>
            Recall
          </h1>
          <nav className="flex gap-6 text-sm font-semibold text-muted">
            <button className="hover:text-primary transition-colors" onClick={() => navigate('home')}>Home</button>
            <button className="hover:text-primary transition-colors" onClick={() => navigate('levelSelect')}>Levels</button>
            <button className="hover:text-primary transition-colors" onClick={() => navigate('profile')}>Profile</button>
          </nav>
        </header>
      )}
      <main className="flex-1 relative w-full max-w-4xl mx-auto">
        {children}
      </main>
    </div>
  )
}
