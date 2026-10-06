import { createContext, useContext, useState, ReactNode } from 'react'

export type Screen = 'home' | 'game' | 'result' | 'levelSelect' | 'profile'

interface NavigationState {
  screen: Screen
  navigate: (screen: Screen) => void
}

const NavigationContext = createContext<NavigationState | undefined>(undefined)

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<Screen>('home')
  return (
    <NavigationContext.Provider value={{ screen, navigate: setScreen }}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (!context) throw new Error('useNavigation must be used within NavigationProvider')
  return context
}
