import { useNavigation } from '../NavigationContext'
import { useState, useEffect } from 'react'

export function ProfileScreen() {
  const { navigate } = useNavigation()
  const [name, setName] = useState('')

  useEffect(() => {
    setName(localStorage.getItem('playerName') || 'Player 1')
  }, [])

  const handleSave = () => {
    localStorage.setItem('playerName', name)
    navigate('home')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center">
      <div className="w-full max-w-md p-10 bg-surface rounded-3xl shadow-soft">
        <div className="mx-auto flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6 border-4 border-surface shadow-sm text-3xl font-bold text-muted uppercase">
          {name ? name.substring(0, 1) : '?'}
        </div>
        <h2 className="text-3xl font-extrabold mb-4 text-foreground">Player Profile</h2>
        
        <div className="text-left mb-8">
          <label className="block text-sm font-semibold text-muted mb-2">Display Name</label>
          <input 
            type="text" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            className="w-full bg-background border border-gray-200 rounded-full px-4 py-3 text-foreground outline-none focus:border-primary transition-colors"
            placeholder="Enter your name"
          />
        </div>

        <button
          className="w-full rounded-full bg-primary px-8 py-4 font-bold text-primary-foreground hover:bg-primary-hover shadow-md transition-all active:scale-95"
          onClick={handleSave}
        >
          Save & Return
        </button>
      </div>
    </div>
  )
}
