import { useEffect } from 'react'
import { AlertTriangle, Skull } from 'lucide-react'
import { getAlertLevel, getAlertMessage } from '../lib/gameLogic'
import { useVibration } from '../hooks/useVibration'

export default function AlertBanner({ players, currentPlayerId }) {
  const { alertWarning, alertCritical } = useVibration()

  const currentPlayer = players.find(p => p.id === currentPlayerId)
  const score = currentPlayer?.total_score || 0
  const level = getAlertLevel(score)
  const message = getAlertMessage(level)

  useEffect(() => {
    // Disparar vibración/sonido al cambiar de nivel
    if (level === 'warning') {
      alertWarning()
    } else if (level === 'critical') {
      alertCritical()
    }
  }, [level, alertWarning, alertCritical])

  if (level === 'safe') {
    return null
  }

  const styles = {
    warning: {
      bg: 'bg-amber-500/20',
      border: 'border-amber-500/50',
      text: 'text-amber-400',
      icon: AlertTriangle,
    },
    critical: {
      bg: 'bg-red-500/30',
      border: 'border-red-500/70',
      text: 'text-red-400',
      icon: Skull,
    },
    'game-over': {
      bg: 'bg-red-600/40',
      border: 'border-red-600',
      text: 'text-red-300',
      icon: Skull,
    },
  }

  const style = styles[level]
  const Icon = style.icon

  return (
    <div
      className={`${style.bg} border-2 ${style.border} rounded-lg p-4 animate-pulse`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`w-6 h-6 ${style.text} flex-shrink-0`} />
        <div className="flex-1">
          <p className={`font-bold ${style.text}`}>
            {message}
          </p>
          <p className="text-sm text-gray-300 mt-1">
            Tu puntaje actual: <span className="font-mono font-bold">{score}</span> puntos
          </p>
        </div>
      </div>
    </div>
  )
}
