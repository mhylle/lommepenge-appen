import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="access-denied-container">
      <mat-card class="access-denied-card">
        <mat-card-header>
          <mat-icon mat-card-avatar color="warn">block</mat-icon>
          <mat-card-title>Access Denied</mat-card-title>
          <mat-card-subtitle>Insufficient Permissions</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <p>You don't have permission to access the Task Management application.</p>
          <p *ngIf="userEmail" class="user-info">
            <mat-icon>account_circle</mat-icon>
            Current user: {{ userEmail }}
          </p>
          <p>Please contact an administrator if you believe this is an error.</p>
        </mat-card-content>
        
        <mat-card-actions>
          <button mat-raised-button color="primary" (click)="logout()">
            <mat-icon>logout</mat-icon>
            Logout
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .access-denied-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 60vh;
      padding: 2rem;
    }
    
    .access-denied-card {
      max-width: 500px;
      width: 100%;
      text-align: center;
    }
    
    .user-info {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin: 1rem 0;
      color: #666;
    }
    
    .user-info mat-icon {
      font-size: 1.25rem;
      width: 1.25rem;
      height: 1.25rem;
    }
    
    mat-card-actions {
      padding-top: 1rem;
      display: flex;
      justify-content: center;
    }
    
    mat-card-actions button {
      font-size: 1rem;
    }
    
    mat-card-actions mat-icon {
      margin-right: 0.5rem;
    }
  `]
})
export class AccessDeniedComponent {
  userEmail: string | null = null;

  constructor(private authService: AuthService) {
    const user = this.authService.getCurrentUser();
    this.userEmail = user?.email || null;
  }

  async logout(): Promise<void> {
    await this.authService.logout();
  }
}