import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    try {
      // Check if user is authenticated
      let user = this.authService.getCurrentUser();
      
      // If no user, try to validate session
      if (!user) {
        user = await this.authService.validateSession();
      }

      if (user) {
        // Check if user has access to this app
        if (this.authService.hasAppAccess('app2')) {
          // Check if session is expiring soon and warn user
          this.checkSessionExpiration();
          return true;
        } else {
          // User is authenticated but doesn't have app access
          this.showErrorMessage('Du har ikke adgang til Lommepenge App\'en. Kontakt en administrator.');
          this.router.navigate(['/access-denied']);
          return false;
        }
      }

      // Not authenticated - show login
      this.showLogin('Du skal logge ind for at få adgang til Lommepenge App\'en.');
      return false;
    } catch (error) {
      console.error('AuthGuard error:', error);
      this.showLogin('Der opstod en fejl ved validering af din session. Log ind igen.');
      return false;
    }
  }

  private checkSessionExpiration(): void {
    if (this.authService.isSessionExpiringSoon()) {
      this.showWarningMessage('Din session udløber snart. Gem dit arbejde.');
    }
  }

  private showLogin(message?: string): void {
    if (message) {
      this.showInfoMessage(message);
    }
    
    // Trigger login modal
    const event = new CustomEvent('show-login');
    window.dispatchEvent(event);
  }

  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Luk', {
      duration: 8000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  private showWarningMessage(message: string): void {
    this.snackBar.open(message, 'Luk', {
      duration: 10000,
      panelClass: ['warning-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  private showInfoMessage(message: string): void {
    this.snackBar.open(message, 'Luk', {
      duration: 6000,
      panelClass: ['info-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
}