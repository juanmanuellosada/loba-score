import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Hook para suscribirse a cambios en la tabla de jugadores
 */
export function usePlayersRealtime(gameId, onPlayersChange) {
  const callbackRef = useRef(onPlayersChange)

  // Mantener el callback actualizado
  useEffect(() => {
    callbackRef.current = onPlayersChange
  }, [onPlayersChange])

  useEffect(() => {
    if (!gameId) return

    console.log('🔗 Subscribing to players changes for:', gameId)

    const channel = supabase
      .channel(`players_${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players',
          filter: `game_id=eq.${gameId}`,
        },
        (payload) => {
          console.log('👥 Players update received:', payload)
          if (callbackRef.current) {
            callbackRef.current(payload)
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Players subscription status:', status)
      })

    return () => {
      console.log('🔌 Unsubscribing from players:', gameId)
      supabase.removeChannel(channel)
    }
  }, [gameId])
}

/**
 * Hook para suscribirse a cambios en la tabla de puntajes
 */
export function useScoresRealtime(gameId, onScoresChange) {
  const callbackRef = useRef(onScoresChange)

  // Mantener el callback actualizado
  useEffect(() => {
    callbackRef.current = onScoresChange
  }, [onScoresChange])

  useEffect(() => {
    if (!gameId) return

    console.log('🔗 Subscribing to scores changes for:', gameId)

    const channel = supabase
      .channel(`scores_${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scores',
          filter: `game_id=eq.${gameId}`,
        },
        (payload) => {
          console.log('🎯 Scores update received:', payload)
          if (callbackRef.current) {
            callbackRef.current(payload)
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Scores subscription status:', status)
      })

    return () => {
      console.log('🔌 Unsubscribing from scores:', gameId)
      supabase.removeChannel(channel)
    }
  }, [gameId])
}

/**
 * Hook para suscribirse a cambios en la tabla de partidas
 */
export function useGameRealtime(gameId, onGameChange) {
  const callbackRef = useRef(onGameChange)

  // Mantener el callback actualizado
  useEffect(() => {
    callbackRef.current = onGameChange
  }, [onGameChange])

  useEffect(() => {
    if (!gameId) return

    console.log('🔗 Subscribing to game changes for:', gameId)

    const channel = supabase
      .channel(`game_${gameId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`,
        },
        (payload) => {
          console.log('🎮 Game update received:', payload)
          if (callbackRef.current) {
            callbackRef.current(payload)
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Game subscription status:', status)
      })

    return () => {
      console.log('🔌 Unsubscribing from game:', gameId)
      supabase.removeChannel(channel)
    }
  }, [gameId])
}
