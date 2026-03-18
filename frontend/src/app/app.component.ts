import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService, UserInfo } from './services/auth.service';
import { SessionTrackingService, SessionState } from './services/session-tracking.service';
import { ErrorHandlerService } from './services/error-handler.service';
import { BreadcrumbService } from './services/breadcrumb.service';

interface AppInfo {
  name: string;
  version: string;
  environment: string;
  apiUrl: string;
}

interface HealthStatus {
  status: string;
  timestamp: string;
  database: string;
  version: string;
}

@Component({
  selector: 'app-root',
  standalone: false,
  template: `
    <div class="lommepenge-app" [class.child-mode]="isChildAccount()">
      <!-- Main Header -->
      <header class="lommepenge-header" [class.child-header-theme]="isChildAccount()">
        <div class="header-content">
          <div class="app-branding">
            <h1 class="app-title">💰 Lommepenge App'en</h1>
            <p class="app-subtitle" *ngIf="!isChildAccount()">Familiens levende scrapbog</p>
            <p class="app-subtitle child-subtitle" *ngIf="isChildAccount()">Mine penge</p>
          </div>
          <div class="header-user-area" *ngIf="currentUser">
            <div class="user-welcome" [class.child-welcome]="isChildAccount()">
              <span class="welcome-text">Hej, {{currentUser.firstName}}! 👋</span>
              <div class="user-actions">
                <button (click)="logout()" class="logout-btn">
                  <span>🚪 Log ud</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Navigation Breadcrumbs (hidden for child accounts) -->
      <app-breadcrumb *ngIf="!isChildAccount()"></app-breadcrumb>

      <!-- Main Content Area -->
      <main class="lommepenge-main">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer with family-friendly decorations (simplified for children) -->
      <footer class="lommepenge-footer" *ngIf="currentUser && !isChildAccount()">
        <div class="footer-decoration">
          <span class="footer-emoji">🌈</span>
          <span class="footer-emoji">⭐</span>
          <span class="footer-emoji">🎉</span>
          <span class="footer-emoji">💫</span>
          <span class="footer-emoji">🌟</span>
        </div>
        <div class="footer-content">
          <p class="footer-text">© 2026 Lommepenge App'en - Hvor pengeventure begynder! ✨</p>
        </div>
      </footer>

      <!-- Login Modal -->
      <app-login (loginSuccess)="onLoginSuccess()"></app-login>
    </div>
  `,
  styles: [`
    .lommepenge-app {
      min-height: 100vh;
      background: linear-gradient(135deg, #f8f6f0 0%, #f0efe8 50%, #ede9e0 100%);
      font-family: 'Comic Neue', 'Kalam', cursive, 'Segoe UI', sans-serif;
      position: relative;
    }

    .lommepenge-app::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: 
        radial-gradient(circle at 25% 25%, rgba(255, 215, 0, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 75% 75%, rgba(255, 182, 193, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 50% 50%, rgba(144, 238, 144, 0.1) 0%, transparent 50%);
      pointer-events: none;
      z-index: -1;
    }

    .lommepenge-header {
      background: linear-gradient(145deg, #fff3e0 0%, #ffe4b5 50%, #ffd700 100%);
      border-bottom: 3px solid #d4af37;
      box-shadow: 
        0 4px 12px rgba(139, 69, 19, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.8);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .app-branding {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .app-title {
      margin: 0;
      font-size: 2.2rem;
      font-weight: 800;
      color: #8b4513;
      text-shadow: 2px 2px 4px rgba(139, 69, 19, 0.2);
      font-family: 'Comic Neue', 'Kalam', cursive;
      line-height: 1.2;
    }

    .app-subtitle {
      margin: 0;
      font-size: 1rem;
      color: #654321;
      font-style: italic;
      font-weight: 500;
      opacity: 0.8;
    }

    .header-user-area {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .user-welcome {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: rgba(255, 255, 255, 0.7);
      padding: 0.75rem 1.25rem;
      border-radius: 25px;
      border: 2px solid rgba(139, 69, 19, 0.2);
      box-shadow: 0 2px 6px rgba(139, 69, 19, 0.1);
    }

    .welcome-text {
      font-size: 1.05rem;
      font-weight: 600;
      color: #8b4513;
    }

    .logout-btn {
      padding: 0.5rem 1rem;
      background: linear-gradient(145deg, #ff6b6b, #ee5a52);
      color: white;
      border: 2px solid #c44847;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 2px 4px rgba(196, 72, 71, 0.3);
      font-family: 'Comic Neue', cursive;
    }

    .logout-btn:hover {
      background: linear-gradient(145deg, #ee5a52, #dd4b47);
      transform: translateY(-1px);
      box-shadow: 0 3px 8px rgba(196, 72, 71, 0.4);
    }

    .logout-btn:active {
      transform: translateY(0);
      box-shadow: 0 1px 3px rgba(196, 72, 71, 0.4);
    }

    .lommepenge-main {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1.5rem 2rem 3rem;
      min-height: calc(100vh - 200px);
    }

    .lommepenge-footer {
      margin-top: auto;
      background: linear-gradient(145deg, #fff9e6 0%, #f7f2e0 100%);
      border-top: 2px solid #e8dcc0;
      padding: 1.5rem 2rem;
      position: relative;
    }

    .footer-decoration {
      display: flex;
      justify-content: center;
      gap: 1.5rem;
      margin-bottom: 0.75rem;
    }

    .footer-emoji {
      font-size: 1.5rem;
      animation: gentle-bounce 3s ease-in-out infinite;
    }

    .footer-emoji:nth-child(2) { animation-delay: 0.5s; }
    .footer-emoji:nth-child(3) { animation-delay: 1s; }
    .footer-emoji:nth-child(4) { animation-delay: 1.5s; }
    .footer-emoji:nth-child(5) { animation-delay: 2s; }

    .footer-content {
      text-align: center;
    }

    .footer-text {
      margin: 0;
      color: #8b4513;
      font-size: 0.95rem;
      font-weight: 500;
      font-family: 'Comic Neue', cursive;
    }

    @keyframes gentle-bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-3px); }
    }

    /* Child account theme */
    .child-header-theme {
      background: linear-gradient(145deg, #e8f5e9 0%, #c8e6c9 50%, #a5d6a7 100%);
      border-bottom: 3px solid #66bb6a;
    }

    .child-subtitle {
      font-weight: 700;
      color: #2e7d32;
      font-style: normal;
      opacity: 1;
    }

    .child-welcome {
      background: rgba(255, 255, 255, 0.8);
      border: 2px solid rgba(46, 125, 50, 0.3);
    }

    .child-mode .lommepenge-header .welcome-text {
      color: #2e7d32;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .header-content {
        padding: 1rem 1.5rem;
      }

      .app-title {
        font-size: 1.8rem;
      }

      .app-subtitle {
        font-size: 0.9rem;
      }

      .user-welcome {
        padding: 0.5rem 1rem;
        flex-direction: column;
        gap: 0.5rem;
      }

      .welcome-text {
        font-size: 0.95rem;
      }

      .logout-btn {
        padding: 0.4rem 0.8rem;
        font-size: 0.85rem;
      }

      .lommepenge-main {
        padding: 1rem 1.5rem 2rem;
      }

      .footer-decoration {
        gap: 1rem;
      }

      .footer-emoji {
        font-size: 1.25rem;
      }
    }

    @media (max-width: 480px) {
      .header-content {
        padding: 1rem;
      }

      .app-title {
        font-size: 1.6rem;
      }

      .user-welcome {
        padding: 0.5rem 0.75rem;
      }

      .lommepenge-main {
        padding: 0.75rem 1rem 1.5rem;
      }
    }
  `]
})
export class AppComponent implements OnInit {
  appInfo: AppInfo = {
    name: 'App2 - Task Management Application',
    version: '1.0.0',
    environment: 'production',
    apiUrl: '/api/app2'
  };

