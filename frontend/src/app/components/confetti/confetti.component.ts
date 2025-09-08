import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ConfettiService, CelebrationTheme, ConfettiPattern } from '../../services/confetti.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-confetti',
  standalone: true,
  template: `
    <div #confettiContainer class="confetti-overlay" [class.active]="isActive">
      <div class="celebration-message" [class.show]="showMessage" [@fadeInOut]>
        {{ celebrationMessage }}
      </div>
    </div>
  `,
  styleUrls: ['./confetti.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeInOut', [
      state('in', style({ opacity: 1, transform: 'scale(1)' })),
      transition('void => *', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate(300, style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition('* => void', [
        animate(300, style({ opacity: 0, transform: 'scale(0.8)' }))
      ])
    ])
  ]
})
export class ConfettiComponent implements OnInit, OnDestroy {
  @Input() theme: string = 'reward';
  @Input() autoTrigger: boolean = false;
  @Input() disabled: boolean = false;
  @Input() intensity: 'low' | 'medium' | 'high' = 'medium';
  
  @ViewChild('confettiContainer', { static: true }) confettiContainer!: ElementRef<HTMLDivElement>;

  isActive = false;
  showMessage = false;
  celebrationMessage = '';
  private subscription = new Subscription();

  constructor(private confettiService: ConfettiService) {}

  ngOnInit(): void {
    // Subscribe to celebration messages
    this.subscription.add(
      this.confettiService.celebration$.subscribe(message => {
        this.showCelebrationMessage(message);
      })
    );

    if (this.autoTrigger && !this.disabled) {
      this.triggerCelebration();
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  triggerCelebration(): void {
    if (this.disabled) return;

    this.isActive = true;
    this.confettiService.celebrate(this.theme, this.getIntensityOptions());

    // Reset active state after animation
    setTimeout(() => {
      this.isActive = false;
    }, 3000);
  }

  triggerAt(x: number, y: number): void {
    if (this.disabled) return;

    this.confettiService.celebrateAt(x, y, this.theme);
  }

  private showCelebrationMessage(message: string): void {
    this.celebrationMessage = message;
    this.showMessage = true;

    // Hide message after 3 seconds
    setTimeout(() => {
      this.showMessage = false;
    }, 3000);
  }

  private getIntensityOptions() {
    switch (this.intensity) {
      case 'high':
        return { particleCount: 200, spread: 90, startVelocity: 55 };
      case 'medium':
        return { particleCount: 120, spread: 70, startVelocity: 45 };
      case 'low':
        return { particleCount: 80, spread: 50, startVelocity: 35 };
    }
  }
}