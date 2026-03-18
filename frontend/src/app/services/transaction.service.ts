import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Transaction {
  id: string;
  userId: string;
  familyId: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  description: string;
  transactionDate: Date;
  balanceAfter: number;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    name: string;
  };
  family?: {
    id: string;
    name: string;
  };
}

export enum TransactionType {
  ALLOWANCE = 'ALLOWANCE',
  REWARD = 'REWARD', 
  PURCHASE = 'PURCHASE',
  SAVINGS = 'SAVINGS',
  PENALTY = 'PENALTY',
  BONUS = 'BONUS'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED'
}

export interface CreateTransactionDto {
  userId: string;
  familyId: string;
  amount: number;
  type: TransactionType;
  description: string;
  createdByUserId?: string;
  transactionDate?: Date;
}

export interface TransactionStats {
  totalIncome: number;
  totalExpenses: number;
  currentBalance: number;
  transactionCount: number;
}

export interface TransactionHistory {
  transactions: Transaction[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Danish transaction type mappings
export const DANISH_TRANSACTION_TYPES: Record<TransactionType, string> = {
  [TransactionType.ALLOWANCE]: 'Ugepenge',
  [TransactionType.REWARD]: 'Belønning',
  [TransactionType.PURCHASE]: 'Køb',
  [TransactionType.SAVINGS]: 'Opsparing', 
  [TransactionType.PENALTY]: 'Bøde',
  [TransactionType.BONUS]: 'Bonus'
};

// Danish transaction icons and colors
export const TRANSACTION_UI_CONFIG: Record<TransactionType, { icon: string; color: string }> = {
  [TransactionType.ALLOWANCE]: { icon: '💰', color: '#7fb069' },
  [TransactionType.REWARD]: { icon: '🏆', color: '#d4944a' },
  [TransactionType.PURCHASE]: { icon: '🛍️', color: '#e67e52' },
  [TransactionType.SAVINGS]: { icon: '🐷', color: '#6ba3d6' },
  [TransactionType.PENALTY]: { icon: '⚠️', color: '#d65d7a' },
  [TransactionType.BONUS]: { icon: '⭐', color: '#d4944a' }
};

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private apiUrl = `${environment.apiUrl}/transactions`;
  private transactionHistorySubject = new BehaviorSubject<Transaction[]>([]);
  public transactionHistory$ = this.transactionHistorySubject.asObservable();

  constructor(private http: HttpClient) {}

  // Create a new transaction
  createTransaction(createTransactionDto: CreateTransactionDto): Observable<Transaction> {
    return this.http.post<Transaction>(this.apiUrl, createTransactionDto);
  }

  // Get all transactions with optional filters
  getTransactions(filters?: {
    userId?: string;
    familyId?: string;
    type?: TransactionType;
    status?: TransactionStatus;
  }): Observable<Transaction[]> {
    let params = new HttpParams();
    
    if (filters?.userId) {
      params = params.set('userId', filters.userId);
    }
    if (filters?.familyId) {
      params = params.set('familyId', filters.familyId);
    }
    if (filters?.type) {
      params = params.set('type', filters.type);
    }
    if (filters?.status) {
      params = params.set('status', filters.status);
    }

    return this.http.get<Transaction[]>(this.apiUrl, { params });
  }

  // Get transactions by user ID
  getTransactionsByUserId(userId: string): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/by-user/${userId}`);
  }

  // Get transactions by family ID
  getTransactionsByFamilyId(familyId: string): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/by-family/${familyId}`);
  }

  // Get transactions by date range
  getTransactionsByDateRange(
    userId: string, 
    startDate: Date, 
    endDate: Date
  ): Observable<Transaction[]> {
    const params = new HttpParams()
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());

    return this.http.get<Transaction[]>(`${this.apiUrl}/date-range/${userId}`, { params });
  }

  // Get transaction statistics for a user
  getTransactionStats(userId: string): Observable<TransactionStats> {
    return this.http.get<TransactionStats>(`${this.apiUrl}/stats/${userId}`);
  }

  // Get single transaction by ID
  getTransaction(id: string): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.apiUrl}/${id}`);
  }

  // Update transaction
  updateTransaction(id: string, updates: Partial<Transaction>): Observable<Transaction> {
    return this.http.patch<Transaction>(`${this.apiUrl}/${id}`, updates);
  }

  // Delete transaction
  deleteTransaction(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Get recent transactions for dashboard
  getRecentTransactions(familyId: string, limit: number = 5): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/recent/${familyId}?limit=${limit}`);
  }

  // Get transactions for a specific child
  getChildTransactions(childId: string, limit: number = 10): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/child/${childId}?limit=${limit}`);
  }

  // Helper methods for Danish localization
  getTransactionTypeName(type: TransactionType): string {
    return DANISH_TRANSACTION_TYPES[type] || type;
  }

  getTransactionIcon(type: TransactionType): string {
    return TRANSACTION_UI_CONFIG[type]?.icon || '💰';
  }

  getTransactionColor(type: TransactionType): string {
    return TRANSACTION_UI_CONFIG[type]?.color || '#7fb069';
  }

  // Format transaction amount with Danish currency
  formatTransactionAmount(amount: number): string {
    const absAmount = Math.abs(amount);
    const formattedAmount = new Intl.NumberFormat('da-DK', {
      style: 'currency',
      currency: 'DKK',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(absAmount);
    
    return amount >= 0 ? `+${formattedAmount}` : `-${formattedAmount}`;
  }

  // Format Danish date
  formatTransactionDate(date: Date): string {
    return new Intl.DateTimeFormat('da-DK', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  }

  // Get last activity description for a child
  getLastActivityDescription(transactions: Transaction[]): string {
    if (!transactions || transactions.length === 0) {
      return 'Ingen aktivitet endnu';
    }

    const latestTransaction = transactions[0]; // Assuming sorted by date desc
    const typeName = this.getTransactionTypeName(latestTransaction.type);
    const amount = Math.abs(latestTransaction.amount);
    
    if (latestTransaction.type === TransactionType.PURCHASE) {
      return `${latestTransaction.description} (${amount} kr.)`;
    } else {
      return `${typeName}: ${amount} kr.`;
    }
  }

  // Quick transaction creation methods
  createAllowanceTransaction(userId: string, familyId: string, amount: number): Observable<Transaction> {
    return this.createTransaction({
      userId,
      familyId,
      amount,
      type: TransactionType.ALLOWANCE,
      description: 'Ugepenge'
    });
  }

  createRewardTransaction(userId: string, familyId: string, amount: number, description: string): Observable<Transaction> {
    return this.createTransaction({
      userId,
      familyId,
      amount,
      type: TransactionType.REWARD,
      description
    });
  }

  createPurchaseTransaction(userId: string, familyId: string, amount: number, description: string): Observable<Transaction> {
    return this.createTransaction({
      userId,
      familyId,
      amount: -Math.abs(amount), // Purchases are negative
      type: TransactionType.PURCHASE,
      description
    });
  }

  createSavingsTransaction(userId: string, familyId: string, amount: number): Observable<Transaction> {
    return this.createTransaction({
      userId,
      familyId,
      amount,
      type: TransactionType.SAVINGS,
      description: 'Opsparet til mål'
    });
  }

  createBonusTransaction(userId: string, familyId: string, amount: number, description: string): Observable<Transaction> {
    return this.createTransaction({
      userId,
      familyId,
      amount,
      type: TransactionType.BONUS,
      description
    });
  }

  createPenaltyTransaction(userId: string, familyId: string, amount: number, description: string): Observable<Transaction> {
    return this.createTransaction({
      userId,
      familyId,
      amount: -Math.abs(amount), // Penalties are negative
      type: TransactionType.PENALTY,
      description
    });
  }

  // Enhanced deduction creation method with balance validation
  createDeductionTransaction(userId: string, familyId: string, amount: number, description: string, type: TransactionType = TransactionType.PURCHASE): Observable<Transaction> {
    return this.createTransaction({
      userId,
      familyId,
      amount: -Math.abs(amount), // All deductions are negative
      type,
      description
    });
  }

  // Refresh transaction history for reactive updates
  refreshTransactionHistory(familyId: string): void {
    this.getTransactionsByFamilyId(familyId).subscribe(
      transactions => this.transactionHistorySubject.next(transactions)
    );
  }
}