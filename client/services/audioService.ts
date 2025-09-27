// Audio service for cognitive tests
export class AudioService {
  private audioContext: AudioContext | null = null;
  private currentSource: OscillatorNode | AudioBufferSourceNode | null = null;

  constructor() {
    this.initAudioContext();
  }

  private async initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.error('Error initializing audio context:', error);
    }
  }

  // Generate pure tone for hearing tests
  async generateTone(frequency: number, duration: number = 2000): Promise<void> {
    if (!this.audioContext) {
      await this.initAudioContext();
    }
    
    if (!this.audioContext) return;

    // Resume audio context if suspended
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    // Fade in and out to prevent clicks
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000 - 0.1);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration / 1000);

    this.currentSource = oscillator;
  }

  // Generate musical sequence for music recognition test
  async generateMelody(songId: number, duration: number = 10000): Promise<void> {
    if (!this.audioContext) {
      await this.initAudioContext();
    }
    
    if (!this.audioContext) return;

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    // Different melody patterns based on song ID
    const melodies = [
      [261.63, 293.66, 329.63, 349.23, 392.00], // C-D-E-F-G
      [440.00, 392.00, 349.23, 329.63, 293.66], // A-G-F-E-D
      [329.63, 349.23, 392.00, 440.00, 493.88], // E-F-G-A-B
      [523.25, 493.88, 440.00, 392.00, 349.23], // C-B-A-G-F
      [293.66, 329.63, 392.00, 329.63, 261.63], // D-E-G-E-C
      [392.00, 440.00, 493.88, 523.25, 587.33], // G-A-B-C-D
      [349.23, 329.63, 293.66, 261.63, 246.94], // F-E-D-C-B
      [261.63, 349.23, 440.00, 349.23, 261.63]  // C-F-A-F-C
    ];

    const melody = melodies[songId % melodies.length];
    const noteDuration = duration / melody.length;

    melody.forEach((frequency, index) => {
      const startTime = this.audioContext!.currentTime + (index * noteDuration / 1000);
      const oscillator = this.audioContext!.createOscillator();
      const gainNode = this.audioContext!.createGain();
      const filter = this.audioContext!.createBiquadFilter();

      // Chain: oscillator -> filter -> gain -> destination
      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.audioContext!.destination);

      // Configure oscillator
      oscillator.frequency.value = frequency;
      oscillator.type = 'square'; // Different waveform for musical quality

      // Configure filter for muffled effect
      filter.type = 'lowpass';
      filter.frequency.value = 800;
      filter.Q.value = 5;

      // Configure gain with envelope
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + noteDuration / 1000 - 0.05);

      oscillator.start(startTime);
      oscillator.stop(startTime + noteDuration / 1000);
    });
  }

  // Play audio from URL (for music recognition)
  async playAudioFromUrl(url: string, volume: number = 0.5): Promise<HTMLAudioElement> {
    return new Promise((resolve, reject) => {
      const audio = new Audio(url);
      audio.volume = volume;
      audio.crossOrigin = "anonymous";
      
      audio.onloadeddata = () => resolve(audio);
      audio.onerror = (error) => reject(error);
      
      audio.load();
    });
  }

  // Apply low-pass filter to make audio "muffled"
  async playMuffledAudio(audioElement: HTMLAudioElement): Promise<void> {
    if (!this.audioContext) {
      await this.initAudioContext();
    }

    if (!this.audioContext) {
      audioElement.play();
      return;
    }

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    const source = this.audioContext.createMediaElementSource(audioElement);
    const filter = this.audioContext.createBiquadFilter();
    const gainNode = this.audioContext.createGain();

    // Configure low-pass filter for muffled effect
    filter.type = 'lowpass';
    filter.frequency.value = 800; // Cut off high frequencies
    filter.Q.value = 5;

    // Reduce volume slightly
    gainNode.gain.value = 0.6;

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    audioElement.play();
  }

  // Stop current audio
  stopAudio() {
    if (this.currentSource) {
      try {
        this.currentSource.stop();
      } catch (error) {
        // Audio might already be stopped
      }
      this.currentSource = null;
    }
  }

  // Cleanup
  dispose() {
    this.stopAudio();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

// Sample songs database - using royalty-free audio samples
export const SAMPLE_SONGS = [
  {
    id: 1,
    title: "Classical Symphony",
    artist: "Public Domain",
    // Using royalty-free classical music (placeholder URLs)
    url: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmocDzaH0/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmocDzaH0/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmocDzaH0/LNeSsFJHfH8N2QQAoUXrTp", // Placeholder base64 audio
    duration: 15
  },
  {
    id: 2,
    title: "Jazz Standard",
    artist: "Public Domain",
    url: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmocDzaH0/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmocDzaH0/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmocDzaH0/LNeSsFJHfH8N2QQAoUXrTp",
    duration: 15
  },
  {
    id: 3,
    title: "Folk Melody",
    artist: "Traditional",
    url: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmocDzaH0/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmocDzaH0/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmocDzaH0/LNeSsFJHfH8N2QQAoUXrTp",
    duration: 15
  },
  {
    id: 4,
    title: "Rock Anthem",
    artist: "Demo Band",
    url: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmocDzaH0/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmocDzaH0/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmocDzaH0/LNeSsFJHfH8N2QQAoUXrTp",
    duration: 15
  },
  {
    id: 5,
    title: "Electronic Beat",
    artist: "Synth Artist",
    url: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmocDzaH0/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmocDzaH0/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmocDzaH0/LNeSsFJHfH8N2QQAoUXrTp",
    duration: 15
  },
  {
    id: 6,
    title: "Orchestral Piece",
    artist: "Symphony Demo",
    url: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmocDzaH0/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmocDzaH0/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmocDzaH0/LNeSsFJHfH8N2QQAoUXrTp",
    duration: 15
  },
  {
    id: 7,
    title: "Piano Ballad",
    artist: "Demo Pianist",
    url: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmocDzaH0/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmocDzaH0/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmocDzaH0/LNeSsFJHfH8N2QQAoUXrTp",
    duration: 15
  },
  {
    id: 8,
    title: "Acoustic Guitar",
    artist: "Folk Demo",
    url: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmocDzaH0/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmocDzaH0/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmocDzaH0/LNeSsFJHfH8N2QQAoUXrTp",
    duration: 15
  }
];

// Hearing test frequencies (in Hz)
export const HEARING_FREQUENCIES = [
  { frequency: 250, label: "250 Hz (Low)" },
  { frequency: 500, label: "500 Hz (Low-Mid)" },
  { frequency: 1000, label: "1000 Hz (Mid)" },
  { frequency: 2000, label: "2000 Hz (Mid-High)" },
  { frequency: 4000, label: "4000 Hz (High)" },
  { frequency: 8000, label: "8000 Hz (Very High)" }
];