import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { getSessionId } from '../lib/session'

/**
 * Hook principal para gestionar el estado de una partida
 */
export function useGame(gameId) {
  const [game, setGame] = useState(null)
  const [players, setPlayers] = useState([])
  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const sessionId = getSessionId()

  // Cargar datos iniciales de la partida
  const loadGame = useCallback(async () => {
    if (!gameId) return

    try {
      setLoading(true)
      setError(null)

      // Cargar partida
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single()

      if (gameError) throw gameError
      setGame(gameData)

      // Cargar jugadores
      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select('*')
        .eq('game_id', gameId)
        .order('joined_at', { ascending: true })

      if (playersError) throw playersError
      setPlayers(playersData || [])

      // Cargar puntajes
      const { data: scoresData, error: scoresError } = await supabase
        .from('scores')
        .select('*')
        .eq('game_id', gameId)
        .order('round_number', { ascending: true })

      if (scoresError) throw scoresError
      setScores(scoresData || [])

    } catch (err) {
      console.error('Error loading game:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [gameId])

  // Cargar al montar
  useEffect(() => {
    loadGame()
  }, [loadGame])

  // Obtener jugador actual
  const currentPlayer = players.find(p => p.session_id === sessionId)
  const isHost = currentPlayer?.is_host || false

  // Refrescar jugadores
  const refreshPlayers = useCallback(async () => {
    if (!gameId) return

    const { data } = await supabase
      .from('players')
      .select('*')
      .eq('game_id', gameId)
      .order('joined_at', { ascending: true })

    if (data) setPlayers(data)
  }, [gameId])

  // Refrescar puntajes
  const refreshScores = useCallback(async () => {
    if (!gameId) return

    const { data } = await supabase
      .from('scores')
      .select('*')
      .eq('game_id', gameId)
      .order('round_number', { ascending: true })

    if (data) setScores(data)
  }, [gameId])

  return {
    game,
    players,
    scores,
    loading,
    error,
    currentPlayer,
    isHost,
    refreshPlayers,
    refreshScores,
    reload: loadGame,
  }
}
