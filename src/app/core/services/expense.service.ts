import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Expense, CreateExpensePayload } from '../models/expense.model';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}`;

  listForGroup(groupId: number): Observable<Expense[]> {
    return this.http.get<Expense[]>(`${this.base}/groups/${groupId}/expenses`);
  }

  getById(id: number): Observable<Expense> {
    return this.http.get<Expense>(`${this.base}/expenses/${id}`);
  }

  create(groupId: number, payload: CreateExpensePayload): Observable<Expense> {
    return this.http.post<Expense>(`${this.base}/groups/${groupId}/expenses`, payload);
  }
}
