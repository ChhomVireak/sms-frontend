import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-[#0b0f19] flex items-center justify-center p-4 relative overflow-hidden">
      <!-- Background Ambient Glow -->
      <div class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div class="max-w-md w-full bg-[#111827] border border-[#1f2937] rounded-2xl p-8 shadow-2xl relative z-10">
        <!-- Logo & Header -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white text-lg shadow-lg shadow-emerald-500/20">
              <i class="fa-solid fa-graduation-cap"></i>
            </div>
            <div>
              <h1 class="font-bold text-white text-lg leading-none">EduTrack SMS</h1>
              <p class="text-[10px] text-gray-400 font-semibold tracking-wider uppercase mt-1">SCHOOL MANAGEMENT SYSTEM</p>
            </div>
          </div>
          <span class="text-xs bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-mono">v2.0</span>
        </div>

        <div class="mb-6">
          <h2 class="text-2xl font-bold text-white tracking-tight">Welcome back</h2>
          <p class="text-xs text-gray-400 mt-1">Sign in to your account to continue</p>
        </div>

        <!-- System Quick Login Rules Banner -->
        <div class="mb-5 p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-xs text-emerald-300 space-y-1.5 shadow-inner">
          <div class="font-bold flex items-center gap-1.5 text-emerald-400">
            <i class="fa-solid fa-shield-halved"></i> Login Credentials Guide:
          </div>
          <div class="text-[11px] text-gray-300 leading-relaxed space-y-1 pt-1">
            <div>• <strong>Admin Login</strong>: Email (<code class="bg-emerald-900/60 px-1 py-0.5 rounded font-mono text-emerald-200">admin&#64;school.edu</code>) &amp; password (<code class="bg-emerald-900/60 px-1 py-0.5 rounded font-mono text-emerald-200">admin123</code>)</div>
            <div>• <strong>Teacher Login</strong>: Email &amp; Email Prefix password (e.g. <code class="bg-emerald-900/60 px-1 py-0.5 rounded font-mono text-emerald-200">teacher123&#64;gmail.com</code> ➔ <code class="bg-emerald-900/60 px-1 py-0.5 rounded font-mono text-emerald-200">teacher123</code>)</div>
            <div>• <strong>Student Login</strong>: Student ID (<code class="bg-emerald-900/60 px-1 py-0.5 rounded font-mono text-emerald-200">SV34-2026-0001</code>) &amp; DOB password (<code class="bg-emerald-900/60 px-1 py-0.5 rounded font-mono text-emerald-200">08022000</code>)</div>
          </div>
        </div>

        <!-- Form -->
        <form (ngSubmit)="onLogin()" class="space-y-5">
          <div>
            <label class="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">USERNAME / EMAIL / STUDENT ID</label>
            <div class="relative">
              <input type="text" 
                     [(ngModel)]="username" 
                     (input)="onInputChange()"
                     name="username" 
                     required
                     placeholder="USERNAME / EMAIL / STUDENT ID" 
                     [ngClass]="hasError ? 'border-2 border-rose-500 bg-rose-950/30 text-rose-100 ring-2 ring-rose-500/20 focus:border-rose-400' : 'border border-[#1f2937] focus:border-emerald-500 bg-[#1e293b]/70 text-white'"
                     class="w-full rounded-xl px-4 py-3 text-sm placeholder-gray-500 focus:outline-none transition-all pr-10">
              <i [class.text-rose-400]="hasError" [class.text-gray-400]="!hasError" class="fa-regular fa-user absolute right-3.5 top-1/2 -translate-y-1/2"></i>
            </div>
            <p *ngIf="hasError" class="text-xs text-rose-400 font-bold mt-1.5 flex items-center gap-1.5 animate-pulse">
              <i class="fa-solid fa-circle-exclamation text-rose-400"></i> {{ genericErrorMessage }}
            </p>
          </div>

          <div>
            <label class="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">PASSWORD</label>
            <div class="relative">
              <input type="password" 
                     [(ngModel)]="password" 
                     (input)="onInputChange()"
                     name="password" 
                     required
                     placeholder="••••••••••••" 
                     [ngClass]="hasError ? 'border-2 border-rose-500 bg-rose-950/30 text-rose-100 ring-2 ring-rose-500/20 focus:border-rose-400' : 'border border-[#1f2937] focus:border-emerald-500 bg-[#1e293b]/70 text-white'"
                     class="w-full rounded-xl px-4 py-3 text-sm placeholder-gray-500 focus:outline-none transition-all pr-10">
              <i [class.text-rose-400]="hasError" [class.text-gray-400]="!hasError" class="fa-solid fa-lock absolute right-3.5 top-1/2 -translate-y-1/2"></i>
            </div>
            <p *ngIf="hasError" class="text-xs text-rose-400 font-bold mt-1.5 flex items-center gap-1.5 animate-pulse">
              <i class="fa-solid fa-circle-exclamation text-rose-400"></i> {{ genericErrorMessage }}
            </p>
          </div>

          <div class="flex items-center justify-between text-xs">
            <label class="flex items-center gap-2 text-gray-400 cursor-pointer">
              <input type="checkbox" [(ngModel)]="rememberMe" name="rememberMe" class="rounded bg-gray-800 border-gray-700 text-emerald-500 focus:ring-0">
              <span>Remember me</span>
            </label>
            <a href="javascript:void(0)" class="text-emerald-400 hover:underline">Forgot password?</a>
          </div>

          <button type="submit" 
                  [disabled]="loading"
                  class="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-500/25 transition-all text-sm flex items-center justify-center gap-2">
            <i *ngIf="loading" class="fa-solid fa-spinner fa-spin"></i>
            <span>{{ loading ? 'Signing in...' : 'Sign In' }}</span>
          </button>
        </form>

        <!-- Quick Demo Account Switcher -->
        <div class="mt-8 pt-6 border-t border-[#1f2937]/80">
          <div class="text-[11px] font-bold text-gray-500 text-center uppercase tracking-widest mb-3">SIGN IN AS</div>
          
          <p class="text-[11px] text-gray-500 text-center mt-4">
            Need access? <a href="javascript:void(0)" class="text-emerald-400">Contact Administrator</a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  username = '';
  password = '';
  rememberMe = true;
  loading = false;

  hasError: boolean = false;
  genericErrorMessage: string = 'Invalid Username/Email/ID or Password';

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) { }

  onInputChange(): void {
    this.hasError = false;
  }

  quickLogin(user: string, pass: string): void {
    this.username = user;
    this.password = pass;
    this.hasError = false;
    this.onLogin();
  }

  validateInputs(): boolean {
    let isValid = true;
    const cleanUsername = (this.username || '').trim();
    const cleanPassword = (this.password || '').trim();

    if (!cleanUsername || !cleanPassword || cleanPassword.length < 3) {
      this.hasError = true;
      isValid = false;
    } else if (cleanUsername.includes('@')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanUsername)) {
        this.hasError = true;
        isValid = false;
      }
    }

    return isValid;
  }

  onLogin(): void {
    this.hasError = false;

    if (!this.validateInputs()) {
      this.toastService.error('Invalid Username/Email/ID or Password');
      return;
    }

    const cleanUsername = (this.username || '').trim();
    const cleanPassword = (this.password || '').trim();

    this.loading = true;
    this.authService.login({ username: cleanUsername, password: cleanPassword }).subscribe({
      next: (res) => {
        this.loading = false;
        this.toastService.success('Welcome back, ' + (res.data?.user?.fullName || res.data?.user?.username || 'User'));
        const role = res.data?.user?.role;
        if (role === 'TEACHER') {
          this.router.navigate(['/teacher/dashboard'], { replaceUrl: true });
        } else if (role === 'STUDENT') {
          this.router.navigate(['/student/dashboard'], { replaceUrl: true });
        } else {
          this.router.navigate(['/admin/dashboard'], { replaceUrl: true });
        }
      },
      error: (err) => {
        this.loading = false;
        this.hasError = true;
        this.toastService.error(err.error?.message || 'Invalid Username/Email/ID or Password');
      }
    });
  }
}
