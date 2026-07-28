import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';
import { User, AuthResponse } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  
  // Angular Signal for global authentication state
  currentUser = signal<User | null>(this.getStoredUser());
  token = signal<string | null>(localStorage.getItem('accessToken'));

  isAuthenticated = computed(() => !!this.currentUser() && !!this.token());
  userRole = computed(() => this.currentUser()?.role || null);

  constructor(private http: HttpClient, private router: Router) {
    const storedToken = localStorage.getItem('accessToken');
    const storedUser = this.getStoredUser();

    if (storedToken) {
      this.token.set(storedToken);
      if (storedUser) {
        this.currentUser.set(storedUser);
      }
      // Refresh current user profile immediately
      this.fetchCurrentUser().subscribe();
    }
  }

  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post<{ success: boolean; message: string; data: AuthResponse }>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(res => {
          if (res.success && res.data) {
            this.setSession(res.data);
          }
        })
      );
  }

  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.token.set(null);
    this.router.navigate(['/auth/login']);
  }

  fetchCurrentUser(): Observable<any> {
    return this.http.get<{ success: boolean; data: { user: User } }>(`${this.apiUrl}/me`)
      .pipe(
        tap(res => {
          if (res.success && res.data?.user) {
            this.currentUser.set(res.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.user));
          }
        }),
        catchError(err => {
          if (err.status === 401) {
            this.logout();
          }
          return of(null);
        })
      );
  }

  private setSession(authResult: AuthResponse): void {
    localStorage.setItem('accessToken', authResult.accessToken);
    localStorage.setItem('refreshToken', authResult.refreshToken);
    localStorage.setItem('user', JSON.stringify(authResult.user));
    this.token.set(authResult.accessToken);
    this.currentUser.set(authResult.user);
    // Refresh user profile & image immediately upon login
    this.fetchCurrentUser().subscribe();
  }

  private getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }
}
