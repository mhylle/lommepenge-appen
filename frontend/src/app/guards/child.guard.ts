import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { FamilyService } from '../services/family.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChildGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private familyService: FamilyService,
    private http: HttpClient,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    // First check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
      return of(false);
    }

    // Get child ID from route parameters
    const childId = route.paramMap.get('childId');
    if (!childId) {
      console.error('No child ID provided in route');
      this.router.navigate(['/dashboard']);
      return of(false);
    }

    // Get current family from service
    const currentFamily = this.familyService.getCurrentFamily();
    if (!currentFamily?.id) {
      console.error('No family context available');
      this.router.navigate(['/dashboard']);
      return of(false);
    }

    // Verify that the child belongs to the current user's family
    return this.verifyChildAccess(childId, currentFamily.id);
  }

  private verifyChildAccess(childId: string, familyId: string): Observable<boolean> {
    const apiUrl = `/api/app2/pocket-money-users/verify-child-access/${childId}/${familyId}`;
    
    return this.http.get<{hasAccess: boolean}>(apiUrl).pipe(
      map(response => {
        if (response.hasAccess) {
          return true;
        } else {
          console.error('User does not have access to this child');
          this.router.navigate(['/dashboard']);
          return false;
        }
      }),
      catchError(error => {
        console.error('Error verifying child access:', error);
        this.router.navigate(['/dashboard']);
        return of(false);
      })
    );
  }
}