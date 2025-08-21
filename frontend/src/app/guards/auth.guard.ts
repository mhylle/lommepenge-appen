import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async canActivate(): Promise<boolean> {
    // Check if user is authenticated
    let user = this.authService.getCurrentUser();
    
    // If no user, try to validate session
    if (!user) {
      user = await this.authService.validateSession();
    }

    if (user) {
      // Check if user has access to this app
      if (this.authService.hasAppAccess('app2')) {
        return true;
      } else {
        // User is authenticated but doesn't have app access
        this.router.navigate(['/access-denied']);
        return false;
      }
    }

    // Not authenticated - show login
    this.showLogin();
    return false;
  }

  private showLogin(): void {
    // Trigger login modal
    const event = new CustomEvent('show-login');
    window.dispatchEvent(event);
  }
}