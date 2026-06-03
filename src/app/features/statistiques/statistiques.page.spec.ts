import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

import { StatistiquesPage } from './statistiques.page';

describe('StatistiquesPage', () => {
  let component: StatistiquesPage;
  let fixture: ComponentFixture<StatistiquesPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [StatistiquesPage],
      imports: [IonicModule.forRoot(), CommonModule],
    }).compileComponents();

    fixture = TestBed.createComponent(StatistiquesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default selectedPeriod to "mois"', () => {
    expect(component.selectedPeriod).toBe('mois');
  });

  it('setPeriod should update selectedPeriod', () => {
    component.setPeriod('semaine');
    expect(component.selectedPeriod).toBe('semaine');

    component.setPeriod('annee');
    expect(component.selectedPeriod).toBe('annee');

    component.setPeriod('mois');
    expect(component.selectedPeriod).toBe('mois');
  });

  it('should expose 4 category rows', () => {
    expect(component.categories.length).toBe(4);
    const labels = component.categories.map(c => c.label);
    expect(labels).toContain('Courses');
    expect(labels).toContain('Restaurant');
    expect(labels).toContain('Transport');
    expect(labels).toContain('Loyer');
  });
});
