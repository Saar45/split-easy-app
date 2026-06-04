import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { BalanceService } from './balance.service';
import { GroupBalances } from '../models/balance.model';
import { environment } from '../../../environments/environment';

describe('BalanceService', () => {
  let service: BalanceService;
  let httpMock: HttpTestingController;
  const base = `${environment.apiUrl}`;

  const mock: GroupBalances = {
    soldes: [
      { user: { id: 1, prenom: 'A', nom: 'X' }, balance: '15.00' },
      { user: { id: 2, prenom: 'B', nom: 'Y' }, balance: '-15.00' },
    ],
    remboursements: [
      {
        from: { id: 2, prenom: 'B', nom: 'Y' },
        to: { id: 1, prenom: 'A', nom: 'X' },
        montant: '15.00',
      },
    ],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BalanceService],
    });
    service = TestBed.inject(BalanceService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should GET /api/groups/:id/balances and return GroupBalances', () => {
    service.getForGroup(7).subscribe((b) => {
      expect(b.soldes.length).toBe(2);
      expect(b.remboursements.length).toBe(1);
      expect(b.remboursements[0].montant).toBe('15.00');
    });

    const req = httpMock.expectOne(`${base}/groups/7/balances`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });
});
