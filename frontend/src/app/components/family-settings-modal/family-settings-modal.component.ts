import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { FamilyService, Family, UpdateFamilyDto } from '../../services/family.service';

export interface FamilySettingsData {
  family: Family;
}

@Component({
  selector: 'app-family-settings-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './family-settings-modal.component.html',
  styleUrls: ['./family-settings-modal.component.scss']
})
export class FamilySettingsModalComponent implements OnInit, OnDestroy {
  settingsForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  private subscriptions = new Subscription();

  // Currency options
  currencyOptions = [
    { value: 'DKK', name: 'Danske kroner (DKK)' },
    { value: 'EUR', name: 'Euro (EUR)' },
    { value: 'USD', name: 'US Dollar (USD)' },
    { value: 'SEK', name: 'Svenske kroner (SEK)' },
    { value: 'NOK', name: 'Norske kroner (NOK)' }
  ];

  // Allowance frequency options
  frequencyOptions = [
    { value: 'weekly', name: 'Ugentligt' },
    { value: 'biweekly', name: 'Hver anden uge' },
    { value: 'monthly', name: 'Månedligt' }
  ];

  constructor(
    private fb: FormBuilder,
    private familyService: FamilyService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<FamilySettingsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: FamilySettingsData
  ) {
    this.settingsForm = this.createForm();
  }

  ngOnInit(): void {
    // Populate form with current family data
    if (this.data.family) {
      this.settingsForm.patchValue({
        name: this.data.family.name,
        description: this.data.family.description || '',
        currency: this.data.family.currency,
        defaultAllowance: this.data.family.defaultAllowance,
        allowanceFrequency: this.data.family.allowanceFrequency
      });
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]],
      description: ['', [
        Validators.maxLength(500)
      ]],
      currency: ['DKK', [Validators.required]],
      defaultAllowance: [0, [
        Validators.min(0),
        Validators.max(1000)
      ]],
      allowanceFrequency: ['weekly', [Validators.required]]
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.settingsForm.get(fieldName);
    if (!field?.errors || !field.touched) return '';

    const errors = field.errors;

    // Danish error messages
    switch (fieldName) {
      case 'name':
        if (errors['required']) return 'Familie navn er påkrævet';
        if (errors['minlength']) return 'Familie navn skal være mindst 2 karakterer';
        if (errors['maxlength']) return 'Familie navn må maksimalt være 100 karakterer';
        break;
      case 'description':
        if (errors['maxlength']) return 'Beskrivelse må maksimalt være 500 karakterer';
        break;
      case 'currency':
        if (errors['required']) return 'Valuta er påkrævet';
        break;
      case 'defaultAllowance':
        if (errors['min']) return 'Standard ugepenge kan ikke være negative';
        if (errors['max']) return 'Standard ugepenge må maksimalt være 1.000 kr.';
        break;
      case 'allowanceFrequency':
        if (errors['required']) return 'Ugepenge frekvens er påkrævet';
        break;
    }

    return 'Ugyldigt input';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.settingsForm.get(fieldName);
    return !!(field?.invalid && field.touched);
  }

  getCurrencySymbol(currency: string): string {
    switch (currency) {
      case 'DKK': return 'kr.';
      case 'EUR': return '€';
      case 'USD': return '$';
      case 'SEK': return 'kr.';
      case 'NOK': return 'kr.';
      default: return currency;
    }
  }

  onSubmit(): void {
    if (this.settingsForm.invalid) {
      this.settingsForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const formValue = this.settingsForm.value;
    const updateDto: UpdateFamilyDto = {
      name: formValue.name.trim(),
      description: formValue.description?.trim(),
      currency: formValue.currency,
      defaultAllowance: formValue.defaultAllowance,
      allowanceFrequency: formValue.allowanceFrequency
    };

    this.subscriptions.add(
      this.familyService.updateFamily(this.data.family.id, updateDto).then(
        (updatedFamily) => {
          this.isSubmitting = false;
          this.snackBar.open('Familie indstillinger opdateret!', 'Luk', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.dialogRef.close(updatedFamily);
        }
      ).catch(
        (error) => {
          this.isSubmitting = false;
          console.error('Error updating family:', error);

          if (error.message) {
            this.errorMessage = error.message;
          } else {
            this.errorMessage = 'Der opstod en fejl ved opdatering af familie indstillinger. Prøv venligst igen.';
          }
        }
      )
    );
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getPreviewText(): string {
    const formValue = this.settingsForm.value;
    const currency = this.getCurrencySymbol(formValue.currency);
    const frequency = this.frequencyOptions.find(f => f.value === formValue.allowanceFrequency)?.name || formValue.allowanceFrequency;

    if (formValue.defaultAllowance > 0) {
      return `Standard ugepenge: ${formValue.defaultAllowance} ${currency} ${frequency.toLowerCase()}`;
    }
    return 'Ingen standard ugepenge sat';
  }
}