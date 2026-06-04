import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ProfileService } from './profile.service';
import { UserPreferences } from '../models/preferences.model';
import { environment } from '../../../environments/environment';

describe('ProfileService', () => {
  let service: ProfileService;
  let httpMock: HttpTestingController;
  const base = `${environment.apiUrl}/users/me`;

  const mockPreferences: UserPreferences = {
    notifications_email: true,
    notifications_push: false,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProfileService],
    });
    service = TestBed.inject(ProfileService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('exportMyData()', () => {
    it('should GET /api/users/me/data with responseType blob and return Blob', () => {
      const mockBlob = new Blob(['{"test": true}'], { type: 'application/json' });

      service.exportMyData().subscribe((blob) => {
        expect(blob).toBeTruthy();
      });

      const req = httpMock.expectOne(`${base}/data`);
      expect(req.request.method).toBe('GET');
      req.flush(mockBlob);
    });

    it('should propagate error when GET /api/users/me/data fails', () => {
      let errorThrown = false;

      service.exportMyData().subscribe({
        error: () => { errorThrown = true; },
      });

      const req = httpMock.expectOne(`${base}/data`);
      req.error(new ProgressEvent('error'), { status: 500, statusText: 'Internal Server Error' });

      expect(errorThrown).toBeTrue();
    });
  });

  describe('deleteAccount()', () => {
    it('should DELETE /api/users/me and return 204', () => {
      let completed = false;

      service.deleteAccount().subscribe({
        complete: () => { completed = true; },
      });

      const req = httpMock.expectOne(base);
      expect(req.request.method).toBe('DELETE');
      req.flush(null, { status: 204, statusText: 'No Content' });

      expect(completed).toBeTrue();
    });

    it('should propagate 409 when user is creator of active groups', () => {
      let errorStatus = 0;

      service.deleteAccount().subscribe({
        error: (err) => { errorStatus = err.status; },
      });

      const req = httpMock.expectOne(base);
      req.flush(
        { message: 'Vous etes createur de groupes actifs.' },
        { status: 409, statusText: 'Conflict' },
      );

      expect(errorStatus).toBe(409);
    });
  });

  describe('getPreferences()', () => {
    it('should GET /api/users/me/preferences and return UserPreferences', () => {
      service.getPreferences().subscribe((prefs) => {
        expect(prefs).toEqual(mockPreferences);
      });

      const req = httpMock.expectOne(`${base}/preferences`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPreferences);
    });

    it('should propagate error when GET /api/users/me/preferences fails', () => {
      let errorThrown = false;

      service.getPreferences().subscribe({
        error: () => { errorThrown = true; },
      });

      const req = httpMock.expectOne(`${base}/preferences`);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

      expect(errorThrown).toBeTrue();
    });
  });

  describe('updatePreferences()', () => {
    it('should PUT /api/users/me/preferences with payload and return updated UserPreferences', () => {
      const updated: UserPreferences = { notifications_email: false, notifications_push: true };

      service.updatePreferences(updated).subscribe((prefs) => {
        expect(prefs).toEqual(updated);
      });

      const req = httpMock.expectOne(`${base}/preferences`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updated);
      req.flush(updated);
    });

    it('should propagate error when PUT /api/users/me/preferences fails', () => {
      let errorThrown = false;

      service.updatePreferences(mockPreferences).subscribe({
        error: () => { errorThrown = true; },
      });

      const req = httpMock.expectOne(`${base}/preferences`);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });

      expect(errorThrown).toBeTrue();
    });
  });
});
