import { NavigationProvider, useNavigation } from './NavigationContext'
import { AppShell } from './AppShell'
import { HomeScreen } from './screens/HomeScreen'
import { GameScreen } from './screens/GameScreen'
import { ResultScreen } from './screens/ResultScreen'
import { LevelSelectScreen } from './screens/LevelSelectScreen'
import { ProfileScreen } from './screens/ProfileScreen'

function Router() {
  const { screen } = useNavigation()
  
  switch (screen) {
    case 'home': return <HomeScreen />
    case 'game': return <GameScreen />
    case 'result': return <ResultScreen />
    case 'levelSelect': return <LevelSelectScreen />
    case 'profile': return <ProfileScreen />
    default: return <HomeScreen />
  }
}

export function App() {
  return (
    <NavigationProvider>
      <AppShell>
        <Router />
      </AppShell>
    </NavigationProvider>
  )
}
