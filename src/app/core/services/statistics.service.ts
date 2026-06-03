import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Period, StatisticsResponse } from '../models/statistics.model';

@Injectable({ providedIn: 'root' })
export class StatisticsService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/stats`;

  get(period: Period, groupId?: number): Observable<StatisticsResponse> {
    let params = new HttpParams().set('period', period);
    if (groupId !== undefined && groupId !== null) {
      params = params.set('group_id', String(groupId));
    }
    return this.http.get<StatisticsResponse>(this.url, { params });
  }
}
