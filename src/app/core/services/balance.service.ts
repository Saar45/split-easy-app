import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { GroupBalances } from '../models/balance.model';

@Injectable({ providedIn: 'root' })
export class BalanceService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}`;

  getForGroup(groupId: number): Observable<GroupBalances> {
    return this.http.get<GroupBalances>(`${this.base}/groups/${groupId}/balances`);
  }
}
