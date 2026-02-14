import { Crown, User } from 'lucide-react'

export default function PlayerList({ players, currentPlayerId }) {
  return (
    <div className="space-y-3">
      {players.map((player, index) => (
        <div
          key={player.id}
          className={`card flex items-center justify-between ${
            player.id === currentPlayerId ? 'ring-2 ring-casino-green' : ''
          }`}
        >
          <div className="flex items-center gap-3">
            {/* Ícono jugador */}
            <div className={`p-2 rounded-full ${
              player.is_host ? 'bg-casino-gold/20' : 'bg-gray-700'
            }`}>
              {player.is_host ? (
                <Crown className="w-5 h-5 text-casino-gold" />
              ) : (
                <User className="w-5 h-5 text-gray-300" />
              )}
            </div>

            {/* Nombre */}
            <div>
              <p className="text-white font-medium">
                {player.name}
                {player.id === currentPlayerId && (
                  <span className="text-casino-green text-sm ml-2">(Vos)</span>
                )}
              </p>
              {player.is_host && (
                <p className="text-xs text-casino-gold">Anfitrión</p>
              )}
            </div>
          </div>

          {/* Número de jugador */}
          <div className="text-gray-500 font-mono text-sm">
            #{index + 1}
          </div>
        </div>
      ))}
    </div>
  )
}
