import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { GroupService } from '../../core/services/group.service';
import { Group } from '../../core/models/group.model';

@Component({
  selector: 'app-groupes',
  templateUrl: './groupes.page.html',
  styleUrls: ['./groupes.page.scss'],
  standalone: false,
})
export class GroupesPage {
  private readonly groupService = inject(GroupService);
  private readonly router = inject(Router);

  groups: Group[] = [];
  loading = true;
  loadError = false;

  ionViewWillEnter(): void {
    this.loadGroups();
  }

  loadGroups(): void {
    this.loading = true;
    this.loadError = false;
    this.groupService.list().subscribe({
      next: (groups) => {
        this.groups = groups;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.loadError = true;
      },
    });
  }

  goToCreate(): void {
    this.router.navigate(['/tabs/groupes/create']);
  }

  goToDetail(id: number): void {
    this.router.navigate(['/tabs/groupes', id]);
  }
}
