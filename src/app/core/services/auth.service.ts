import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

type LoginResponse = {
  access_token: string;
  token_type: string;
  user_id: string;
  email: string;
};

type RegisterResponse = {
  user_id: string;
  email: string;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private readonly base = environment.apiUrl;
  private readonly TOKEN_KEY = 'access_token';

  /**
   * POST /auth/login
   * Stores JWT in localStorage on success and returns the full payload.
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const res = await lastValueFrom(
      this.http.post<LoginResponse>(`${this.base}/auth/login`, { email, password })
    );
    localStorage.setItem(this.TOKEN_KEY, res.access_token);
    return res;
  }

  /**
   * POST /auth/register
   * Returns the created user's id & email.
   */
  async register(email: string, password: string): Promise<RegisterResponse> {
    return lastValueFrom(
      this.http.post<RegisterResponse>(`${this.base}/auth/register`, { email, password })
    );
  }

  /** Remove JWT and any cached auth state. */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  /** True if a token is present (basic check). */
  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  /** Convenience getter for the stored JWT. */
  get token(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
}
