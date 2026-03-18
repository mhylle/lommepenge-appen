import { NgModule, isDevMode, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ServiceWorkerModule } from '@angular/service-worker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule, provideHttpClient, withInterceptors } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeDa from '@angular/common/locales/da';
import { authInterceptor } from './interceptors/auth.interceptor';

registerLocaleData(localeDa);

// Angular Material Modules
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ChildDashboardComponent } from './components/child-dashboard/child-dashboard.component';
import { LoginComponent } from './components/login/login.component';
import { AccessDeniedComponent } from './components/access-denied/access-denied.component';
import { ChildRegistrationModalComponent } from './components/child-registration-modal/child-registration-modal.component';
import { DeductionModalComponent } from './components/deduction-modal/deduction-modal.component';
import { TransactionHistoryModalComponent } from './components/transaction-history-modal/transaction-history-modal.component';
import { AddMoneyModalComponent } from './components/add-money-modal/add-money-modal.component';
import { RewardModalComponent } from './components/reward-modal/reward-modal.component';
import { ChildCredentialsModalComponent } from './components/child-credentials-modal/child-credentials-modal.component';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { ConfettiComponent } from './components/confetti/confetti.component';
import { AnimatedCounterDirective } from './directives/animated-counter.directive';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    ChildDashboardComponent,
    LoginComponent,
    AccessDeniedComponent,
    TransactionHistoryModalComponent,
    AddMoneyModalComponent,
    RewardModalComponent,
    ChildCredentialsModalComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FormsModule,
    ChildRegistrationModalComponent,
    DeductionModalComponent,
    BreadcrumbComponent,
    ConfettiComponent,
    AnimatedCounterDirective,
    
    // Angular Material Modules
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: LOCALE_ID, useValue: 'da' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
