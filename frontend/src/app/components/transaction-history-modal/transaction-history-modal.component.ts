import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TransactionService, Transaction, TransactionType } from '../../services/transaction.service';
import { Subscription } from 'rxjs';

export interface TransactionHistoryData {
  familyId: string;
  childId?: string;
  childName?: string;
}

@Component({
  selector: 'app-transaction-history-modal',
  standalone: false,
  templateUrl: './transaction-history-modal.component.html',
  styleUrl: './transaction-history-modal.component.scss'
})
export class TransactionHistoryModalComponent implements OnInit, OnDestroy {
  transactions: Transaction[] = [];
  isLoading = true;
  error: string | null = null;
  currentPage = 1;
  totalPages = 1;
  limit = 10;
  
  // Filter options
  selectedType: TransactionType | '' = '';
  filterTypes = Object.values(TransactionType);
  
  private subscriptions = new Subscription();

  constructor(
    private dialogRef: MatDialogRef<TransactionHistoryModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TransactionHistoryData,
    private transactionService: TransactionService
  ) {}

  ngOnInit(): void {
    this.loadTransactions();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadTransactions(): void {
    this.isLoading = true;
    this.error = null;

    const request = this.data.childId 
      ? this.transactionService.getTransactionsByUserId(this.data.childId)
      : this.transactionService.getTransactionsByFamilyId(this.data.familyId);

    this.subscriptions.add(
      request.subscribe({
        next: (transactions) => {
          this.transactions = this.filterTransactions(transactions);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading transactions:', error);
          this.error = 'Kunne ikke indlæse transaktioner';
          this.isLoading = false;
        }
      })
    );
  }

  filterTransactions(transactions: Transaction[]): Transaction[] {
    if (!this.selectedType) return transactions;
    return transactions.filter(t => t.type === this.selectedType);
  }

  onFilterChange(): void {
    this.loadTransactions();
  }

  getTransactionIcon(transaction: Transaction): string {
    return this.transactionService.getTransactionIcon(transaction.type);
  }

  getTransactionColor(transaction: Transaction): string {
    return this.transactionService.getTransactionColor(transaction.type);
  }

  getTransactionTypeName(transaction: Transaction): string {
    return this.transactionService.getTransactionTypeName(transaction.type);
  }

  formatTransactionAmount(transaction: Transaction): string {
    return this.transactionService.formatTransactionAmount(transaction.amount);
  }

  formatTransactionDate(transaction: Transaction): string {
    return this.transactionService.formatTransactionDate(transaction.transactionDate);
  }

  getChildName(transaction: Transaction): string {
    return transaction.user?.name || 'Ukendt barn';
  }

  close(): void {
    this.dialogRef.close();
  }

  // Get filter label in Danish
  getFilterLabel(type: TransactionType): string {
    return this.transactionService.getTransactionTypeName(type);
  }
}