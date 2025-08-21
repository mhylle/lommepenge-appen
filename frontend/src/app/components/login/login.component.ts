import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService, LoginRequest } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="login-modal" [class.hidden]="!isVisible">
      <div class="login-form">
        <div class="login-header">
          <mat-icon>task_alt</mat-icon>
          <h2>Task Management Login</h2>
        </div>
        
        <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Email</mat-label>
            <input 
              matInput 
              type="email" 
              name="email"
              [(ngModel)]="credentials.email" 
              required 
              #email="ngModel"
              placeholder="admin@mhylle.com">
            <mat-icon matSuffix>email</mat-icon>
            <mat-error *ngIf="email.invalid && email.touched">
              Email is required
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Password</mat-label>
            <input 
              matInput 
              type="password" 
              name="password"
              [(ngModel)]="credentials.password" 
              required 
              #password="ngModel"
              placeholder="Admin123!">
            <mat-icon matSuffix>lock</mat-icon>
            <mat-error *ngIf="password.invalid && password.touched">
              Password is required
            </mat-error>
          </mat-form-field>

          <div *ngIf="errorMessage" class="error-message">
            <mat-icon>error</mat-icon>
            {{ errorMessage }}
          </div>

          <button 
            mat-raised-button 
            color="primary"
            type="submit" 
            class="login-button"
            [disabled]="loginForm.invalid || isLoading">
            <mat-spinner *ngIf="isLoading" diameter="20"></mat-spinner>
            <span *ngIf="!isLoading">Login</span>
            <span *ngIf="isLoading">Logging in...</span>
          </button>
        </form>
        
        <div class="demo-credentials">
          <mat-icon>info</mat-icon>
          <div>
            <p><strong>Demo credentials:</strong></p>
            <p>Email: admin&#64;mhylle.com</p>
            <p>Password: Admin123!</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    
    .login-modal.hidden {
      display: none;
    }
    
    .login-form {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      min-width: 400px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }
    
    .login-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      color: #667eea;
    }
    
    .login-header mat-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
    }
    
    .login-header h2 {
      margin: 0;
      font-weight: 500;
    }
    
    .form-field {
      width: 100%;
      margin-bottom: 1rem;
    }
    
    .error-message {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #f44336;
      font-size: 0.875rem;
      margin-bottom: 1rem;
    }
    
    .error-message mat-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
    }
    
    .login-button {
      width: 100%;
      height: 48px;
      font-size: 1rem;
      margin-bottom: 1.5rem;
    }
    
    .login-button mat-spinner {
      margin-right: 8px;
    }
    
    .demo-credentials {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      padding: 1rem;
      background: #f5f5f5;
      border-radius: 4px;
      font-size: 0.875rem;
      color: #666;
    }
    
    .demo-credentials mat-icon {
      font-size: 1.25rem;
      width: 1.25rem;
      height: 1.25rem;
      margin-top: 0.125rem;
    }
    
    .demo-credentials p {
      margin: 0.25rem 0;
    }
  `]
})
export class LoginComponent {
  @Output() loginSuccess = new EventEmitter<void>();
  
  isVisible = false;
  isLoading = false;
  errorMessage = '';
  
  credentials: LoginRequest = {
    email: 'admin@mhylle.com',
    password: 'Admin123!'
  };

  constructor(private authService: AuthService) {
    // Listen for login show events
    window.addEventListener('show-login', () => {
      this.show();
    });
  }

  show(): void {
    this.isVisible = true;
    this.errorMessage = '';
  }

  hide(): void {
    this.isVisible = false;
  }

  async onSubmit(): Promise<void> {
    if (this.isLoading) return;

    this.isLoading = true;
    this.errorMessage = '';

    try {
      await this.authService.login(this.credentials);
      this.hide();
      this.loginSuccess.emit();
    } catch (error: any) {
      this.errorMessage = error.message || 'Login failed';
    } finally {
      this.isLoading = false;
    }
  }
}