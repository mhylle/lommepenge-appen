import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CreateChildData {
  familyId: string;
}

export interface CreateChildRequest {
  name: string;
  familyId: string;
  age: number;
  cardColor?: string;
  initialBalance?: number;
  weeklyAllowance?: number;
}

export interface Child {
  id: string;
  name: string;
  age: number | null;
  currentBalance: number;
  cardColor: string;
  profilePicture?: string;
  weeklyAllowance: number;
  dateOfBirth: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-child-registration-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './child-registration-modal.component.html',
  styleUrls: ['./child-registration-modal.component.scss']
})
export class ChildRegistrationModalComponent implements OnInit, OnDestroy {
  childForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  private subscriptions = new Subscription();

  // Danish-friendly color palette for polaroid cards
  cardColors = [
    { value: '#FFB6C1', name: 'Lyserød', preview: '#FFB6C1' },
    { value: '#87CEEB', name: 'Himmelblå', preview: '#87CEEB' },
    { value: '#98FB98', name: 'Lysegrøn', preview: '#98FB98' },
    { value: '#DDA0DD', name: 'Lilla', preview: '#DDA0DD' },
    { value: '#F0E68C', name: 'Gul', preview: '#F0E68C' },
    { value: '#FFA07A', name: 'Laks', preview: '#FFA07A' },
    { value: '#20B2AA', name: 'Havgrøn', preview: '#20B2AA' },
    { value: '#FFE4E1', name: 'Ferskenfarvet', preview: '#FFE4E1' },
    { value: '#E6E6FA', name: 'Lavendel', preview: '#E6E6FA' },
    { value: '#F5DEB3', name: 'Beige', preview: '#F5DEB3' }
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private dialogRef: MatDialogRef<ChildRegistrationModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CreateChildData
  ) {
    this.childForm = this.createForm();
  }

  ngOnInit(): void {
    // Set default card color randomly
    if (!this.childForm.get('cardColor')?.value) {
      const randomColor = this.cardColors[Math.floor(Math.random() * this.cardColors.length)];
      this.childForm.patchValue({ cardColor: randomColor.value });
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
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZæøåÆØÅ\s\-']+$/) // Danish characters allowed
      ]],
      age: [7, [
        Validators.required,
        Validators.min(3),
        Validators.max(17)
      ]],
      cardColor: [this.cardColors[0].value],
      initialBalance: [0, [
        Validators.min(0),
        Validators.max(10000)
      ]],
      weeklyAllowance: [null, [
        Validators.min(0),
        Validators.max(500)
      ]]
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.childForm.get(fieldName);
    if (!field?.errors || !field.touched) return '';

    const errors = field.errors;

    // Danish error messages
    switch (fieldName) {
      case 'name':
        if (errors['required']) return 'Navn er påkrævet';
        if (errors['minlength']) return 'Navn skal være mindst 2 karakterer';
        if (errors['maxlength']) return 'Navn må maksimalt være 50 karakterer';
        if (errors['pattern']) return 'Navn må kun indeholde bogstaver, mellemrum og bindestreg';
        break;
      case 'age':
        if (errors['required']) return 'Alder er påkrævet';
        if (errors['min']) return 'Barn skal være mindst 3 år gammelt';
        if (errors['max']) return 'Barn må maksimalt være 17 år gammelt';
        break;
      case 'initialBalance':
        if (errors['min']) return 'Start balance kan ikke være negativ';
        if (errors['max']) return 'Start balance må maksimalt være 10.000 kr.';
        break;
      case 'weeklyAllowance':
        if (errors['min']) return 'Ugepenge kan ikke være negative';
        if (errors['max']) return 'Ugepenge må maksimalt være 500 kr.';
        break;
    }

    return 'Ugyldigt input';
  }

  getRecommendedAllowance(): number {
    const age = this.childForm.get('age')?.value;
    if (!age) return 25;
    
    // Danish pocket money recommendations
    if (age <= 8) return 25;
    if (age <= 12) return 50;
    return 75;
  }

  suggestAllowance(): void {
    const recommended = this.getRecommendedAllowance();
    this.childForm.patchValue({ weeklyAllowance: recommended });
  }

  onSubmit(): void {
    if (this.childForm.invalid) {
      this.childForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const formValue = this.childForm.value;
    const createChildRequest: CreateChildRequest = {
      name: formValue.name.trim(),
      familyId: this.data.familyId,
      age: formValue.age,
      cardColor: formValue.cardColor,
      initialBalance: formValue.initialBalance || 0,
      weeklyAllowance: formValue.weeklyAllowance || this.getRecommendedAllowance()
    };

    const apiUrl = `/api/app2/pocket-money-users/children`;
    
    this.subscriptions.add(
      this.http.post<Child>(apiUrl, createChildRequest).subscribe({
        next: (newChild) => {
          this.isSubmitting = false;
          this.dialogRef.close(newChild); // Return the created child
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error creating child:', error);
          
          if (error.status === 400 && error.error?.message) {
            this.errorMessage = error.error.message;
          } else {
            this.errorMessage = 'Der opstod en fejl ved oprettelse af barnet. Prøv venligst igen.';
          }
        }
      })
    );
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  // Get the selected color name for display
  getSelectedColorName(): string {
    const selectedColor = this.childForm.get('cardColor')?.value;
    const color = this.cardColors.find(c => c.value === selectedColor);
    return color?.name || 'Ukendt farve';
  }
}