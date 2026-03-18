import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ChildDashboardComponent } from './components/child-dashboard/child-dashboard.component';
import { AccessDeniedComponent } from './components/access-denied/access-denied.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { AdminGuard } from './guards/admin.guard';
import { ChildGuard } from './guards/child.guard';
import { ParentGuard } from './guards/parent.guard';
import { ChildAccountGuard } from './guards/child-account.guard';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard, ParentGuard],
    data: { 
      title: 'Dashboard - Lommepenge App\'en',
      description: 'Oversigt over dine lommepenge opgaver'
    }
  },
  {
    path: 'child/:childId',
    component: ChildDashboardComponent,
    canActivate: [AuthGuard, ChildAccountGuard],
    data: { 
      title: 'Børne Dashboard - Lommepenge App\'en',
      description: 'Barnets personlige lommepenge dashboard'
    }
  },
  { 
    path: 'access-denied', 
    component: AccessDeniedComponent,
    data: { 
      title: 'Adgang Nægtet - Lommepenge App\'en',
      description: 'Du har ikke tilladelse til at få adgang til denne ressource'
    }
  },
  // Example routes demonstrating different guard levels
  {
    path: 'tasks',
    component: DashboardComponent, // Using dashboard as placeholder
    canActivate: [AuthGuard],
    data: { 
      title: 'Opgaver - Lommepenge App\'en',
      description: 'Administrer dine lommepenge opgaver'
    }
  },
  {
    path: 'profile',
    component: DashboardComponent, // Using dashboard as placeholder  
    canActivate: [AuthGuard, RoleGuard],
    data: { 
      roles: ['user', 'admin'],
      appId: 'app2',
      title: 'Profil - Lommepenge App\'en',
      description: 'Din brugerprofil og indstillinger'
    }
  },
  {
    path: 'admin',
    component: DashboardComponent, // Using dashboard as placeholder
    canActivate: [AuthGuard, AdminGuard],
    data: { 
      title: 'Administration - Lommepenge App\'en',
      description: 'Administrative funktioner (kun for administratorer)'
    }
  },
  { path: '**', redirectTo: '/dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { 
    useHash: false,
    enableTracing: false 
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
