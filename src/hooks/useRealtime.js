import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Hook para suscribirse a cambios en tiempo real de Supabase
 */
export function useRealtime(table, gameId, onUpdate) {
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!gameId) return

    const channel = supabase
      .channel(`${table}_${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: table,
          filter: `game_id=eq.${gameId}`,
        },
        (payload) => {
          console.log(`Realtime ${table}:`, payload)
          if (onUpdate) {
            onUpdate(payload)
          }
        }
      )
      .subscribe((status) => {
        console.log(`Subscription status (${table}):`, status)
        setIsConnected(status === 'SUBSCRIBED')
      })

    return () => {
      console.log(`Unsubscribing from ${table}`)
      supabase.removeChannel(channel)
    }
  }, [table, gameId, onUpdate])

  return { isConnected }
}

/**
 * Hook para suscribirse a cambios en la tabla de jugadores
 */
export function usePlayersRealtime(gameId, onPlayersChange) {
  return useRealtime('players', gameId, (payload) => {
    if (onPlayersChange) {
      onPlayersChange(payload)
    }
  })
}

/**
 * Hook para suscribirse a cambios en la tabla de puntajes
 */
export function useScoresRealtime(gameId, onScoresChange) {
  return useRealtime('scores', gameId, (payload) => {
    if (onScoresChange) {
      onScoresChange(payload)
    }
  })
}

/**
 * Hook para suscribirse a cambios en la tabla de partidas
 */
export function useGameRealtime(gameId, onGameChange) {
  useEffect(() => {
    if (!gameId) return

    const channel = supabase
      .channel(`game_${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`,
        },
        (payload) => {
          console.log('Game update:', payload)
          if (onGameChange) {
            onGameChange(payload)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [gameId, onGameChange])
}
