import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GoalsService, CreateSavingsGoalDto } from '../../services/goals.service';

export interface AddGoalDialogData {
  childId: string;
}

@Component({
  selector: 'app-add-goal-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './add-goal-modal.component.html',
  styleUrls: ['./add-goal-modal.component.scss'],
})
export class AddGoalModalComponent {
  goalForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';

  availableEmojis = [
    { value: '🚲', label: 'Cykel' },
    { value: '🎮', label: 'Spil' },
    { value: '📱', label: 'Telefon' },
    { value: '🎨', label: 'Kunst' },
    { value: '🏀', label: 'Sport' },
    { value: '⚽', label: 'Fodbold' },
    { value: '🎸', label: 'Musik' },
    { value: '🎵', label: 'Noder' },
    { value: '📚', label: 'Bøger' },
    { value: '🧸', label: 'Legetøj' },
    { value: '🎁', label: 'Gave' },
    { value: '🏖️', label: 'Ferie' },
    { value: '🎢', label: 'Forlystelse' },
    { value: '🍦', label: 'Is' },
    { value: '🛹', label: 'Skateboard' },
  ];

  selectedEmoji = '🎯';

  constructor(
    private fb: FormBuilder,
    private goalsService: GoalsService,
    private dialogRef: MatDialogRef<AddGoalModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddGoalDialogData,
  ) {
    this.goalForm = this.fb.group({
      name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
      ]],
      targetAmount: [null, [
        Validators.required,
        Validators.min(1),
        Validators.max(100000),
      ]],
    });
  }

  selectEmoji(emoji: string): void {
    this.selectedEmoji = emoji;
  }

  getFieldError(fieldName: string): string {
    const field = this.goalForm.get(fieldName);
    if (!field?.errors || !field.touched) return '';

    const errors = field.errors;

    switch (fieldName) {
      case 'name':
        if (errors['required']) return 'Navn er påkrævet';
        if (errors['minlength']) return 'Navn skal være mindst 2 tegn';
        if (errors['maxlength']) return 'Navn må højst være 100 tegn';
        break;
      case 'targetAmount':
        if (errors['required']) return 'Beløb er påkrævet';
        if (errors['min']) return 'Beløb skal være mindst 1 kr.';
        if (errors['max']) return 'Beløb må højst være 100.000 kr.';
        break;
    }

    return 'Ugyldigt input';
  }

  onSubmit(): void {
    if (this.goalForm.invalid) {
      this.goalForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const dto: CreateSavingsGoalDto = {
      name: this.goalForm.value.name.trim(),
      targetAmount: this.goalForm.value.targetAmount,
      emoji: this.selectedEmoji,
    };

    this.goalsService.createGoal(this.data.childId, dto).subscribe({
      next: (goal) => {
        this.isSubmitting = false;
        this.dialogRef.close(goal);
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error creating goal:', error);

        if (error.status === 400 && error.error?.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = 'Der opstod en fejl ved oprettelse af målet. Prøv venligst igen.';
        }
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
