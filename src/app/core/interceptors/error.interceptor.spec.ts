import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ToastController } from '@ionic/angular';

import { errorInterceptor } from './error.interceptor';
import { environment } from '../../../environments/environment';

describe('errorInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let toastCtrlSpy: jasmine.SpyObj<ToastController>;
  let toastSpy: jasmine.SpyObj<{ present: () => Promise<void> }>;

  beforeEach(() => {
    toastSpy = jasmine.createSpyObj('toast', ['present']);
    toastSpy.present.and.resolveTo();
    toastCtrlSpy = jasmine.createSpyObj('ToastController', ['create']);
    toastCtrlSpy.create.and.resolveTo(toastSpy as never);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: ToastController, useValue: toastCtrlSpy },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should let a successful response pass through without showing a toast', (done) => {
    httpClient.get(`${environment.apiUrl}/me`).subscribe((res) => {
      expect(res).toEqual({ ok: true });
      expect(toastCtrlSpy.create).not.toHaveBeenCalled();
      done();
    });

    httpMock.expectOne(`${environment.apiUrl}/me`).flush({ ok: true });
  });

  it('should show a toast and rethrow on a 5xx response', (done) => {
    httpClient.get(`${environment.apiUrl}/me`).subscribe({
      next: () => fail('should not emit a value'),
      error: (err) => {
        expect(err.status).toBe(500);
        expect(toastCtrlSpy.create).toHaveBeenCalledTimes(1);
        done();
      },
    });

    httpMock.expectOne(`${environment.apiUrl}/me`).flush('boom', {
      status: 500,
      statusText: 'Internal Server Error',
    });
  });

  it('should show a toast and rethrow on a network error (status 0)', (done) => {
    httpClient.get(`${environment.apiUrl}/me`).subscribe({
      next: () => fail('should not emit a value'),
      error: (err) => {
        expect(err.status).toBe(0);
        expect(toastCtrlSpy.create).toHaveBeenCalledTimes(1);
        done();
      },
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/me`);
    req.error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });
  });

  it('should not show a toast on a 401, leaving the refresh flow untouched', (done) => {
    httpClient.get(`${environment.apiUrl}/me`).subscribe({
      next: () => fail('should not emit a value'),
      error: (err) => {
        expect(err.status).toBe(401);
        expect(toastCtrlSpy.create).not.toHaveBeenCalled();
        done();
      },
    });

    httpMock.expectOne(`${environment.apiUrl}/me`).flush('unauthorized', {
      status: 401,
      statusText: 'Unauthorized',
    });
  });
});
