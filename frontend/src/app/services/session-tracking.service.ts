import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer, interval, Subscription } from 'rxjs';
import { AuthService, UserInfo } from './auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface SessionState {
  isActive: boolean;
  lastActivity: Date;
  sessionStartTime: Date;
  warningShown: boolean;
  expirationWarningTime?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class SessionTrackingService {
  private readonly SESSION_WARNING_MINUTES = 15;
  private readonly SESSION_TIMEOUT_MINUTES = 30;
  private readonly ACTIVITY_CHECK_INTERVAL = 30000; // 30 seconds

  private sessionStateSubject = new BehaviorSubject<SessionState | null>(null);
  public sessionState$ = this.sessionStateSubject.asObservable();

  private activityTimer?: Subscription;
  private warningTimer?: Subscription;
  private timeoutTimer?: Subscription;

  private lastActivityTime = new Date();

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.initializeSessionTracking();
    this.setupActivityListeners();
  }

  private initializeSessionTracking(): void {
    // Subscribe to authentication state changes
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.startSessionTracking();
      } else {
        this.stopSessionTracking();
      }
    });
  }

  private startSessionTracking(): void {
    const sessionState: SessionState = {
      isActive: true,
      lastActivity: new Date(),
      sessionStartTime: new Date(),
      warningShown: false
    };

    this.sessionStateSubject.next(sessionState);
    this.startActivityMonitoring();
    this.scheduleWarning();
    this.scheduleTimeout();
  }

  private stopSessionTracking(): void {
    this.sessionStateSubject.next(null);
    this.clearTimers();
  }

  private startActivityMonitoring(): void {
    this.activityTimer = interval(this.ACTIVITY_CHECK_INTERVAL).subscribe(() => {
      this.checkSessionActivity();
    });
  }

  private checkSessionActivity(): void {
    const currentState = this.sessionStateSubject.value;
    if (!currentState || !currentState.isActive) return;

    const now = new Date();
    const timeSinceLastActivity = now.getTime() - this.lastActivityTime.getTime();
    
    // If user has been inactive for more than session timeout, log them out
    if (timeSinceLastActivity > this.SESSION_TIMEOUT_MINUTES * 60 * 1000) {
      this.handleSessionTimeout();
      return;
    }

    // Update session state with current activity
    const updatedState: SessionState = {
      ...currentState,
      lastActivity: this.lastActivityTime
    };

    this.sessionStateSubject.next(updatedState);
  }

  private scheduleWarning(): void {
    const warningTime = this.SESSION_WARNING_MINUTES * 60 * 1000;
    this.warningTimer = timer(warningTime).subscribe(() => {
      this.showSessionWarning();
    });
  }

  private scheduleTimeout(): void {
    const timeoutTime = this.SESSION_TIMEOUT_MINUTES * 60 * 1000;
    this.timeoutTimer = timer(timeoutTime).subscribe(() => {
      this.handleSessionTimeout();
    });
  }

  private showSessionWarning(): void {
    const currentState = this.sessionStateSubject.value;
    if (!currentState || currentState.warningShown) return;

    const updatedState: SessionState = {
      ...currentState,
      warningShown: true,
      expirationWarningTime: new Date()
    };

    this.sessionStateSubject.next(updatedState);

    // Show warning with action buttons
    const snackBarRef = this.snackBar.open(
      'Din session udløber om 15 minutter. Vil du forlænge den?',
      'Forlæng Session',
      {
        duration: 0, // Don't auto-dismiss
        panelClass: ['warning-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'top'
      }
    );

    snackBarRef.onAction().subscribe(() => {
      this.extendSession();
    });

    // Auto-dismiss after 2 minutes if no action
    timer(120000).subscribe(() => {
      snackBarRef.dismiss();
    });
  }

  private async extendSession(): Promise<void> {
    try {
      // Validate current session with backend
      const user = await this.authService.validateSession();
      
      if (user) {
        // Reset session tracking
        this.clearTimers();
        this.startSessionTracking();
        
        this.snackBar.open('Din session er forlænget med 30 minutter.', 'Luk', {
          duration: 3000,
          panelClass: ['success-snackbar'],
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      } else {
        this.handleSessionTimeout();
      }
    } catch (error) {
      console.error('Failed to extend session:', error);
      this.handleSessionTimeout();
    }
  }

  private handleSessionTimeout(): void {
    this.snackBar.open('Din session er udløbet. Du bliver logget ud.', 'Luk', {
      duration: 3000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });

    // Log out user
    this.authService.logout();
    this.stopSessionTracking();
  }

  private setupActivityListeners(): void {
    // Track user activity
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    activityEvents.forEach(event => {
      document.addEventListener(event, () => this.recordActivity(), true);
    });
  }

  private recordActivity(): void {
    this.lastActivityTime = new Date();
    
    // Reset warning if user becomes active again
    const currentState = this.sessionStateSubject.value;
    if (currentState && currentState.warningShown) {
      const updatedState: SessionState = {
        ...currentState,
        warningShown: false,
        expirationWarningTime: undefined
      };
      this.sessionStateSubject.next(updatedState);
    }
  }

  private clearTimers(): void {
    this.activityTimer?.unsubscribe();
    this.warningTimer?.unsubscribe();
    this.timeoutTimer?.unsubscribe();
  }

  // Public methods
  public getCurrentSessionState(): SessionState | null {
    return this.sessionStateSubject.value;
  }

  public getSessionDuration(): number {
    const state = this.getCurrentSessionState();
    if (!state) return 0;
    
    return new Date().getTime() - state.sessionStartTime.getTime();
  }

  public getTimeSinceLastActivity(): number {
    const state = this.getCurrentSessionState();
    if (!state) return 0;
    
    return new Date().getTime() - state.lastActivity.getTime();
  }

  public forceSessionRefresh(): Promise<UserInfo | null> {
    this.recordActivity();
    return this.authService.refreshSession();
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }
}