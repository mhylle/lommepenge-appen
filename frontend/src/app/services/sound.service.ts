import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TransactionType } from './transaction.service';

// Sound effect types matching app functionality
export type SoundType = 
  | 'coin_drop' 
  | 'coin_multiple'
  | 'celebration_reward'
  | 'celebration_achievement'
  | 'celebration_allowance'
  | 'celebration_bonus'
  | 'button_click'
  | 'button_success'
  | 'notification_gentle'
  | 'notification_alert'
  | 'purchase_success'
  | 'milestone_reached'
  | 'danish_chime'
  | 'ui_whoosh'
  | 'ui_pop';

export interface SoundPreferences {
  enabled: boolean;
  volume: number; // 0.0 to 1.0
  enableCelebrations: boolean;
  enableTransactions: boolean;
  enableUIFeedback: boolean;
  enableNotifications: boolean;
}

interface AudioCache {
  [key: string]: HTMLAudioElement[];
}

@Injectable({
  providedIn: 'root'
})
export class SoundService {
  private audioCache: AudioCache = {};
  private preloadedSounds = new Set<SoundType>();
  private soundPreferencesKey = 'lommepenge_sound_preferences';
  
  // Default preferences - child-friendly settings
  private defaultPreferences: SoundPreferences = {
    enabled: true,
    volume: 0.7,
    enableCelebrations: true,
    enableTransactions: true,
    enableUIFeedback: true,
    enableNotifications: true
  };

  private preferencesSubject = new BehaviorSubject<SoundPreferences>(this.loadPreferences());
  public preferences$ = this.preferencesSubject.asObservable();

  // Sound file mappings - will use fallback generated tones if files not available
  private soundMappings: Record<SoundType, { 
    file?: string; 
    frequency?: number; 
    duration?: number; 
    fallbackTone?: boolean;
    category: 'celebration' | 'transaction' | 'ui' | 'notification';
  }> = {
    coin_drop: { 
      file: 'assets/sounds/coin-drop.mp3', 
      frequency: 800, 
      duration: 200,
      fallbackTone: true,
      category: 'transaction'
    },
    coin_multiple: { 
      file: 'assets/sounds/coins-multiple.mp3', 
      frequency: 600, 
      duration: 400,
      fallbackTone: true,
      category: 'transaction'
    },
    celebration_reward: { 
      file: 'assets/sounds/celebration-reward.mp3', 
      frequency: 523, 
      duration: 800,
      fallbackTone: true,
      category: 'celebration'
    },
    celebration_achievement: { 
      file: 'assets/sounds/celebration-achievement.mp3', 
      frequency: 659, 
      duration: 1000,
      fallbackTone: true,
      category: 'celebration'
    },
    celebration_allowance: { 
      file: 'assets/sounds/celebration-allowance.mp3', 
      frequency: 440, 
      duration: 600,
      fallbackTone: true,
      category: 'celebration'
    },
    celebration_bonus: { 
      file: 'assets/sounds/celebration-bonus.mp3', 
      frequency: 587, 
      duration: 700,
      fallbackTone: true,
      category: 'celebration'
    },
    button_click: { 
      file: 'assets/sounds/button-click.mp3', 
      frequency: 1000, 
      duration: 100,
      fallbackTone: true,
      category: 'ui'
    },
    button_success: { 
      file: 'assets/sounds/button-success.mp3', 
      frequency: 1200, 
      duration: 150,
      fallbackTone: true,
      category: 'ui'
    },
    notification_gentle: { 
      file: 'assets/sounds/notification-gentle.mp3', 
      frequency: 523, 
      duration: 300,
      fallbackTone: true,
      category: 'notification'
    },
    notification_alert: { 
      file: 'assets/sounds/notification-alert.mp3', 
      frequency: 880, 
      duration: 250,
      fallbackTone: true,
      category: 'notification'
    },
    purchase_success: { 
      file: 'assets/sounds/purchase-success.mp3', 
      frequency: 698, 
      duration: 500,
      fallbackTone: true,
      category: 'transaction'
    },
    milestone_reached: { 
      file: 'assets/sounds/milestone.mp3', 
      frequency: 783, 
      duration: 1200,
      fallbackTone: true,
      category: 'celebration'
    },
    danish_chime: { 
      file: 'assets/sounds/danish-chime.mp3', 
      frequency: 523, 
      duration: 800,
      fallbackTone: true,
      category: 'celebration'
    },
    ui_whoosh: { 
      file: 'assets/sounds/ui-whoosh.mp3', 
      frequency: 400, 
      duration: 200,
      fallbackTone: true,
      category: 'ui'
    },
    ui_pop: { 
      file: 'assets/sounds/ui-pop.mp3', 
      frequency: 1200, 
      duration: 80,
      fallbackTone: true,
      category: 'ui'
    }
  };

