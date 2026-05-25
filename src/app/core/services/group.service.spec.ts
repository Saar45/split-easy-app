import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { GroupService } from './group.service';
import { Group, CreateGroupPayload } from '../models/group.model';
import { environment } from '../../../environments/environment';

describe('GroupService', () => {
  let service: GroupService;
  let httpMock: HttpTestingController;
  const base = `${environment.apiUrl}/groups`;

  const mockGroup: Group = {
    id: 1,
    nom: 'Vacances',
    description: 'Voyage annuel',
    couleur: '#1E2A4A',
    statut: 'actif',
    date_creation: '2026-01-15T00:00:00+00:00',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GroupService],
    });
    service = TestBed.inject(GroupService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('list()', () => {
    it('should GET /api/groups and return Group[]', () => {
      const mockGroups: Group[] = [mockGroup];

      service.list().subscribe((groups) => {
        expect(groups.length).toBe(1);
        expect(groups[0]).toEqual(mockGroup);
      });

      const req = httpMock.expectOne(base);
      expect(req.request.method).toBe('GET');
      req.flush(mockGroups);
    });
  });

  describe('create()', () => {
    it('should POST /api/groups with payload and return Group', () => {
      const payload: CreateGroupPayload = { nom: 'Vacances', description: 'Voyage annuel', couleur: '#1E2A4A' };

      service.create(payload).subscribe((group) => {
        expect(group).toEqual(mockGroup);
      });

      const req = httpMock.expectOne(base);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(mockGroup);
    });
  });

  describe('show()', () => {
    it('should GET /api/groups/:id and return Group', () => {
      service.show(1).subscribe((group) => {
        expect(group).toEqual(mockGroup);
      });

      const req = httpMock.expectOne(`${base}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockGroup);
    });
  });

  describe('remove()', () => {
    it('should DELETE /api/groups/:id', () => {
      service.remove(1).subscribe((result) => {
        expect(result).toBeFalsy();
      });

      const req = httpMock.expectOne(`${base}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null, { status: 204, statusText: 'No Content' });
    });
  });
});
