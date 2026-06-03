import { Component } from '@angular/core';

export type Period = 'semaine' | 'mois' | 'annee';

export interface CategoryRow {
  label: string;
  icon: string;
}

@Component({
  selector: 'app-statistiques',
  templateUrl: './statistiques.page.html',
  styleUrls: ['./statistiques.page.scss'],
  standalone: false,
})
export class StatistiquesPage {
  selectedPeriod: Period = 'mois';

  readonly categories: CategoryRow[] = [
    { label: 'Courses', icon: 'cart-outline' },
    { label: 'Restaurant', icon: 'restaurant-outline' },
    { label: 'Transport', icon: 'car-outline' },
    { label: 'Loyer', icon: 'home-outline' },
  ];

  setPeriod(p: Period): void {
    this.selectedPeriod = p;
  }
}
