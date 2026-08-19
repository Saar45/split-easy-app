import { Pipe, PipeTransform } from '@angular/core';

const MINUTE_MS = 60_000;
const HOUR_MS = 3_600_000;
const DAY_MS = 86_400_000;

// Format relatif français : "il y a 45 min", "il y a 2 h", "il y a 3 j",
// puis date courte ("14 févr.") au-delà de 7 jours.
@Pipe({ name: 'timeAgo', standalone: false })
export class TimeAgoPipe implements PipeTransform {
  private readonly dateFormatter = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
  });

  transform(value: string | null | undefined): string {
    if (!value) {
      return '';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const diff = Date.now() - date.getTime();
    if (diff < MINUTE_MS) {
      return "à l'instant";
    }
    if (diff < HOUR_MS) {
      return `il y a ${Math.floor(diff / MINUTE_MS)} min`;
    }
    if (diff < DAY_MS) {
      return `il y a ${Math.floor(diff / HOUR_MS)} h`;
    }
    if (diff < 7 * DAY_MS) {
      return `il y a ${Math.floor(diff / DAY_MS)} j`;
    }
    return this.dateFormatter.format(date);
  }
}
