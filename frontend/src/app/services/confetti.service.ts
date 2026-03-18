import { Injectable, ElementRef, Renderer2, RendererFactory2, NgZone } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface ConfettiOptions {
  particleCount?: number;
  spread?: number;
  startVelocity?: number;
  decay?: number;
  gravity?: number;
  drift?: number;
  ticks?: number;
  origin?: { x: number; y: number };
  colors?: string[];
  shapes?: string[];
  scalar?: number;
  zIndex?: number;
  disableForReducedMotion?: boolean;
}

export interface ConfettiPattern {
  name: string;
  displayName: string;
  emoji: string[];
  colors: string[];
  particleCount: number;
  spread: number;
  startVelocity: number;
  gravity: number;
  scalar: number;
  duration: number;
  description: string;
}

export interface CelebrationTheme {
  id: string;
  name: string;
  displayName: string;
  patterns: ConfettiPattern[];
  celebrationMessage: string;
  soundEffect?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfettiService {
  private renderer: Renderer2;
  private confettiContainer: HTMLElement | null = null;
  private activeAnimations: Set<HTMLElement> = new Set();
  private celebrationSubject = new Subject<string>();
  public celebration$ = this.celebrationSubject.asObservable();

  // Danish-themed confetti patterns
  private danishPatterns: ConfettiPattern[] = [
    {
      name: 'celebration',
      displayName: 'Fejring',
      emoji: ['🎉', '🎊', '✨', '🌟', '🎈'],
      colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'],
      particleCount: 150,
      spread: 70,
      startVelocity: 45,
      gravity: 0.6,
      scalar: 1.2,
      duration: 3000,
      description: 'Klassisk fejrings-konfetti'
    },
    {
      name: 'hearts',
      displayName: 'Hjerter',
      emoji: ['❤️', '💖', '💝', '💕', '💗'],
      colors: ['#FF69B4', '#FFB6C1', '#FF1493', '#DC143C', '#FF6347'],
      particleCount: 100,
      spread: 60,
      startVelocity: 35,
      gravity: 0.4,
      scalar: 1.0,
      duration: 4000,
      description: 'Søde hjerter for kærlige belønninger'
    },
    {
      name: 'coins',
      displayName: 'Mønter',
      emoji: ['💰', '🪙', '💵', '💳', '🏦'],
      colors: ['#FFD700', '#FFA500', '#DAA520', '#B8860B', '#F4A460'],
      particleCount: 80,
      spread: 50,
      startVelocity: 40,
      gravity: 0.8,
      scalar: 1.1,
      duration: 2500,
      description: 'Gyldne mønter for penge-belønninger'
    },
    {
      name: 'stars',
      displayName: 'Stjerner',
      emoji: ['⭐', '🌟', '✨', '💫', '🌠'],
      colors: ['#FFD700', '#FFFF00', '#FFA500', '#FF69B4', '#00CED1'],
      particleCount: 120,
      spread: 80,
      startVelocity: 50,
      gravity: 0.5,
      scalar: 1.3,
      duration: 3500,
      description: 'Magiske stjerner for præstationer'
    },
    {
      name: 'crown',
      displayName: 'Krone',
      emoji: ['👑', '🏆', '🥇', '🎖️', '🏅'],
      colors: ['#FFD700', '#FFA500', '#FF6B35', '#8B4513', '#DAA520'],
      particleCount: 60,
      spread: 40,
      startVelocity: 30,
      gravity: 0.3,
      scalar: 1.4,
      duration: 4500,
      description: 'Kongelig fejring for store præstationer'
    },
    {
      name: 'danish',
      displayName: 'Dansk',
      emoji: ['🇩🇰', '🍪', '🧸', '🎪', '🎠'],
      colors: ['#C8102E', '#FFFFFF', '#FF1744', '#E57373', '#F8BBD9'],
      particleCount: 100,
      spread: 65,
      startVelocity: 42,
      gravity: 0.6,
      scalar: 1.1,
      duration: 3200,
      description: 'Danske elementer og farver'
    }
  ];

  // Danish celebration themes
  private danishThemes: CelebrationTheme[] = [
    {
      id: 'reward',
      name: 'reward',
      displayName: 'Belønning',
      patterns: [
        this.danishPatterns.find(p => p.name === 'celebration')!,
        this.danishPatterns.find(p => p.name === 'hearts')!
      ],
      celebrationMessage: 'Fantastisk! Du fik en belønning! 🎉'
    },
    {
      id: 'allowance',
      name: 'allowance',
      displayName: 'Ugepenge',
      patterns: [
        this.danishPatterns.find(p => p.name === 'coins')!,
        this.danishPatterns.find(p => p.name === 'stars')!
      ],
      celebrationMessage: 'Dine ugepenge er her! 💰'
    },
    {
      id: 'bonus',
      name: 'bonus',
      displayName: 'Bonus',
      patterns: [
        this.danishPatterns.find(p => p.name === 'stars')!,
        this.danishPatterns.find(p => p.name === 'celebration')!
      ],
      celebrationMessage: 'Hvilken fantastisk bonus! ⭐'
    },
    {
      id: 'achievement',
      name: 'achievement',
      displayName: 'Præstation',
      patterns: [
        this.danishPatterns.find(p => p.name === 'crown')!,
        this.danishPatterns.find(p => p.name === 'stars')!
      ],
      celebrationMessage: 'Du har opnået noget fantastisk! 👑'
    },
    {
      id: 'savings',
      name: 'savings',
      displayName: 'Opsparing',
      patterns: [
        this.danishPatterns.find(p => p.name === 'coins')!,
        this.danishPatterns.find(p => p.name === 'danish')!
      ],
      celebrationMessage: 'Du sparer så godt op! 🐷'
    }
  ];

  constructor(
    private rendererFactory: RendererFactory2,
    private ngZone: NgZone
  ) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
    this.initializeContainer();
  }

