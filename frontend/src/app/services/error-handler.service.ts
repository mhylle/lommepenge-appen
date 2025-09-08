import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

export enum ErrorType {
  Authentication = 'authentication',
  Authorization = 'authorization',
  Validation = 'validation',
  Network = 'network',
  Server = 'server',
  Unknown = 'unknown'
}

export interface ErrorContext {
  type: ErrorType;
  message: string;
  originalError?: any;
  userMessage: string;
  actionRequired?: boolean;
  redirectUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  private readonly danishErrorMessages: Record<string, string> = {
    // Authentication errors
    'invalid_credentials': 'Forkert email eller adgangskode.',
    'user_not_found': 'Brugeren blev ikke fundet.',
    'account_locked': 'Din konto er midlertidigt låst. Prøv igen senere.',
    'password_expired': 'Din adgangskode er udløbet. Du skal opdatere den.',
    'session_expired': 'Din session er udløbet. Log ind igen.',
    'token_invalid': 'Din session er ugyldig. Log ind igen.',
    
    // Authorization errors
    'access_denied': 'Du har ikke tilladelse til at udføre denne handling.',
    'insufficient_permissions': 'Du mangler nødvendige tilladelser.',
    'app_access_denied': 'Du har ikke adgang til Lommepenge App\'en.',
    'role_required': 'Du mangler de nødvendige roller for denne handling.',
    
    // Validation errors
    'validation_failed': 'De indtastede data er ikke gyldige.',
    'required_field': 'Dette felt er påkrævet.',
    'invalid_email': 'Indtast en gyldig email-adresse.',
    'password_too_short': 'Adgangskoden skal være mindst 6 tegn.',
    'invalid_format': 'Formattet er ikke gyldigt.',
    
    // Network errors
    'network_error': 'Netværksfejl. Tjek din internetforbindelse.',
    'timeout': 'Anmodningen tog for lang tid. Prøv igen.',
    'connection_failed': 'Kunne ikke oprette forbindelse til serveren.',
    'offline': 'Du er offline. Tjek din internetforbindelse.',
    
    // Server errors
    'server_error': 'Der opstod en serverfejl. Prøv igen senere.',
    'service_unavailable': 'Tjenesten er midlertidigt utilgængelig.',
    'database_error': 'Database fejl. Kontakt support hvis problemet fortsætter.',
    'rate_limit': 'For mange anmodninger. Vent et øjeblik og prøv igen.',
    
    // Generic errors
    'unknown_error': 'Der opstod en ukendt fejl. Prøv igen eller kontakt support.',
    'operation_failed': 'Handlingen kunne ikke gennemføres.',
    'data_not_found': 'De ønskede data blev ikke fundet.',
    'conflict': 'Der opstod en konflikt. Genindlæs siden og prøv igen.'
  };

