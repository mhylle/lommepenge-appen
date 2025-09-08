import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
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
        this.showLogin('Du skal logge ind for at fortsætte.');
        return false;
      }

      // Get required roles from route data
      const requiredRoles = route.data?.['roles'] as string[] | undefined;
      const appId = route.data?.['appId'] as string || 'app2';

      if (!requiredRoles || requiredRoles.length === 0) {
        // No specific roles required
        return true;
      }

      // Check if user has any of the required roles
      const hasRequiredRole = requiredRoles.some(role => 
        this.authService.hasRole(appId, role)
      );

      if (hasRequiredRole) {
        return true;
      } else {
        // User doesn't have required role
        this.showErrorMessage(`Du mangler tilladelser for at få adgang til denne side. Påkrævede roller: ${requiredRoles.join(', ')}`);
        this.router.navigate(['/access-denied']);
        return false;
      }
    } catch (error) {
      console.error('RoleGuard error:', error);
      this.showErrorMessage('Der opstod en fejl ved kontrol af dine tilladelser.');
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