  private initializeContainer(): void {
    // Create confetti container
    this.confettiContainer = this.renderer.createElement('div');
    this.renderer.setStyle(this.confettiContainer, 'position', 'fixed');
    this.renderer.setStyle(this.confettiContainer, 'top', '0');
    this.renderer.setStyle(this.confettiContainer, 'left', '0');
    this.renderer.setStyle(this.confettiContainer, 'width', '100%');
    this.renderer.setStyle(this.confettiContainer, 'height', '100%');
    this.renderer.setStyle(this.confettiContainer, 'pointer-events', 'none');
    this.renderer.setStyle(this.confettiContainer, 'z-index', '10000');
    this.renderer.setStyle(this.confettiContainer, 'overflow', 'hidden');
    this.renderer.appendChild(document.body, this.confettiContainer);
  }

  // Main celebration method
  celebrate(themeId: string, options?: Partial<ConfettiOptions>): void {
    const theme = this.danishThemes.find(t => t.id === themeId);
    if (!theme) {
      console.warn(`Confetti theme '${themeId}' not found`);
      return;
    }

    // Check for reduced motion preference
    if (options?.disableForReducedMotion && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Show celebration message without animation
      this.celebrationSubject.next(theme.celebrationMessage);
      return;
    }

    // Emit celebration message
    this.celebrationSubject.next(theme.celebrationMessage);

    // Run confetti patterns with delays
    theme.patterns.forEach((pattern, index) => {
      setTimeout(() => {
        this.runPattern(pattern, options);
      }, index * 200);
    });
  }

  // Run specific confetti pattern
  runPattern(pattern: ConfettiPattern, options?: Partial<ConfettiOptions>): void {
    if (!this.confettiContainer) return;

    const mergedOptions: ConfettiOptions = {
      particleCount: options?.particleCount ?? pattern.particleCount,
      spread: options?.spread ?? pattern.spread,
      startVelocity: options?.startVelocity ?? pattern.startVelocity,
      decay: options?.decay ?? 0.92,
      gravity: options?.gravity ?? pattern.gravity,
      drift: options?.drift ?? 0,
      ticks: options?.ticks ?? 200,
      origin: options?.origin ?? { x: 0.5, y: 0.4 },
      colors: options?.colors ?? pattern.colors,
      shapes: options?.shapes ?? pattern.emoji,
      scalar: options?.scalar ?? pattern.scalar,
      zIndex: options?.zIndex ?? 10000
    };

    this.ngZone.runOutsideAngular(() => {
      for (let i = 0; i < mergedOptions.particleCount!; i++) {
        this.createParticle(mergedOptions, pattern);
      }
    });
  }

