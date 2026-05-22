import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AjouterPage } from './ajouter.page';

const routes: Routes = [{ path: '', component: AjouterPage }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AjouterPageRoutingModule {}
