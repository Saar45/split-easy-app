import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { jwtInterceptor } from './jwt.interceptor';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

describe('jwtInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let authServiceStub: { token: string | null };

  beforeEach(() => {
    authServiceStub = { token: null };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([jwtInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceStub },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should add the Authorization header for API requests when a token is present', () => {
    authServiceStub.token = 'access-token-abc';

    httpClient.get(`${environment.apiUrl}/me`).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/me`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer access-token-abc');
    req.flush({});
  });

  it('should let an error response pass through unchanged when there is no token', (done) => {
    authServiceStub.token = null;

    httpClient.get(`${environment.apiUrl}/me`).subscribe({
      next: () => fail('should not emit a value'),
      error: (err) => {
        expect(err.status).toBe(500);
        done();
      },
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/me`);
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush('server error', { status: 500, statusText: 'Internal Server Error' });
  });
});
