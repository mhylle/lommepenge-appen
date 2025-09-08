import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ChildRegistrationModalComponent } from './child-registration-modal.component';

describe('ChildRegistrationModalComponent', () => {
  let component: ChildRegistrationModalComponent;
  let fixture: ComponentFixture<ChildRegistrationModalComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<ChildRegistrationModalComponent>>;

  beforeEach(async () => {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      declarations: [ChildRegistrationModalComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientTestingModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatProgressSpinnerModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { familyId: 'test-family-id' } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ChildRegistrationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    expect(component.childForm.get('name')?.value).toBe('');
    expect(component.childForm.get('age')?.value).toBe(7);
    expect(component.childForm.get('initialBalance')?.value).toBe(0);
    expect(component.childForm.get('cardColor')?.value).toBeTruthy();
  });

  it('should validate required fields', () => {
    const nameControl = component.childForm.get('name');
    const ageControl = component.childForm.get('age');

    nameControl?.setValue('');
    ageControl?.setValue(null);
    nameControl?.markAsTouched();
    ageControl?.markAsTouched();

    expect(component.getFieldError('name')).toContain('påkrævet');
    expect(component.getFieldError('age')).toContain('påkrævet');
  });

  it('should return recommended allowance based on age', () => {
    component.childForm.patchValue({ age: 6 });
    expect(component.getRecommendedAllowance()).toBe(25);

    component.childForm.patchValue({ age: 10 });
    expect(component.getRecommendedAllowance()).toBe(50);

    component.childForm.patchValue({ age: 15 });
    expect(component.getRecommendedAllowance()).toBe(75);
  });

  it('should close dialog on cancel', () => {
    component.onCancel();
    expect(mockDialogRef.close).toHaveBeenCalledWith();
  });
});