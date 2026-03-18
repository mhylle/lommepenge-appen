import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ConfettiService } from './confetti.service';
import { Transaction, TransactionType } from './transaction.service';

export interface CelebrationEvent {
  type: 'confetti' | 'message';
  theme: string;
  message?: string;
  intensity?: 'low' | 'medium' | 'high';
  position?: { x: number; y: number };
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CelebrationService {
  private celebrationSubject = new Subject<CelebrationEvent>();
  public celebration$ = this.celebrationSubject.asObservable();

  // Danish celebration messages for different transaction types
  private danishMessages: Record<TransactionType, string[]> = {
    [TransactionType.REWARD]: [
      'Fantastisk! Du fik en belønning! 🎉',
      'Godt klaret! Her er din belønning! 🏆',
      'Du har været fantastisk! 🌟',
      'Tillykke med din belønning! 🎊'
    ],
    [TransactionType.ALLOWANCE]: [
      'Dine ugepenge er her! 💰',
      'Ugepenge tid! 💵',
      'Her er dine penge for ugen! 🪙',
      'Ugepenge leveret! 💳'
    ],
    [TransactionType.BONUS]: [
      'Hvilken fantastisk bonus! ⭐',
      'Ekstra bonus til dig! 🌟',
      'Du fortjener denne bonus! 🎯',
      'Bonus tid! Du er fantastisk! 💫'
    ],
    [TransactionType.SAVINGS]: [
      'Du sparer så godt op! 🐷',
      'Fantastisk opsparing! 💰',
      'Du kommer tættere på dit mål! 🎯',
      'Godt arbejde med opsparingen! 📈'
    ],
    [TransactionType.PURCHASE]: [
      'Godt køb! 🛍️',
      'Håber du nyder dit køb! 🎁',
      'Smart indkøb! 💳',
      'Tillykke med dit nye køb! ✨'
    ],
    [TransactionType.PENALTY]: [
      'Næste gang går det bedre! 💪',
      'Lær af dette og fortsæt! 🌱',
      'Du kan gøre det bedre! ⭐',
      'Hver fejl er en mulighed for at lære! 📚'
    ]
  };

  constructor(
    private confettiService: ConfettiService
  ) {}

  // Main celebration method for transactions
  celebrateTransaction(transaction: Transaction, position?: { x: number; y: number }): void {
    const theme = this.getThemeForTransactionType(transaction.type);
    const intensity = this.getIntensityForAmount(transaction.amount);
    const message = this.getRandomMessage(transaction.type);

    this.celebrationSubject.next({
      type: 'confetti',
      theme,
      message,
      intensity,
      position,
      duration: 3000
    });

    if (position) {
      this.confettiService.celebrateAt(position.x, position.y, theme);
    } else {
      this.confettiService.celebrate(theme, this.getOptionsForIntensity(intensity));
    }
  }

  // Celebrate reward with specific amount-based intensity
  celebrateReward(amount: number, position?: { x: number; y: number }): void {
    const intensity = this.getIntensityForAmount(amount);
    const message = this.getRandomMessage(TransactionType.REWARD);

    this.celebrationSubject.next({
      type: 'confetti',
      theme: 'reward',
      message,
      intensity,
      position
    });

    if (position) {
      this.confettiService.celebrateAt(position.x, position.y, 'reward');
    } else {
      this.confettiService.celebrateReward(amount);
    }
  }

  // Celebrate allowance
  celebrateAllowance(position?: { x: number; y: number }): void {
    const message = this.getRandomMessage(TransactionType.ALLOWANCE);

    this.celebrationSubject.next({
      type: 'confetti',
      theme: 'allowance',
      message,
      intensity: 'medium',
      position
    });

    if (position) {
      this.confettiService.celebrateAt(position.x, position.y, 'allowance');
    } else {
      this.confettiService.celebrateAllowance();
    }
  }

  // Celebrate bonus
  celebrateBonus(amount: number, position?: { x: number; y: number }): void {
    const intensity = this.getIntensityForAmount(amount);
    const message = this.getRandomMessage(TransactionType.BONUS);

    this.celebrationSubject.next({
      type: 'confetti',
      theme: 'bonus',
      message,
      intensity,
      position
    });

    if (position) {
      this.confettiService.celebrateAt(position.x, position.y, 'bonus');
    } else {
      this.confettiService.celebrateBonus();
    }
  }

  // Celebrate savings/achievement
  celebrateAchievement(description?: string, position?: { x: number; y: number }): void {
    const message = description || this.getRandomMessage(TransactionType.SAVINGS);

    this.celebrationSubject.next({
      type: 'confetti',
      theme: 'achievement',
      message,
      intensity: 'high',
      position
    });

    if (position) {
      this.confettiService.celebrateAt(position.x, position.y, 'achievement');
    } else {
      this.confettiService.celebrateAchievement();
    }
  }

  // Celebrate purchase (gentle celebration)
  celebratePurchase(description: string, position?: { x: number; y: number }): void {
    const message = `${description} - ${this.getRandomMessage(TransactionType.PURCHASE)}`;

    this.celebrationSubject.next({
      type: 'confetti',
      theme: 'reward',
      message,
      intensity: 'low',
      position
    });

    const options = { particleCount: 50, spread: 40, startVelocity: 25 };
    if (position) {
      this.confettiService.celebrateAt(position.x, position.y, 'reward');
    } else {
      this.confettiService.celebrate('reward', options);
    }
  }

  // Custom celebration with message
  celebrateWithMessage(message: string, theme: string = 'reward', intensity: 'low' | 'medium' | 'high' = 'medium'): void {
    this.celebrationSubject.next({
      type: 'confetti',
      theme,
      message,
      intensity
    });

    this.confettiService.celebrate(theme, this.getOptionsForIntensity(intensity));
  }

  // Special Danish-themed celebrations
  celebrateDanishWay(): void {
    const message = 'Tillykke på dansk! 🇩🇰';

    this.celebrationSubject.next({
      type: 'confetti',
      theme: 'danish',
      message,
      intensity: 'high'
    });

    this.confettiService.celebrate('danish');
  }

  // Birthday or special event celebration
  celebrateSpecialEvent(childName: string, event: string): void {
    const message = `Tillykke ${childName}! ${event} 🎂`;

    this.celebrationSubject.next({
      type: 'confetti',
      theme: 'achievement',
      message,
      intensity: 'high',
      duration: 5000
    });

    // Multiple confetti bursts for special events
    this.confettiService.celebrate('reward');
    setTimeout(() => this.confettiService.celebrate('hearts'), 500);
    setTimeout(() => this.confettiService.celebrate('stars'), 1000);
  }

  // Get theme based on transaction type
  private getThemeForTransactionType(type: TransactionType): string {
    switch (type) {
      case TransactionType.REWARD:
        return 'reward';
      case TransactionType.ALLOWANCE:
        return 'allowance';
      case TransactionType.BONUS:
        return 'bonus';
      case TransactionType.SAVINGS:
        return 'savings';
      case TransactionType.PURCHASE:
        return 'reward';
      case TransactionType.PENALTY:
        return 'danish';
      default:
        return 'reward';
    }
  }

  // Get intensity based on amount
  private getIntensityForAmount(amount: number): 'low' | 'medium' | 'high' {
    const absAmount = Math.abs(amount);
    if (absAmount >= 100) return 'high';
    if (absAmount >= 50) return 'medium';
    return 'low';
  }

  // Get confetti options for intensity
  private getOptionsForIntensity(intensity: 'low' | 'medium' | 'high') {
    switch (intensity) {
      case 'high':
        return { particleCount: 200, spread: 90, startVelocity: 55, scalar: 1.3 };
      case 'medium':
        return { particleCount: 120, spread: 70, startVelocity: 45, scalar: 1.1 };
      case 'low':
        return { particleCount: 80, spread: 50, startVelocity: 35, scalar: 0.9 };
    }
  }

  // Get random message for transaction type
  private getRandomMessage(type: TransactionType): string {
    const messages = this.danishMessages[type];
    if (!messages || messages.length === 0) {
      return 'Tillykke! 🎉';
    }
    return messages[Math.floor(Math.random() * messages.length)];
  }

  // Test all celebration types (for development)
  testAllCelebrations(): void {
    const celebrations = [
      () => this.celebrateReward(75),
      () => this.celebrateAllowance(),
      () => this.celebrateBonus(50),
      () => this.celebrateAchievement('Test præstation'),
      () => this.celebratePurchase('Test køb'),
      () => this.celebrateDanishWay()
    ];

    celebrations.forEach((celebration, index) => {
      setTimeout(celebration, index * 1500);
    });
  }

  // Clear all celebrations
  clearCelebrations(): void {
    this.confettiService.clearAll();
  }
}
