import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { authGuard } from '../core/guards/auth.guard';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    canActivate: [authGuard],
    children: [
      {
        path: 'accueil',
        loadChildren: () =>
          import('../features/dashboard/dashboard.module').then((m) => m.DashboardPageModule),
      },
      {
        path: 'groupes',
        loadChildren: () =>
          import('../features/groupes/groupes.module').then((m) => m.GroupesPageModule),
      },
      {
        path: 'ajouter',
        redirectTo: '/tabs/accueil',
        pathMatch: 'full',
      },
      {
        path: 'statistiques',
        loadChildren: () =>
          import('../features/statistiques/statistiques.module').then(
            (m) => m.StatistiquesPageModule,
          ),
      },
      {
        path: 'profil',
        loadChildren: () =>
          import('../features/profil/profil.module').then((m) => m.ProfilPageModule),
      },
      {
        path: 'depenses',
        loadChildren: () =>
          import('../features/depenses/depenses.module').then((m) => m.DepensesModule),
      },
      {
        path: 'remboursements',
        loadChildren: () =>
          import('../features/remboursements/remboursements.module').then(
            (m) => m.RemboursementsPageModule,
          ),
      },
      {
        path: 'invitations',
        loadChildren: () =>
          import('../features/invitations/invitations.module').then(
            (m) => m.InvitationsPageModule,
          ),
      },
      {
        path: 'notifications',
        loadChildren: () =>
          import('../features/notifications/notifications.module').then(
            (m) => m.NotificationsPageModule,
          ),
      },
      { path: '', redirectTo: '/tabs/accueil', pathMatch: 'full' },
    ],
  },
  { path: '', redirectTo: '/tabs/accueil', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
