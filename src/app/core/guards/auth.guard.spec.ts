import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  let authServiceStub: { isAuthenticated: boolean };
  let router: Router;

  const runGuard = () =>
    TestBed.runInInjectionContext(() =>
      authGuard(undefined as never, undefined as never),
    );

  beforeEach(() => {
    authServiceStub = { isAuthenticated: false };

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [{ provide: AuthService, useValue: authServiceStub }],
    });

    router = TestBed.inject(Router);
  });

  it('should return true when the user is authenticated', () => {
    authServiceStub.isAuthenticated = true;

    const result = runGuard();

    expect(result).toBeTrue();
  });

  it('should return a UrlTree redirecting to /auth/login when the user is not authenticated', () => {
    authServiceStub.isAuthenticated = false;

    const result = runGuard() as UrlTree;

    expect(result instanceof UrlTree).toBeTrue();
    expect(router.serializeUrl(result)).toBe('/auth/login');
  });
});
