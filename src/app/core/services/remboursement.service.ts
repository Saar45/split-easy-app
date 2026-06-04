import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { CreateRemboursementPayload, Remboursement } from '../models/remboursement.model';

@Injectable({ providedIn: 'root' })
export class RemboursementService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}`;

  list(): Observable<Remboursement[]> {
    return this.http.get<Remboursement[]>(`${this.base}/remboursements`);
  }

  propose(groupId: number, payload: CreateRemboursementPayload): Observable<Remboursement> {
    return this.http.post<Remboursement>(`${this.base}/groups/${groupId}/remboursements`, payload);
  }

  accept(id: number): Observable<Remboursement> {
    return this.http.post<Remboursement>(`${this.base}/remboursements/${id}/accept`, {});
  }

  reject(id: number): Observable<Remboursement> {
    return this.http.post<Remboursement>(`${this.base}/remboursements/${id}/reject`, {});
  }

  cancel(id: number): Observable<Remboursement> {
    return this.http.post<Remboursement>(`${this.base}/remboursements/${id}/cancel`, {});
  }
}
