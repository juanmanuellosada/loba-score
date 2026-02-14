import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { History as HistoryIcon, Trash2, Trophy, ArrowLeft, Calendar } from 'lucide-react'

export default function History() {
  const navigate = useNavigate()
  const [history, setHistory] = useState([])

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = () => {
    try {
      const historyKey = 'lobascoreHistory'
      const data = JSON.parse(localStorage.getItem(historyKey) || '[]')
      setHistory(data)
    } catch (error) {
      console.error('Error loading history:', error)
      setHistory([])
    }
  }

  const clearHistory = () => {
    if (confirm('¿Estás seguro de que querés borrar todo el historial?')) {
      localStorage.removeItem('lobascoreHistory')
      setHistory([])
    }
  }

  const formatDate = (isoDate) => {
    const date = new Date(isoDate)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) {
      return `Hace ${diffMins} min${diffMins !== 1 ? 's' : ''}`
    } else if (diffHours < 24) {
      return `Hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`
    } else if (diffDays < 7) {
      return `Hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`
    } else {
      return date.toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'short',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      })
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <HistoryIcon className="w-6 h-6 text-casino-green" />
            Historial
          </h1>
          <div className="w-6" /> {/* Spacer */}
        </div>

        {/* Lista de partidas */}
        {history.length === 0 ? (
          <div className="card text-center py-12 space-y-4">
            <HistoryIcon className="w-16 h-16 text-gray-600 mx-auto" />
            <p className="text-gray-400">No hay partidas guardadas</p>
            <button
              onClick={() => navigate('/')}
              className="btn-primary mx-auto"
            >
              Jugar una partida
            </button>
          </div>
        ) : (
          <>
            {/* Contador */}
            <div className="flex items-center justify-between text-sm">
              <p className="text-gray-400">
                {history.length} partida{history.length !== 1 ? 's' : ''} guardada{history.length !== 1 ? 's' : ''}
              </p>
              <button
                onClick={clearHistory}
                className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                Borrar todo
              </button>
            </div>

            {/* Partidas */}
            <div className="space-y-3">
              {history.map((game, index) => (
                <div key={game.id || index} className="card hover:border-casino-green/30 transition-colors">
                  <div className="space-y-3">
                    {/* Header de la partida */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <p className="text-sm text-gray-400">
                          {formatDate(game.date)}
                        </p>
                      </div>
                      <div className="text-xs text-gray-500">
                        {game.players.length} jugadores
                      </div>
                    </div>

                    {/* Ganador */}
                    <div className="bg-casino-green/10 border border-casino-green/30 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Trophy className="w-5 h-5 text-casino-gold" />
                          <span className="text-white font-semibold">
                            {game.winner}
                          </span>
                        </div>
                        <span className="text-casino-green font-bold">
                          {game.players.find(p => p.isWinner)?.score || 0} pts
                        </span>
                      </div>
                    </div>

                    {/* Resto de jugadores */}
                    <div className="space-y-1">
                      {game.players
                        .filter(p => !p.isWinner)
                        .sort((a, b) => a.score - b.score)
                        .map((player, pIndex) => (
                          <div
                            key={pIndex}
                            className={`flex items-center justify-between text-sm py-1 px-2 rounded ${
                              player.isLoser
                                ? 'bg-red-500/10 text-red-400'
                                : 'text-gray-400'
                            }`}
                          >
                            <span>
                              {player.name}
                              {player.isLoser && ' (Perdió)'}
                            </span>
                            <span className="font-mono">
                              {player.score} pts
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
