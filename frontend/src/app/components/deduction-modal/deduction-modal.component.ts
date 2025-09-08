import { Component, Inject, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';
import { TransactionService, TransactionType } from '../../services/transaction.service';
import { Child } from '../child-registration-modal/child-registration-modal.component';

export interface DeductionModalData {
  familyId: string;
  children: Child[];
  selectedChildId?: string;
}

export enum DeductionType {
  PURCHASE = 'PURCHASE',
  PENALTY = 'PENALTY', 
  SAVINGS = 'SAVINGS',
  GIFT = 'GIFT'
}

// Danish deduction types with descriptions
export const DANISH_DEDUCTION_TYPES = {
  [DeductionType.PURCHASE]: {
    name: 'Køb',
    icon: '🛍️',
    color: '#8B4A6B',
    description: 'Indkøb af legetøj, slik eller andre ting',
    examples: ['Legoklodser', 'Slik fra butikken', 'Tegnesager', 'Bøger', 'Spillekonsoller']
  },
  [DeductionType.PENALTY]: {
    name: 'Straf',
    icon: '⚠️',
    color: '#B85450',
    description: 'Fradrag for dårlig opførsel eller overtrædelser',
    examples: ['Ikke rydde op', 'Ikke følge regler', 'Være ubehøvlet', 'Ikke lave lektier', 'Slås med søskende']
  },
  [DeductionType.SAVINGS]: {
    name: 'Opsparing',
    icon: '🐷',
    color: '#6B8B47',
    description: 'Sætte penge til side til fremtidige mål',
    examples: ['Spar til cykel', 'Spar til computer', 'Spar til ferie', 'Spar til gave', 'Langsigtet opsparing']
  },
  [DeductionType.GIFT]: {
    name: 'Gave',
    icon: '🎁',
    color: '#8B6B47',
    description: 'Køb gave til familie eller venner',
    examples: ['Mors fødselsdag', 'Julegal til far', 'Gave til bedsteforældre', 'Venns fødselsdag', 'Søskende gave']
  }
};

@Component({
  selector: 'app-deduction-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './deduction-modal.component.html',
  styleUrl: './deduction-modal.component.scss',
  animations: [
    trigger('warning', [
      state('hidden', style({ opacity: 0, transform: 'scale(0.8)' })),
      state('visible', style({ opacity: 1, transform: 'scale(1)' })),
      transition('hidden => visible', [
        animate('0.4s ease-out')
      ])
    ]),
    trigger('confirmation', [
      state('hidden', style({ opacity: 0, transform: 'translateY(-20px)' })),
      state('visible', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('hidden => visible', [
        animate('0.5s ease-out', keyframes([
          style({ opacity: 0, transform: 'translateY(-20px)', offset: 0 }),
          style({ opacity: 0.8, transform: 'translateY(5px)', offset: 0.7 }),
          style({ opacity: 1, transform: 'translateY(0)', offset: 1 })
        ]))
      ])
    ])
  ]
})
export class DeductionModalComponent implements OnInit {
  deductionForm: FormGroup;
  isSubmitting = false;
  showWarning = false;
  showConfirmation = false;
  confirmationMessage = '';
  selectedDeductionType: DeductionType = DeductionType.PURCHASE;

  // Available deduction types
  deductionTypes = Object.entries(DANISH_DEDUCTION_TYPES).map(([key, value]) => ({
    type: key as DeductionType,
    ...value
  }));

  // Quick amounts for deductions (typically smaller than rewards)
  quickAmounts = [10, 25, 50, 75, 100, 150];

  // Pre-defined descriptions by type
  deductionDescriptions: Record<DeductionType, string[]> = {
    [DeductionType.PURCHASE]: [
      'Købte slik i butikken', 'Nye Lego klodser', 'Tegnesager til skolen', 
      'Bog fra boghandleren', 'Legetøj fra byen', 'Computerspil'
    ],
    [DeductionType.PENALTY]: [
      'Glemte at rydde værelset op', 'Var ubehøvlet ved bordet', 'Ikke lavet lektier',
      'Sloges med søskende', 'Ikke fulgt familiens regler', 'Kom for sent hjem'
    ],
    [DeductionType.SAVINGS]: [
      'Spar til ny cykel', 'Opsparer til computer', 'Lægger til side til ferie',
      'Sparer op til særligt legetøj', 'Fremtidig investering', 'Langsigtet opsparingsmål'
    ],
    [DeductionType.GIFT]: [
      'Gave til mors fødselsdag', 'Julegal til far', 'Gave til bedsteforældre',
      'Fødselsdagsgave til ven', 'Overraskelse til søskende', 'Tak-gave til lærer'
    ]
  };

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DeductionModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DeductionModalData,
    private transactionService: TransactionService,
    private snackBar: MatSnackBar
  ) {
    this.deductionForm = this.fb.group({
      childId: [this.data.selectedChildId || '', Validators.required],
      amount: [25, [Validators.required, Validators.min(1), Validators.max(5000)]],
      deductionType: [DeductionType.PURCHASE, Validators.required],
      description: ['', [Validators.required, Validators.maxLength(200)]],
      reason: ['', [Validators.maxLength(300)]]
    });
  }

  ngOnInit(): void {
    // Auto-update description when deduction type changes
    this.deductionForm.get('deductionType')?.valueChanges.subscribe(deductionType => {
      this.selectedDeductionType = deductionType;
      this.updateDescriptionSuggestion();
      this.validateBalance();
    });

    // Validate balance when child or amount changes
    this.deductionForm.get('childId')?.valueChanges.subscribe(() => this.validateBalance());
    this.deductionForm.get('amount')?.valueChanges.subscribe(() => this.validateBalance());

    // Initial setup
    this.updateDescriptionSuggestion();
    this.validateBalance();
  }

  private updateDescriptionSuggestion(): void {
    const descriptions = this.deductionDescriptions[this.selectedDeductionType];
    const randomDescription = descriptions[Math.floor(Math.random() * descriptions.length)];
    
    this.deductionForm.patchValue({
      description: randomDescription
    });
  }

  private validateBalance(): void {
    const childId = this.deductionForm.get('childId')?.value;
    const amount = this.deductionForm.get('amount')?.value;
    
    if (!childId || !amount) {
      this.showWarning = false;
      return;
    }

    const child = this.data.children.find(c => c.id === childId);
    if (!child) {
      this.showWarning = false;
      return;
    }

    // Check if deduction would make balance negative
    const newBalance = child.currentBalance - amount;
    this.showWarning = newBalance < 0;
  }

  getSelectedChild(): Child | undefined {
    const childId = this.deductionForm.get('childId')?.value;
    return this.data.children.find(c => c.id === childId);
  }

  getRemainingBalance(): number {
    const child = this.getSelectedChild();
    const amount = this.deductionForm.get('amount')?.value || 0;
    return child ? child.currentBalance - amount : 0;
  }

  setQuickAmount(amount: number): void {
    this.deductionForm.patchValue({ amount });
  }

  setDeductionType(type: DeductionType): void {
    this.deductionForm.patchValue({ deductionType: type });
  }

  getSelectedTypeInfo() {
    return DANISH_DEDUCTION_TYPES[this.selectedDeductionType];
  }

  getChildName(childId: string): string {
    const child = this.data.children.find(c => c.id === childId);
    return child?.name || 'Ukendt barn';
  }

  // Get random confirmation message
  private getConfirmationMessage(childName: string, amount: number, deductionType: DeductionType): string {
    const typeInfo = DANISH_DEDUCTION_TYPES[deductionType];
    const remainingBalance = this.getRemainingBalance();
    
    const messages = [
      `${typeInfo.icon} ${childName} har brugt ${amount} DKK på ${typeInfo.name.toLowerCase()}`,
      `💰 ${amount} DKK er trukket fra ${childName}s konto til ${typeInfo.name.toLowerCase()}`,
      `📝 ${childName} har ${remainingBalance.toFixed(2)} DKK tilbage efter ${typeInfo.name.toLowerCase()}`,
      `✅ Fradrag på ${amount} DKK er registreret for ${childName}`,
      `🏦 ${childName}s nye saldo er ${remainingBalance.toFixed(2)} DKK`
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  onSubmit(): void {
    if (this.deductionForm.valid) {
      this.isSubmitting = true;
      
      const formData = this.deductionForm.value;
      const childName = this.getChildName(formData.childId);

      // Create the description with reason if provided
      let finalDescription = formData.description;
      if (formData.reason?.trim()) {
        finalDescription += ` - ${formData.reason}`;
      }

      // Map deduction type to transaction type
      let transactionType: TransactionType;
      switch (formData.deductionType) {
        case DeductionType.PURCHASE:
          transactionType = TransactionType.PURCHASE;
          break;
        case DeductionType.PENALTY:
          transactionType = TransactionType.PENALTY;
          break;
        case DeductionType.SAVINGS:
          transactionType = TransactionType.SAVINGS;
          break;
        case DeductionType.GIFT:
          transactionType = TransactionType.PURCHASE; // Gifts are purchases
          break;
        default:
          transactionType = TransactionType.PURCHASE;
      }
      
      this.transactionService.createTransaction({
        userId: formData.childId,
        familyId: this.data.familyId,
        amount: -Math.abs(Number(formData.amount)), // Always negative for deductions
        type: transactionType,
        description: finalDescription
      }).subscribe({
        next: (transaction) => {
          // Show confirmation
          this.confirmationMessage = this.getConfirmationMessage(
            childName, 
            formData.amount, 
            formData.deductionType
          );
          this.showConfirmation = true;
          
          // Success notification
          const typeInfo = DANISH_DEDUCTION_TYPES[formData.deductionType as DeductionType];
          this.snackBar.open(
            `${typeInfo.icon} ${formData.amount} DKK trukket fra ${childName}s konto`,
            'OK',
            { 
              duration: 4000,
              panelClass: ['deduction-snackbar']
            }
          );
          
          // Close modal after confirmation
          setTimeout(() => {
            this.dialogRef.close(transaction);
          }, 2500);
        },
        error: (error) => {
          console.error('Error creating deduction transaction:', error);
          this.snackBar.open(
            'Der opstod en fejl ved fradrag 😔',
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
      Object.keys(this.deductionForm.controls).forEach(key => {
        this.deductionForm.get(key)?.markAsTouched();
      });
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }

  // Form validation helpers
  isFieldInvalid(fieldName: string): boolean {
    const field = this.deductionForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.deductionForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} er påkrævet`;
      if (field.errors['min']) return 'Beløbet skal være mindst 1 DKK';
      if (field.errors['max']) return 'Beløbet må ikke overstige 5.000 DKK';
      if (field.errors['maxlength']) return 'Teksten er for lang';
    }
    return '';
  }

  // Get random suggestion for description
  getRandomSuggestion(): void {
    this.updateDescriptionSuggestion();
  }

  // Get deduction examples for current type
  getCurrentDeductionExamples(): string[] {
    return this.deductionDescriptions[this.selectedDeductionType] || [];
  }

  // Allow proceeding with negative balance warning
  proceedWithNegativeBalance(): void {
    this.showWarning = false;
    this.onSubmit();
  }
}
