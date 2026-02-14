import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Users, Play, Loader2, Copy, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { getSessionId } from '../lib/session'
import { usePlayersRealtime, useGameRealtime } from '../hooks/useRealtime'
import PlayerList from '../components/PlayerList'

export default function Lobby() {
  const navigate = useNavigate()
  const { gameId } = useParams()

  const [game, setGame] = useState(null)
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [startingGame, setStartingGame] = useState(false)
  const [copied, setCopied] = useState(false)

  const sessionId = getSessionId()
  const currentPlayer = players.find(p => p.session_id === sessionId)
  const isHost = currentPlayer?.is_host || false

  // Cargar datos iniciales
  useEffect(() => {
    loadGameData()
  }, [gameId])

  const loadGameData = async () => {
    try {
      setLoading(true)

      // Cargar partida
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single()

      if (gameError || !gameData) {
        alert('Partida no encontrada')
        navigate('/')
        return
      }

      // Si la partida ya empezó, redirigir al juego
      if (gameData.status === 'playing') {
        navigate(`/game/${gameId}`)
        return
      }

      setGame(gameData)

      // Cargar jugadores
      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select('*')
        .eq('game_id', gameId)
        .order('joined_at', { ascending: true })

      if (playersError) {
        console.error('Error loading players:', playersError)
      } else {
        setPlayers(playersData || [])
      }

    } catch (error) {
      console.error('Error loading lobby:', error)
      alert('Error al cargar la sala')
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  // Realtime: jugadores
  usePlayersRealtime(gameId, async (payload) => {
    console.log('Players update:', payload)

    // Recargar jugadores
    const { data } = await supabase
      .from('players')
      .select('*')
      .eq('game_id', gameId)
      .order('joined_at', { ascending: true })

    if (data) {
      setPlayers(data)
    }
  })

  // Realtime: partida (para detectar cuando inicia)
  useGameRealtime(gameId, async (payload) => {
    console.log('Game update:', payload)

    if (payload.new?.status === 'playing') {
      navigate(`/game/${gameId}`)
    }
  })

  const startGame = async () => {
    console.log('🎮 Starting game...', { isHost, playersCount: players.length, gameId })

    if (!isHost) {
      console.log('❌ Not host, aborting')
      return
    }

    if (players.length < 2) {
      alert('Se necesitan al menos 2 jugadores para iniciar')
      return
    }

    try {
      setStartingGame(true)
      console.log('⏳ Updating game status...')

      // Actualizar estado de la partida
      const { error, data } = await supabase
        .from('games')
        .update({
          status: 'playing',
          current_round: 1,
        })
        .eq('id', gameId)
        .select()

      console.log('📊 Update result:', { error, data })

      if (error) {
        console.error('❌ Error starting game:', error)
        alert('Error al iniciar la partida: ' + error.message)
        setStartingGame(false)
        return
      }

      // El host navega inmediatamente (los demás por Realtime)
      console.log('✅ Navigating to game...')
      navigate(`/game/${gameId}`)
      console.log('✅ Navigate called')
    } catch (error) {
      console.error('❌ Unexpected error:', error)
      alert('Error inesperado al iniciar la partida: ' + error.message)
      setStartingGame(false)
    }
  }

  const copyCode = () => {
    if (game?.code) {
      navigator.clipboard.writeText(game.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-casino-green animate-spin mx-auto" />
          <p className="text-gray-400">Cargando sala...</p>
        </div>
      </div>
    )
  }

  const canStart = players.length >= 2 && players.length <= 8

  return (
    <div className="min-h-screen bg-dark-bg p-6 pb-24">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="bg-casino-green/20 p-4 rounded-2xl">
              <Users className="w-10 h-10 text-casino-green" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">
            Sala de espera
          </h1>
          {game && (
            <div className="flex items-center justify-center gap-2">
              <p className="text-gray-400">Código:</p>
              <button
                onClick={copyCode}
                className="bg-dark-card px-4 py-2 rounded-lg font-mono text-casino-green font-bold tracking-wider hover:bg-gray-800 transition-colors flex items-center gap-2"
              >
                {game.code}
                <Copy className="w-4 h-4" />
              </button>
              {copied && (
                <span className="text-sm text-green-400">¡Copiado!</span>
              )}
            </div>
          )}
        </div>

        {/* Info jugadores */}
        <div className="card">
          <div className="flex items-center justify-between">
            <p className="text-gray-300">
              Jugadores: {players.length}/8
            </p>
            <div className="flex gap-1">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i < players.length ? 'bg-casino-green' : 'bg-gray-700'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Lista de jugadores */}
        <div>
          <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-casino-green" />
            Jugadores en la sala
          </h2>
          <PlayerList players={players} currentPlayerId={currentPlayer?.id} />
        </div>

        {/* Alertas */}
        {players.length < 2 && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-400 font-medium">
                Se necesitan al menos 2 jugadores
              </p>
              <p className="text-amber-300/70 text-sm mt-1">
                Compartí el código para que se unan más jugadores
              </p>
            </div>
          </div>
        )}

        {players.length > 8 && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400">
              Máximo 8 jugadores. La partida está llena.
            </p>
          </div>
        )}

        {/* Botón iniciar (solo host) */}
        {isHost && (
          <div className="fixed bottom-6 left-6 right-6 max-w-2xl mx-auto">
            <button
              onClick={startGame}
              disabled={!canStart || startingGame}
              className="btn-primary w-full flex items-center justify-center gap-2 shadow-2xl"
            >
              {startingGame ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Iniciando...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Iniciar partida
                </>
              )}
            </button>
          </div>
        )}

        {/* Mensaje para no-host */}
        {!isHost && (
          <div className="text-center text-gray-500 text-sm">
            Esperando a que el anfitrión inicie la partida...
          </div>
        )}

        {/* Volver */}
        <div className="text-center pt-4">
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            Salir de la sala
          </button>
        </div>
      </div>
    </div>
  )
}
