import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { CelebrationService } from './celebration.service';
import { ConfettiService } from './confetti.service';
import { EasingFunction } from '../directives/animated-counter.directive';

export interface BalanceChange {
  oldValue: number;
  newValue: number;
  difference: number;
  timestamp: Date;
  reason: 'allowance' | 'reward' | 'bonus' | 'penalty' | 'purchase' | 'savings' | 'other';
  childId: string;
  childName?: string;
}

export interface BalanceAnimationEvent {
  type: 'start' | 'progress' | 'complete' | 'milestone';
  currentValue: number;
  targetValue: number;
  progress: number; // 0-1
  childId: string;
}

export interface MilestoneConfig {
  value: number;
  message: string;
  emoji: string;
  celebrationType: 'confetti' | 'stars' | 'fireworks';
  intensity: 'low' | 'medium' | 'high';
}

@Injectable({
  providedIn: 'root'
})
export class BalanceAnimationService {
  private balanceChangeSubject = new Subject<BalanceChange>();
  private animationEventSubject = new Subject<BalanceAnimationEvent>();
  
  // Danish child-friendly messages for different balance ranges
  private readonly balanceMessages = {
    milestone: {
      50: { message: 'Du har nu 50 kr.! Det er fantastisk! 🌟', emoji: '🌟' },
      100: { message: 'Wow! Du har 100 kr.! Du er en spar-stjerne! ⭐', emoji: '⭐' },
      200: { message: 'Utroligt! 200 kr.! Du er rigtig god til at spare! 🏆', emoji: '🏆' },
      300: { message: 'Fantastisk! 300 kr.! Du er en rigtig penge-mester! 👑', emoji: '👑' },
      500: { message: 'Uha! 500 kr.! Du er en super-sparer! 💎', emoji: '💎' }
    },
    increase: [
      'Flere penge til dig! 💰',
      'Din saldo vokser! 🌱',
      'Godt arbejde med dine penge! ⭐',
      'Du bliver rigere og rigere! 📈',
      'Fantastisk! Dine penge vokser! 🌟'
    ],
    decrease: [
      'Du har købt noget fedt! 🛍️',
      'Penge brugt, men du lærer! 📚',
      'Det er okay, du får mere snart! 💪',
      'Du brugte dine penge klogt! ✨',
      'Næste gang har du mere! 🌈'
    ],
    encouragement: [
      'Du klarer det så godt! 💪',
      'Fortsæt det gode arbejde! ⭐',
      'Du er en stjerne! 🌟',
      'Du lærer at spare! 📖',
      'Du er fantastisk! 🎉'
    ]
  };

  // Predefined milestones for celebrations
  private readonly defaultMilestones: MilestoneConfig[] = [
    { value: 50, message: 'Du har nået 50 kr.!', emoji: '🎯', celebrationType: 'stars', intensity: 'low' },
    { value: 100, message: 'Wow! 100 kr.!', emoji: '💯', celebrationType: 'confetti', intensity: 'medium' },
    { value: 200, message: '200 kr.! Du er en stjerne!', emoji: '⭐', celebrationType: 'fireworks', intensity: 'medium' },
    { value: 300, message: '300 kr.! Utroligt!', emoji: '🏆', celebrationType: 'confetti', intensity: 'high' },
    { value: 500, message: '500 kr.! Du er en mester!', emoji: '👑', celebrationType: 'fireworks', intensity: 'high' },
    { value: 1000, message: '1000 kr.! Du er fantastisk!', emoji: '💎', celebrationType: 'confetti', intensity: 'high' }
  ];

  public balanceChanges$: Observable<BalanceChange> = this.balanceChangeSubject.asObservable();
  public animationEvents$: Observable<BalanceAnimationEvent> = this.animationEventSubject.asObservable();

  constructor(
    private celebrationService: CelebrationService,
    private confettiService: ConfettiService,
    private ngZone: NgZone
  ) {}

