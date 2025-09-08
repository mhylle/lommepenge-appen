import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
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
      // First check if user is authenticated
      const user = this.authService.getCurrentUser();
      if (!user) {
        // Not authenticated, trigger login
        this.showLogin('Du skal logge ind som administrator for at fortsætte.');
        return false;
      }

      // Check if user has admin role for app2
      const isAdmin = this.authService.hasRole('app2', 'admin') || 
                     this.authService.hasRole('app2', 'super-admin');

      if (isAdmin) {
        return true;
      } else {
        // User doesn't have admin privileges
        this.showErrorMessage('Du skal have administratorrettigheder for at få adgang til denne side.');
        this.router.navigate(['/access-denied']);
        return false;
      }
    } catch (error) {
      console.error('AdminGuard error:', error);
      this.showErrorMessage('Der opstod en fejl ved kontrol af dine administratorrettigheder.');
      this.router.navigate(['/access-denied']);
      return false;
    }
  }

  private showLogin(message: string): void {
    this.showInfoMessage(message);
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

  private showInfoMessage(message: string): void {
    this.snackBar.open(message, 'Luk', {
      duration: 6000,
      panelClass: ['info-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
}