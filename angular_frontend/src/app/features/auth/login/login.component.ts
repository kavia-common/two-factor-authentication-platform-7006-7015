import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

/**
 * LoginComponent renders email/password form and initiates 2FA flow if required.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private router = inject(Router);

  hide = signal(true);
  loading = signal(false);
  error = signal<string | null>(null);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  // PUBLIC_INTERFACE
  submit() {
    /** Submits the login form; handles 2FA branching. */
    this.error.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    const { email, password } = this.form.getRawValue();
    this.api.login({ email: email!, password: password! }).subscribe({
      next: (res) => {
        if (res.requires2fa && res.tempToken) {
          this.auth.setTempToken(res.tempToken);
          this.router.navigateByUrl('/2fa');
        } else if (res.token) {
          this.auth.setToken(res.token);
          this.router.navigateByUrl('/dashboard');
        } else {
          this.error.set(res.message || 'Unexpected response from server.');
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Login failed. Check your credentials.');
        this.loading.set(false);
      }
    });
  }
}
