import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { FamilyService, Family } from '../../services/family.service';
import { TransactionService, Transaction, TransactionType } from '../../services/transaction.service';
import { CelebrationService } from '../../services/celebration.service';
import { ConfettiService } from '../../services/confetti.service';
import { BreadcrumbService } from '../../services/breadcrumb.service';
import { BalanceAnimationService, BalanceChange } from '../../services/balance-animation.service';
import { Child } from '../child-registration-modal/child-registration-modal.component';
import { environment } from '../../../environments/environment';

// Interfaces for child-specific data
export interface ChildGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  emoji: string;
  color: string;
  priority: 'high' | 'medium' | 'low';
  createdDate: Date;
}

export interface PurchaseSuggestion {
  name: string;
  price: number;
  emoji: string;
  category: string;
  canAfford: boolean;
}

@Component({
  selector: 'app-child-dashboard',
  standalone: false,
  templateUrl: './child-dashboard.component.html',
  styleUrl: './child-dashboard.component.scss'
})
export class ChildDashboardComponent implements OnInit, OnDestroy {
  // Current child data
  currentChild: Child | null = null;
  childId: string | null = null;
  isLoading = true;
  
  // Family context
  currentFamily: Family | null = null;
  
  // Dashboard data
  recentTransactions: Transaction[] = [];
  childGoals: ChildGoal[] = [];
  purchaseSuggestions: PurchaseSuggestion[] = [];
  
  // Loading states
  isLoadingTransactions = false;
  isLoadingGoals = false;
  
  // UI state
  stickyNoteRotation = 0;
  balanceColor = '#FFD700';
  celebratingBalance = false;
  selectedTransaction: Transaction | null = null;
  Math = Math; // Make Math available to template
  
  // Balance animation state
  animatedBalance: number = 0;
  previousBalance: number = 0;
  balanceAnimationConfig: any = {
    duration: 1500,
    easing: 'easeOut',
    colorAnimation: true,
    scaleAnimation: true,
    suffix: ' kr.',
    decimals: 0,
    onComplete: () => this.onBalanceAnimationComplete(),
    onUpdate: (currentValue: number) => this.onBalanceAnimationUpdate(currentValue)
  };
  
  private subscriptions = new Subscription();

  // Enhanced sticker data for each transaction type
  private stickerShapes = ['circle', 'star', 'heart', 'hexagon', 'rectangle', 'diamond', 'flower'];
  private stickerRotations = new Map<string, number>();

  // Emoji collections for fun UI
  balanceEmojis = ['💰', '🪙', '💵', '✨', '🌟', '⭐'];
  goalEmojis = ['🎯', '🏆', '🎮', '🚲', '📱', '🧸', '🎨', '📚'];
  activityEmojis = ['🎉', '💫', '🌈', '🎈', '🦄', '🍭', '🎁', '🏅'];
  
  // Danish child-friendly messages
  encouragementMessages = [
    'Du klarer det super godt! 🌟',
    'Wow, du er rigtig god til at spare! ⭐',
    'Du er på vej mod dit mål! 🎯',
    'Fantastisk arbejde! 🎉',
    'Du er en stjerne! ⭐'
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private familyService: FamilyService,
    private transactionService: TransactionService,
    private celebrationService: CelebrationService,
    private confettiService: ConfettiService,
    private balanceAnimationService: BalanceAnimationService,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private breadcrumbService: BreadcrumbService
  ) {
    // Generate random rotation for sticky note effect
    this.stickyNoteRotation = Math.random() * 6 - 3; // -3 to 3 degrees
  }

