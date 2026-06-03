import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { NotificationService } from './notification.service';
import { AppNotification } from '../models/notification.model';
import { environment } from '../../../environments/environment';

describe('NotificationService', () => {
  let service: NotificationService;
  let httpMock: HttpTestingController;
  const base = `${environment.apiUrl}`;

  const sample: AppNotification = {
    id: 1,
    type: 'invitation_recue',
    titre: 'Nouvelle invitation',
    message: 'X invite vous',
    lue: false,
    date_creation: '2026-06-03T10:00:00+00:00',
    date_lecture: null,
    reference_type: 'appartenir',
    reference_id: 5,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [NotificationService],
    });
    service = TestBed.inject(NotificationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    service.stopPolling();
    httpMock.verify();
  });

  it('GET /notifications with default limit', () => {
    service.list().subscribe((list) => expect(list.length).toBe(1));
    const req = httpMock.expectOne((r) => r.url === `${base}/notifications` && r.params.get('limit') === '50');
    expect(req.request.method).toBe('GET');
    req.flush([sample]);
  });

  it('GET /notifications with unread filter', () => {
    service.list(true).subscribe((list) => expect(list).toEqual([]));
    const req = httpMock.expectOne((r) => r.url === `${base}/notifications` && r.params.get('unread') === 'true');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('GET unread-count updates subject', (done) => {
    service.unreadCount$.subscribe((value) => {
      if (value === 3) {
        done();
      }
    });
    service.unreadCount().subscribe();
    const req = httpMock.expectOne(`${base}/notifications/unread-count`);
    expect(req.request.method).toBe('GET');
    req.flush({ count: 3 });
  });

  it('POST /notifications/:id/read', () => {
    service.markAsRead(1).subscribe();
    const req = httpMock.expectOne(`${base}/notifications/1/read`);
    expect(req.request.method).toBe('POST');
    req.flush(null, { status: 204, statusText: 'No Content' });

    const refresh = httpMock.expectOne(`${base}/notifications/unread-count`);
    refresh.flush({ count: 0 });
  });

  it('POST /notifications/read-all resets counter', (done) => {
    let calls = 0;
    service.unreadCount$.subscribe((value) => {
      calls += 1;
      if (calls === 2 && value === 0) {
        done();
      }
    });
    service.markAllAsRead().subscribe();
    const req = httpMock.expectOne(`${base}/notifications/read-all`);
    expect(req.request.method).toBe('POST');
    req.flush({ updated: 7 });
  });
});
