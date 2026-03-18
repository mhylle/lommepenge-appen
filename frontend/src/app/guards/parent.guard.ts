import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ParentGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.authService.isChildAccount()) {
      const childId = this.authService.getChildId();
      if (childId) {
        this.router.navigate(['/child', childId]);
      }
      return false;
    }
    return true;
  }
}
