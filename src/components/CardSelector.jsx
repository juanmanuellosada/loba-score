import { useState } from 'react'
import { CARDS, CARD_VALUES } from '../lib/gameLogic'
import { Minus, Plus } from 'lucide-react'

export default function CardSelector({ onConfirm, disabled }) {
  const [selectedCards, setSelectedCards] = useState({})

  const total = Object.entries(selectedCards).reduce((sum, [card, count]) => {
    return sum + (CARD_VALUES[card] * count)
  }, 0)

  const incrementCard = (card) => {
    setSelectedCards(prev => ({
      ...prev,
      [card]: (prev[card] || 0) + 1
    }))
  }

  const decrementCard = (card) => {
    setSelectedCards(prev => {
      const newCount = (prev[card] || 0) - 1
      if (newCount <= 0) {
        const { [card]: _, ...rest } = prev
        return rest
      }
      return {
        ...prev,
        [card]: newCount
      }
    })
  }

  const handleConfirm = () => {
    if (onConfirm) {
      const cardsArray = Object.entries(selectedCards).flatMap(([card, count]) =>
        Array(count).fill(card)
      )
      onConfirm(total, cardsArray)
    }
  }

  const reset = () => {
    setSelectedCards({})
  }

  const handleCut = () => {
    if (onConfirm) {
      onConfirm(0, [])
    }
  }

  return (
    <div className="space-y-4">
      {/* Botón especial "Corté" */}
      <button
        onClick={handleCut}
        disabled={disabled}
        className="btn-primary w-full bg-casino-gold hover:bg-amber-600"
      >
        ✂️ Corté (0 puntos)
      </button>

      {/* Divisor */}
      <div className="flex items-center gap-3 text-gray-500 text-sm">
        <div className="flex-1 border-t border-gray-700"></div>
        <span>O seleccioná tus cartas</span>
        <div className="flex-1 border-t border-gray-700"></div>
      </div>

      {/* Grid de cartas */}
      <div className="grid grid-cols-4 gap-2">
        {CARDS.map(card => (
          <div
            key={card}
            className="card p-3 text-center space-y-2"
          >
            {/* Nombre de la carta */}
            <div className="text-white font-bold text-lg">
              {card}
            </div>

            {/* Valor */}
            <div className="text-gray-400 text-xs">
              {CARD_VALUES[card]} pts
            </div>

            {/* Controles */}
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => decrementCard(card)}
                disabled={!selectedCards[card] || disabled}
                className="bg-dark-bg p-1 rounded disabled:opacity-30"
              >
                <Minus className="w-4 h-4 text-gray-400" />
              </button>

              <span className="text-casino-green font-mono text-lg w-6 text-center">
                {selectedCards[card] || 0}
              </span>

              <button
                onClick={() => incrementCard(card)}
                disabled={disabled}
                className="bg-dark-bg p-1 rounded disabled:opacity-30"
              >
                <Plus className="w-4 h-4 text-casino-green" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="card bg-dark-bg">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Total</span>
          <span className="text-3xl font-bold text-casino-green">
            {total}
          </span>
        </div>
      </div>

      {/* Botones */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={reset}
          disabled={disabled || Object.keys(selectedCards).length === 0}
          className="btn-secondary"
        >
          Limpiar
        </button>
        <button
          onClick={handleConfirm}
          disabled={disabled || total === 0}
          className="btn-primary"
        >
          Confirmar
        </button>
      </div>
    </div>
  )
}
