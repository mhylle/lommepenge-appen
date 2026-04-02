import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError, from, of } from 'rxjs';

let isRefreshing = false;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);

  // Skip interception for auth endpoints to avoid infinite loops
  if (req.url.includes('/auth/')) {
    return next(req);
  }

  // Add Bearer token and ensure cookies are sent with requests
  const token = localStorage.getItem('access_token');
  req = req.clone({
    withCredentials: true,
    ...(token ? { setHeaders: { Authorization: `Bearer ${token}` } } : {}),
  });

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        return handle401Error(authService, router, snackBar, req, next);
      }

      // Handle other auth-related errors
      if (error.status === 403) {
        handleForbiddenError(router, snackBar);
      } else if (error.status >= 500) {
        handleServerError(snackBar);
      }

      return throwError(() => error);
    })
  );
};

function handle401Error(authService: AuthService, router: Router, snackBar: MatSnackBar, request: any, next: any) {
  if (!isRefreshing) {
    isRefreshing = true;

    // Try to validate/refresh session
    return from(authService.validateSession()).pipe(
      switchMap((user) => {
        isRefreshing = false;
        if (user) {
          // Session is valid, retry the original request
          return next(request);
        } else {
          // Session is invalid, trigger login
          triggerLogin(authService, snackBar, 'Din session er udløbet. Log ind igen.');
          return throwError(() => new Error('Session expired'));
        }
      }),
      catchError((error) => {
        isRefreshing = false;
        triggerLogin(authService, snackBar, 'Kunne ikke validere din session. Log ind igen.');
        return throwError(() => error);
      })
    );
  } else {
    // Already refreshing, wait a bit and retry
    return new Promise(resolve => setTimeout(resolve, 1000)).then(() => {
      if (authService.isAuthenticated()) {
        return next(request);
      } else {
        return throwError(() => new Error('Session refresh failed'));
      }
    });
  }
}

function handleForbiddenError(router: Router, snackBar: MatSnackBar): void {
  showErrorMessage(snackBar, 'Du har ikke tilladelse til at udføre denne handling.');
  router.navigate(['/access-denied']);
}

function handleServerError(snackBar: MatSnackBar): void {
  showErrorMessage(snackBar, 'Der opstod en serverfejl. Prøv igen senere.');
}

function triggerLogin(authService: AuthService, snackBar: MatSnackBar, message: string): void {
  showErrorMessage(snackBar, message);
  
  // Clear user state
  authService.clearUserState();
  
  // Trigger login modal
  const event = new CustomEvent('show-login');
  window.dispatchEvent(event);
}

function showErrorMessage(snackBar: MatSnackBar, message: string): void {
  snackBar.open(message, 'Luk', {
    duration: 8000,
    panelClass: ['error-snackbar'],
    horizontalPosition: 'center',
    verticalPosition: 'top'
  });
}