  // Pool size for each sound to prevent conflicts
  private readonly AUDIO_POOL_SIZE = 3;

  constructor() {
    this.initializeService();
  }

  private async initializeService(): Promise<void> {
    try {
      // Preload essential sounds
      await this.preloadEssentialSounds();
    } catch (error) {
      console.warn('Sound service initialization warning:', error);
    }
  }

  /**
   * Play sound with fallback support
   */
  async playSound(soundType: SoundType, options?: { 
    volume?: number; 
    delay?: number; 
    loop?: boolean 
  }): Promise<void> {
    const preferences = this.preferencesSubject.value;
    
    if (!this.shouldPlaySound(soundType, preferences)) {
      return;
    }

    const volume = options?.volume ?? preferences.volume;
    const delay = options?.delay ?? 0;

    if (delay > 0) {
      setTimeout(() => this.executeSound(soundType, volume, options?.loop), delay);
    } else {
      await this.executeSound(soundType, volume, options?.loop);
    }
  }

  /**
   * Play sound sequence for complex celebrations
   */
  async playSoundSequence(sounds: Array<{
    type: SoundType;
    delay: number;
    volume?: number;
  }>): Promise<void> {
    const preferences = this.preferencesSubject.value;
    if (!preferences.enabled) return;

    for (const sound of sounds) {
      setTimeout(
        () => this.playSound(sound.type, { volume: sound.volume }),
        sound.delay
      );
    }
  }

  /**
   * Play celebration sound based on transaction type
   */
  async playCelebrationForTransaction(
    transactionType: TransactionType, 
    amount?: number
  ): Promise<void> {
    const preferences = this.preferencesSubject.value;
    if (!preferences.enabled || !preferences.enableCelebrations) return;

    // Choose appropriate celebration sound
    let soundType: SoundType;
    switch (transactionType) {
      case TransactionType.REWARD:
        soundType = 'celebration_reward';
        break;
      case TransactionType.ALLOWANCE:
        soundType = 'celebration_allowance';
        break;
      case TransactionType.BONUS:
        soundType = 'celebration_bonus';
        break;
      case TransactionType.SAVINGS:
        soundType = 'celebration_achievement';
        break;
      case TransactionType.PURCHASE:
        soundType = 'purchase_success';
        break;
      default:
        soundType = 'notification_gentle';
    }

    // Add coin sounds for money transactions
    if (amount && amount > 0) {
      if (amount >= 50) {
        await this.playSound('coin_multiple', { delay: 100 });
      } else {
        await this.playSound('coin_drop', { delay: 50 });
      }
    }

    // Play main celebration sound
    await this.playSound(soundType, { delay: amount ? 200 : 0 });
  }

  /**
   * Play achievement milestone sound
   */
  async playMilestoneSound(milestone: string): Promise<void> {
    const preferences = this.preferencesSubject.value;
    if (!preferences.enabled || !preferences.enableCelebrations) return;

    // Special sequence for milestones
    await this.playSoundSequence([
      { type: 'danish_chime', delay: 0 },
      { type: 'milestone_reached', delay: 200 },
      { type: 'celebration_achievement', delay: 500 }
    ]);
  }

