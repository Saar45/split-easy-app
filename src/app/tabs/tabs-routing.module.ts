import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
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
        loadChildren: () =>
          import('../features/ajouter/ajouter.module').then((m) => m.AjouterPageModule),
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
      { path: '', redirectTo: '/tabs/accueil', pathMatch: 'full' },
    ],
  },
  { path: '', redirectTo: '/tabs/accueil', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
