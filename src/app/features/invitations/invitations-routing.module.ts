import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InvitationsPage } from './invitations.page';

const routes: Routes = [{ path: '', component: InvitationsPage }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InvitationsPageRoutingModule {}
