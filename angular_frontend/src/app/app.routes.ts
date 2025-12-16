import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { TwoFaComponent } from './features/auth/twofa/twofa.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginComponent, title: 'Sign in' },
  { path: '2fa', component: TwoFaComponent, title: 'Two-Factor Verification' },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard], title: 'Dashboard' },
  { path: '**', redirectTo: 'login' }
];
