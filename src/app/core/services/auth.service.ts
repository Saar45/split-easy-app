import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { LoginPayload, LoginResponse, RegisterPayload, User } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  // Token stocké en mémoire RAM (jamais localStorage) — brief §8 défense XSS.
  private readonly accessToken$ = new BehaviorSubject<string | null>(null);
  private readonly currentUser$ = new BehaviorSubject<User | null>(null);

  readonly token$ = this.accessToken$.asObservable();
  readonly user$ = this.currentUser$.asObservable();

  get token(): string | null {
    return this.accessToken$.value;
  }

  get isAuthenticated(): boolean {
    return this.accessToken$.value !== null;
  }

  login(payload: LoginPayload): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/login`, payload).pipe(
      tap((res) => this.accessToken$.next(res.token)),
    );
  }

  register(payload: RegisterPayload): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/register`, payload);
  }

  fetchCurrentUser(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/me`).pipe(
      tap((user) => this.currentUser$.next(user)),
    );
  }

  logout(): void {
    this.accessToken$.next(null);
    this.currentUser$.next(null);
  }
}
