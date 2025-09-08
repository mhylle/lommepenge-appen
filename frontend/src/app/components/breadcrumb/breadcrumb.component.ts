import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { BreadcrumbService, BreadcrumbItem } from '../../services/breadcrumb.service';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="lommepenge-breadcrumb" *ngIf="breadcrumbs.length > 0">
      <ol class="breadcrumb-list">
        <li *ngFor="let breadcrumb of breadcrumbs; let last = last" 
            class="breadcrumb-item"
            [class.active]="breadcrumb.isActive">
          
          <!-- Clickable breadcrumb -->
          <a *ngIf="!breadcrumb.isActive" 
             [routerLink]="breadcrumb.url" 
             class="breadcrumb-link">
            <span class="breadcrumb-icon" *ngIf="breadcrumb.icon">{{ breadcrumb.icon }}</span>
            <span class="breadcrumb-label">{{ breadcrumb.label }}</span>
          </a>
          
          <!-- Active breadcrumb (not clickable) -->
          <span *ngIf="breadcrumb.isActive" class="breadcrumb-current">
            <span class="breadcrumb-icon" *ngIf="breadcrumb.icon">{{ breadcrumb.icon }}</span>
            <span class="breadcrumb-label">{{ breadcrumb.label }}</span>
          </span>
          
          <!-- Arrow separator (except for last item) -->
          <span *ngIf="!last" class="breadcrumb-separator">→</span>
        </li>
      </ol>
    </nav>
  `,
  styles: [`
    .lommepenge-breadcrumb {
      background: linear-gradient(145deg, #fff9e6 0%, #f7f2e0 100%);
      border: 2px solid #e8dcc0;
      border-radius: 12px;
      padding: 0.75rem 1.25rem;
      margin-bottom: 1.5rem;
      box-shadow: 
        0 2px 8px rgba(139, 69, 19, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.8);
      position: relative;
    }

    .lommepenge-breadcrumb::before {
      content: '';
      position: absolute;
      top: -3px;
      left: 20px;
      width: 20px;
      height: 8px;
      background: linear-gradient(45deg, transparent 30%, #ffd700 30%, #ffd700 70%, transparent 70%);
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      border-radius: 2px;
    }

    .breadcrumb-list {
      display: flex;
      align-items: center;
      list-style: none;
      margin: 0;
      padding: 0;
      font-family: 'Comic Neue', 'Kalam', cursive;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .breadcrumb-item {
      display: flex;
      align-items: center;
      font-size: 0.95rem;
      line-height: 1.4;
    }

    .breadcrumb-link {
      display: flex;
      align-items: center;
      text-decoration: none;
      color: #8b4513;
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
      transition: all 0.3s ease;
      cursor: pointer;
      font-weight: 500;
    }

    .breadcrumb-link:hover {
      background: rgba(139, 69, 19, 0.1);
      color: #654321;
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(139, 69, 19, 0.2);
    }

    .breadcrumb-current {
      display: flex;
      align-items: center;
      color: #2d5016;
      font-weight: 600;
      padding: 0.25rem 0.5rem;
      background: rgba(45, 80, 22, 0.1);
      border-radius: 6px;
      border: 1px solid rgba(45, 80, 22, 0.2);
    }

    .breadcrumb-icon {
      margin-right: 0.4rem;
      font-size: 1.1em;
    }

    .breadcrumb-label {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 150px;
    }

    .breadcrumb-separator {
      color: #b8860b;
      font-size: 1.1rem;
      font-weight: bold;
      margin: 0 0.5rem;
      opacity: 0.7;
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .lommepenge-breadcrumb {
        padding: 0.5rem 1rem;
        margin-bottom: 1rem;
      }

      .breadcrumb-list {
        font-size: 0.85rem;
      }

      .breadcrumb-label {
        max-width: 120px;
      }

      .breadcrumb-separator {
        margin: 0 0.3rem;
      }
    }

    @media (max-width: 480px) {
      .breadcrumb-label {
        max-width: 80px;
      }

      .breadcrumb-list {
        gap: 0.25rem;
      }
    }
  `]
})
export class BreadcrumbComponent implements OnInit, OnDestroy {
  breadcrumbs: BreadcrumbItem[] = [];
  private subscription?: Subscription;

  constructor(private breadcrumbService: BreadcrumbService) {}

  ngOnInit(): void {
    this.subscription = this.breadcrumbService.breadcrumbs$.subscribe(
      breadcrumbs => {
        this.breadcrumbs = breadcrumbs;
      }
    );
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}