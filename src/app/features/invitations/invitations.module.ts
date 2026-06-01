import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { InvitationsPage } from './invitations.page';
import { InvitationsPageRoutingModule } from './invitations-routing.module';

@NgModule({
  imports: [CommonModule, IonicModule, InvitationsPageRoutingModule],
  declarations: [InvitationsPage],
})
export class InvitationsPageModule {}
