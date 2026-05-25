import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DetailGroupPage } from './detail.page';

const routes: Routes = [{ path: '', component: DetailGroupPage }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetailGroupPageRoutingModule {}
