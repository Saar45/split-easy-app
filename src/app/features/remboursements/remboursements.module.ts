import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { RemboursementsPage } from './remboursements.page';
import { RemboursementsPageRoutingModule } from './remboursements-routing.module';

@NgModule({
  imports: [CommonModule, IonicModule, RemboursementsPageRoutingModule],
  declarations: [RemboursementsPage],
})
export class RemboursementsPageModule {}