  private createParticle(options: ConfettiOptions, pattern: ConfettiPattern): void {
    if (!this.confettiContainer) return;

    const particle = this.renderer.createElement('div');
    
    // Random emoji or use color circle
    const useEmoji = Math.random() > 0.3;
    if (useEmoji && options.shapes && options.shapes.length > 0) {
      const emoji = options.shapes[Math.floor(Math.random() * options.shapes.length)];
      this.renderer.setProperty(particle, 'textContent', emoji);
      this.renderer.setStyle(particle, 'fontSize', `${16 * (options.scalar || 1)}px`);
    } else {
      // Create colored circle
      const color = options.colors![Math.floor(Math.random() * options.colors!.length)];
      this.renderer.setStyle(particle, 'backgroundColor', color);
      this.renderer.setStyle(particle, 'borderRadius', '50%');
      this.renderer.setStyle(particle, 'width', `${8 * (options.scalar || 1)}px`);
      this.renderer.setStyle(particle, 'height', `${8 * (options.scalar || 1)}px`);
    }

    // Position and styling
    this.renderer.setStyle(particle, 'position', 'absolute');
    this.renderer.setStyle(particle, 'pointerEvents', 'none');
    this.renderer.setStyle(particle, 'zIndex', options.zIndex?.toString() || '10000');
    this.renderer.setStyle(particle, 'userSelect', 'none');
    
    // Starting position
    const containerWidth = window.innerWidth;
    const containerHeight = window.innerHeight;
    const startX = containerWidth * (options.origin?.x || 0.5);
    const startY = containerHeight * (options.origin?.y || 0.4);
    
    this.renderer.setStyle(particle, 'left', `${startX}px`);
    this.renderer.setStyle(particle, 'top', `${startY}px`);

    // Physics calculations
    const angle = (Math.random() - 0.5) * (options.spread! / 180 * Math.PI);
    const velocity = options.startVelocity! * (0.75 + Math.random() * 0.5);
    let vx = Math.cos(angle) * velocity;
    let vy = Math.sin(angle) * velocity - Math.random() * options.startVelocity! * 0.3;
    let x = startX;
    let y = startY;
    let rotation = Math.random() * 360;
    let rotationSpeed = (Math.random() - 0.5) * 20;
    let opacity = 1;

    // Add to container and tracking
    this.renderer.appendChild(this.confettiContainer, particle);
    this.activeAnimations.add(particle);

    // Animation loop
    let animationId: number;
    let tickCount = 0;
    const maxTicks = options.ticks || 200;

    const animate = () => {
      tickCount++;
      
      // Physics update
      vy += options.gravity || 0.6;
      x += vx + (options.drift || 0);
      y += vy;
      rotation += rotationSpeed;
      
      // Apply decay
      vx *= options.decay || 0.92;
      vy *= options.decay || 0.92;
      
      // Fade out near end
      if (tickCount > maxTicks * 0.8) {
        opacity = 1 - (tickCount - maxTicks * 0.8) / (maxTicks * 0.2);
      }

      // Update particle
      this.renderer.setStyle(particle, 'transform', 
        `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg)`);
      this.renderer.setStyle(particle, 'opacity', opacity.toString());

      // Continue animation or cleanup
      if (tickCount < maxTicks && y < containerHeight + 100 && x > -100 && x < containerWidth + 100) {
        animationId = requestAnimationFrame(animate);
      } else {
        this.cleanup(particle);
      }
    };

    animationId = requestAnimationFrame(animate);
  }

  private cleanup(particle: HTMLElement): void {
    if (this.confettiContainer && this.confettiContainer.contains(particle)) {
      this.renderer.removeChild(this.confettiContainer, particle);
    }
    this.activeAnimations.delete(particle);
  }

  // Clear all active confetti
  clearAll(): void {
    this.activeAnimations.forEach(particle => {
      this.cleanup(particle);
    });
    this.activeAnimations.clear();
  }

  // Get available themes
  getThemes(): CelebrationTheme[] {
    return [...this.danishThemes];
  }

  // Get available patterns
  getPatterns(): ConfettiPattern[] {
    return [...this.danishPatterns];
  }

  // Quick celebration methods for common scenarios
  celebrateReward(amount?: number): void {
    const intensity = amount ? this.getIntensityFromAmount(amount) : 'medium';
    const options = this.getOptionsForIntensity(intensity);
    this.celebrate('reward', options);
  }

  celebrateAllowance(): void {
    this.celebrate('allowance');
  }

  celebrateBonus(): void {
    this.celebrate('bonus');
  }

  celebrateAchievement(): void {
    this.celebrate('achievement');
  }

  celebrateSavings(): void {
    this.celebrate('savings');
  }

  // Firework-style burst from specific position
  celebrateAt(x: number, y: number, themeId: string = 'reward'): void {
    const options: Partial<ConfettiOptions> = {
      origin: { x: x / window.innerWidth, y: y / window.innerHeight }
    };
    this.celebrate(themeId, options);
  }

  private getIntensityFromAmount(amount: number): 'low' | 'medium' | 'high' {
    if (amount >= 100) return 'high';
    if (amount >= 50) return 'medium';
    return 'low';
  }

  private getOptionsForIntensity(intensity: 'low' | 'medium' | 'high'): Partial<ConfettiOptions> {
    switch (intensity) {
      case 'high':
        return { particleCount: 200, spread: 90, startVelocity: 55 };
      case 'medium':
        return { particleCount: 120, spread: 70, startVelocity: 45 };
      case 'low':
        return { particleCount: 80, spread: 50, startVelocity: 35 };
    }
  }

  // Test method for development
  testConfetti(): void {
    const themes = ['reward', 'allowance', 'bonus', 'achievement', 'savings'];
    themes.forEach((theme, index) => {
      setTimeout(() => {
        this.celebrate(theme);
      }, index * 1000);
    });
  }

  // Cleanup on destroy
  destroy(): void {
    this.clearAll();
    if (this.confettiContainer) {
      this.renderer.removeChild(document.body, this.confettiContainer);
      this.confettiContainer = null;
    }
  }
}