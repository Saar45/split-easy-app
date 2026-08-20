import { Component, OnInit, inject } from '@angular/core';
import { ChartConfiguration, ChartData } from 'chart.js';

import { StatisticsService } from '../../core/services/statistics.service';
import { Period, StatisticsResponse } from '../../core/models/statistics.model';

@Component({
  selector: 'app-statistiques',
  templateUrl: './statistiques.page.html',
  styleUrls: ['./statistiques.page.scss'],
  standalone: false,
})
export class StatistiquesPage implements OnInit {
  private readonly statsService = inject(StatisticsService);

  selectedPeriod: Period = 'mois';
  stats: StatisticsResponse | null = null;
  loading = false;
  error: string | null = null;

  doughnutData: ChartData<'doughnut', number[], string> = { labels: [], datasets: [] };
  doughnutOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '62%',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.label}: ${this.formatMontant(String(ctx.parsed))}`,
        },
      },
    },
  };

  lineData: ChartData<'line', number[], string> = { labels: [], datasets: [] };
  lineOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 7, color: '#B0AA9C', font: { size: 10, weight: 600 } },
        grid: { color: '#F1EEE3' },
        border: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: { color: '#B0AA9C', font: { size: 10, weight: 600 } },
        grid: { color: '#F1EEE3' },
        border: { display: false },
      },
    },
  };

  private readonly montantFormatter = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  ngOnInit(): void {
    this.fetch();
  }

  setPeriod(p: Period): void {
    if (p === this.selectedPeriod) {
      return;
    }
    this.selectedPeriod = p;
    this.fetch();
  }

  // Légende texte au centre du doughnut ("€ ce mois" / "€ cette semaine" / "€ cette année").
  periodLabel(): string {
    return ({ semaine: 'cette semaine', mois: 'ce mois', annee: 'cette année' } as Record<string, string>)[
      this.selectedPeriod
    ];
  }

  formatMontant(montant: string | null | undefined): string {
    if (!montant) {
      return '0,00 €';
    }
    const num = Number(montant);
    if (!Number.isFinite(num)) {
      return '— €';
    }
    return `${this.montantFormatter.format(num)} €`;
  }

  private fetch(): void {
    this.loading = true;
    this.error = null;
    this.statsService.get(this.selectedPeriod).subscribe({
      next: (res) => {
        this.stats = res;
        this.loading = false;
        this.rebuildCharts(res);
      },
      error: () => {
        this.stats = null;
        this.loading = false;
        this.error = 'Impossible de charger les statistiques.';
      },
    });
  }

  private rebuildCharts(res: StatisticsResponse): void {
    const labels = res.par_categorie.map((c) => c.nom);
    const values = res.par_categorie.map((c) => Number(c.montant));
    const colors = res.par_categorie.map((c) => c.couleur ?? '#607D8B');
    this.doughnutData = {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: colors,
          borderWidth: 0,
        },
      ],
    };

    const evoLabels = res.evolution.map((p) => this.formatEvolutionLabel(p.date, res.periode));
    const evoValues = res.evolution.map((p) => Number(p.montant));
    this.lineData = {
      labels: evoLabels,
      datasets: [
        {
          data: evoValues,
          borderColor: '#1E2A4A',
          backgroundColor: 'rgba(30, 42, 74, 0.12)',
          fill: true,
          tension: 0.25,
          pointRadius: 2,
          pointHoverRadius: 4,
          pointBackgroundColor: '#C4B882',
          pointBorderColor: '#1E2A4A',
        },
      ],
    };
  }

  private formatEvolutionLabel(iso: string, periode: Period): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
      return iso;
    }
    if (periode === 'annee') {
      return d.toLocaleDateString('fr-FR', { month: 'short' });
    }
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  }
}
