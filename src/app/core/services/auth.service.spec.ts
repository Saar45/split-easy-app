import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { AuthService } from './auth.service';
import { LoginPayload, LoginResponse, User } from '../models/auth.model';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const loginPayload: LoginPayload = { email: 'jane@example.com', motDePasse: 'secret123' };
  const loginResponse: LoginResponse = {
    token: 'access-token-abc',
    refresh_token: 'refresh-token-xyz',
    refresh_token_expiration: 1893456000,
  };
  const mockUser: User = {
    id: 1,
    email: 'jane@example.com',
    nom: 'Doe',
    prenom: 'Jane',
    roles: ['ROLE_USER'],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login()', () => {
    it('should POST /login and store tokens in memory only', () => {
      expect(service.isAuthenticated).toBeFalse();

      service.login(loginPayload).subscribe((res) => {
        expect(res).toEqual(loginResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(loginPayload);
      req.flush(loginResponse);

      expect(service.token).toBe(loginResponse.token);
      expect(service.refreshToken).toBe(loginResponse.refresh_token);
      expect(service.isAuthenticated).toBeTrue();
    });

    it('should never write the access token or refresh token to localStorage or sessionStorage', () => {
      service.login(loginPayload).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/login`);
      req.flush(loginResponse);

      const localStorageDump = JSON.stringify(localStorage);
      const sessionStorageDump = JSON.stringify(sessionStorage);
      expect(localStorageDump).not.toContain(loginResponse.token);
      expect(localStorageDump).not.toContain(loginResponse.refresh_token);
      expect(sessionStorageDump).not.toContain(loginResponse.token);
      expect(sessionStorageDump).not.toContain(loginResponse.refresh_token);
    });

    it('should emit the new token on token$', (done) => {
      const emitted: (string | null)[] = [];
      service.token$.subscribe((token) => emitted.push(token));

      service.login(loginPayload).subscribe(() => {
        expect(emitted).toEqual([null, loginResponse.token]);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/login`);
      req.flush(loginResponse);
    });
  });

  describe('fetchCurrentUser()', () => {
    it('should GET /me and update user$', () => {
      service.fetchCurrentUser().subscribe((user) => {
        expect(user).toEqual(mockUser);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/me`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);

      service.user$.subscribe((user) => expect(user).toEqual(mockUser));
    });
  });

  describe('refresh()', () => {
    it('should POST /token/refresh with the stored refresh token and update tokens', () => {
      service.login(loginPayload).subscribe();
      httpMock.expectOne(`${environment.apiUrl}/login`).flush(loginResponse);

      const refreshedResponse: LoginResponse = {
        token: 'access-token-refreshed',
        refresh_token: 'refresh-token-refreshed',
        refresh_token_expiration: 1893456999,
      };

      service.refresh().subscribe((res) => {
        expect(res).toEqual(refreshedResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/token/refresh`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ refresh_token: loginResponse.refresh_token });
      req.flush(refreshedResponse);

      expect(service.token).toBe(refreshedResponse.token);
      expect(service.refreshToken).toBe(refreshedResponse.refresh_token);
    });

    it('should error without an HTTP call when no refresh token is stored', (done) => {
      service.refresh().subscribe({
        next: () => fail('should not emit a value'),
        error: (err) => {
          expect(err).toBeTruthy();
          done();
        },
      });

      httpMock.expectNone(`${environment.apiUrl}/token/refresh`);
    });
  });

  describe('logout()', () => {
    it('should clear the token, refresh token and current user', () => {
      service.login(loginPayload).subscribe();
      httpMock.expectOne(`${environment.apiUrl}/login`).flush(loginResponse);

      service.fetchCurrentUser().subscribe();
      httpMock.expectOne(`${environment.apiUrl}/me`).flush(mockUser);

      expect(service.isAuthenticated).toBeTrue();

      service.logout();

      expect(service.token).toBeNull();
      expect(service.refreshToken).toBeNull();
      expect(service.isAuthenticated).toBeFalse();
      service.user$.subscribe((user) => expect(user).toBeNull());
    });
  });

  describe('isAuthenticated', () => {
    it('should reflect the presence of an access token over time', () => {
      const states: boolean[] = [];
      service.token$.subscribe(() => states.push(service.isAuthenticated));

      service.login(loginPayload).subscribe();
      httpMock.expectOne(`${environment.apiUrl}/login`).flush(loginResponse);

      service.logout();

      expect(states).toEqual([false, true, false]);
    });
  });
});
