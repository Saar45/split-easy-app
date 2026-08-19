import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable, of, throwError } from 'rxjs';

import { refreshTokenInterceptor } from './refresh-token.interceptor';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

describe('refreshTokenInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let router: Router;
  let authServiceStub: {
    token: string | null;
    refreshToken: string | null;
    refresh: jasmine.Spy<() => Observable<unknown>>;
    logout: jasmine.Spy<() => void>;
  };

  beforeEach(() => {
    authServiceStub = {
      token: 'expired-token',
      refreshToken: 'stored-refresh-token',
      refresh: jasmine.createSpy('refresh'),
      logout: jasmine.createSpy('logout'),
    };

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        provideHttpClient(withInterceptors([refreshTokenInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceStub },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should refresh the token on a 401 and retry the request with the new token', (done) => {
    authServiceStub.refresh.and.callFake(() => {
      authServiceStub.token = 'fresh-token';
      return of({ token: 'fresh-token', refresh_token: 'fresh-refresh', refresh_token_expiration: 0 });
    });

    httpClient.get(`${environment.apiUrl}/groups`).subscribe((res) => {
      expect(res).toEqual({ ok: true });
      expect(authServiceStub.refresh).toHaveBeenCalledTimes(1);
      done();
    });

    const firstReq = httpMock.expectOne(`${environment.apiUrl}/groups`);
    firstReq.flush('unauthorized', { status: 401, statusText: 'Unauthorized' });

    const retriedReq = httpMock.expectOne(`${environment.apiUrl}/groups`);
    expect(retriedReq.request.headers.get('Authorization')).toBe('Bearer fresh-token');
    retriedReq.flush({ ok: true });
  });

  it('should log out and redirect to login when the refresh call itself fails', (done) => {
    authServiceStub.refresh.and.returnValue(throwError(() => new Error('refresh expired')));

    httpClient.get(`${environment.apiUrl}/groups`).subscribe({
      next: () => fail('should not emit a value'),
      error: (err) => {
        expect(err).toBeTruthy();
        expect(authServiceStub.logout).toHaveBeenCalledTimes(1);
        expect(router.navigate).toHaveBeenCalledWith(['/auth/login'], { replaceUrl: true });
        done();
      },
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/groups`);
    req.flush('unauthorized', { status: 401, statusText: 'Unauthorized' });
  });
});
