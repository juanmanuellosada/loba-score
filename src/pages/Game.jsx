import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Loader2, ChevronRight, Users } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { getSessionId } from '../lib/session'
import { checkGameOver } from '../lib/gameLogic'
import { useGame } from '../hooks/useGame'
import { usePlayersRealtime, useScoresRealtime, useGameRealtime } from '../hooks/useRealtime'
import { useVibration } from '../hooks/useVibration'
import GameBoard from '../components/GameBoard'
import RoundInput from '../components/RoundInput'
import AlertBanner from '../components/AlertBanner'
import GameOverScreen from '../components/GameOverScreen'

export default function Game() {
  const navigate = useNavigate()
  const { gameId } = useParams()
  const sessionId = getSessionId()

  const {
    game,
    players,
    scores,
    loading,
    currentPlayer,
    isHost,
    refreshPlayers,
    refreshScores,
    reload,
  } = useGame(gameId)

  const [submittingScore, setSubmittingScore] = useState(false)
  const [hasSubmittedThisRound, setHasSubmittedThisRound] = useState(false)
  const [showGameOver, setShowGameOver] = useState(false)
  const { confirmSound } = useVibration()

  // Verificar si ya submitió en esta ronda
  useEffect(() => {
    if (!game || !currentPlayer || !scores) return

    const currentRoundScores = scores.filter(
      s => s.round_number === game.current_round && s.player_id === currentPlayer.id
    )

    setHasSubmittedThisRound(currentRoundScores.length > 0)
  }, [game, currentPlayer, scores])

  // Verificar si el juego terminó
  useEffect(() => {
    if (!players || players.length === 0) return

    if (checkGameOver(players)) {
      setShowGameOver(true)
    }
  }, [players])

  // Realtime updates
  usePlayersRealtime(gameId, async () => {
    await refreshPlayers()
  })

  useScoresRealtime(gameId, async () => {
    await refreshScores()
  })

  useGameRealtime(gameId, async () => {
    await reload()
  })

  const submitScore = async (score, cards) => {
    if (!game || !currentPlayer) return

    try {
      setSubmittingScore(true)

      // Si cortó (score = 0), marcar en la partida
      if (score === 0) {
        const { error: gameUpdateError } = await supabase
          .from('games')
          .update({
            current_round_cut_by: currentPlayer.id,
          })
          .eq('id', gameId)

        if (gameUpdateError) {
          console.error('Error marking cut:', gameUpdateError)
        }
      }

      // Insertar puntaje en la tabla scores
      const { error: scoreError } = await supabase
        .from('scores')
        .insert({
          game_id: gameId,
          player_id: currentPlayer.id,
          round_number: game.current_round,
          round_score: score,
          cards_detail: cards ? { cards } : null,
        })

      if (scoreError) {
        console.error('Error submitting score:', scoreError)
        alert('Error al enviar el puntaje')
        return
      }

      // Actualizar total del jugador
      const newTotal = currentPlayer.total_score + score
      const shouldEliminate = newTotal >= 100

      const { error: updateError } = await supabase
        .from('players')
        .update({
          total_score: newTotal,
          is_eliminated: shouldEliminate,
        })
        .eq('id', currentPlayer.id)

      if (updateError) {
        console.error('Error updating player score:', updateError)
        alert('Error al actualizar el puntaje')
        return
      }

      confirmSound()
      setHasSubmittedThisRound(true)

    } catch (error) {
      console.error('Unexpected error:', error)
      alert('Error al enviar el puntaje')
    } finally {
      setSubmittingScore(false)
    }
  }

  const nextRound = async () => {
    if (!isHost || !game) return

    // Verificar que todos los jugadores ACTIVOS hayan jugado
    const activePlayers = players.filter(p => !p.is_eliminated)
    const currentRoundScores = scores.filter(
      s => s.round_number === game.current_round
    )

    if (currentRoundScores.length < activePlayers.length) {
      alert('Esperá a que todos los jugadores activos carguen sus puntajes')
      return
    }

    try {
      const { error } = await supabase
        .from('games')
        .update({
          current_round: game.current_round + 1,
          current_round_cut_by: null, // Limpiar quien cortó
        })
        .eq('id', gameId)

      if (error) {
        console.error('Error advancing round:', error)
        alert('Error al avanzar de ronda')
      }
    } catch (error) {
      console.error('Unexpected error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-casino-green animate-spin mx-auto" />
          <p className="text-gray-400">Cargando partida...</p>
        </div>
      </div>
    )
  }

  if (!game || !currentPlayer) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <p className="text-red-400">Error al cargar la partida</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  if (showGameOver) {
    return (
      <GameOverScreen
        players={players}
        gameId={gameId}
        onNewGame={() => {
          setShowGameOver(false)
          navigate('/')
        }}
        onExit={() => navigate('/')}
      />
    )
  }

  const activePlayers = players.filter(p => !p.is_eliminated)
  const allPlayersSubmitted = scores.filter(
    s => s.round_number === game.current_round
  ).length === activePlayers.length

  // Detectar si alguien cortó
  const cutByPlayerId = game?.current_round_cut_by
  const cutByPlayer = cutByPlayerId ? players.find(p => p.id === cutByPlayerId) : null

  return (
    <div className="min-h-screen bg-dark-bg p-6 pb-32">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">La Loba</h1>
          <p className="text-gray-400 text-sm">
            {players.length} jugadores · Ronda {game.current_round}
          </p>
        </div>

        {/* Banner cuando alguien cortó */}
        {cutByPlayer && (
          <div className="bg-casino-gold/20 border-2 border-casino-gold rounded-lg p-4 animate-pulse">
            <div className="flex items-center gap-3">
              <span className="text-3xl">✂️</span>
              <div className="flex-1">
                <p className="text-casino-gold font-bold text-lg">
                  ¡{cutByPlayer.name} cortó!
                </p>
                <p className="text-gray-300 text-sm">
                  Todos deben cargar sus puntos
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Alert Banner */}
        <AlertBanner players={players} currentPlayerId={currentPlayer.id} />

        {/* GameBoard */}
        <GameBoard
          players={players}
          currentRound={game.current_round}
          currentPlayerId={currentPlayer.id}
        />

        {/* Input de puntaje - solo si no está eliminado */}
        {!currentPlayer.is_eliminated && !hasSubmittedThisRound && (
          <div className="card">
            <RoundInput
              onSubmit={submitScore}
              disabled={submittingScore}
              playerName={currentPlayer.name}
              someoneCut={!!cutByPlayer}
            />
          </div>
        )}

        {/* Mensaje para jugadores eliminados */}
        {currentPlayer.is_eliminated && (
          <div className="card bg-gray-800/50 border-gray-700">
            <div className="text-center space-y-2">
              <p className="text-2xl">💀</p>
              <p className="text-gray-400 font-semibold">
                Fuiste eliminado
              </p>
              <p className="text-sm text-gray-500">
                Podés seguir viendo cómo termina la partida
              </p>
            </div>
          </div>
        )}

        {/* Ya submitió */}
        {!currentPlayer.is_eliminated && hasSubmittedThisRound && (
          <div className="card bg-casino-green/10 border-casino-green/30">
            <div className="text-center space-y-2">
              <p className="text-casino-green font-semibold">
                ✓ Puntaje enviado
              </p>
              <p className="text-sm text-gray-400">
                Esperando a los demás jugadores...
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Users className="w-4 h-4" />
                {scores.filter(s => s.round_number === game.current_round).length} / {players.filter(p => !p.is_eliminated).length}
              </div>
            </div>
          </div>
        )}

        {/* Botón siguiente ronda (solo host) */}
        {isHost && allPlayersSubmitted && (
          <div className="fixed bottom-6 left-6 right-6 max-w-4xl mx-auto">
            <button
              onClick={nextRound}
              className="btn-primary w-full flex items-center justify-center gap-2 shadow-2xl"
            >
              Siguiente ronda
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
