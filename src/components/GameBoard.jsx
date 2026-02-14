import { Trophy, Crown } from 'lucide-react'
import { getRanking, getAlertLevel } from '../lib/gameLogic'

export default function GameBoard({ players, currentRound, currentPlayerId }) {
  const ranking = getRanking(players)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-white font-bold text-xl flex items-center gap-2">
          <Trophy className="w-5 h-5 text-casino-gold" />
          Tabla de puntajes
        </h2>
        <div className="bg-dark-card px-4 py-2 rounded-lg">
          <span className="text-gray-400 text-sm">Ronda</span>
          <span className="text-casino-green font-bold ml-2 text-lg">
            {currentRound}
          </span>
        </div>
      </div>

      {/* Tabla */}
      <div className="space-y-2">
        {ranking.map((player, index) => {
          const isCurrentPlayer = player.id === currentPlayerId
          const alertLevel = getAlertLevel(player.total_score, player.is_eliminated)
          const isWarning = alertLevel === 'warning'
          const isCritical = alertLevel === 'critical' || alertLevel === 'game-over'
          const isEliminated = player.is_eliminated

          return (
            <div
              key={player.id}
              className={`card flex items-center gap-4 ${
                isCurrentPlayer ? 'ring-2 ring-casino-green' : ''
              } ${
                isEliminated
                  ? 'opacity-50 bg-gray-800/50 border-gray-700'
                  : isCritical
                  ? 'bg-red-500/10 border-red-500/30'
                  : isWarning
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : ''
              }`}
            >
              {/* Posición */}
              <div className="flex items-center justify-center w-8 h-8">
                {isEliminated ? (
                  <span className="text-red-400">💀</span>
                ) : index === 0 && player.total_score < 100 ? (
                  <Crown className="w-6 h-6 text-casino-gold" />
                ) : (
                  <span className="text-gray-500 font-bold">#{index + 1}</span>
                )}
              </div>

              {/* Nombre */}
              <div className="flex-1 min-w-0">
                <p className={`font-medium truncate ${isEliminated ? 'text-gray-500 line-through' : 'text-white'}`}>
                  {player.name}
                  {isCurrentPlayer && (
                    <span className="text-casino-green text-xs ml-2">(Vos)</span>
                  )}
                </p>
                {isEliminated ? (
                  <p className="text-xs text-red-400">Eliminado</p>
                ) : player.is_host && (
                  <p className="text-xs text-gray-500">Anfitrión</p>
                )}
              </div>

              {/* Puntajes */}
              <div className="text-right">
                <p className={`text-2xl font-bold ${
                  player.total_score >= 100
                    ? 'text-red-400'
                    : player.total_score >= 90
                    ? 'text-amber-400'
                    : 'text-white'
                }`}>
                  {player.total_score}
                </p>
                {/* Aquí podríamos mostrar el último puntaje si lo guardamos */}
              </div>
            </div>
          )
        })}
      </div>

      {/* Leyenda */}
      <div className="text-center text-xs text-gray-500">
        <p>El objetivo es NO llegar a 100 puntos · Menor puntaje gana</p>
      </div>
    </div>
  )
}
