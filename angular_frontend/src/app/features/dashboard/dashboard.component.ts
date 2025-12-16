import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * DashboardComponent is a placeholder guarded route after successful 2FA.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div style="padding:24px;">
    <h2 style="margin-bottom:8px;">Dashboard</h2>
    <p>You're signed in with 2FA. This is a protected route.</p>
  </div>
  `
})
export class DashboardComponent {}
