import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RemboursementsPage } from './remboursements.page';

const routes: Routes = [{ path: '', component: RemboursementsPage }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RemboursementsPageRoutingModule {}
