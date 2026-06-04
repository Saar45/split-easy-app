import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { InvitationService } from './invitation.service';
import { Invitation } from '../models/invitation.model';
import { environment } from '../../../environments/environment';

describe('InvitationService', () => {
  let service: InvitationService;
  let httpMock: HttpTestingController;
  const base = `${environment.apiUrl}`;

  const mockInvitation: Invitation = {
    token: 'a'.repeat(64),
    statut_invitation: 'en_attente',
    role: 'membre',
    date_invitation: '2026-06-01T10:00:00+00:00',
    date_expiration: '2026-06-08T10:00:00+00:00',
    date_acceptation: null,
    date_adhesion: null,
    groupe: { id: 7, nom: 'Coloc', couleur: '#1E2A4A' },
    utilisateur: { id: 2, prenom: 'Bob', nom: 'M', email: 'bob@test.com' },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [InvitationService],
    });
    service = TestBed.inject(InvitationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should POST /api/groups/:id/invitations with email', () => {
    service.invite(7, { email: 'bob@test.com' }).subscribe((inv) => {
      expect(inv.statut_invitation).toBe('en_attente');
    });
    const req = httpMock.expectOne(`${base}/groups/7/invitations`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'bob@test.com' });
    req.flush(mockInvitation, { status: 201, statusText: 'Created' });
  });

  it('should POST accept', () => {
    service.accept(mockInvitation.token).subscribe();
    const req = httpMock.expectOne(`${base}/invitations/${mockInvitation.token}/accept`);
    expect(req.request.method).toBe('POST');
    req.flush({ ...mockInvitation, statut_invitation: 'acceptee' });
  });

  it('should POST refuse', () => {
    service.refuse(mockInvitation.token).subscribe();
    const req = httpMock.expectOne(`${base}/invitations/${mockInvitation.token}/refuse`);
    expect(req.request.method).toBe('POST');
    req.flush({ ...mockInvitation, statut_invitation: 'refusee' });
  });

  it('should GET /api/invitations/me', () => {
    service.listMine().subscribe((list) => {
      expect(list.length).toBe(1);
    });
    const req = httpMock.expectOne(`${base}/invitations/me`);
    expect(req.request.method).toBe('GET');
    req.flush([mockInvitation]);
  });

  it('should GET /api/groups/:id/members', () => {
    service.listMembers(7).subscribe((members) => {
      expect(members.length).toBe(2);
    });
    const req = httpMock.expectOne(`${base}/groups/7/members`);
    expect(req.request.method).toBe('GET');
    req.flush([
      {
        id: 1,
        prenom: 'Alice',
        nom: 'D',
        email: 'alice@test.com',
        role: 'createur',
        statut_invitation: 'acceptee',
        date_adhesion: '2026-06-01T10:00:00+00:00',
      },
      {
        id: 2,
        prenom: 'Bob',
        nom: 'M',
        email: 'bob@test.com',
        role: 'membre',
        statut_invitation: 'en_attente',
        date_adhesion: null,
      },
    ]);
  });
});
