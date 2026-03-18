import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { FamilyService } from '../services/family.service';

@Injectable({
  providedIn: 'root'
})
export class ChildAccountGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private familyService: FamilyService,
    private http: HttpClient,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> | boolean {
    const routeChildId = route.paramMap.get('childId');

    if (!routeChildId) {
      this.router.navigate(['/dashboard']);
      return false;
    }

    const user = this.authService.getCurrentUser();

    // Child account: verify childId from JWT matches route param
    if (user?.accountType === 'child') {
      const jwtChildId = this.authService.getChildId();
      if (jwtChildId !== routeChildId) {
        // Child trying to view another child's dashboard - redirect to their own
        this.router.navigate(['/child', jwtChildId]);
        return false;
      }
      return true;
    }

    // Parent account (or undefined for backwards compat): delegate to family-based verification
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
      return false;
    }

    const currentFamily = this.familyService.getCurrentFamily();
    if (!currentFamily?.id) {
      this.router.navigate(['/dashboard']);
      return false;
    }

    return this.verifyChildAccess(routeChildId, currentFamily.id);
  }

  private verifyChildAccess(childId: string, familyId: string): Observable<boolean> {
    const apiUrl = `/api/app2/pocket-money-users/verify-child-access/${childId}/${familyId}`;

    return this.http.get<{ hasAccess: boolean }>(apiUrl).pipe(
      map(response => {
        if (response.hasAccess) {
          return true;
        } else {
          this.router.navigate(['/dashboard']);
          return false;
        }
      }),
      catchError(() => {
        this.router.navigate(['/dashboard']);
        return of(false);
      })
    );
  }
}
