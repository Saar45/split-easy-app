import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { LoginPayload, LoginResponse, RegisterPayload, User } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  // Tokens stockés en mémoire RAM (jamais localStorage), brief §8 défense XSS.
  private readonly accessToken$ = new BehaviorSubject<string | null>(null);
  private readonly refreshTokenSubject = new BehaviorSubject<string | null>(null);
  private readonly currentUser$ = new BehaviorSubject<User | null>(null);

  readonly token$ = this.accessToken$.asObservable();
  readonly user$ = this.currentUser$.asObservable();

  get token(): string | null {
    return this.accessToken$.value;
  }

  get refreshToken(): string | null {
    return this.refreshTokenSubject.value;
  }

  get isAuthenticated(): boolean {
    return this.accessToken$.value !== null;
  }

  login(payload: LoginPayload): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/login`, payload).pipe(
      tap((res) => this.storeTokens(res)),
    );
  }

  register(payload: RegisterPayload): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/register`, payload);
  }

  refresh(): Observable<LoginResponse> {
    const refreshToken = this.refreshTokenSubject.value;
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token'));
    }
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/token/refresh`, { refresh_token: refreshToken })
      .pipe(tap((res) => this.storeTokens(res)));
  }

  fetchCurrentUser(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/me`).pipe(
      tap((user) => this.currentUser$.next(user)),
    );
  }

  logout(): void {
    this.accessToken$.next(null);
    this.refreshTokenSubject.next(null);
    this.currentUser$.next(null);
  }

  private storeTokens(res: LoginResponse): void {
    this.accessToken$.next(res.token);
    this.refreshTokenSubject.next(res.refresh_token);
  }
}
