import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { RemboursementService } from './remboursement.service';
import { Remboursement } from '../models/remboursement.model';
import { environment } from '../../../environments/environment';

describe('RemboursementService', () => {
  let service: RemboursementService;
  let httpMock: HttpTestingController;
  const base = `${environment.apiUrl}`;

  const mockRb: Remboursement = {
    id: 1,
    groupe_id: 7,
    montant: '15.00',
    statut: 'propose',
    date_creation: '2026-06-01T10:00:00+00:00',
    date_proposition: '2026-06-01T10:00:00+00:00',
    date_validation: null,
    debiteur: { id: 2, prenom: 'Bob', nom: 'M' },
    crediteur: { id: 1, prenom: 'Alice', nom: 'D' },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RemboursementService],
    });
    service = TestBed.inject(RemboursementService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should GET /api/remboursements', () => {
    service.list().subscribe((list) => {
      expect(list.length).toBe(1);
    });
    const req = httpMock.expectOne(`${base}/remboursements`);
    expect(req.request.method).toBe('GET');
    req.flush([mockRb]);
  });

  it('should POST /api/groups/:id/remboursements with payload', () => {
    service.propose(7, { id_crediteur: 1, montant: 15 }).subscribe((rb) => {
      expect(rb.statut).toBe('propose');
    });
    const req = httpMock.expectOne(`${base}/groups/7/remboursements`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ id_crediteur: 1, montant: 15 });
    req.flush(mockRb, { status: 201, statusText: 'Created' });
  });

  it('should POST accept', () => {
    service.accept(1).subscribe();
    const req = httpMock.expectOne(`${base}/remboursements/1/accept`);
    expect(req.request.method).toBe('POST');
    req.flush({ ...mockRb, statut: 'valide' });
  });

  it('should POST reject', () => {
    service.reject(1).subscribe();
    const req = httpMock.expectOne(`${base}/remboursements/1/reject`);
    expect(req.request.method).toBe('POST');
    req.flush({ ...mockRb, statut: 'conteste' });
  });

  it('should POST cancel', () => {
    service.cancel(1).subscribe();
    const req = httpMock.expectOne(`${base}/remboursements/1/cancel`);
    expect(req.request.method).toBe('POST');
    req.flush({ ...mockRb, statut: 'annule' });
  });
});
