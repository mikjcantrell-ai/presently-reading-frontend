import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { API_BASE } from '../../core/config/api.config';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-shell">
      <div class="login-card">
        <div class="login-logo">
          <span class="logo-script">Presently</span>
          <span class="logo-serif">Reading</span>
        </div>
        <p class="login-sub">Admin Access</p>

        <form class="login-form" (ngSubmit)="onSubmit()" #f="ngForm">
          <div class="field">
            <label for="username">Username</label>
            <input id="username" type="text" [(ngModel)]="username" name="username"
                   placeholder="admin" autocomplete="username" required />
          </div>
          <div class="field">
            <label for="password">Password</label>
            <input id="password" type="password" [(ngModel)]="password" name="password"
                   placeholder="••••••••" autocomplete="current-password" required />
          </div>

          <div class="error" *ngIf="error">{{ error }}</div>

          <button type="submit" class="login-btn" [disabled]="loading" id="admin-login-btn">
            {{ loading ? 'Verifying…' : 'Sign In' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-shell {
      min-height: 100vh;
      background: var(--cream-dark);
      background-image: radial-gradient(ellipse at 30% 20%, rgba(220,208,192,0.3) 0%, transparent 60%),
                        radial-gradient(ellipse at 80% 80%, rgba(220,208,192,0.2) 0%, transparent 60%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .login-card {
      background: var(--white);
      border: 1px solid var(--taupe);
      border-radius: 8px;
      padding: 52px 48px;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.05);
    }
    .login-logo {
      display: flex;
      align-items: baseline;
      gap: 6px;
      justify-content: center;
      margin-bottom: 6px;
    }
    .logo-script {
      font-family: var(--font-script);
      font-size: 2rem;
      color: var(--accent);
    }
    .logo-serif {
      font-family: var(--font-serif);
      font-size: 1.4rem;
      font-weight: 600;
      color: var(--text-dark);
    }
    .login-sub {
      text-align: center;
      font-family: var(--font-sans);
      font-size: 0.75rem;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: var(--text-mid);
      margin-bottom: 36px;
    }
    .field { margin-bottom: 20px; }
    .field label {
      display: block;
      font-family: var(--font-sans);
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--text-mid);
      margin-bottom: 7px;
    }
    .field input {
      width: 100%;
      padding: 13px 16px;
      background: var(--cream);
      border: 1px solid var(--taupe);
      border-radius: 4px;
      color: var(--text-dark);
      font-family: var(--font-sans);
      font-size: 0.95rem;
      outline: none;
      transition: border-color 0.2s, background 0.2s;
      box-sizing: border-box;
    }
    .field input:focus {
      border-color: var(--accent);
      background: var(--white);
    }
    .error {
      font-family: var(--font-sans);
      font-size: 0.8rem;
      color: #e07070;
      margin-bottom: 16px;
      text-align: center;
    }
    .login-btn {
      width: 100%;
      padding: 14px;
      background: var(--accent);
      border: none;
      border-radius: 4px;
      color: var(--white);
      font-family: var(--font-sans);
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      cursor: pointer;
      transition: background 0.2s, transform 0.2s;
      margin-top: 8px;
    }
    .login-btn:hover:not(:disabled) { background: var(--accent-dark); transform: translateY(-1px); }
    .login-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  `]
})
export class AdminLoginComponent {
  username = '';
  password = '';
  loading  = false;
  error    = '';

  constructor(
    private router: Router, 
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  onSubmit(): void {
    if (!this.username || !this.password) return;
    this.loading = true;
    this.error   = '';

    // Verify credentials against the backend by hitting a protected endpoint
    const creds   = btoa(`${this.username}:${this.password}`);
    const headers = new HttpHeaders({ Authorization: `Basic ${creds}` });

    this.http.get(`${API_BASE}/api/books`, { headers }).subscribe({
      next: () => {
        if (isPlatformBrowser(this.platformId)) {
          sessionStorage.setItem('md_admin_creds', creds);
        }
        this.router.navigate(['/admin']);
      },
      error: () => {
        this.loading = false;
        this.error   = 'Invalid username or password.';
      }
    });
  }
}
