import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Copy, Share2, Loader2, Users } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { generateGameCode } from '../lib/gameLogic'
import { getSessionId, getPlayerName } from '../lib/session'

export default function CreateGame() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [gameCode, setGameCode] = useState('')
  const [gameId, setGameId] = useState('')
  const [shareUrl, setShareUrl] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    createGame()
  }, [])

  const createGame = async () => {
    try {
      setLoading(true)

      const playerName = getPlayerName()
      if (!playerName) {
        navigate('/')
        return
      }

      const sessionId = getSessionId()
      const code = generateGameCode()

      // Crear partida
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .insert({
          code: code,
          host_id: sessionId,
          status: 'waiting',
          current_round: 0,
        })
        .select()
        .single()

      if (gameError) {
        console.error('Error creating game:', gameError)
        alert('Error al crear la partida. Por favor intentá de nuevo.')
        navigate('/')
        return
      }

      // Crear jugador host
      const { error: playerError } = await supabase
        .from('players')
        .insert({
          game_id: gameData.id,
          name: playerName,
          session_id: sessionId,
          is_host: true,
          total_score: 0,
        })

      if (playerError) {
        console.error('Error creating player:', playerError)
        alert('Error al unirse a la partida. Por favor intentá de nuevo.')
        navigate('/')
        return
      }

      setGameCode(code)
      setGameId(gameData.id)

      // Generar link compartible
      const url = `${window.location.origin}/join/${code}`
      setShareUrl(url)

    } catch (error) {
      console.error('Unexpected error:', error)
      alert('Error inesperado. Por favor intentá de nuevo.')
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const copyCode = () => {
    navigator.clipboard.writeText(gameCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareGame = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Loba Score',
          text: `Unite a mi partida de La Loba! Código: ${gameCode}`,
          url: shareUrl,
        })
      } catch (error) {
        // Si el usuario cancela, no hacer nada
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error)
          copyCode()
        }
      }
    } else {
      // Fallback: copiar al clipboard
      navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const goToLobby = () => {
    navigate(`/lobby/${gameId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-casino-green animate-spin mx-auto" />
          <p className="text-gray-400">Creando partida...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="bg-casino-green/20 p-4 rounded-2xl">
              <Users className="w-10 h-10 text-casino-green" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">
            ¡Partida creada!
          </h1>
          <p className="text-gray-400">
            Compartí el código con tus amigos
          </p>
        </div>

        {/* Código de partida */}
        <div className="card space-y-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-400">Código de partida</p>
            <div className="bg-dark-bg rounded-lg p-6">
              <p className="text-5xl font-bold text-casino-green tracking-widest font-mono">
                {gameCode}
              </p>
            </div>
          </div>

          {/* Botones de compartir */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={copyCode}
              className="btn-secondary flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4" />
              {copied ? '¡Copiado!' : 'Copiar código'}
            </button>

            <button
              onClick={shareGame}
              className="btn-primary flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Compartir
            </button>
          </div>

          {/* URL compartible */}
          <div className="space-y-2">
            <p className="text-xs text-gray-500">O compartí este link:</p>
            <div className="bg-dark-bg rounded-lg p-3">
              <p className="text-xs text-gray-400 break-all font-mono">
                {shareUrl}
              </p>
            </div>
          </div>
        </div>

        {/* Botón continuar */}
        <button
          onClick={goToLobby}
          className="btn-primary w-full"
        >
          Ir a la sala de espera
        </button>

        {/* Info */}
        <div className="text-center text-xs text-gray-600 space-y-1">
          <p>Los jugadores pueden unirse escaneando el código</p>
          <p>o usando el link compartido</p>
        </div>
      </div>
    </div>
  )
}
