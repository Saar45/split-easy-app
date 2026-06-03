import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { StatisticsService } from './statistics.service';
import { StatisticsResponse } from '../models/statistics.model';
import { environment } from '../../../environments/environment';

describe('StatisticsService', () => {
  let service: StatisticsService;
  let httpMock: HttpTestingController;
  const url = `${environment.apiUrl}/stats`;

  const mockResponse: StatisticsResponse = {
    periode: 'mois',
    date_debut: '2026-06-01',
    date_fin: '2026-06-30',
    total_depense: '120.00',
    moyenne_par_jour: '4.00',
    categorie_principale: { id: 1, nom: 'Courses', couleur: '#4CAF50', montant: '80.00' },
    par_categorie: [
      { id: 1, nom: 'Courses', couleur: '#4CAF50', montant: '80.00', pourcentage: '66.67' },
      { id: 2, nom: 'Restaurant', couleur: '#FF9800', montant: '40.00', pourcentage: '33.33' },
    ],
    evolution: [
      { date: '2026-06-01', montant: '120.00' },
    ],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [StatisticsService],
    });
    service = TestBed.inject(StatisticsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('get()', () => {
    it('should GET /api/stats with period query param', () => {
      service.get('mois').subscribe((res) => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne((r) => r.url === url && r.params.get('period') === 'mois');
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('group_id')).toBeNull();
      req.flush(mockResponse);
    });

    it('should include group_id when provided', () => {
      service.get('semaine', 42).subscribe();

      const req = httpMock.expectOne(
        (r) => r.url === url && r.params.get('period') === 'semaine' && r.params.get('group_id') === '42',
      );
      expect(req.request.params.get('group_id')).toBe('42');
      expect(req.request.params.get('period')).toBe('semaine');
      req.flush(mockResponse);
    });

    it('should propagate HTTP errors', () => {
      let errorCaught = false;
      service.get('mois').subscribe({
        next: () => fail('expected an error'),
        error: (err) => {
          errorCaught = true;
          expect(err.status).toBe(500);
        },
      });
      const req = httpMock.expectOne((r) => r.url === url);
      req.flush('boom', { status: 500, statusText: 'Server Error' });
      expect(errorCaught).toBeTrue();
    });
  });
});
