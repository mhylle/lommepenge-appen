import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

export interface BreadcrumbItem {
  label: string;
  url: string;
  icon?: string;
  isActive?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {
  private breadcrumbsSubject = new BehaviorSubject<BreadcrumbItem[]>([]);
  public breadcrumbs$: Observable<BreadcrumbItem[]> = this.breadcrumbsSubject.asObservable();

  constructor(private router: Router) {
    // Listen to router events to automatically update breadcrumbs
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateBreadcrumbsFromRoute();
      });
  }

  setBreadcrumbs(breadcrumbs: BreadcrumbItem[]): void {
    this.breadcrumbsSubject.next(breadcrumbs);
  }

  addBreadcrumb(breadcrumb: BreadcrumbItem): void {
    const current = this.breadcrumbsSubject.value;
    this.breadcrumbsSubject.next([...current, breadcrumb]);
  }

  clearBreadcrumbs(): void {
    this.breadcrumbsSubject.next([]);
  }

  private updateBreadcrumbsFromRoute(): void {
    const url = this.router.url;
    const breadcrumbs: BreadcrumbItem[] = [];

    // Home/Dashboard breadcrumb
    breadcrumbs.push({
      label: '🏠 Familiens Dagbog',
      url: '/dashboard',
      icon: '🏠',
      isActive: url === '/dashboard'
    });

    // Child dashboard breadcrumb
    if (url.includes('/child/')) {
      const childId = this.extractChildIdFromUrl(url);
      breadcrumbs.push({
        label: `👶 Barnets Dashboard`,
        url: url,
        icon: '👶',
        isActive: true
      });
    }

    // Task breadcrumb (legacy)
    if (url.includes('/tasks')) {
      breadcrumbs.push({
        label: '📋 Opgaver',
        url: '/tasks',
        icon: '📋',
        isActive: true
      });
    }

    // Profile breadcrumb
    if (url.includes('/profile')) {
      breadcrumbs.push({
        label: '👤 Profil',
        url: '/profile',
        icon: '👤',
        isActive: true
      });
    }

    // Admin breadcrumb
    if (url.includes('/admin')) {
      breadcrumbs.push({
        label: '⚙️ Administration',
        url: '/admin',
        icon: '⚙️',
        isActive: true
      });
    }

    this.setBreadcrumbs(breadcrumbs);
  }

  private extractChildIdFromUrl(url: string): string {
    const matches = url.match(/\/child\/([^\/]+)/);
    return matches ? matches[1] : '';
  }

  // Helper method to navigate with breadcrumb context
  navigateWithContext(url: string, childName?: string): void {
    this.router.navigate([url]);
    
    if (url.includes('/child/') && childName) {
      // Update breadcrumb with child's name after navigation
      setTimeout(() => {
        const breadcrumbs = this.breadcrumbsSubject.value;
        const childBreadcrumb = breadcrumbs.find(b => b.url.includes('/child/'));
        if (childBreadcrumb) {
          childBreadcrumb.label = `👶 ${childName}'s Penge`;
          this.setBreadcrumbs([...breadcrumbs]);
        }
      }, 100);
    }
  }
}