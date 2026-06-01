import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  CreateInvitationPayload,
  GroupMember,
  Invitation,
} from '../models/invitation.model';

@Injectable({ providedIn: 'root' })
export class InvitationService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}`;

  invite(groupId: number, payload: CreateInvitationPayload): Observable<Invitation> {
    return this.http.post<Invitation>(`${this.base}/groups/${groupId}/invitations`, payload);
  }

  accept(token: string): Observable<Invitation> {
    return this.http.post<Invitation>(`${this.base}/invitations/${token}/accept`, {});
  }

  refuse(token: string): Observable<Invitation> {
    return this.http.post<Invitation>(`${this.base}/invitations/${token}/refuse`, {});
  }

  listMine(): Observable<Invitation[]> {
    return this.http.get<Invitation[]>(`${this.base}/invitations/me`);
  }

  listMembers(groupId: number): Observable<GroupMember[]> {
    return this.http.get<GroupMember[]>(`${this.base}/groups/${groupId}/members`);
  }
}