  constructor(
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  handleError(error: any, context?: Partial<ErrorContext>): void {
    const errorContext = this.analyzeError(error, context);
    this.displayError(errorContext);
    
    if (errorContext.actionRequired) {
      this.handleRequiredAction(errorContext);
    }
    
    // Log error for debugging
    console.error('Error handled:', errorContext);
  }

  private analyzeError(error: any, context?: Partial<ErrorContext>): ErrorContext {
    let errorType = ErrorType.Unknown;
    let message = 'unknown_error';
    let userMessage = this.danishErrorMessages['unknown_error'];

    if (error instanceof HttpErrorResponse) {
      // HTTP errors
      switch (error.status) {
        case 401:
          errorType = ErrorType.Authentication;
          message = this.getAuthErrorMessage(error);
          break;
        case 403:
          errorType = ErrorType.Authorization;
          message = 'access_denied';
          break;
        case 400:
          errorType = ErrorType.Validation;
          message = this.getValidationErrorMessage(error);
          break;
        case 404:
          errorType = ErrorType.Unknown;
          message = 'data_not_found';
          break;
        case 409:
          errorType = ErrorType.Unknown;
          message = 'conflict';
          break;
        case 429:
          errorType = ErrorType.Server;
          message = 'rate_limit';
          break;
        case 500:
        case 502:
        case 503:
          errorType = ErrorType.Server;
          message = error.status === 503 ? 'service_unavailable' : 'server_error';
          break;
        case 0:
          errorType = ErrorType.Network;
          message = 'network_error';
          break;
        default:
          errorType = ErrorType.Unknown;
          message = 'unknown_error';
      }
    } else if (error?.name === 'TimeoutError') {
      errorType = ErrorType.Network;
      message = 'timeout';
    } else if (error?.message?.includes('Network')) {
      errorType = ErrorType.Network;
      message = 'network_error';
    } else if (typeof error === 'string') {
      message = error;
    }

    userMessage = this.danishErrorMessages[message] || this.danishErrorMessages['unknown_error'];

    return {
      type: errorType,
      message,
      originalError: error,
      userMessage,
      actionRequired: errorType === ErrorType.Authentication,
      redirectUrl: this.getRedirectUrl(errorType),
      ...context
    };
  }

  private getAuthErrorMessage(error: HttpErrorResponse): string {
    const errorBody = error.error;
    
    if (errorBody?.message) {
      if (errorBody.message.includes('Invalid credentials')) return 'invalid_credentials';
      if (errorBody.message.includes('User not found')) return 'user_not_found';
      if (errorBody.message.includes('Account locked')) return 'account_locked';
      if (errorBody.message.includes('Password expired')) return 'password_expired';
      if (errorBody.message.includes('Session expired')) return 'session_expired';
      if (errorBody.message.includes('Token invalid')) return 'token_invalid';
    }
    
    return 'session_expired';
  }

  private getValidationErrorMessage(error: HttpErrorResponse): string {
    const errorBody = error.error;
    
    if (errorBody?.message) {
      if (errorBody.message.includes('email')) return 'invalid_email';
      if (errorBody.message.includes('password')) return 'password_too_short';
      if (errorBody.message.includes('required')) return 'required_field';
    }
    
    return 'validation_failed';
  }

  private getRedirectUrl(errorType: ErrorType): string | undefined {
    switch (errorType) {
      case ErrorType.Authentication:
        return undefined; // Will trigger login modal
      case ErrorType.Authorization:
        return '/access-denied';
      default:
        return undefined;
    }
  }

  private displayError(errorContext: ErrorContext): void {
    const panelClass = this.getSnackBarClass(errorContext.type);
    const duration = this.getSnackBarDuration(errorContext.type);

    this.snackBar.open(errorContext.userMessage, 'Luk', {
      duration,
      panelClass: [panelClass],
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  private getSnackBarClass(errorType: ErrorType): string {
    switch (errorType) {
      case ErrorType.Authentication:
      case ErrorType.Authorization:
      case ErrorType.Server:
        return 'error-snackbar';
      case ErrorType.Validation:
        return 'warning-snackbar';
      case ErrorType.Network:
        return 'info-snackbar';
      default:
        return 'error-snackbar';
    }
  }

  private getSnackBarDuration(errorType: ErrorType): number {
    switch (errorType) {
      case ErrorType.Authentication:
      case ErrorType.Authorization:
        return 10000; // 10 seconds for critical errors
      case ErrorType.Server:
        return 8000; // 8 seconds for server errors
      case ErrorType.Network:
        return 6000; // 6 seconds for network issues
      case ErrorType.Validation:
        return 5000; // 5 seconds for validation errors
      default:
        return 5000;
    }
  }

  private handleRequiredAction(errorContext: ErrorContext): void {
    if (errorContext.type === ErrorType.Authentication) {
      // Trigger login modal
      const event = new CustomEvent('show-login');
      window.dispatchEvent(event);
    } else if (errorContext.redirectUrl) {
      // Navigate to error page
      setTimeout(() => {
        this.router.navigate([errorContext.redirectUrl]);
      }, 1000);
    }
  }

  // Convenience methods for common error scenarios
  showSuccess(message: string): void {
    this.snackBar.open(message, 'Luk', {
      duration: 3000,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  showInfo(message: string): void {
    this.snackBar.open(message, 'Luk', {
      duration: 5000,
      panelClass: ['info-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  showWarning(message: string): void {
    this.snackBar.open(message, 'Luk', {
      duration: 6000,
      panelClass: ['warning-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  showError(message: string): void {
    this.snackBar.open(message, 'Luk', {
      duration: 8000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
}