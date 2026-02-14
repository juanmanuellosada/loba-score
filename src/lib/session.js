// Gestión de session ID para identificar jugadores sin autenticación

const SESSION_KEY = 'loba_session_id'
const PLAYER_NAME_KEY = 'loba_player_name'

/**
 * Obtiene o crea un session ID único para el jugador
 */
export function getSessionId() {
  let sessionId = localStorage.getItem(SESSION_KEY)

  if (!sessionId) {
    // Generar UUID v4
    sessionId = crypto.randomUUID()
    localStorage.setItem(SESSION_KEY, sessionId)
  }

  return sessionId
}

/**
 * Guarda el nombre del jugador en localStorage
 */
export function savePlayerName(name) {
  localStorage.setItem(PLAYER_NAME_KEY, name)
}

/**
 * Obtiene el nombre del jugador guardado
 */
export function getPlayerName() {
  return localStorage.getItem(PLAYER_NAME_KEY) || ''
}

/**
 * Limpia la sesión (útil para testing)
 */
export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}
