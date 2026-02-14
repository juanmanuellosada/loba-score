// Lógica y reglas del juego de La Loba

/**
 * Valores de las cartas según las reglas de La Loba
 */
export const CARD_VALUES = {
  'A': 11,
  'Joker': 15,
  'J': 10,
  'Q': 10,
  'K': 10,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
}

/**
 * Lista de todas las cartas disponibles
 */
export const CARDS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'Joker']

/**
 * Genera un código único de 6 caracteres para la partida
 * Evita caracteres confusos como 0/O, 1/I
 */
export function generateGameCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Sin 0, O, 1, I
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

/**
 * Verifica si la partida terminó (solo queda 1 jugador sin eliminar)
 */
export function checkGameOver(players) {
  const activePlayers = players.filter(p => !p.is_eliminated)
  return activePlayers.length <= 1
}

/**
 * Obtiene el ranking de jugadores ordenados por puntaje (menor a mayor)
 * Jugadores eliminados van al final
 * El de menor puntaje sin eliminar es el ganador
 */
export function getRanking(players) {
  return [...players].sort((a, b) => {
    // Eliminados van al final
    if (a.is_eliminated && !b.is_eliminated) return 1
    if (!a.is_eliminated && b.is_eliminated) return -1
    // Si ambos están en el mismo estado, ordenar por puntaje
    return a.total_score - b.total_score
  })
}

/**
 * Calcula el total de puntos según las cartas seleccionadas
 */
export function calculateScore(selectedCards) {
  return selectedCards.reduce((total, card) => {
    return total + (CARD_VALUES[card] || 0)
  }, 0)
}

/**
 * Verifica si un jugador debe recibir alerta (80 o 90 puntos)
 */
export function getAlertLevel(score, isEliminated) {
  if (isEliminated) return 'eliminated'
  if (score >= 100) return 'game-over'
  if (score >= 90) return 'critical' // Alerta roja intensa
  if (score >= 80) return 'warning'  // Alerta naranja
  return 'safe'
}

/**
 * Obtiene el mensaje de alerta según el nivel
 */
export function getAlertMessage(level) {
  switch (level) {
    case 'critical':
      return '¡ÚLTIMO AVISO! Estás al borde de ser eliminado'
    case 'warning':
      return '¡Cuidado! Te estás acercando a 100 puntos'
    case 'game-over':
      return '¡Fuiste eliminado! Llegaste a 100 puntos'
    case 'eliminated':
      return 'Eliminado - Esperando a que termine la partida'
    default:
      return ''
  }
}
