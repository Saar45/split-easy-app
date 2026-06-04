import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { BalancesPage } from './balances.page';
import { BalancesPageRoutingModule } from './balances-routing.module';

@NgModule({
  imports: [CommonModule, IonicModule, BalancesPageRoutingModule],
  declarations: [BalancesPage],
})
export class BalancesPageModule {}
