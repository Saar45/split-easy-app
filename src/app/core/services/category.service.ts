import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, shareReplay } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { Categorie, FALLBACK_CATEGORIES } from '../models/categorie.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/categories`;
  private cache$: Observable<Categorie[]> | null = null;

  list(): Observable<Categorie[]> {
    if (this.cache$ === null) {
      this.cache$ = this.http.get<Categorie[]>(this.url).pipe(
        map((cats) => cats.sort((a, b) => (a.ordre_affichage ?? 0) - (b.ordre_affichage ?? 0))),
        catchError(() => of(FALLBACK_CATEGORIES)),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
    }
    return this.cache$;
  }
}
