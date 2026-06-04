import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ExpenseService } from './expense.service';
import { Expense, CreateExpensePayload } from '../models/expense.model';
import { environment } from '../../../environments/environment';

describe('ExpenseService', () => {
  let service: ExpenseService;
  let httpMock: HttpTestingController;
  const base = `${environment.apiUrl}`;

  const mockExpense: Expense = {
    id: 1,
    description: 'Pizza du vendredi',
    montant: 42.5,
    date_depense: '2026-05-20',
    date_creation: '2026-05-20T18:00:00+00:00',
    type_repartition: 'equitable',
    categorie: { id: 2, libelle: 'Restaurant' },
    payeur: { id: 1, prenom: 'Alice', nom: 'Durand' },
    groupe_id: 7,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ExpenseService],
    });
    service = TestBed.inject(ExpenseService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('listForGroup()', () => {
    it('should GET /api/groups/:groupId/expenses and return Expense[]', () => {
      const mockList: Expense[] = [mockExpense];

      service.listForGroup(7).subscribe((expenses) => {
        expect(expenses.length).toBe(1);
        expect(expenses[0]).toEqual(mockExpense);
      });

      const req = httpMock.expectOne(`${base}/groups/7/expenses`);
      expect(req.request.method).toBe('GET');
      req.flush(mockList);
    });
  });

  describe('getById()', () => {
    it('should GET /api/expenses/:id and return Expense with beneficiaires', () => {
      const withBenef: Expense = {
        ...mockExpense,
        beneficiaires: [{ id: 1, prenom: 'Alice', nom: 'Durand', montant_part: 21.25 }],
      };

      service.getById(1).subscribe((expense) => {
        expect(expense).toEqual(withBenef);
        expect(expense.beneficiaires?.length).toBe(1);
      });

      const req = httpMock.expectOne(`${base}/expenses/1`);
      expect(req.request.method).toBe('GET');
      req.flush(withBenef);
    });
  });

  describe('create()', () => {
    it('should POST /api/groups/:groupId/expenses with payload and return 201 Expense', () => {
      const payload: CreateExpensePayload = {
        description: 'Pizza du vendredi',
        montant: 42.5,
        date_depense: '2026-05-20',
        id_categorie: 2,
        beneficiaire_ids: [1],
      };

      service.create(7, payload).subscribe((expense) => {
        expect(expense).toEqual(mockExpense);
      });

      const req = httpMock.expectOne(`${base}/groups/7/expenses`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(mockExpense, { status: 201, statusText: 'Created' });
    });

    it('should POST custom mode payload with mode and parts', () => {
      const payload: CreateExpensePayload = {
        description: 'Repas',
        montant: 30,
        date_depense: '2026-05-20',
        id_categorie: 2,
        beneficiaire_ids: [1, 2],
        mode: 'personnalisee',
        parts: { '1': '20.00', '2': '10.00' },
      };

      service.create(7, payload).subscribe();

      const req = httpMock.expectOne(`${base}/groups/7/expenses`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.mode).toBe('personnalisee');
      expect(req.request.body.parts).toEqual({ '1': '20.00', '2': '10.00' });
      req.flush({ ...mockExpense, type_repartition: 'personnalisee' });
    });

    it('should POST percentage mode payload with parts summing to 100', () => {
      const payload: CreateExpensePayload = {
        description: 'Repas pct',
        montant: 100,
        date_depense: '2026-05-20',
        id_categorie: 2,
        beneficiaire_ids: [1, 2],
        mode: 'pourcentage',
        parts: { '1': '60.00', '2': '40.00' },
      };

      service.create(7, payload).subscribe();

      const req = httpMock.expectOne(`${base}/groups/7/expenses`);
      expect(req.request.body.mode).toBe('pourcentage');
      expect(req.request.body.parts).toEqual({ '1': '60.00', '2': '40.00' });
      req.flush({ ...mockExpense, type_repartition: 'pourcentage' });
    });
  });
});
