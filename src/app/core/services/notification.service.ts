import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscription, interval, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import {
  AppNotification,
  ReadAllResponse,
  UnreadCountResponse,
} from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private static readonly POLL_INTERVAL_MS = 30_000;

  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}`;

  private readonly unreadCountSubject = new BehaviorSubject<number>(0);
  readonly unreadCount$ = this.unreadCountSubject.asObservable();

  private pollSubscription: Subscription | null = null;

  list(unread?: boolean, limit = 50): Observable<AppNotification[]> {
    let params = new HttpParams().set('limit', String(limit));
    if (unread !== undefined) {
      params = params.set('unread', String(unread));
    }
    return this.http.get<AppNotification[]>(`${this.base}/notifications`, { params });
  }

  unreadCount(): Observable<UnreadCountResponse> {
    return this.http.get<UnreadCountResponse>(`${this.base}/notifications/unread-count`).pipe(
      tap((res) => this.unreadCountSubject.next(res.count)),
    );
  }

  markAsRead(id: number): Observable<void> {
    return this.http.post<void>(`${this.base}/notifications/${id}/read`, {}).pipe(
      tap(() => this.refreshUnreadCount()),
    );
  }

  markAllAsRead(): Observable<ReadAllResponse> {
    return this.http.post<ReadAllResponse>(`${this.base}/notifications/read-all`, {}).pipe(
      tap(() => this.unreadCountSubject.next(0)),
    );
  }

  startPolling(): void {
    if (this.pollSubscription !== null) {
      return;
    }
    this.refreshUnreadCount();
    this.pollSubscription = interval(NotificationService.POLL_INTERVAL_MS)
      .pipe(switchMap(() => this.unreadCount().pipe(catchError(() => of({ count: this.unreadCountSubject.value })))))
      .subscribe();
  }

  stopPolling(): void {
    this.pollSubscription?.unsubscribe();
    this.pollSubscription = null;
  }

  refreshUnreadCount(): void {
    this.unreadCount().pipe(catchError(() => of(null))).subscribe();
  }
}
