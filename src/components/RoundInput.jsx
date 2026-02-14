import { useState } from 'react'
import { Calculator, Grid3x3 } from 'lucide-react'
import CardSelector from './CardSelector'

export default function RoundInput({ onSubmit, disabled, playerName }) {
  const [mode, setMode] = useState('quick') // 'quick' o 'direct'
  const [directValue, setDirectValue] = useState('')

  const handleCardSelectorConfirm = (total, cards) => {
    if (onSubmit) {
      onSubmit(total, cards)
    }
  }

  const handleDirectSubmit = () => {
    const value = parseInt(directValue, 10)
    if (isNaN(value) || value < 0) {
      alert('Ingresá un puntaje válido')
      return
    }

    if (onSubmit) {
      onSubmit(value, null)
    }
    setDirectValue('')
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center space-y-1">
        <h3 className="text-white font-semibold">
          Ingresá tu puntaje
        </h3>
        {playerName && (
          <p className="text-sm text-gray-400">
            Jugador: {playerName}
          </p>
        )}
      </div>

      {/* Selector de modo */}
      <div className="flex gap-2 p-1 bg-dark-card rounded-lg">
        <button
          onClick={() => setMode('quick')}
          className={`flex-1 py-2 px-4 rounded-md transition-all flex items-center justify-center gap-2 ${
            mode === 'quick'
              ? 'bg-casino-green text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Grid3x3 className="w-4 h-4" />
          Modo rápido
        </button>
        <button
          onClick={() => setMode('direct')}
          className={`flex-1 py-2 px-4 rounded-md transition-all flex items-center justify-center gap-2 ${
            mode === 'direct'
              ? 'bg-casino-green text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Calculator className="w-4 h-4" />
          Modo directo
        </button>
      </div>

      {/* Contenido según modo */}
      {mode === 'quick' ? (
        <CardSelector onConfirm={handleCardSelectorConfirm} disabled={disabled} />
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm text-gray-400">
              Ingresá el puntaje total
            </label>
            <input
              type="number"
              value={directValue}
              onChange={(e) => setDirectValue(e.target.value)}
              placeholder="0"
              min="0"
              className="input-field text-center text-2xl"
              disabled={disabled}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleDirectSubmit()
                }
              }}
            />
          </div>
          <button
            onClick={handleDirectSubmit}
            disabled={disabled || !directValue}
            className="btn-primary w-full"
          >
            Confirmar
          </button>
        </div>
      )}
    </div>
  )
}
