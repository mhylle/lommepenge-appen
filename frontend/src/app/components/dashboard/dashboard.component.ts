import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { FamilyService, Family } from '../../services/family.service';
import { TransactionService, Transaction } from '../../services/transaction.service';
import { BreadcrumbService } from '../../services/breadcrumb.service';
import { CelebrationService } from '../../services/celebration.service';
import { ConfettiService } from '../../services/confetti.service';
import { ChildRegistrationModalComponent, Child } from '../child-registration-modal/child-registration-modal.component';
import { AddMoneyModalComponent } from '../add-money-modal/add-money-modal.component';
import { RewardModalComponent } from '../reward-modal/reward-modal.component';
import { DeductionModalComponent } from '../deduction-modal/deduction-modal.component';
import { TransactionHistoryModalComponent } from '../transaction-history-modal/transaction-history-modal.component';
import { FamilySettingsModalComponent } from '../family-settings-modal/family-settings-modal.component';
import { ChildCredentialsModalComponent, ChildCredentialsData } from '../child-credentials-modal/child-credentials-modal.component';
import { environment } from '../../../environments/environment';

// Interfaces for placeholder data
export interface PlaceholderChild {
  id: string;
  name: string;
  age: number;
  currentBalance: number;
  profileImage?: string;
  lastActivity: string;
  goal?: string;
  goalAmount?: number;
}

export interface PlaceholderTransaction {
  id: string;
  childName: string;
  amount: number;
  type: 'allowance' | 'bonus' | 'penalty' | 'purchase' | 'saving';
  description: string;
  date: string;
  icon: string;
  color: string;
}

export interface FamilyStats {
  totalSaved: number;
  childrenCount: number;
  weeklyAllowance: number;
  transactionsThisMonth: number;
  averageBalance: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  currentFamily: Family | null = null;
  isNewFamily = false;
  userName = '';
  actualChildren: Child[] = [];
  isLoadingChildren = false;
  
  // Real data properties
  recentTransactions: Transaction[] = [];
  realFamilyStats: any = null;
  isLoadingTransactions = false;
  isLoadingStats = false;
  childrenLastActivity: { [childId: string]: string } = {};
  
  // Make environment available to template
  environment = environment;
  
  private subscriptions = new Subscription();

  // Placeholder data for demonstration
  placeholderChildren: PlaceholderChild[] = [
    {
      id: '1',
      name: 'Emma',
      age: 8,
      currentBalance: 127.50,
      profileImage: 'emma.jpg',
      lastActivity: 'Købte slik for 15 kr.',
      goal: 'Ny cykel',
      goalAmount: 800
    },
    {
      id: '2', 
      name: 'Lukas',
      age: 12,
      currentBalance: 340.25,
      profileImage: 'lukas.jpg',
      lastActivity: 'Fik ugepenge: 50 kr.',
      goal: 'PlayStation spil',
      goalAmount: 500
    },
    {
      id: '3',
      name: 'Sofia',
      age: 6,
      currentBalance: 89.00,
      profileImage: 'sofia.jpg', 
      lastActivity: 'Bonus for at rydde op: 20 kr.',
      goal: 'Tegnesæt',
      goalAmount: 150
    }
  ];

  // Placeholder data removed - using real transactions from API now

  familyStats: FamilyStats = {
    totalSaved: 556.75,
    childrenCount: 3,
    weeklyAllowance: 150.00,
    transactionsThisMonth: 47,
    averageBalance: 185.58
  };

  constructor(
    private authService: AuthService,
    private familyService: FamilyService,
    private transactionService: TransactionService,
    private celebrationService: CelebrationService,
    private confettiService: ConfettiService,
    private http: HttpClient,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
    private breadcrumbService: BreadcrumbService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Subscribe to current user
    this.subscriptions.add(
      this.authService.currentUser$.subscribe(user => {
        queueMicrotask(() => {
          if (user) {
            this.userName = user.firstName || user.email.split('@')[0];
            this.loadUserFamilies();
          }
          this.cdr.detectChanges();
        });
      })
    );

    // Subscribe to current family
    this.subscriptions.add(
      this.familyService.currentFamily$.subscribe(family => {
        queueMicrotask(() => {
          this.currentFamily = family;

          // Check if this is a newly created family (only if not already dismissed)
          const dismissed = sessionStorage.getItem('welcomeDismissed_' + family?.id);
          this.isNewFamily = !dismissed && (family?.description?.includes('automatisk') || false);

          // Load children when family is available
          if (family) {
            this.loadChildren();
            this.loadTransactionData();
            this.loadFamilyStats();
          }
          this.cdr.detectChanges();
        });
      })
    );
  }