  currentUser: UserInfo | null = null;
  sessionState: SessionState | null = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private sessionTracking: SessionTrackingService,
    private errorHandler: ErrorHandlerService,
    private breadcrumbService: BreadcrumbService
  ) {}

  ngOnInit(): void {
    // Load app configuration from environment or API
    this.loadAppInfo();
    
    // Subscribe to authentication state changes
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    
    // Subscribe to session state changes
    this.sessionTracking.sessionState$.subscribe(sessionState => {
      this.sessionState = sessionState;
    });
  }

  async logout(): Promise<void> {
    try {
      await this.authService.logout();
      this.errorHandler.showSuccess('Du er nu logget ud af Lommepenge App\'en.');
    } catch (error) {
      this.errorHandler.handleError(error, {
        userMessage: 'Der opstod en fejl ved logout.'
      });
    }
  }

  onLoginSuccess(): void {
    // User successfully logged in - router will handle navigation
    console.log('Login successful for Task Management App!');
  }

  isChildAccount(): boolean {
    return this.authService.isChildAccount();
  }

  isAdmin(): boolean {
    return this.authService.hasRole('app2', 'admin') || 
           this.authService.hasRole('app2', 'super-admin');
  }

  private loadAppInfo(): void {
    // In a real application, this would come from environment config or API
    const isProduction = window.location.hostname !== 'localhost';
    
    this.appInfo = {
      ...this.appInfo,
      environment: isProduction ? 'production' : 'development',
      apiUrl: '/api/app2' // Always use relative URL - handled by proxy in dev
    };
  }
}
