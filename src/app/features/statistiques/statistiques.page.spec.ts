import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { of, throwError } from 'rxjs';

import { StatistiquesPage } from './statistiques.page';
import { StatisticsService } from '../../core/services/statistics.service';
import { StatisticsResponse } from '../../core/models/statistics.model';

describe('StatistiquesPage', () => {
  let component: StatistiquesPage;
  let fixture: ComponentFixture<StatistiquesPage>;
  let statsServiceSpy: jasmine.SpyObj<StatisticsService>;

  const mockStats: StatisticsResponse = {
    periode: 'mois',
    date_debut: '2026-06-01',
    date_fin: '2026-06-30',
    total_depense: '120.00',
    moyenne_par_jour: '4.00',
    categorie_principale: { id: 1, nom: 'Courses', couleur: '#4CAF50', montant: '80.00' },
    par_categorie: [
      { id: 1, nom: 'Courses', couleur: '#4CAF50', montant: '80.00', pourcentage: '66.67' },
      { id: 2, nom: 'Restaurant', couleur: '#FF9800', montant: '40.00', pourcentage: '33.33' },
    ],
    evolution: [
      { date: '2026-06-01', montant: '60.00' },
      { date: '2026-06-02', montant: '60.00' },
    ],
  };

  beforeEach(waitForAsync(() => {
    statsServiceSpy = jasmine.createSpyObj('StatisticsService', ['get']);
    statsServiceSpy.get.and.returnValue(of(mockStats));

    TestBed.configureTestingModule({
      declarations: [StatistiquesPage],
      imports: [IonicModule.forRoot(), CommonModule],
      providers: [{ provide: StatisticsService, useValue: statsServiceSpy }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(StatistiquesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default selectedPeriod to "mois" and load stats on init', () => {
    expect(component.selectedPeriod).toBe('mois');
    expect(statsServiceSpy.get).toHaveBeenCalledWith('mois');
    expect(component.stats).toEqual(mockStats);
    expect(component.loading).toBeFalse();
    expect(component.error).toBeNull();
  });

  it('setPeriod should refetch when value changes', () => {
    statsServiceSpy.get.calls.reset();
    component.setPeriod('semaine');
    expect(component.selectedPeriod).toBe('semaine');
    expect(statsServiceSpy.get).toHaveBeenCalledWith('semaine');
  });

  it('setPeriod should NOT refetch when value is unchanged', () => {
    statsServiceSpy.get.calls.reset();
    component.setPeriod('mois');
    expect(statsServiceSpy.get).not.toHaveBeenCalled();
  });

  it('should build doughnut chart from par_categorie', () => {
    expect(component.doughnutData.labels).toEqual(['Courses', 'Restaurant']);
    const ds = component.doughnutData.datasets[0];
    expect(ds.data).toEqual([80, 40]);
    expect(ds.backgroundColor).toEqual(['#4CAF50', '#FF9800']);
  });

  it('should build line chart from evolution', () => {
    expect(component.lineData.datasets[0].data).toEqual([60, 60]);
    expect(component.lineData.labels?.length).toBe(2);
  });

  it('should expose error state on HTTP failure', () => {
    statsServiceSpy.get.and.returnValue(throwError(() => new Error('boom')));
    component.setPeriod('annee');
    expect(component.stats).toBeNull();
    expect(component.error).not.toBeNull();
    expect(component.loading).toBeFalse();
  });

  it('formatMontant should format amounts in fr-FR with euro sign', () => {
    expect(component.formatMontant('120.00')).toContain('120,00');
    expect(component.formatMontant('120.00')).toContain('€');
    expect(component.formatMontant(null)).toBe('0,00 €');
  });
});
