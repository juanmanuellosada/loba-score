import { useCallback } from 'react'

/**
 * Hook para vibración y sonidos del dispositivo
 */
export function useVibration() {

  const vibrate = useCallback((pattern = [200]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  }, [])

  const playBeep = useCallback((frequency = 440, duration = 150) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = frequency
      oscillator.type = 'sine'

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + duration / 1000)
    } catch (error) {
      // Silencioso si falla
      console.debug('Audio not supported')
    }
  }, [])

  const alertWarning = useCallback(() => {
    vibrate([100, 50, 100])
    playBeep(600, 200)
  }, [vibrate, playBeep])

  const alertCritical = useCallback(() => {
    vibrate([200, 100, 200, 100, 200])
    playBeep(800, 300)
  }, [vibrate, playBeep])

  const confirmSound = useCallback(() => {
    vibrate([50])
    playBeep(440, 100)
  }, [vibrate, playBeep])

  return {
    vibrate,
    playBeep,
    alertWarning,
    alertCritical,
    confirmSound,
  }
}