  ngOnInit(): void {
    // Get child ID from route parameters
    this.childId = this.route.snapshot.paramMap.get('childId');
    
    if (!this.childId) {
      this.snackBar.open('Ingen barn ID fundet', 'Luk', { duration: 3000 });
      this.router.navigate(['/dashboard']);
      return;
    }

    // Subscribe to current family
    this.subscriptions.add(
      this.familyService.currentFamily$.subscribe(family => {
        this.currentFamily = family;
        if (family) {
          this.loadChildData();
        }
      })
    );

    // Subscribe to balance animation events
    this.subscriptions.add(
      this.balanceAnimationService.animationEvents$.subscribe(event => {
        if (event.childId === this.childId) {
          this.handleBalanceAnimationEvent(event);
        }
      })
    );

    // Load initial data
    this.loadChildData();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // Load all child-specific data
  private loadChildData(): void {
    if (!this.childId || !this.currentFamily?.id) return;

    this.isLoading = true;
    
    // Load child details
    this.loadChild();
    
    // Load child's transactions
    this.loadChildTransactions();
    
    // Load child's goals (mock for now)
    this.loadChildGoals();
    
    // Generate purchase suggestions
    this.generatePurchaseSuggestions();
  }

  // Load specific child data
  private loadChild(): void {
    if (!this.childId || !this.currentFamily?.id) return;

    const apiUrl = `/api/app2/pocket-money-users/child/${this.childId}`;
    
    this.subscriptions.add(
      this.http.get<Child>(apiUrl).subscribe({
        next: (child) => {
          const oldBalance = this.currentChild?.currentBalance || 0;
          const newBalance = child.currentBalance;
          
          this.currentChild = child;
          this.isLoading = false;
          
          // Initialize or animate balance
          if (this.animatedBalance === 0) {
            // First load - no animation
            this.animatedBalance = newBalance;
            this.previousBalance = newBalance;
          } else if (oldBalance !== newBalance) {
            // Balance changed - animate it
            this.animateBalanceChange(oldBalance, newBalance);
          }
          
          // Set balance color based on amount
          this.updateBalanceColor(newBalance);
          
          // Show celebration if balance is good
          if (newBalance > 100) {
            this.celebrateBalance();
          }
        },
        error: (error) => {
          console.error('Error loading child:', error);
          this.isLoading = false;
          this.snackBar.open('Kunne ikke indlæse barnets data', 'Luk', { duration: 3000 });
          this.router.navigate(['/dashboard']);
        }
      })
    );
  }

  // Load child's recent transactions
  private loadChildTransactions(): void {
    if (!this.childId) return;

    this.isLoadingTransactions = true;
    
    this.subscriptions.add(
      this.transactionService.getChildTransactions(this.childId, 10).subscribe({
        next: (transactions) => {
          this.recentTransactions = transactions;
          this.isLoadingTransactions = false;
        },
        error: (error) => {
          console.error('Error loading transactions:', error);
          this.isLoadingTransactions = false;
        }
      })
    );
  }

  // Load child's savings goals (mock implementation for now)
  private loadChildGoals(): void {
    this.isLoadingGoals = true;
    
    // Mock goals - in real implementation, this would come from API
    const mockGoals: ChildGoal[] = [
      {
        id: '1',
        name: 'Ny cykel',
        targetAmount: 800,
        currentAmount: this.currentChild?.currentBalance || 0,
        emoji: '🚲',
        color: '#FF6B6B',
        priority: 'high',
        createdDate: new Date()
      },
      {
        id: '2',
        name: 'Tegnesæt',
        targetAmount: 150,
        currentAmount: this.currentChild?.currentBalance || 0,
        emoji: '🎨',
        color: '#4ECDC4',
        priority: 'medium',
        createdDate: new Date()
      }
    ];

    // Simulate API delay
    setTimeout(() => {
      this.childGoals = mockGoals.filter(goal => goal.targetAmount > (this.currentChild?.currentBalance || 0));
      this.isLoadingGoals = false;
    }, 500);
  }

  // Generate purchase suggestions based on balance
  private generatePurchaseSuggestions(): void {
    const balance = this.currentChild?.currentBalance || 0;
    
    const allSuggestions: PurchaseSuggestion[] = [
      { name: 'Slik', price: 10, emoji: '🍭', category: 'Snacks', canAfford: balance >= 10 },
      { name: 'Klistermærker', price: 15, emoji: '⭐', category: 'Legetøj', canAfford: balance >= 15 },
      { name: 'Lille bog', price: 25, emoji: '📚', category: 'Bøger', canAfford: balance >= 25 },
      { name: 'Blyanter', price: 30, emoji: '✏️', category: 'Skole', canAfford: balance >= 30 },
      { name: 'Legetøjsbil', price: 50, emoji: '🚗', category: 'Legetøj', canAfford: balance >= 50 },
      { name: 'Puslespil', price: 75, emoji: '🧩', category: 'Spil', canAfford: balance >= 75 },
      { name: 'LEGO sæt (lille)', price: 100, emoji: '🧱', category: 'Legetøj', canAfford: balance >= 100 },
      { name: 'Spil til tablet', price: 25, emoji: '🎮', category: 'Spil', canAfford: balance >= 25 }
    ];

    // Show 4 suggestions: 2 affordable, 2 stretch goals
    const affordable = allSuggestions.filter(s => s.canAfford).slice(0, 3);
    const stretch = allSuggestions.filter(s => !s.canAfford && s.price <= balance * 1.5).slice(0, 2);
    
    this.purchaseSuggestions = [...affordable, ...stretch].slice(0, 4);
  }

  // Update balance color based on amount
  private updateBalanceColor(balance: number): void {
    if (balance >= 200) {
      this.balanceColor = '#4CAF50'; // Green - lots of money
    } else if (balance >= 100) {
      this.balanceColor = '#FFD700'; // Gold - good amount
    } else if (balance >= 50) {
      this.balanceColor = '#FF9800'; // Orange - moderate
    } else {
      this.balanceColor = '#F44336'; // Red - low balance
    }
  }

  // Celebrate good balance with animation
  private celebrateBalance(): void {
    this.celebratingBalance = true;
    
    // Trigger confetti for good balance
    if (this.currentChild && this.currentChild.currentBalance > 100) {
      this.celebrationService.celebrateWithMessage(
        `${this.currentChild.name}, du har en fantastisk saldo! 💰`, 
        'achievement', 
        'medium'
      );
    }
    
    setTimeout(() => {
      this.celebratingBalance = false;
    }, 2000);
  }

  // Get display age for child
  getChildAge(): number {
    if (!this.currentChild) return 0;
    
    if (this.currentChild.age !== null) return this.currentChild.age;
    
    if (this.currentChild.dateOfBirth) {
      const birthDate = new Date(this.currentChild.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return Math.max(0, age);
    }
    
    return 0;
  }

  // Get goal progress percentage
  getGoalProgress(goal: ChildGoal): number {
    if (!goal.targetAmount || goal.targetAmount <= 0) return 0;
    const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
    return progress;
  }

  // Get random encouragement message
  getEncouragementMessage(): string {
    const randomIndex = Math.floor(Math.random() * this.encouragementMessages.length);
    return this.encouragementMessages[randomIndex];
  }

  // Get random emoji for activities
  getRandomEmoji(collection: string[]): string {
    const randomIndex = Math.floor(Math.random() * collection.length);
    return collection[randomIndex];
  }

  // Format currency for child display
  formatCurrency(amount: number): string {
    return `${amount.toFixed(0)} kr.`; // Simplified for children
  }

  // Format date for child display
  formatDateForChild(date: string | Date): string {
    const d = new Date(date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - d.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'I dag 🌟';
    if (diffDays === 1) return 'I går 📅';
    if (diffDays <= 7) return `For ${diffDays} dage siden`;
    return d.toLocaleDateString('da-DK', { day: 'numeric', month: 'short' });
  }

  // Get transaction emoji and description for children
  getChildFriendlyTransaction(transaction: Transaction): { emoji: string, description: string, color: string } {
    switch (transaction.type) {
      case TransactionType.ALLOWANCE:
        return { emoji: '💰', description: 'Ugepenge', color: '#4CAF50' };
      case TransactionType.REWARD:
        return { emoji: '🎉', description: 'Belønning', color: '#FF9800' };
      case TransactionType.BONUS:
        return { emoji: '⭐', description: 'Bonus', color: '#2196F3' };
      case TransactionType.PENALTY:
        return { emoji: '😔', description: 'Fratræk', color: '#F44336' };
      case TransactionType.PURCHASE:
        return { emoji: '🛍️', description: 'Køb', color: '#9C27B0' };
      default:
        return { emoji: '💸', description: 'Penge', color: '#607D8B' };
    }
  }

  // Navigation methods
  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  // Fun interaction methods for children
  bounceBalance(): void {
    const stickyNote = document.querySelector('.sticky-note-balance') as HTMLElement;
    if (stickyNote) {
      stickyNote.classList.add('balance-bounce');
      
      // Set CSS custom property for rotation
      stickyNote.style.setProperty('--rotation', `${this.stickyNoteRotation}deg`);
      
      setTimeout(() => {
        stickyNote.classList.remove('balance-bounce');
      }, 800);
    }

    // Trigger a fun celebration message
    this.celebrateClick('Du klikkede på din saldo! 💰');
    
    // Add pulse effect to the balance amount
    const balanceAmount = document.querySelector('.balance-amount') as HTMLElement;
    if (balanceAmount) {
      balanceAmount.classList.add('counter-scale-effect');
      setTimeout(() => {
        balanceAmount.classList.remove('counter-scale-effect');
      }, 600);
    }
  }

  // Show success message when child clicks on achievements
  celebrateClick(message: string, event?: MouseEvent): void {
    const position = event ? { x: event.clientX, y: event.clientY } : undefined;
    
    // Trigger confetti at click position for children
    this.celebrationService.celebrateWithMessage(message, 'celebration', 'low');
    
    this.snackBar.open(`${message} ${this.getRandomEmoji(this.activityEmojis)}`, '', { 
      duration: 2000,
      panelClass: ['child-celebration-snackbar']
    });
  }

  // Enhanced sticker methods
  getEnhancedStickerData(transaction: Transaction): { emoji: string, title: string, badge: string, gentleMessage: string } {
    switch (transaction.type) {
      case TransactionType.ALLOWANCE:
        return { 
          emoji: '💰', 
          title: 'Ugepenge!', 
          badge: 'Woo-hoo!', 
          gentleMessage: '' 
        };
      case TransactionType.REWARD:
        return { 
          emoji: '🌟', 
          title: 'Belønning!', 
          badge: 'Stjerne!', 
          gentleMessage: '' 
        };
      case TransactionType.BONUS:
        return { 
          emoji: '🎉', 
          title: 'Bonus!', 
          badge: 'Fantastisk!', 
          gentleMessage: '' 
        };
      case TransactionType.PENALTY:
        return { 
          emoji: '🤗', 
          title: 'Læring', 
          badge: '', 
          gentleMessage: 'Næste gang gør du det bedre!' 
        };
      case TransactionType.PURCHASE:
        return { 
          emoji: '🛍️', 
          title: 'Køb', 
          badge: '', 
          gentleMessage: 'Du brugte dine penge klogt!' 
        };
      default:
        return { 
          emoji: '💸', 
          title: 'Penge-aktivitet', 
          badge: '', 
          gentleMessage: '' 
        };
    }
  }

  getStickerClass(transaction: Transaction, index: number): string {
    const baseClass = 'sticker-base';
    const shape = this.stickerShapes[index % this.stickerShapes.length];
    const typeClass = `sticker-${transaction.type}`;
    const amountClass = transaction.amount > 100 ? 'sticker-large' : transaction.amount > 50 ? 'sticker-medium' : 'sticker-small';
    return `${baseClass} ${shape} ${typeClass} ${amountClass}`;
  }

  getStickerTransform(transaction: Transaction, index: number): string {
    const transactionId = transaction.id || `${index}`;
    
    if (!this.stickerRotations.has(transactionId)) {
      const rotation = Math.random() * 20 - 10; // -10 to 10 degrees
      this.stickerRotations.set(transactionId, rotation);
    }
    
    const rotation = this.stickerRotations.get(transactionId)!;
    const scale = 0.9 + (Math.random() * 0.2); // 0.9 to 1.1
    const translateX = Math.random() * 10 - 5; // -5 to 5px
    const translateY = Math.random() * 10 - 5; // -5 to 5px
    
    return `rotate(${rotation}deg) scale(${scale}) translate(${translateX}px, ${translateY}px)`;
  }

  getStickerGradient(transaction: Transaction): string {
    switch (transaction.type) {
      case TransactionType.ALLOWANCE:
        return 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)';
      case TransactionType.REWARD:
        return 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 50%, #FFB6B6 100%)';
      case TransactionType.BONUS:
        return 'linear-gradient(135deg, #4ECDC4 0%, #45B7B8 50%, #26ADE4 100%)';
      case TransactionType.PENALTY:
        return 'linear-gradient(135deg, #FFA726 0%, #FFB74D 50%, #FFCC80 100%)';
      case TransactionType.PURCHASE:
        return 'linear-gradient(135deg, #9C27B0 0%, #BA68C8 50%, #CE93D8 100%)';
      default:
        return 'linear-gradient(135deg, #607D8B 0%, #78909C 50%, #90A4AE 100%)';
    }
  }

  getStickerShadowColor(transaction: Transaction): string {
    switch (transaction.type) {
      case TransactionType.ALLOWANCE:
        return 'rgba(255, 215, 0, 0.4)';
      case TransactionType.REWARD:
        return 'rgba(255, 107, 107, 0.4)';
      case TransactionType.BONUS:
        return 'rgba(78, 205, 196, 0.4)';
      case TransactionType.PENALTY:
        return 'rgba(255, 167, 38, 0.4)';
      case TransactionType.PURCHASE:
        return 'rgba(156, 39, 176, 0.4)';
      default:
        return 'rgba(96, 125, 139, 0.4)';
    }
  }

  shouldShowPeelingCorner(index: number): boolean {
    return index % 3 === 0; // Show peeling corner on every 3rd sticker
  }

  isSpecialTransaction(transaction: Transaction): boolean {
    return transaction.type === TransactionType.REWARD || transaction.type === TransactionType.BONUS || transaction.amount >= 100;
  }

  // Modal and interaction methods
  openTransactionDetails(transaction: Transaction): void {
    this.selectedTransaction = transaction;
    this.celebrateClick('Fedt klistermærke!');
  }

  closeTransactionDetails(): void {
    this.selectedTransaction = null;
  }

  formatDateDetailedForChild(date: string | Date): string {
    const d = new Date(date);
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    };
    return d.toLocaleDateString('da-DK', options);
  }

  getTransactionStory(transaction: Transaction): string {
    const stories: { [key: string]: string[] } = {
      'allowance': [
        'Du fik dine ugepenge! Det betyder, at du har været rigtig god hele ugen. 🌟',
        'Ugepenge tid! Du har gjort dit bedste, og nu kan du planlægge, hvad du vil bruge dem på. 💡',
        'Woo-hoo! Dine ugepenge er her! Du har fortjent dem ved at være fantastisk. 🎉'
      ],
      'reward': [
        'Du blev belønnet for noget specielt! Måske hjalp du til derhjemme eller var ekstra sød? 💖',
        'En stor belønning! Du har gjort noget rigtig godt, og dine forældre er stolte af dig. 🏆',
        'Belønning tid! Du viste, at du er en stjerne, og nu har du fået penge for det. ⭐'
      ],
      'bonus': [
        'En ekstra bonus! Du har gjort noget helt særligt og fået en overraskelse. 🎁',
        'Bonus penge! Det betyder, at du har imponeret nogen med dit gode arbejde. 🌈',
        'Surprise! En bonus kom din vej fordi du er så fantastisk. 🎊'
      ],
      'penalty': [
        'Nogle gange sker der ting, men det er okay. Du lærer og bliver bedre hver dag. 🤗',
        'Det er en lille læring. Alle laver fejl, og du vil gøre det bedre næste gang. 💪',
        'En small bump på vejen. Du er stadig fantastisk, og i morgen er en ny dag. 🌅'
      ],
      'purchase': [
        'Du købte noget! Det er fedt, at du bruger dine egne penge på ting, du ønsker. 🛒',
        'Smart køb! Du sparede op og købte noget med dine egne penge. Det er voksent! 🧠',
        'Du tog en beslutning med dine penge. Det er sådan, man lærer at være god med penge. 📚'
      ]
    };
    
    const typeStories = stories[transaction.type] || stories['allowance'];
    return typeStories[Math.floor(Math.random() * typeStories.length)];
  }

  getCelebrationMessage(transaction: Transaction): string {
    const messages: { [key: string]: string[] } = {
      'allowance': ['Du er så god til at få dine ugepenge!', 'Tillykke med dine ugepenge!', 'Du har fortjent hver krone!'],
      'reward': ['Du er en superstjerne!', 'Belønninger er det bedste!', 'Du gør alt rigtigt!'],
      'bonus': ['Bonus tid! Du rockers!', 'En ekstra overraskelse til dig!', 'Du er helt utrolig!'],
      'purchase': ['Smart indkøb!', 'Du bruger dine penge klogt!', 'Fedt at du købte det!']
    };
    
    const typeMessages = messages[transaction.type] || messages['allowance'];
    return typeMessages[Math.floor(Math.random() * typeMessages.length)];
  }

  // Animation methods
  playHoverEffect(event: Event): void {
    const element = event.target as HTMLElement;
    const sticker = element.closest('.authentic-sticker') as HTMLElement;
    if (sticker) {
      sticker.classList.add('hover-wiggle');
    }
  }

  stopHoverEffect(event: Event): void {
    const element = event.target as HTMLElement;
    const sticker = element.closest('.authentic-sticker') as HTMLElement;
    if (sticker) {
      sticker.classList.remove('hover-wiggle');
    }
  }

  // Special celebration methods for child dashboard
  celebrateGoalProgress(goal: ChildGoal, event?: MouseEvent): void {
    const progress = this.getGoalProgress(goal);
    const position = event ? { x: event.clientX, y: event.clientY } : undefined;
    
    if (progress >= 100) {
      // Goal achieved!
      this.celebrationService.celebrateAchievement(`Du har nået dit mål: ${goal.name}! 🎯`, position);
    } else if (progress >= 75) {
      // Close to goal
      this.celebrationService.celebrateWithMessage(`Næsten der! ${goal.name} er næsten nået! 🌟`, 'stars', 'medium');
    } else if (progress >= 50) {
      // Halfway there
      this.celebrationService.celebrateWithMessage(`Halvvejs til ${goal.name}! Godt arbejde! 💪`, 'celebration', 'low');
    }
  }

  // Celebrate special child achievements
  celebrateSpecialEvent(message: string, theme: string = 'achievement'): void {
    this.celebrationService.celebrateWithMessage(`${this.currentChild?.name}: ${message}`, theme, 'high');
  }

  // Child-friendly transaction celebration
  celebrateTransaction(transaction: Transaction, event?: MouseEvent): void {
    const position = event ? { x: event.clientX, y: event.clientY } : undefined;
    
    // Use child-friendly messages
    const childMessage = this.getChildFriendlyTransactionMessage(transaction);
    this.celebrationService.celebrateWithMessage(childMessage, 'reward', 'medium');
  }

  // Balance animation methods
  private animateBalanceChange(oldBalance: number, newBalance: number): void {
    if (!this.childId || !this.currentChild) return;

    const balanceChange: BalanceChange = {
      oldValue: oldBalance,
      newValue: newBalance,
      difference: newBalance - oldBalance,
      timestamp: new Date(),
      reason: this.determineBalanceChangeReason(oldBalance, newBalance),
      childId: this.childId,
      childName: this.currentChild.name
    };

    // Update configuration based on change type and amount
    this.balanceAnimationConfig = {
      ...this.balanceAnimationConfig,
      ...this.balanceAnimationService.getConfigForBalance(newBalance),
      onComplete: () => this.onBalanceAnimationComplete(),
      onUpdate: (currentValue: number) => this.onBalanceAnimationUpdate(currentValue)
    };

    // Update animated balance (this will trigger the directive)
    this.previousBalance = this.animatedBalance;
    this.animatedBalance = newBalance;

    // Trigger balance animation service
    this.balanceAnimationService.animateBalanceChange(balanceChange);

    // Add visual effects to sticky note
    this.addBalanceChangeEffects(balanceChange);
  }

  private determineBalanceChangeReason(oldBalance: number, newBalance: number): BalanceChange['reason'] {
    const difference = newBalance - oldBalance;
    
    // Try to determine from recent transactions
    if (this.recentTransactions.length > 0) {
      const latestTransaction = this.recentTransactions[0];
      const transactionDate = new Date(latestTransaction.transactionDate);
      const now = new Date();
      const timeDiff = now.getTime() - transactionDate.getTime();
      
      // If the latest transaction was within the last minute and matches the balance change
      if (timeDiff < 60000 && Math.abs(latestTransaction.amount - difference) < 0.01) {
        switch (latestTransaction.type) {
          case TransactionType.ALLOWANCE: return 'allowance';
          case TransactionType.REWARD: return 'reward';
          case TransactionType.BONUS: return 'bonus';
          case TransactionType.PENALTY: return 'penalty';
          case TransactionType.PURCHASE: return 'purchase';
          case TransactionType.SAVINGS: return 'savings';
          default: return 'other';
        }
      }
    }

    // Fallback based on amount patterns
    if (difference > 0) {
      if (difference >= 100) return 'reward';
      if (difference >= 50) return 'allowance';
      return 'bonus';
    } else {
      if (Math.abs(difference) >= 50) return 'purchase';
      return 'penalty';
    }
  }

  private addBalanceChangeEffects(change: BalanceChange): void {
    const stickyNote = document.querySelector('.sticky-note-balance') as HTMLElement;
    if (!stickyNote) return;

    // Remove existing animation classes
    stickyNote.classList.remove('balance-increased', 'balance-decreased', 'milestone-achieved');

    // Add appropriate animation class
    setTimeout(() => {
      if (change.difference > 0) {
        stickyNote.classList.add('balance-increased');
        
        // Check for milestone
        if (this.isBalanceMilestone(change.newValue)) {
          setTimeout(() => {
            stickyNote.classList.add('milestone-achieved');
          }, 500);
        }
      } else {
        stickyNote.classList.add('balance-decreased');
      }
    }, 100);

    // Remove animation classes after completion
    setTimeout(() => {
      stickyNote.classList.remove('balance-increased', 'balance-decreased', 'milestone-achieved');
    }, 3000);
  }

  private isBalanceMilestone(balance: number): boolean {
    const milestones = [50, 100, 200, 300, 500, 1000];
    return milestones.includes(balance);
  }

  private handleBalanceAnimationEvent(event: any): void {
    switch (event.type) {
      case 'start':
        this.celebratingBalance = true;
        break;
      case 'complete':
        this.celebratingBalance = false;
        this.balanceAnimationService.triggerCompleteEvent(this.childId!, event.currentValue);
        break;
      case 'milestone':
        this.triggerMilestoneCelebration(event.currentValue);
        break;
    }
  }

  private triggerMilestoneCelebration(milestoneValue: number): void {
    const milestoneMessages = {
      50: 'Du har nået 50 kr.! 🎯',
      100: 'Fantastisk! 100 kr.! 💯',
      200: 'Utroligt! 200 kr.! ⭐',
      300: 'Wow! 300 kr.! 🏆',
      500: 'Fantastisk! 500 kr.! 👑',
      1000: 'Utroligt! 1000 kr.! 💎'
    };

    const message = milestoneMessages[milestoneValue as keyof typeof milestoneMessages] || `${milestoneValue} kr. opnået! 🌟`;
    this.celebrationService.celebrateWithMessage(`${this.currentChild?.name}: ${message}`, 'achievement', 'high');
    
    // Add extra sparkle effects
    this.addSparkleEffects();
  }

  private addSparkleEffects(): void {
    const stickyNote = document.querySelector('.sticky-note-balance') as HTMLElement;
    if (stickyNote) {
      stickyNote.classList.add('balance-sparkles');
      setTimeout(() => {
        stickyNote.classList.remove('balance-sparkles');
      }, 2000);
    }
  }

  private onBalanceAnimationUpdate(currentValue: number): void {
    // Update balance color during animation
    this.updateBalanceColor(currentValue);
    
    // Report progress to animation service
    if (this.childId) {
      this.balanceAnimationService.triggerProgressEvent(
        this.childId, 
        currentValue, 
        this.animatedBalance, 
        Math.abs(currentValue - this.previousBalance) / Math.abs(this.animatedBalance - this.previousBalance)
      );
    }
  }

  private onBalanceAnimationComplete(): void {
    this.celebratingBalance = false;
    
    // Final color update
    if (this.currentChild) {
      this.updateBalanceColor(this.currentChild.currentBalance);
    }
  }

  // Generate child-friendly transaction messages
  private getChildFriendlyTransactionMessage(transaction: Transaction): string {
    const childMessages: { [key in TransactionType]: string[] } = {
      [TransactionType.REWARD]: [
        'Du har været fantastisk! 🌟',
        'Godt klaret! Her er din belønning! 🎉',
        'Du fortjener dette! 🏆',
        'Så sej en præstation! ⭐'
      ],
      [TransactionType.ALLOWANCE]: [
        'Ugepenge tid! 💰',
        'Dine penge er her! 🪙',
        'Ugepenge leveret! 🎯',
        'Tid til nye muligheder! ✨'
      ],
      [TransactionType.BONUS]: [
        'Ekstra bonus til dig! 🌟',
        'Du har været ekstra sød! 💫',
        'Bonus for godt arbejde! 🎊',
        'En lille ekstra overraskelse! 🎁'
      ],
      [TransactionType.SAVINGS]: [
        'Godt opsparet! 🐷',
        'Du sparer som en stjerne! 💪',
        'Nærmere dit mål! 🎯',
        'Smart opsparingsarbejde! 📈'
      ],
      [TransactionType.PURCHASE]: [
        'Fedt køb! 🛍️',
        'Håber du nyder det! 🎁',
        'Godt valg! ✨',
        'Tillykke med dit nye køb! 🛒'
      ],
      [TransactionType.PENALTY]: [
        'Næste gang gør du det bedre! 💪',
        'Det er okay at lave fejl! 🌱',
        'Du lærer og bliver stærkere! 📚',
        'Alle begår fejl - du klarer det! ⭐'
      ]
    };

    const messages = childMessages[transaction.type] || ['Tillykke! 🎉'];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    return `${this.currentChild?.name}, ${randomMessage}`;
  }
}