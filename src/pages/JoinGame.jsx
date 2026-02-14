import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { LogIn, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { getSessionId, getPlayerName } from '../lib/session'

export default function JoinGame() {
  const navigate = useNavigate()
  const { code: urlCode } = useParams()

  const [code, setCode] = useState(urlCode?.toUpperCase() || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Si vienen de un link con código, auto-rellenar
    if (urlCode) {
      setCode(urlCode.toUpperCase())
    }
  }, [urlCode])

  const handleJoinGame = async () => {
    if (!code.trim()) {
      setError('Ingresá el código de la partida')
      return
    }

    if (code.length !== 6) {
      setError('El código debe tener 6 caracteres')
      return
    }

    const playerName = getPlayerName()
    if (!playerName) {
      navigate('/')
      return
    }

    try {
      setLoading(true)
      setError('')

      // Buscar partida por código
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .select('*')
        .eq('code', code.toUpperCase())
        .single()

      if (gameError || !gameData) {
        setError('Partida no encontrada. Verificá el código.')
        setLoading(false)
        return
      }

      // Verificar que la partida no haya empezado
      if (gameData.status !== 'waiting') {
        setError('Esta partida ya comenzó')
        setLoading(false)
        return
      }

      const sessionId = getSessionId()

      // Verificar si el jugador ya está en la partida
      const { data: existingPlayer } = await supabase
        .from('players')
        .select('*')
        .eq('game_id', gameData.id)
        .eq('session_id', sessionId)
        .single()

      if (existingPlayer) {
        // Ya está en la partida, solo redirigir
        navigate(`/lobby/${gameData.id}`)
        return
      }

      // Contar jugadores actuales
      const { data: players, error: countError } = await supabase
        .from('players')
        .select('id')
        .eq('game_id', gameData.id)

      if (countError) {
        setError('Error al verificar jugadores')
        setLoading(false)
        return
      }

      // Verificar máximo de jugadores (8)
      if (players.length >= 8) {
        setError('La partida está llena (máximo 8 jugadores)')
        setLoading(false)
        return
      }

      // Crear jugador
      const { error: playerError } = await supabase
        .from('players')
        .insert({
          game_id: gameData.id,
          name: playerName,
          session_id: sessionId,
          is_host: false,
          total_score: 0,
        })

      if (playerError) {
        console.error('Error joining game:', playerError)
        setError('Error al unirse a la partida')
        setLoading(false)
        return
      }

      // Redirigir a lobby
      navigate(`/lobby/${gameData.id}`)

    } catch (error) {
      console.error('Unexpected error:', error)
      setError('Error inesperado. Por favor intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleCodeChange = (value) => {
    // Solo permitir alfanuméricos, convertir a mayúsculas, máximo 6
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
    setCode(cleaned)
    setError('')
  }

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="bg-casino-gold/20 p-4 rounded-2xl">
              <LogIn className="w-10 h-10 text-casino-gold" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">
            Unirse a partida
          </h1>
          <p className="text-gray-400">
            Ingresá el código de 6 caracteres
          </p>
        </div>

        {/* Input código */}
        <div className="card space-y-4">
          <div className="space-y-2">
            <label htmlFor="gameCode" className="block text-sm font-medium text-gray-300">
              Código de partida
            </label>
            <input
              id="gameCode"
              type="text"
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              placeholder="ABC123"
              maxLength={6}
              className="input-field text-center text-2xl font-mono tracking-widest uppercase"
              autoFocus
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleJoinGame()
                }
              }}
            />
            <p className="text-xs text-gray-500">
              Ingresá el código sin espacios
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Botón unirse */}
          <button
            onClick={handleJoinGame}
            disabled={loading || code.length !== 6}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Uniéndose...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Unirse a partida
              </>
            )}
          </button>
        </div>

        {/* Volver */}
        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white transition-colors"
            disabled={loading}
          >
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  )
}