  /**
   * Trigger a balance change animation with celebration effects
   */
  animateBalanceChange(change: BalanceChange): void {
    this.balanceChangeSubject.next(change);

    // Determine animation style based on change type and amount
    const animationConfig = this.getAnimationConfig(change);

    // Check for milestone achievements
    this.checkMilestones(change);

    // Trigger appropriate celebration
    this.triggerCelebration(change, animationConfig);

    // Emit animation start event
    this.animationEventSubject.next({
      type: 'start',
      currentValue: change.oldValue,
      targetValue: change.newValue,
      progress: 0,
      childId: change.childId
    });
  }

  /**
   * Get animation configuration based on balance change
   */
  private getAnimationConfig(change: BalanceChange): any {
    const difference = Math.abs(change.difference);
    const isIncrease = change.difference > 0;

    // Base configuration
    let config: {
      duration: number;
      easing: EasingFunction;
      colorAnimation: boolean;
      scaleAnimation: boolean;
      showSign: boolean;
      suffix: string;
    } = {
      duration: 1500,
      easing: 'easeOut',
      colorAnimation: true,
      scaleAnimation: true,
      showSign: false,
      suffix: ' kr.'
    };

    // Adjust based on amount and type
    if (difference >= 100) {
      // Large amount - longer, more dramatic animation
      config.duration = 2500;
      config.easing = 'bounce';
      config.scaleAnimation = true;
    } else if (difference >= 50) {
      // Medium amount
      config.duration = 2000;
      config.easing = 'easeInOut';
    } else {
      // Small amount - quick and subtle
      config.duration = 1000;
      config.easing = 'easeOut';
    }

    // Special handling for different transaction types
    switch (change.reason) {
      case 'reward':
      case 'bonus':
        config.duration = Math.max(config.duration, 2000);
        config.easing = 'bounce';
        config.showSign = isIncrease;
        break;
      case 'allowance':
        config.duration = 1800;
        config.easing = 'easeInOut';
        config.showSign = isIncrease;
        break;
      case 'penalty':
        config.duration = 1200;
        config.easing = 'easeOut';
        config.scaleAnimation = false; // Gentler for penalties
        break;
      case 'purchase':
        config.duration = 1000;
        config.easing = 'easeIn';
        break;
    }

    return config;
  }

  /**
   * Check if balance change triggers any milestones
   */
  private checkMilestones(change: BalanceChange): void {
    const oldValue = change.oldValue;
    const newValue = change.newValue;

    // Only check milestones for increases
    if (newValue <= oldValue) return;

    // Find milestones crossed
    const milestoneCrossed = this.defaultMilestones.find(milestone => 
      oldValue < milestone.value && newValue >= milestone.value
    );

    if (milestoneCrossed) {
      this.triggerMilestoneCelebration(milestoneCrossed, change);
    }
  }

  /**
   * Trigger milestone celebration
   */
  private triggerMilestoneCelebration(milestone: MilestoneConfig, change: BalanceChange): void {
    const message = `${change.childName || 'Du'}: ${milestone.message} ${milestone.emoji}`;

    setTimeout(() => {
      switch (milestone.celebrationType) {
        case 'confetti':
          this.celebrationService.celebrateWithMessage(message, 'achievement', milestone.intensity);
          break;
        case 'stars':
          this.celebrationService.celebrateWithMessage(message, 'stars', milestone.intensity);
          break;
        case 'fireworks':
          this.celebrationService.celebrateWithMessage(message, 'celebration', milestone.intensity);
          break;
      }

      // Emit milestone event
      this.animationEventSubject.next({
        type: 'milestone',
        currentValue: milestone.value,
        targetValue: change.newValue,
        progress: 1,
        childId: change.childId
      });
    }, 1000); // Delay to let balance animation start first
  }

