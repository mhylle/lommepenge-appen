import { 
  Directive, 
  ElementRef, 
  Input, 
  OnChanges, 
  SimpleChanges, 
  OnInit,
  Renderer2,
  NgZone,
  OnDestroy
} from '@angular/core';

export interface CounterAnimationConfig {
  duration: number; // Animation duration in milliseconds
  easing: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'bounce';
  prefix?: string; // e.g., '+', '-'
  suffix?: string; // e.g., ' kr.', ' DKK'
  showSign?: boolean; // Show + or - for positive/negative values
  colorAnimation?: boolean; // Enable color transitions
  scaleAnimation?: boolean; // Enable scale bounce effects
  decimals?: number; // Number of decimal places (0 for whole numbers)
  onComplete?: () => void; // Callback when animation completes
  onUpdate?: (currentValue: number) => void; // Callback during animation
}

export type EasingFunction = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'bounce';

@Directive({
  selector: '[appAnimatedCounter]',
  standalone: true
})
export class AnimatedCounterDirective implements OnInit, OnChanges, OnDestroy {
  @Input('appAnimatedCounter') targetValue: number = 0;
  @Input() counterConfig: CounterAnimationConfig = {
    duration: 1500,
    easing: 'easeOut',
    suffix: ' kr.',
    showSign: false,
    colorAnimation: true,
    scaleAnimation: true,
    decimals: 0
  };

  private currentValue: number = 0;
  private animationFrame: number | null = null;
  private isAnimating: boolean = false;
  private lastTimestamp: number = 0;
  private initialValue: number = 0;

  // Color schemes for different value ranges
  private readonly colorSchemes = {
    negative: '#F44336', // Red
    low: '#FF9800',     // Orange (0-49)
    moderate: '#FFD700', // Gold (50-99)
    good: '#4CAF50',    // Green (100-199)
    excellent: '#2196F3' // Blue (200+)
  };

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    // Initialize with current target value (no animation on init)
    this.currentValue = this.targetValue;
    this.initialValue = this.targetValue;
    this.updateDisplay(this.targetValue, false);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['targetValue'] && !changes['targetValue'].firstChange) {
      const oldValue = changes['targetValue'].previousValue || 0;
      const newValue = changes['targetValue'].currentValue || 0;
      
      if (oldValue !== newValue) {
        this.animateToValue(newValue, oldValue);
      }
    }
  }

  ngOnDestroy(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  private animateToValue(targetValue: number, fromValue: number): void {
    if (this.isAnimating && this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    this.isAnimating = true;
    this.initialValue = fromValue;
    const valueDifference = targetValue - fromValue;
    const startTime = performance.now();

    // Add initial scale effect for significant changes
    if (Math.abs(valueDifference) > 50 && this.counterConfig.scaleAnimation) {
      this.addScaleEffect();
    }

    this.ngZone.runOutsideAngular(() => {
      const animate = (timestamp: number) => {
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / this.counterConfig.duration, 1);
        
        // Apply easing function
        const easedProgress = this.applyEasing(progress, this.counterConfig.easing);
        
        // Calculate current value
        this.currentValue = fromValue + (valueDifference * easedProgress);
        
        // Update display
        this.updateDisplay(this.currentValue, true, progress);
        
        // Continue animation if not complete
        if (progress < 1) {
          this.animationFrame = requestAnimationFrame(animate);
        } else {
          this.isAnimating = false;
          this.currentValue = targetValue;
          this.updateDisplay(targetValue, false);
          
          // Trigger completion callback
          if (this.counterConfig.onComplete) {
            this.ngZone.run(() => {
              this.counterConfig.onComplete!();
            });
          }
        }

        // Trigger update callback
        if (this.counterConfig.onUpdate) {
          this.ngZone.run(() => {
            this.counterConfig.onUpdate!(this.currentValue);
          });
        }
      };

      this.animationFrame = requestAnimationFrame(animate);
    });
  }

  private updateDisplay(value: number, isAnimating: boolean = false, progress?: number): void {
    const config = this.counterConfig;
    const element = this.elementRef.nativeElement;

    // Format the number
    const formattedValue = this.formatNumber(value, config.decimals || 0);
    
    // Build display text
    let displayText = '';
    
    // Add prefix if specified
    if (config.prefix) {
      displayText += config.prefix;
    }
    
    // Add sign if enabled
    if (config.showSign && value > 0) {
      displayText += '+';
    }
    
    displayText += formattedValue;
    
    // Add suffix if specified
    if (config.suffix) {
      displayText += config.suffix;
    }

    // Update text content
    this.renderer.setProperty(element, 'textContent', displayText);

    // Apply color animation if enabled
    if (config.colorAnimation) {
      const color = this.getColorForValue(value);
      this.renderer.setStyle(element, 'color', color);
    }

    // Add animation class for CSS transitions
    if (isAnimating) {
      this.renderer.addClass(element, 'animating-counter');
    } else {
      this.renderer.removeClass(element, 'animating-counter');
    }
  }

  private formatNumber(value: number, decimals: number): string {
    const multiplier = Math.pow(10, decimals);
    const roundedValue = Math.round(value * multiplier) / multiplier;
    return roundedValue.toFixed(decimals);
  }

  private getColorForValue(value: number): string {
    if (value < 0) return this.colorSchemes.negative;
    if (value < 50) return this.colorSchemes.low;
    if (value < 100) return this.colorSchemes.moderate;
    if (value < 200) return this.colorSchemes.good;
    return this.colorSchemes.excellent;
  }

  private applyEasing(progress: number, easing: EasingFunction): number {
    switch (easing) {
      case 'linear':
        return progress;
      case 'easeIn':
        return progress * progress;
      case 'easeOut':
        return 1 - Math.pow(1 - progress, 2);
      case 'easeInOut':
        return progress < 0.5 
          ? 2 * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      case 'bounce':
        if (progress < 1 / 2.75) {
          return 7.5625 * progress * progress;
        } else if (progress < 2 / 2.75) {
          return 7.5625 * (progress -= 1.5 / 2.75) * progress + 0.75;
        } else if (progress < 2.5 / 2.75) {
          return 7.5625 * (progress -= 2.25 / 2.75) * progress + 0.9375;
        } else {
          return 7.5625 * (progress -= 2.625 / 2.75) * progress + 0.984375;
        }
      default:
        return progress;
    }
  }

  private addScaleEffect(): void {
    const element = this.elementRef.nativeElement;
    
    // Add scale animation class
    this.renderer.addClass(element, 'counter-scale-effect');
    
    // Remove class after animation completes
    setTimeout(() => {
      this.renderer.removeClass(element, 'counter-scale-effect');
    }, 600);
  }
}