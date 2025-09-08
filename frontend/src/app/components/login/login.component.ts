import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService, LoginRequest } from '../../services/auth.service';
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
  isLoading = false;
  hidePassword = true;
  showModal = false;

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
    this.loginForm.reset();
    this.isLoading = false;
  }

  closeModal(): void {
    this.showModal = false;
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
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


  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  // Getters for form validation
  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
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
}
