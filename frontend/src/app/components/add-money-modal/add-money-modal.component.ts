import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TransactionService, TransactionType } from '../../services/transaction.service';
import { SoundService } from '../../services/sound.service';
import { Child } from '../child-registration-modal/child-registration-modal.component';

export interface AddMoneyData {
  familyId: string;
  children: Child[];
  selectedChildId?: string;
}

@Component({
  selector: 'app-add-money-modal',
  standalone: false,
  templateUrl: './add-money-modal.component.html',
  styleUrl: './add-money-modal.component.scss'
})
export class AddMoneyModalComponent implements OnInit {
  addMoneyForm: FormGroup;
  isSubmitting = false;
  
  // Quick transaction types
  transactionTypes = [
    { type: TransactionType.ALLOWANCE, name: 'Ugepenge', icon: '💰', color: '#7fb069' },
    { type: TransactionType.REWARD, name: 'Belønning', icon: '🏆', color: '#d4944a' },
    { type: TransactionType.BONUS, name: 'Bonus', icon: '⭐', color: '#d4944a' },
    { type: TransactionType.SAVINGS, name: 'Opsparing', icon: '🐷', color: '#6ba3d6' }
  ];

  // Quick amounts
  quickAmounts = [10, 20, 50, 100, 200];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddMoneyModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddMoneyData,
    private transactionService: TransactionService,
    private snackBar: MatSnackBar,
    private soundService: SoundService
  ) {
    this.addMoneyForm = this.fb.group({
      childId: [this.data.selectedChildId || '', Validators.required],
      amount: [50, [Validators.required, Validators.min(0.01), Validators.max(10000)]],
      type: [TransactionType.ALLOWANCE, Validators.required],
      description: ['', [Validators.required, Validators.maxLength(200)]]
    });
  }

  ngOnInit(): void {
    // Auto-fill description based on type
    this.addMoneyForm.get('type')?.valueChanges.subscribe(type => {
      const selectedType = this.transactionTypes.find(t => t.type === type);
      if (selectedType) {
        this.addMoneyForm.patchValue({
          description: selectedType.name
        });
      }
    });

    // Initial description
    this.addMoneyForm.patchValue({
      description: 'Ugepenge'
    });
  }

  setQuickAmount(amount: number): void {
    this.addMoneyForm.patchValue({ amount });
    // Play UI feedback sound
    this.soundService.playUIFeedback('click');
  }

  setTransactionType(type: TransactionType): void {
    this.addMoneyForm.patchValue({ type });
    // Play UI feedback sound
    this.soundService.playUIFeedback('pop');
  }

  getSelectedTypeInfo() {
    const selectedType = this.addMoneyForm.get('type')?.value;
    return this.transactionTypes.find(t => t.type === selectedType);
  }

  getChildName(childId: string): string {
    const child = this.data.children.find(c => c.id === childId);
    return child?.name || 'Ukendt barn';
  }

  onSubmit(): void {
    if (this.addMoneyForm.valid) {
      this.isSubmitting = true;
      
      const formData = this.addMoneyForm.value;
      
      this.transactionService.createTransaction({
        userId: formData.childId,
        familyId: this.data.familyId,
        amount: Number(formData.amount),
        type: formData.type,
        description: formData.description
      }).subscribe({
        next: (transaction) => {
          const childName = this.getChildName(transaction.userId);
          const typeInfo = this.getSelectedTypeInfo();
          
          // Play success sound
          this.soundService.playUIFeedback('success');
          
          // Play celebration sound for transaction
          this.soundService.playCelebrationForTransaction(transaction.type, transaction.amount);
          
          this.snackBar.open(
            `${typeInfo?.icon} ${formData.amount} kr. tilføjet til ${childName}!`,
            'Luk',
            { 
              duration: 4000,
              panelClass: ['success-snackbar']
            }
          );
          
          this.dialogRef.close(transaction);
        },
        error: (error) => {
          console.error('Error creating transaction:', error);
          this.snackBar.open(
            'Der opstod en fejl ved tilføjelse af penge',
            'Luk',
            { 
              duration: 4000,
              panelClass: ['error-snackbar']
            }
          );
          this.isSubmitting = false;
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.addMoneyForm.controls).forEach(key => {
        this.addMoneyForm.get(key)?.markAsTouched();
      });
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }

  // Form validation helpers
  isFieldInvalid(fieldName: string): boolean {
    const field = this.addMoneyForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.addMoneyForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} er påkrævet`;
      if (field.errors['min']) return 'Beløbet skal være større end 0';
      if (field.errors['max']) return 'Beløbet må ikke overstige 10.000 kr.';
      if (field.errors['maxlength']) return 'Beskrivelsen er for lang';
    }
    return '';
  }
}