  /**
   * Play UI feedback sound
   */
  async playUIFeedback(type: 'click' | 'success' | 'whoosh' | 'pop'): Promise<void> {
    const preferences = this.preferencesSubject.value;
    if (!preferences.enabled || !preferences.enableUIFeedback) return;

    const soundType: SoundType = type === 'click' ? 'button_click' 
      : type === 'success' ? 'button_success'
      : type === 'whoosh' ? 'ui_whoosh'
      : 'ui_pop';

    await this.playSound(soundType, { volume: preferences.volume * 0.8 });
  }

  /**
   * Play notification sound
   */
  async playNotification(type: 'gentle' | 'alert' = 'gentle'): Promise<void> {
    const preferences = this.preferencesSubject.value;
    if (!preferences.enabled || !preferences.enableNotifications) return;

    const soundType = type === 'gentle' ? 'notification_gentle' : 'notification_alert';
    await this.playSound(soundType);
  }

  /**
   * Update sound preferences
   */
  updatePreferences(preferences: Partial<SoundPreferences>): void {
    const current = this.preferencesSubject.value;
    const updated = { ...current, ...preferences };
    
    this.preferencesSubject.next(updated);
    localStorage.setItem(this.soundPreferencesKey, JSON.stringify(updated));
  }

  /**
   * Get current preferences
   */
  getPreferences(): SoundPreferences {
    return this.preferencesSubject.value;
  }

  /**
   * Toggle all sounds on/off
   */
  toggleSounds(): void {
    const current = this.preferencesSubject.value;
    this.updatePreferences({ enabled: !current.enabled });
  }

