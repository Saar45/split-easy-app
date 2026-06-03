import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { CategoryService } from './category.service';
import { Categorie, FALLBACK_CATEGORIES } from '../models/categorie.model';
import { environment } from '../../../environments/environment';

describe('CategoryService', () => {
  let service: CategoryService;
  let httpMock: HttpTestingController;
  const url = `${environment.apiUrl}/categories`;

  const mockCategories: Categorie[] = [
    { id: 2, libelle: 'Restaurant', icone: 'food', couleur: '#FF9800', ordre_affichage: 2 },
    { id: 1, libelle: 'Courses', icone: 'cart', couleur: '#4CAF50', ordre_affichage: 1 },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CategoryService],
    });
    service = TestBed.inject(CategoryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should GET /api/categories and sort by ordre_affichage', () => {
    service.list().subscribe((cats) => {
      expect(cats.length).toBe(2);
      expect(cats[0].libelle).toBe('Courses');
      expect(cats[1].libelle).toBe('Restaurant');
    });
    const req = httpMock.expectOne(url);
    expect(req.request.method).toBe('GET');
    req.flush(mockCategories);
  });

  it('should fall back to FALLBACK_CATEGORIES on HTTP error', () => {
    service.list().subscribe((cats) => {
      expect(cats).toEqual(FALLBACK_CATEGORIES);
    });
    const req = httpMock.expectOne(url);
    req.flush('boom', { status: 500, statusText: 'Server Error' });
  });
});
