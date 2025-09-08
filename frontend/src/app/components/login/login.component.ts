import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService, LoginRequest, RegisterRequest } from '../../services/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ErrorHandlerService } from '../../services/error-handler.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit, OnDestroy {
  @Output() loginSuccess = new EventEmitter<void>();
  
  loginForm: FormGroup;
  registerForm: FormGroup;
  isLoading = false;
  hidePassword = true;
  hideConfirmPassword = true;
  showModal = false;
  isRegistering = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private errorHandler: ErrorHandlerService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      familyName: ['', [Validators.minLength(2)]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Listen for login modal requests
    window.addEventListener('show-login', this.showLoginModal.bind(this));
    
    // Check if user is already authenticated
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('show-login', this.showLoginModal.bind(this));
  }

  private showLoginModal(): void {
    this.showModal = true;
    this.isRegistering = false;
    this.loginForm.reset();
    this.registerForm.reset();
    this.isLoading = false;
  }

  closeModal(): void {
    this.showModal = false;
    this.isRegistering = false;
  }

  toggleRegistrationMode(): void {
    this.isRegistering = !this.isRegistering;
    this.loginForm.reset();
    this.registerForm.reset();
    this.isLoading = false;
  }

  async onSubmit(): Promise<void> {
    if (this.isRegistering) {
      await this.onRegister();
    } else {
      await this.onLogin();
    }
  }

  async onLogin(): Promise<void> {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    this.isLoading = true;
    
    try {
      const credentials: LoginRequest = {
        email: this.loginForm.get('email')?.value,
        password: this.loginForm.get('password')?.value
      };

      const user = await this.authService.login(credentials);
      
      // Success!
      this.errorHandler.showSuccess(`Velkommen tilbage, ${user.firstName}!`);
      this.closeModal();
      this.loginSuccess.emit();
      
      // Navigate to dashboard
      this.router.navigate(['/dashboard']);
      
    } catch (error: any) {
      this.errorHandler.handleError(error);
    } finally {
      this.isLoading = false;
    }
  }

  async onRegister(): Promise<void> {
    if (this.registerForm.invalid) {
      this.markFormGroupTouched(this.registerForm);
      return;
    }

    this.isLoading = true;
    
    try {
      const registrationData: RegisterRequest = {
        firstName: this.registerForm.get('firstName')?.value,
        lastName: this.registerForm.get('lastName')?.value,
        email: this.registerForm.get('email')?.value,
        password: this.registerForm.get('password')?.value,
        familyName: this.registerForm.get('familyName')?.value || undefined
      };

      const user = await this.authService.register(registrationData);
      
      // Success!
      this.errorHandler.showSuccess(`Velkommen til familien, ${user.firstName}!`);
      this.closeModal();
      this.loginSuccess.emit();
      
      // Navigate to dashboard
      this.router.navigate(['/dashboard']);
      
    } catch (error: any) {
      this.errorHandler.handleError(error);
    } finally {
      this.isLoading = false;
    }
  }


  private markFormGroupTouched(form: FormGroup): void {
    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      control?.markAsTouched();
    });
  }

  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    
    if (confirmPassword?.hasError('mismatch')) {
      delete confirmPassword.errors!['mismatch'];
      if (Object.keys(confirmPassword.errors!).length === 0) {
        confirmPassword.setErrors(null);
      }
    }
    
    return null;
  }

  // Getters for form validation
  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  // Registration form getters
  get firstName() {
    return this.registerForm.get('firstName');
  }

  get lastName() {
    return this.registerForm.get('lastName');
  }

  get registerEmail() {
    return this.registerForm.get('email');
  }

  get registerPassword() {
    return this.registerForm.get('password');
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }

  get familyName() {
    return this.registerForm.get('familyName');
  }

  getEmailErrorMessage(): string {
    if (this.email?.hasError('required')) {
      return 'Email er påkrævet';
    }
    if (this.email?.hasError('email')) {
      return 'Indtast en gyldig email';
    }
    return '';
  }

  getPasswordErrorMessage(): string {
    if (this.password?.hasError('required')) {
      return 'Adgangskode er påkrævet';
    }
    if (this.password?.hasError('minlength')) {
      return 'Adgangskoden skal være mindst 6 tegn';
    }
    return '';
  }

  // Registration form error messages
  getFirstNameErrorMessage(): string {
    if (this.firstName?.hasError('required')) {
      return 'Fornavn er påkrævet';
    }
    if (this.firstName?.hasError('minlength')) {
      return 'Fornavnet skal være mindst 2 tegn';
    }
    return '';
  }

  getLastNameErrorMessage(): string {
    if (this.lastName?.hasError('required')) {
      return 'Efternavn er påkrævet';
    }
    if (this.lastName?.hasError('minlength')) {
      return 'Efternavnet skal være mindst 2 tegn';
    }
    return '';
  }

  getRegisterEmailErrorMessage(): string {
    if (this.registerEmail?.hasError('required')) {
      return 'Email er påkrævet';
    }
    if (this.registerEmail?.hasError('email')) {
      return 'Indtast en gyldig email';
    }
    return '';
  }

  getRegisterPasswordErrorMessage(): string {
    if (this.registerPassword?.hasError('required')) {
      return 'Adgangskode er påkrævet';
    }
    if (this.registerPassword?.hasError('minlength')) {
      return 'Adgangskoden skal være mindst 6 tegn';
    }
    return '';
  }

  getConfirmPasswordErrorMessage(): string {
    if (this.confirmPassword?.hasError('required')) {
      return 'Bekræft adgangskode er påkrævet';
    }
    if (this.confirmPassword?.hasError('mismatch')) {
      return 'Adgangskoderne matcher ikke';
    }
    return '';
  }

  getFamilyNameErrorMessage(): string {
    if (this.familyName?.hasError('minlength')) {
      return 'Familienavnet skal være mindst 2 tegn';
    }
    return '';
  }
}