  // Load families for the current user
  private async loadUserFamilies(): Promise<void> {
    try {
      const families = await this.familyService.getActiveFamilies();
      // FamilyService will automatically set the first family as current
      if (families.length === 0) {
        console.warn('No families found for user');
      }
    } catch (error) {
      console.error('Error loading families:', error);
      this.snackBar.open('Kunne ikke indlæse familier', 'Luk', { duration: 3000 });
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  dismissWelcome(): void {
    this.isNewFamily = false;
    if (this.currentFamily) {
      sessionStorage.setItem('welcomeDismissed_' + this.currentFamily.id, 'true');
    }
  }

  formatCurrency(amount: number, currency: string = 'DKK'): string {
    return this.familyService.formatAmount(amount, currency);
  }

  getFrequencyText(frequency: string): string {
    return this.familyService.getFrequencyText(frequency);
  }

  // Utility methods for placeholder data
  getTotalBalance(): number {
    return this.placeholderChildren.reduce((sum, child) => sum + child.currentBalance, 0);
  }

  getGoalProgress(child: PlaceholderChild): number {
    if (!child.goal || !child.goalAmount) return 0;
    return Math.min((child.currentBalance / child.goalAmount) * 100, 100);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('da-DK', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Load children from API
  private loadChildren(): void {
    if (!this.currentFamily?.id) return;
    
    this.isLoadingChildren = true;
    const apiUrl = `/api/app2/pocket-money-users/children/${this.currentFamily.id}`;
    
    this.subscriptions.add(
      this.http.get<Child[]>(apiUrl).subscribe({
        next: (children) => {
          this.actualChildren = children;
          this.isLoadingChildren = false;
          
          // Load last activity for each child
          this.loadChildrenLastActivity();
        },
        error: (error) => {
          console.error('Error loading children:', error);
          this.isLoadingChildren = false;
          this.snackBar.open('Kunne ikke indlæse børn', 'Luk', { duration: 3000 });
        }
      })
    );
  }

  // Load transaction data for dashboard
  private loadTransactionData(): void {
    if (!this.currentFamily?.id) return;
    
    this.isLoadingTransactions = true;
    
    this.subscriptions.add(
      this.transactionService.getRecentTransactions(this.currentFamily.id, 5).subscribe({
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

  // Load family statistics
  private loadFamilyStats(): void {
    if (!this.currentFamily?.id) return;
    
    this.isLoadingStats = true;
    
    this.subscriptions.add(
      this.http.get(`/api/app2/transactions/family-stats/${this.currentFamily.id}`).subscribe({
        next: (stats) => {
          this.realFamilyStats = stats;
          this.isLoadingStats = false;
        },
        error: (error) => {
          console.error('Error loading family stats:', error);
          this.isLoadingStats = false;
        }
      })
    );
  }

  // Load last activity for all children
  private loadChildrenLastActivity(): void {
    this.actualChildren.forEach(child => {
      this.subscriptions.add(
        this.http.get<{lastActivity: string}>(`/api/app2/transactions/last-activity/${child.id}`).subscribe({
          next: (response) => {
            this.childrenLastActivity[child.id] = response.lastActivity;
          },
          error: (error) => {
            console.error(`Error loading last activity for child ${child.id}:`, error);
            this.childrenLastActivity[child.id] = 'Ingen aktivitet endnu';
          }
        })
      );
    });
  }

  // Quick action methods
  addMoney(): void {
    if (!this.currentFamily?.id) {
      this.snackBar.open('Ingen familie valgt', 'Luk', { duration: 3000 });
      return;
    }

    if (this.actualChildren.length === 0) {
      this.snackBar.open('Du skal tilføje børn først', 'Luk', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(RewardModalComponent, {
      data: {
        familyId: this.currentFamily.id,
        children: this.actualChildren
      },
      width: '750px',
      maxWidth: '95vw',
      maxHeight: '95vh',
      disableClose: false,
      autoFocus: true,
      panelClass: 'reward-modal-panel'
    });

    this.subscriptions.add(
      dialogRef.afterClosed().subscribe((transaction: Transaction) => {
        if (transaction) {
          // Trigger confetti celebration for rewards/bonuses
          this.celebrationService.celebrateTransaction(transaction);
          
          // Refresh data after transaction is created
          this.loadTransactionData();
          this.loadFamilyStats();
          this.loadChildrenLastActivity();
          
          // Update child balance locally if possible
          const child = this.actualChildren.find(c => c.id === transaction.userId);
          if (child) {
            child.currentBalance = transaction.balanceAfter;
          }
        }
      })
    );
  }

  deductMoney(): void {
    if (!this.currentFamily?.id) {
      this.snackBar.open('Ingen familie valgt', 'Luk', { duration: 3000 });
      return;
    }

    if (this.actualChildren.length === 0) {
      this.snackBar.open('Du skal tilføje børn først', 'Luk', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(DeductionModalComponent, {
      data: {
        familyId: this.currentFamily.id,
        children: this.actualChildren
      },
      width: '650px',
      maxWidth: '95vw',
      maxHeight: '95vh',
      disableClose: false,
      autoFocus: true,
      panelClass: 'deduction-modal-panel'
    });

    this.subscriptions.add(
      dialogRef.afterClosed().subscribe((transaction: Transaction) => {
        if (transaction) {
          // Refresh data after transaction is created
          this.loadTransactionData();
          this.loadFamilyStats();
          this.loadChildrenLastActivity();
          
          // Update child balance locally if possible
          const child = this.actualChildren.find(c => c.id === transaction.userId);
          if (child) {
            child.currentBalance = transaction.balanceAfter;
          }
        }
      })
    );
  }


  viewReports(): void {
    if (!this.currentFamily?.id) {
      this.snackBar.open('Ingen familie valgt', 'Luk', { duration: 3000 });
      return;
    }

    this.openTransactionHistory();
  }

  // Open transaction history modal
  openTransactionHistory(childId?: string, childName?: string): void {
    if (!this.currentFamily?.id) return;

    const dialogRef = this.dialog.open(TransactionHistoryModalComponent, {
      data: {
        familyId: this.currentFamily.id,
        childId,
        childName
      },
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      disableClose: false,
      autoFocus: false,
      panelClass: 'transaction-history-modal-panel'
    });

    this.subscriptions.add(
      dialogRef.afterClosed().subscribe(() => {
        // Optionally refresh data if needed
      })
    );
  }

  openSettings(): void {
    if (!this.currentFamily) {
      this.snackBar.open('Ingen familie valgt', 'Luk', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(FamilySettingsModalComponent, {
      data: {
        family: this.currentFamily
      },
      width: '650px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      disableClose: false,
      autoFocus: true,
      panelClass: 'family-settings-modal-panel'
    });

    this.subscriptions.add(
      dialogRef.afterClosed().subscribe((updatedFamily: Family) => {
        if (updatedFamily) {
          // Family was updated, refresh the current family data
          this.currentFamily = updatedFamily;

          // Optionally refresh other data if currency changed
          this.loadFamilyStats();

          this.snackBar.open('Familie indstillinger opdateret!', 'Luk', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        }
      })
    );
  }

  // Template helper methods
  getCurrentDate(): Date {
    return new Date();
  }

  getRandomRotation(): number {
    return Math.random() * 6 - 3;
  }

  getAbsoluteValue(value: number): number {
    return Math.abs(value);
  }

  // Helper methods for real children data
  hasChildren(): boolean {
    return this.actualChildren.length > 0;
  }

  getActualTotalBalance(): number {
    return this.actualChildren.reduce((sum, child) => sum + Number(child.currentBalance || 0), 0);
  }

  // Get display age for child
  getChildDisplayAge(child: Child): number {
    if (child.age != null && child.age !== undefined) return child.age;

    // Calculate from date of birth if age is not available
    if (child.dateOfBirth) {
      const birthDate = new Date(child.dateOfBirth);
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

  // Get last activity for child
  getChildLastActivity(child: Child): string {
    return this.childrenLastActivity[child.id] || 'Ingen aktivitet endnu';
  }

  // Get card display balance
  getChildCardBalance(child: Child): string {
    const balance = Number(child.currentBalance) || 0;
    return `${balance.toFixed(2)} DKK`;
  }

  // Enhanced polaroid card methods
  
  // Quick action methods for polaroid cards
  addMoneyToChild(child: Child, event?: MouseEvent): void {
    if (!this.currentFamily?.id) return;

    const dialogRef = this.dialog.open(RewardModalComponent, {
      data: {
        familyId: this.currentFamily.id,
        children: this.actualChildren,
        selectedChildId: child.id
      },
      width: '750px',
      maxWidth: '95vw',
      maxHeight: '95vh',
      disableClose: false,
      autoFocus: true,
      panelClass: 'reward-modal-panel'
    });

    this.subscriptions.add(
      dialogRef.afterClosed().subscribe((transaction: Transaction) => {
        if (transaction) {
          // Get button position for confetti origin if event provided
          const position = event ? { x: event.clientX, y: event.clientY } : undefined;
          
          // Trigger confetti celebration with position
          this.celebrationService.celebrateTransaction(transaction, position);
          
          // Refresh data after transaction is created
          this.loadTransactionData();
          this.loadFamilyStats();
          this.loadChildrenLastActivity();
          
          // Update child balance locally if possible
          const updatedChild = this.actualChildren.find(c => c.id === transaction.userId);
          if (updatedChild) {
            updatedChild.currentBalance = transaction.balanceAfter;
          }
        }
      })
    );
  }

  viewChildDetails(child: Child): void {
    this.openTransactionHistory(child.id, child.name);
  }

  editChild(child: Child): void {
    if (!this.currentFamily) {
      this.snackBar.open('Ingen familie valgt', 'Luk', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(ChildRegistrationModalComponent, {
      data: {
        familyId: this.currentFamily.id,
        editChild: child
      },
      width: '650px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      disableClose: false,
      autoFocus: true,
      panelClass: 'child-registration-modal-panel'
    });

    dialogRef.afterClosed().subscribe((updatedChild?: Child) => {
      if (updatedChild) {
        // Update the child in the list
        const index = this.actualChildren.findIndex((c: Child) => c.id === updatedChild.id);
        if (index !== -1) {
          this.actualChildren[index] = updatedChild;
        }
        this.snackBar.open(`${updatedChild.name} blev opdateret!`, 'Luk', { duration: 3000 });
      }
    });
  }

  // Get activity status for activity indicator
  getActivityStatusClass(child: Child): string {
    // TODO: This should be based on actual transaction data
    // For now, return a random status for demonstration
    const statuses = ['recent', 'moderate', 'old'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }

  // Get savings progress percentage
  getSavingsProgress(child: Child): number {
    // TODO: This should be based on actual savings goal from child data
    // For now, calculate based on a mock goal
    const mockGoal = child.currentBalance * 2; // Mock goal is double current balance
    if (!mockGoal || mockGoal <= 0) return 0;
    return Math.min((child.currentBalance / mockGoal) * 100, 100);
  }

  // Check if child has savings goal
  hasSavingsGoal(child: Child): boolean {
    // TODO: This should check if child has an actual savings goal set
    // For now, randomly return true for some children
    return child.currentBalance > 50; // Mock condition
  }

  // Real transaction data methods
  hasRealTransactions(): boolean {
    return this.recentTransactions.length > 0;
  }

  hasRealStats(): boolean {
    return this.realFamilyStats !== null;
  }

  getRealTransactionIcon(transaction: Transaction): string {
    return this.transactionService.getTransactionIcon(transaction.type);
  }

  getRealTransactionColor(transaction: Transaction): string {
    return this.transactionService.getTransactionColor(transaction.type);
  }

  getRealTransactionTypeName(transaction: Transaction): string {
    return this.transactionService.getTransactionTypeName(transaction.type);
  }

  formatRealTransactionAmount(transaction: Transaction): string {
    return this.transactionService.formatTransactionAmount(transaction.amount);
  }

  formatRealTransactionDate(transaction: Transaction): string {
    return this.transactionService.formatTransactionDate(transaction.transactionDate);
  }

  getRealTotalBalance(): number {
    if (this.hasRealStats()) {
      return this.actualChildren.reduce((sum, child) => sum + Number(child.currentBalance || 0), 0);
    }
    return this.getActualTotalBalance();
  }

  getRealFamilyStats(): any {
    return this.realFamilyStats || this.familyStats; // Fallback to placeholder
  }

  // Get child name from transaction
  getTransactionChildName(transaction: Transaction): string {
    return transaction.user?.name || 'Ukendt barn';
  }

  // Activity indicator for real transactions
  getActivityStatusFromTransactions(child: Child): string {
    const childTransactions = this.recentTransactions.filter(t => t.userId === child.id);
    if (childTransactions.length === 0) return 'old';
    
    const latestTransaction = childTransactions[0];
    const now = new Date();
    const transactionDate = new Date(latestTransaction.transactionDate);
    const daysDiff = (now.getTime() - transactionDate.getTime()) / (1000 * 3600 * 24);
    
    if (daysDiff <= 1) return 'recent';
    if (daysDiff <= 7) return 'moderate';
    return 'old';
  }

  // Navigate to child dashboard
  openChildDashboard(child: Child): void {
    this.breadcrumbService.navigateWithContext(`/child/${child.id}`, child.name);
  }

  // Special celebration methods
  celebrateChildSuccess(child: Child, message: string, event?: MouseEvent): void {
    const position = event ? { x: event.clientX, y: event.clientY } : undefined;
    this.celebrationService.celebrateWithMessage(`${child.name}: ${message}`, 'achievement', 'high');
  }

  celebrateNewChild(): void {
    this.celebrationService.celebrateWithMessage('Velkommen til familien! 🎉', 'celebration', 'high');
  }

  // Show credentials modal for a child
  showCredentialsModal(childName: string, username: string, pin: string, isReset: boolean): void {
    this.dialog.open(ChildCredentialsModalComponent, {
      data: {
        childName,
        username,
        pin,
        isReset
      } as ChildCredentialsData,
      width: '500px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      disableClose: true,
      autoFocus: false,
      panelClass: 'child-credentials-modal-panel'
    });
  }

  // Reset PIN for a child
  resetPin(child: Child): void {
    const apiUrl = `/api/app2/pocket-money-users/credentials/${child.id}/reset-pin`;

    this.subscriptions.add(
      this.http.post<{ username: string; pin: string }>(apiUrl, {}).subscribe({
        next: (result) => {
          this.showCredentialsModal(child.name, result.username, result.pin, true);
        },
        error: (error) => {
          console.error('Error resetting PIN:', error);
          this.snackBar.open('Kunne ikke nulstille PIN-koden. Prøv igen.', 'Luk', {
            duration: 3000
          });
        }
      })
    );
  }

  // Create login account for existing child without one
  createChildAccount(child: Child): void {
    const apiUrl = `/api/app2/pocket-money-users/credentials/${child.id}/create-account`;

    this.subscriptions.add(
      this.http.post<{ username: string; pin: string }>(apiUrl, {}).subscribe({
        next: (result) => {
          // Update child's authUserId locally so the UI updates
          child.authUserId = 'created';
          this.showCredentialsModal(child.name, result.username, result.pin, false);
          this.snackBar.open(`Login oprettet for ${child.name}!`, 'Luk', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error creating child account:', error);
          const msg = error?.error?.message || 'Kunne ikke oprette login. Prøv igen.';
          this.snackBar.open(msg, 'Luk', { duration: 3000 });
        }
      })
    );
  }

  // Test confetti (for development/demo)
  testConfetti(event?: MouseEvent): void {
    const position = event ? { x: event.clientX, y: event.clientY } : undefined;
    this.celebrationService.testAllCelebrations();
  }

  // Trigger confetti when adding child successfully
  addChild(): void {
    if (!this.currentFamily?.id) {
      this.snackBar.open('Ingen familie valgt', 'Luk', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(ChildRegistrationModalComponent, {
      data: { familyId: this.currentFamily.id },
      width: '600px',
      maxWidth: '90vw',
      disableClose: false,
      autoFocus: true,
      panelClass: 'child-registration-modal'
    });

    this.subscriptions.add(
      dialogRef.afterClosed().subscribe((result: any) => {
        if (result) {
          // Add the new child to our list
          const newChild: Child = result.child || result;
          this.actualChildren.push(newChild);

          // Trigger celebration for new child
          this.celebrateNewChild();

          // Show success message
          this.snackBar.open(`${newChild.name} er nu tilføjet til familien! 🎉`, 'Luk', {
            duration: 4000,
            panelClass: ['success-snackbar']
          });

          // If credentials were returned, show the credentials modal
          if (result.credentials) {
            this.showCredentialsModal(
              newChild.name,
              result.credentials.username,
              result.credentials.pin,
              false
            );
          }
        }
      })
    );
  }
}
