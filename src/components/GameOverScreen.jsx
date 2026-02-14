import { useEffect } from 'react'
import { Trophy, Home, RotateCcw } from 'lucide-react'
import { getRanking } from '../lib/gameLogic'

const MEDALS = ['🥇', '🥈', '🥉']

export default function GameOverScreen({ players, gameId, onNewGame, onExit }) {
  const ranking = getRanking(players)
  const winner = ranking[0]
  const loser = ranking.find(p => p.total_score >= 100)

  useEffect(() => {
    // Guardar partida en historial
    saveToHistory()
  }, [])

  const saveToHistory = () => {
    try {
      const historyKey = 'lobascoreHistory'
      const existing = JSON.parse(localStorage.getItem(historyKey) || '[]')

      const gameRecord = {
        id: gameId,
        date: new Date().toISOString(),
        players: players.map(p => ({
          name: p.name,
          score: p.total_score,
          isWinner: p.id === winner.id,
          isLoser: p.id === loser?.id,
        })),
        winner: winner.name,
        loser: loser?.name,
      }

      existing.unshift(gameRecord) // Agregar al inicio
      localStorage.setItem(historyKey, JSON.stringify(existing.slice(0, 50))) // Guardar solo últimas 50
    } catch (error) {
      console.error('Error saving to history:', error)
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-6">
        {/* Título */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-gradient-to-br from-casino-gold to-amber-600 p-6 rounded-full shadow-2xl animate-bounce">
              <Trophy className="w-16 h-16 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white">
            ¡Partida terminada!
          </h1>
        </div>

        {/* Ganador destacado */}
        <div className="card bg-gradient-to-br from-casino-green/20 to-emerald-600/20 border-2 border-casino-green">
          <div className="text-center space-y-2">
            <p className="text-casino-gold text-lg font-semibold">
              🏆 Ganador
            </p>
            <p className="text-white text-3xl font-bold">
              {winner.name}
            </p>
            <p className="text-gray-300 text-lg">
              {winner.total_score} puntos
            </p>
          </div>
        </div>

        {/* Ranking completo */}
        <div className="card space-y-3">
          <h3 className="text-white font-semibold text-center mb-2">
            Ranking Final
          </h3>
          {ranking.map((player, index) => (
            <div
              key={player.id}
              className={`flex items-center justify-between p-3 rounded-lg ${
                player.total_score >= 100
                  ? 'bg-red-500/20 border border-red-500/30'
                  : index === 0
                  ? 'bg-casino-gold/10 border border-casino-gold/30'
                  : 'bg-dark-bg'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl w-8 text-center">
                  {MEDALS[index] || `#${index + 1}`}
                </span>
                <div>
                  <p className="text-white font-medium">
                    {player.name}
                  </p>
                  {player.total_score >= 100 && (
                    <p className="text-xs text-red-400">Perdió</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className={`text-xl font-bold ${
                  player.total_score >= 100
                    ? 'text-red-400'
                    : index === 0
                    ? 'text-casino-gold'
                    : 'text-white'
                }`}>
                  {player.total_score}
                </p>
                <p className="text-xs text-gray-500">puntos</p>
              </div>
            </div>
          ))}
        </div>

        {/* Botones */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onExit}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Inicio
          </button>
          <button
            onClick={onNewGame}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Nueva partida
          </button>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-600">
          <p>Esta partida se guardó en el historial</p>
        </div>
      </div>
    </div>
  )
}
