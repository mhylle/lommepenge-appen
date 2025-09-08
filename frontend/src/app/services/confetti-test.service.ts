import { Injectable } from '@angular/core';
import { ConfettiService } from './confetti.service';
import { CelebrationService } from './celebration.service';

@Injectable({
  providedIn: 'root'
})
export class ConfettiTestService {

  constructor(
    private confettiService: ConfettiService,
    private celebrationService: CelebrationService
  ) {}

  // Test all confetti patterns sequentially
  testAllPatterns(): void {
    const patterns = this.confettiService.getPatterns();
    
    patterns.forEach((pattern, index) => {
      setTimeout(() => {
        console.log(`Testing pattern: ${pattern.displayName}`);
        this.confettiService.runPattern(pattern);
      }, index * 2000);
    });
  }

  // Test all Danish celebration themes
  testAllThemes(): void {
    const themes = this.confettiService.getThemes();
    
    themes.forEach((theme, index) => {
      setTimeout(() => {
        console.log(`Testing theme: ${theme.displayName}`);
        this.confettiService.celebrate(theme.id);
      }, index * 3000);
    });
  }

  // Test celebration service methods
  testCelebrationService(): void {
    const celebrations = [
      () => {
        console.log('Testing reward celebration');
        this.celebrationService.celebrateReward(75);
      },
      () => {
        console.log('Testing allowance celebration');
        this.celebrationService.celebrateAllowance();
      },
      () => {
        console.log('Testing bonus celebration');
        this.celebrationService.celebrateBonus(50);
      },
      () => {
        console.log('Testing achievement celebration');
        this.celebrationService.celebrateAchievement('Test achievement!');
      },
      () => {
        console.log('Testing Danish celebration');
        this.celebrationService.celebrateDanishWay();
      },
      () => {
        console.log('Testing special event celebration');
        this.celebrationService.celebrateSpecialEvent('Emma', 'Fødselsdag');
      }
    ];

    celebrations.forEach((celebration, index) => {
      setTimeout(celebration, index * 2500);
    });
  }

  // Test confetti at different positions
  testPositionalConfetti(): void {
    const positions = [
      { x: 100, y: 100 },
      { x: window.innerWidth - 100, y: 100 },
      { x: window.innerWidth / 2, y: window.innerHeight / 2 },
      { x: 100, y: window.innerHeight - 100 },
      { x: window.innerWidth - 100, y: window.innerHeight - 100 }
    ];

    positions.forEach((position, index) => {
      setTimeout(() => {
        console.log(`Testing confetti at position: ${position.x}, ${position.y}`);
        this.confettiService.celebrateAt(position.x, position.y, 'celebration');
      }, index * 1000);
    });
  }

  // Test performance with many particles
  testPerformance(): void {
    console.log('Testing performance with high particle count');
    
    // Test with many particles
    this.confettiService.celebrate('celebration', {
      particleCount: 300,
      spread: 100,
      startVelocity: 60,
      scalar: 1.5
    });

    // Test rapid fire
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        this.confettiService.celebrate('hearts', {
          particleCount: 50,
          spread: 45,
          origin: { x: 0.1 + (i * 0.2), y: 0.6 }
        });
      }, i * 200);
    }
  }

  // Test mobile responsiveness (smaller particle counts)
  testMobileOptimized(): void {
    console.log('Testing mobile-optimized confetti');
    
    // Smaller, mobile-friendly celebrations
    const mobileOptions = {
      particleCount: 60,
      spread: 45,
      startVelocity: 35,
      scalar: 0.8
    };

    this.confettiService.celebrate('celebration', mobileOptions);
    
    setTimeout(() => {
      this.confettiService.celebrate('hearts', {
        ...mobileOptions,
        particleCount: 40
      });
    }, 1500);
  }

  // Test accessibility (reduced motion)
  testAccessibility(): void {
    console.log('Testing accessibility features');
    
    // Test with reduced motion
    this.confettiService.celebrate('celebration', {
      disableForReducedMotion: true,
      particleCount: 30,
      gravity: 0.3,
      decay: 0.95
    });
  }

  // Clear all animations
  clearAll(): void {
    console.log('Clearing all confetti animations');
    this.confettiService.clearAll();
    this.celebrationService.clearCelebrations();
  }

  // Comprehensive test suite
  runFullTestSuite(): void {
    console.log('🎉 Starting comprehensive confetti test suite');
    
    // Test 1: Individual patterns (0-10s)
    this.testAllPatterns();
    
    // Test 2: Celebration themes (12-30s)  
    setTimeout(() => this.testAllThemes(), 12000);
    
    // Test 3: Celebration service (32-45s)
    setTimeout(() => this.testCelebrationService(), 32000);
    
    // Test 4: Positional confetti (47-52s)
    setTimeout(() => this.testPositionalConfetti(), 47000);
    
    // Test 5: Performance test (54s)
    setTimeout(() => this.testPerformance(), 54000);
    
    // Test 6: Mobile optimization (58s)
    setTimeout(() => this.testMobileOptimized(), 58000);
    
    // Test 7: Accessibility (62s)
    setTimeout(() => this.testAccessibility(), 62000);
    
    // Clear all (65s)
    setTimeout(() => this.clearAll(), 65000);
    
    console.log('✅ Full test suite scheduled! Total duration: ~65 seconds');
  }
}