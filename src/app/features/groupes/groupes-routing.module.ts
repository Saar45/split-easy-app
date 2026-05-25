import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GroupesPage } from './groupes.page';

const routes: Routes = [
  {
    path: '',
    component: GroupesPage,
  },
  {
    path: 'create',
    loadChildren: () =>
      import('./create/create.module').then((m) => m.CreateGroupPageModule),
  },
  {
    path: ':id',
    loadChildren: () =>
      import('./detail/detail.module').then((m) => m.DetailGroupPageModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GroupesPageRoutingModule {}