  /**
   * Trigger celebration based on balance change
   */
  private triggerCelebration(change: BalanceChange, config: any): void {
    const difference = change.difference;
    const isIncrease = difference > 0;
    const childName = change.childName || 'Du';

    if (isIncrease) {
      // Positive balance change
      const message = this.getRandomMessage(this.balanceMessages.increase);
      const fullMessage = `${childName}: ${message}`;

      // Determine celebration intensity
      let intensity: 'low' | 'medium' | 'high' = 'low';
      if (difference >= 100) intensity = 'high';
      else if (difference >= 50) intensity = 'medium';

      // Trigger celebration based on reason
      switch (change.reason) {
        case 'reward':
        case 'bonus':
          this.celebrationService.celebrateWithMessage(fullMessage, 'reward', intensity);
          break;
        case 'allowance':
          this.celebrationService.celebrateWithMessage(fullMessage, 'achievement', 'medium');
          break;
        default:
          this.celebrationService.celebrateWithMessage(fullMessage, 'celebration', intensity);
      }
    } else {
      // Balance decrease - supportive, not punitive
      const message = this.getRandomMessage(this.balanceMessages.decrease);
      const fullMessage = `${childName}: ${message}`;

      // Gentle celebration to stay positive
      this.celebrationService.celebrateWithMessage(fullMessage, 'encouragement', 'low');
    }
  }

  /**
   * Get a random message from an array
   */
  private getRandomMessage(messages: string[]): string {
    return messages[Math.floor(Math.random() * messages.length)];
  }

  /**
   * Trigger balance animation progress event
   */
  triggerProgressEvent(childId: string, currentValue: number, targetValue: number, progress: number): void {
    this.animationEventSubject.next({
      type: 'progress',
      currentValue,
      targetValue,
      progress,
      childId
    });
  }

  /**
   * Trigger balance animation complete event
   */
  triggerCompleteEvent(childId: string, finalValue: number): void {
    this.animationEventSubject.next({
      type: 'complete',
      currentValue: finalValue,
      targetValue: finalValue,
      progress: 1,
      childId
    });

    // Show encouragement message
    const encouragement = this.getRandomMessage(this.balanceMessages.encouragement);
    setTimeout(() => {
      // Use celebrateWithMessage instead since showQuickMessage doesn't exist
      this.celebrationService.celebrateWithMessage(`${encouragement} 💫`, 'celebration', 'low');
    }, 500);
  }

  /**
   * Create a balance change from transaction data
   */
  createBalanceChangeFromTransaction(
    oldBalance: number, 
    newBalance: number, 
    transactionType: string, 
    childId: string, 
    childName?: string
  ): BalanceChange {
    return {
      oldValue: oldBalance,
      newValue: newBalance,
      difference: newBalance - oldBalance,
      timestamp: new Date(),
      reason: this.mapTransactionTypeToReason(transactionType),
      childId,
      childName
    };
  }

  /**
   * Map transaction type to balance change reason
   */
  private mapTransactionTypeToReason(transactionType: string): BalanceChange['reason'] {
    switch (transactionType.toLowerCase()) {
      case 'allowance': return 'allowance';
      case 'reward': return 'reward';
      case 'bonus': return 'bonus';
      case 'penalty': return 'penalty';
      case 'purchase': return 'purchase';
      case 'savings': return 'savings';
      default: return 'other';
    }
  }

  /**
   * Get animation configuration for a specific balance value
   */
  getConfigForBalance(balance: number, transactionType?: string): any {
    const baseConfig: {
      duration: number;
      easing: EasingFunction;
      colorAnimation: boolean;
      scaleAnimation: boolean;
      decimals: number;
      suffix: string;
    } = {
      duration: 1500,
      easing: 'easeOut',
      colorAnimation: true,
      scaleAnimation: true,
      decimals: 0,
      suffix: ' kr.'
    };

    // Adjust for different balance ranges
    if (balance >= 500) {
      baseConfig.duration = 2000;
      baseConfig.easing = 'bounce';
    } else if (balance >= 200) {
      baseConfig.duration = 1800;
      baseConfig.easing = 'easeInOut';
    } else if (balance < 0) {
      baseConfig.duration = 1000;
      baseConfig.easing = 'easeOut';
      baseConfig.scaleAnimation = false;
    }

    return baseConfig;
  }
}