import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { DashboardService } from './dashboard.service';
import { DashboardSummary } from '../models/dashboard.model';
import { environment } from '../../../environments/environment';

describe('DashboardService', () => {
  let service: DashboardService;
  let httpMock: HttpTestingController;
  const url = `${environment.apiUrl}/dashboard`;

  const mockSummary: DashboardSummary = {
    solde_net: '42.50',
    total_du: '10.00',
    total_a_recevoir: '52.50',
    dernieres_depenses: [
      {
        id: 1,
        description: 'Restaurant',
        montant: '60.00',
        date_depense: '2026-06-01T12:00:00+00:00',
        groupe: { id: 1, nom: 'Vacances' },
        payeur: { id: 2, prenom: 'Alice' },
      },
    ],
    invitations_en_attente: 2,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DashboardService],
    });
    service = TestBed.inject(DashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('get()', () => {
    it('should GET /api/dashboard and return DashboardSummary', () => {
      service.get().subscribe((summary) => {
        expect(summary).toEqual(mockSummary);
        expect(summary.solde_net).toBe('42.50');
        expect(summary.dernieres_depenses.length).toBe(1);
        expect(summary.invitations_en_attente).toBe(2);
      });

      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('GET');
      req.flush(mockSummary);
    });

    it('should propagate HTTP errors', () => {
      let errorCaught = false;

      service.get().subscribe({
        next: () => fail('expected an error'),
        error: (err) => {
          errorCaught = true;
          expect(err.status).toBe(500);
        },
      });

      const req = httpMock.expectOne(url);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });

      expect(errorCaught).toBeTrue();
    });

    it('should propagate 401 unauthorized errors', () => {
      let errorCaught = false;

      service.get().subscribe({
        next: () => fail('expected an error'),
        error: (err) => {
          errorCaught = true;
          expect(err.status).toBe(401);
        },
      });

      const req = httpMock.expectOne(url);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

      expect(errorCaught).toBeTrue();
    });
  });
});
