import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService, UserInfo } from './services/auth.service';
import { LoginComponent } from './components/login/login.component';

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
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, HttpClientModule, LoginComponent],
  template: `
    <div class="app-container">
      <header class="app-header">
        <h1>{{ appInfo.name }}</h1>
        <div class="app-info">
          <span class="version">v{{ appInfo.version }}</span>
          <span class="environment" [class]="appInfo.environment">{{ appInfo.environment }}</span>
          <div class="user-info" *ngIf="currentUser">
            <span>Welcome, {{ currentUser.firstName }}!</span>
            <button (click)="logout()" class="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      <nav class="app-nav">
        <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
        <a routerLink="/tasks" routerLinkActive="active">Tasks</a>
        <a routerLink="/tasks/new" routerLinkActive="active">New Task</a>
        <a href="/api/app2/health" target="_blank">API Health</a>
      </nav>

      <main class="app-main">
        <router-outlet></router-outlet>
      </main>

      <footer class="app-footer">
        <div class="footer-content">
          <p>&copy; 2025 mhylle.com - Infrastructure Demo Application</p>
          <div class="footer-links">
            <a href="https://github.com/mhylle" target="_blank">GitHub</a>
            <a href="/api/app2/health" target="_blank">API Health</a>
          </div>
        </div>
      </footer>
      
      <app-login (loginSuccess)="onLoginSuccess()"></app-login>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .app-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .app-header h1 {
      margin: 0;
      font-size: 2rem;
      font-weight: 300;
    }

    .app-info {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .logout-btn {
      padding: 0.25rem 0.75rem;
      background: rgba(255,255,255,0.2);
      color: white;
      border: 1px solid rgba(255,255,255,0.3);
      border-radius: 0.25rem;
      font-size: 0.875rem;
      cursor: pointer;
      transition: background 0.3s ease;
    }

    .logout-btn:hover {
      background: rgba(255,255,255,0.3);
    }

    .version {
      background: rgba(255,255,255,0.2);
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.875rem;
    }

    .environment {
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .environment.production {
      background: #28a745;
      color: white;
    }

    .environment.development {
      background: #ffc107;
      color: #212529;
    }

    .app-nav {
      background: #f8f9fa;
      padding: 0 2rem;
      border-bottom: 1px solid #dee2e6;
      display: flex;
      gap: 2rem;
    }

    .app-nav a {
      padding: 1rem 0;
      text-decoration: none;
      color: #495057;
      font-weight: 500;
      border-bottom: 3px solid transparent;
      transition: all 0.3s ease;
    }

    .app-nav a:hover {
      color: #667eea;
      border-bottom-color: rgba(102, 126, 234, 0.3);
    }

    .app-nav a.active {
      color: #667eea;
      border-bottom-color: #667eea;
    }

    .app-main {
      flex: 1;
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
      box-sizing: border-box;
    }

    .app-footer {
      background: #343a40;
      color: white;
      padding: 2rem;
      margin-top: auto;
    }

    .footer-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .footer-links {
      display: flex;
      gap: 1rem;
    }

    .footer-links a {
      color: #adb5bd;
      text-decoration: none;
      transition: color 0.3s ease;
    }

    .footer-links a:hover {
      color: white;
    }

    @media (max-width: 768px) {
      .app-header {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .app-nav {
        flex-wrap: wrap;
        gap: 1rem;
      }

      .app-main {
        padding: 1rem;
      }

      .footer-content {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
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

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Load app configuration from environment or API
    this.loadAppInfo();
    
    // Subscribe to authentication state changes
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  async logout(): Promise<void> {
    await this.authService.logout();
  }

  onLoginSuccess(): void {
    // User successfully logged in - router will handle navigation
    console.log('Login successful for Task Management App!');
  }

  private loadAppInfo(): void {
    // In a real application, this would come from environment config or API
    const isProduction = window.location.hostname !== 'localhost';
    
    this.appInfo = {
      ...this.appInfo,
      environment: isProduction ? 'production' : 'development',
      apiUrl: isProduction ? '/api/app2' : 'http://localhost:3001'
    };
  }
}
