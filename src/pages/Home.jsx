import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Spade, Users, History } from 'lucide-react'
import { getPlayerName, savePlayerName } from '../lib/session'

export default function Home() {
  const navigate = useNavigate()
  const [playerName, setPlayerName] = useState('')

  useEffect(() => {
    // Cargar nombre guardado
    const saved = getPlayerName()
    if (saved) {
      setPlayerName(saved)
    }
  }, [])

  const handleCreateGame = () => {
    if (!playerName.trim()) {
      alert('Por favor ingresá tu nombre')
      return
    }

    if (playerName.length > 30) {
      alert('El nombre debe tener máximo 30 caracteres')
      return
    }

    savePlayerName(playerName.trim())
    navigate('/create')
  }

  const handleJoinGame = () => {
    if (!playerName.trim()) {
      alert('Por favor ingresá tu nombre')
      return
    }

    if (playerName.length > 30) {
      alert('El nombre debe tener máximo 30 caracteres')
      return
    }

    savePlayerName(playerName.trim())
    navigate('/join')
  }

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-gradient-to-br from-casino-green to-emerald-600 p-6 rounded-3xl shadow-2xl">
              <Spade className="w-16 h-16 text-white" strokeWidth={1.5} />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white tracking-tight">
            Loba Score
          </h1>
          <p className="text-gray-400 text-lg">
            Contador de puntajes en tiempo real
          </p>
        </div>

        {/* Input nombre */}
        <div className="card space-y-3">
          <label htmlFor="playerName" className="block text-sm font-medium text-gray-300">
            Tu nombre
          </label>
          <input
            id="playerName"
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Ingresá tu nombre"
            maxLength={30}
            className="input-field"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCreateGame()
              }
            }}
          />
          <p className="text-xs text-gray-500">
            Máximo 30 caracteres
          </p>
        </div>

        {/* Botones principales */}
        <div className="space-y-3">
          <button
            onClick={handleCreateGame}
            className="btn-primary w-full flex items-center justify-center gap-3"
            disabled={!playerName.trim()}
          >
            <Users className="w-5 h-5" />
            Crear partida
          </button>

          <button
            onClick={handleJoinGame}
            className="btn-secondary w-full flex items-center justify-center gap-3"
            disabled={!playerName.trim()}
          >
            <Spade className="w-5 h-5" />
            Unirse a partida
          </button>
        </div>

        {/* Link historial */}
        <div className="text-center">
          <button
            onClick={() => navigate('/history')}
            className="text-gray-400 hover:text-casino-green transition-colors flex items-center justify-center gap-2 mx-auto"
          >
            <History className="w-4 h-4" />
            Ver historial
          </button>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-600 pt-8">
          <p>La Loba · Se juega a 100 puntos · El primero en llegar pierde</p>
        </div>
      </div>
    </div>
  )
}
