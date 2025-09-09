import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FamilyService } from './family.service';

export interface UserInfo {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  permissions: {
    apps: string[];
    roles: Record<string, string[]>;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  familyName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<UserInfo | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private familyService: FamilyService) {
    // Check for existing session on app startup
    this.validateSession();
  }

  async validateSession(): Promise<UserInfo | null> {
    try {
      const response = await fetch('/api/app2/auth/validate', {
        credentials: 'include' // Include cookies
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // Handle both old format (result.data) and new format (result.user)
        const user = result.data || result.user;
        
        if (user) {
          this.currentUserSubject.next(user);
          
          // Initialize family context if available
          if (result.family) {
            this.familyService.initializeFamilyFromAuth(result.family);
          }
          
          return user;
        }
      }
    } catch (error) {
      console.error('Session validation failed:', error);
    }
    
    this.currentUserSubject.next(null);
    this.familyService.clearFamilyState();
    return null;
  }

  async login(credentials: LoginRequest): Promise<UserInfo> {
    const response = await fetch('/api/app2/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // Include cookies
      body: JSON.stringify(credentials)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || error.message || 'Login failed');
    }

    const result = await response.json();
    
    // Handle both old format (result.data) and new format (result.user)
    const user = result.data || result.user;
    
    if (!user) {
      throw new Error('Invalid login response');
    }

    this.currentUserSubject.next(user);
    
    // Initialize family context if available
    if (result.family) {
      this.familyService.initializeFamilyFromAuth(result.family);
    }
    
    // Handle warnings (e.g., family creation failures)
    if (result.warnings && result.warnings.length > 0) {
      console.warn('Login warnings:', result.warnings);
      // You could emit these warnings to a notification service here
    }

    return user;
  }

  async register(registrationData: RegisterRequest): Promise<UserInfo> {
    const response = await fetch('/api/app2/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(registrationData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || error.message || 'Registration failed');
    }

    const result = await response.json();
    
    // Handle response format
    const user = result.data || result.user;
    
    if (!user) {
      throw new Error('Invalid registration response');
    }

    this.currentUserSubject.next(user);
    
    // Initialize family context if available
    if (result.family) {
      this.familyService.initializeFamilyFromAuth(result.family);
    }

    return user;
  }

  async logout(): Promise<void> {
    try {
      await fetch('/api/app2/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    this.currentUserSubject.next(null);
    this.familyService.clearFamilyState();
  }

  getCurrentUser(): UserInfo | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  hasAppAccess(appId: string): boolean {
    const user = this.getCurrentUser();
    return user?.permissions?.apps?.includes(appId) || false;
  }

  hasRole(appId: string, role: string): boolean {
    const user = this.getCurrentUser();
    return user?.permissions?.roles?.[appId]?.includes(role) || false;
  }

  clearUserState(): void {
    this.currentUserSubject.next(null);
    this.familyService.clearFamilyState();
  }

  async refreshSession(): Promise<UserInfo | null> {
    // Force a fresh session validation
    return this.validateSession();
  }

  getSessionExpirationTime(): Date | null {
    // In a real app, this would be stored when login occurs
    // For now, we'll estimate based on typical session length
    const user = this.getCurrentUser();
    if (user) {
      // Assume 24 hour session
      const expirationTime = new Date();
      expirationTime.setHours(expirationTime.getHours() + 24);
      return expirationTime;
    }
    return null;
  }

  isSessionExpiringSoon(warningMinutes: number = 15): boolean {
    const expirationTime = this.getSessionExpirationTime();
    if (!expirationTime) return false;
    
    const now = new Date();
    const warningTime = new Date(expirationTime.getTime() - (warningMinutes * 60 * 1000));
    
    return now >= warningTime;
  }
}