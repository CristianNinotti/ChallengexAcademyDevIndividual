import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../environments/environment';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  access_token: string;
  user: AuthUser;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly TOKEN_KEY = 'fifa_token';
  private readonly USER_KEY  = 'fifa_user';

  private _user$ = new BehaviorSubject<AuthUser | null>(this.storedUser());

  get user$(): Observable<AuthUser | null> { return this._user$.asObservable(); }
  get currentUser(): AuthUser | null       { return this._user$.getValue(); }
  get isLoggedIn(): boolean                { return !!this.getToken(); }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, { email, password }).pipe(
      tap(res => {
        localStorage.setItem(this.TOKEN_KEY, res.access_token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
        this._user$.next(res.user);
      }),
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._user$.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private storedUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(this.USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }
}
