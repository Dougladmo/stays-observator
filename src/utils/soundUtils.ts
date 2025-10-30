/**
 * Sound utility functions
 * Generates notification sounds using Web Audio API
 */

/**
 * Plays a success notification sound (celebration tone)
 */
export function playSuccessSound() {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Create a more pleasant celebration sound sequence
    const playNote = (frequency: number, startTime: number, duration: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      // Envelope for smooth sound
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };

    // Play a cheerful ascending sequence (C-E-G chord)
    const now = audioContext.currentTime;
    playNote(523.25, now, 0.2);        // C5
    playNote(659.25, now + 0.1, 0.2);  // E5
    playNote(783.99, now + 0.2, 0.3);  // G5

  } catch (error) {
    console.warn('Could not play success sound:', error);
  }
}