  /**
   * Set master volume
   */
  setVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.updatePreferences({ volume: clampedVolume });
  }

  /**
   * Test sound system
   */
  async testSounds(): Promise<void> {
    console.log('Testing sound system...');
    
    const testSequence = [
      { type: 'ui_pop' as SoundType, delay: 0 },
      { type: 'button_click' as SoundType, delay: 300 },
      { type: 'coin_drop' as SoundType, delay: 600 },
      { type: 'notification_gentle' as SoundType, delay: 900 },
      { type: 'celebration_reward' as SoundType, delay: 1200 }
    ];

    await this.playSoundSequence(testSequence);
  }

  /**
   * Preload essential sounds for better performance
   */
  private async preloadEssentialSounds(): Promise<void> {
    const essentialSounds: SoundType[] = [
      'button_click',
      'coin_drop',
      'celebration_reward',
      'notification_gentle',
      'ui_pop'
    ];

    for (const soundType of essentialSounds) {
      try {
        await this.preloadSound(soundType);
      } catch (error) {
        console.warn(`Failed to preload sound: ${soundType}`, error);
      }
    }
  }

  /**
   * Preload a specific sound
   */
  private async preloadSound(soundType: SoundType): Promise<void> {
    if (this.preloadedSounds.has(soundType)) return;

    const soundConfig = this.soundMappings[soundType];
    if (!soundConfig) return;

    // Try to load actual audio file
    if (soundConfig.file) {
      try {
        const audioPool: HTMLAudioElement[] = [];
        
        for (let i = 0; i < this.AUDIO_POOL_SIZE; i++) {
          const audio = new Audio(soundConfig.file);
          audio.volume = 0; // Silent preload
          audio.preload = 'auto';
          
          // Test if audio can load
          await new Promise((resolve, reject) => {
            audio.addEventListener('canplay', resolve, { once: true });
            audio.addEventListener('error', reject, { once: true });
            audio.load();
          });
          
          audioPool.push(audio);
        }
        
        this.audioCache[soundType] = audioPool;
        this.preloadedSounds.add(soundType);
      } catch (error) {
        // Fallback to generated tones - no additional setup needed
        console.warn(`Could not load audio file for ${soundType}, will use fallback tone`);
        this.preloadedSounds.add(soundType);
      }
    } else {
      // Sound uses fallback tone only
      this.preloadedSounds.add(soundType);
    }
  }

  /**
   * Execute the actual sound playback
   */
  private async executeSound(soundType: SoundType, volume: number, loop?: boolean): Promise<void> {
    try {
      // Try playing from cache first
      if (this.audioCache[soundType]) {
        await this.playFromCache(soundType, volume, loop);
        return;
      }

      // Fallback to generated tone
      await this.playFallbackTone(soundType, volume);
    } catch (error) {
      console.warn(`Failed to play sound ${soundType}:`, error);
    }
  }

  /**
   * Play sound from cached audio pool
   */
  private async playFromCache(soundType: SoundType, volume: number, loop?: boolean): Promise<void> {
    const audioPool = this.audioCache[soundType];
    if (!audioPool || audioPool.length === 0) return;

    // Find available audio element
    const availableAudio = audioPool.find(audio => audio.paused || audio.ended);
    const audio = availableAudio || audioPool[0];

    audio.currentTime = 0;
    audio.volume = volume;
    audio.loop = loop || false;
    
    await audio.play();
  }

  /**
   * Generate and play fallback tone
   */
  private async playFallbackTone(soundType: SoundType, volume: number): Promise<void> {
    const soundConfig = this.soundMappings[soundType];
    if (!soundConfig.fallbackTone || !soundConfig.frequency || !soundConfig.duration) return;

    // Create Web Audio API tone
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(soundConfig.frequency, audioContext.currentTime);
      oscillator.type = this.getOscillatorType(soundType);
      
      gainNode.gain.setValueAtTime(volume * 0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + soundConfig.duration / 1000);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + soundConfig.duration / 1000);

      // Cleanup
      setTimeout(() => {
        try {
          audioContext.close();
        } catch (e) {
          // Context might already be closed
        }
      }, soundConfig.duration + 100);
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  /**
   * Get appropriate oscillator type for sound character
   */
  private getOscillatorType(soundType: SoundType): OscillatorType {
    switch (soundType) {
      case 'coin_drop':
      case 'coin_multiple':
        return 'sine';
      case 'celebration_reward':
      case 'celebration_achievement':
      case 'milestone_reached':
        return 'triangle';
      case 'button_click':
      case 'ui_pop':
        return 'square';
      case 'notification_gentle':
      case 'danish_chime':
        return 'sine';
      default:
        return 'triangle';
    }
  }

  /**
   * Check if sound should be played based on preferences
   */
  private shouldPlaySound(soundType: SoundType, preferences: SoundPreferences): boolean {
    if (!preferences.enabled) return false;

    const soundConfig = this.soundMappings[soundType];
    if (!soundConfig) return false;

    switch (soundConfig.category) {
      case 'celebration':
        return preferences.enableCelebrations;
      case 'transaction':
        return preferences.enableTransactions;
      case 'ui':
        return preferences.enableUIFeedback;
      case 'notification':
        return preferences.enableNotifications;
      default:
        return true;
    }
  }

  /**
   * Load preferences from localStorage
   */
  private loadPreferences(): SoundPreferences {
    try {
      const saved = localStorage.getItem(this.soundPreferencesKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...this.defaultPreferences, ...parsed };
      }
    } catch (error) {
      console.warn('Failed to load sound preferences:', error);
    }
    
    return this.defaultPreferences;
  }

  /**
   * Clear all cached audio
   */
  clearCache(): void {
    this.audioCache = {};
    this.preloadedSounds.clear();
  }

  /**
   * Get sound system status for debugging
   */
  getStatus(): { 
    preloadedSounds: SoundType[], 
    cachedSounds: string[], 
    preferences: SoundPreferences 
  } {
    return {
      preloadedSounds: Array.from(this.preloadedSounds),
      cachedSounds: Object.keys(this.audioCache),
      preferences: this.preferencesSubject.value
    };
  }
}