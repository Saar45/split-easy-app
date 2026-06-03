import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { UserPreferences } from '../models/preferences.model';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/users/me`;

  exportMyData(): Observable<Blob> {
    return this.http.get(`${this.base}/data`, { responseType: 'blob' });
  }

  deleteAccount(): Observable<void> {
    return this.http.delete<void>(this.base);
  }

  getPreferences(): Observable<UserPreferences> {
    return this.http.get<UserPreferences>(`${this.base}/preferences`);
  }

  updatePreferences(payload: UserPreferences): Observable<UserPreferences> {
    return this.http.put<UserPreferences>(`${this.base}/preferences`, payload);
  }
}
