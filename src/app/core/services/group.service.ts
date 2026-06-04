import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Group, CreateGroupPayload } from '../models/group.model';

@Injectable({ providedIn: 'root' })
export class GroupService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/groups`;

  list(): Observable<Group[]> {
    return this.http.get<Group[]>(this.base);
  }

  create(payload: CreateGroupPayload): Observable<Group> {
    return this.http.post<Group>(this.base, payload);
  }

  show(id: number): Observable<Group> {
    return this.http.get<Group>(`${this.base}/${id}`);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
