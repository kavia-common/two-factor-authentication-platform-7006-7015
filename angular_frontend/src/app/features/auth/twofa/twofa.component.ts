import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

/**
 * TwoFaComponent verifies TOTP/2FA code using a temporary token from login.
 */
@Component({
  selector: 'app-twofa',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './twofa.component.html',
  styleUrls: ['./twofa.component.css']
})
export class TwoFaComponent {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);
  tempToken = computed(() => this.auth.tempToken);

  form = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(8)]]
  });

  ngOnInit() {
    // If no temp token, redirect back to login.
    if (!this.tempToken()) {
      this.router.navigateByUrl('/login');
    }
  }

  // PUBLIC_INTERFACE
  submit() {
    /** Submits 2FA code for verification. */
    this.error.set(null);
    if (this.form.invalid || !this.tempToken()) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    const { code } = this.form.getRawValue();
    this.api.verify2fa({ code: code!, tempToken: this.tempToken()! }).subscribe({
      next: (res) => {
        if (res.token) {
          this.auth.setToken(res.token);
          this.router.navigateByUrl('/dashboard');
        } else {
          this.error.set(res.message || 'Verification failed.');
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Invalid or expired code.');
        this.loading.set(false);
      }
    });
  }
}
