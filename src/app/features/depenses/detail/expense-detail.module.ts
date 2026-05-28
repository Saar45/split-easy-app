import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { ExpenseDetailPage } from './expense-detail.page';
import { ExpenseDetailPageRoutingModule } from './expense-detail-routing.module';

@NgModule({
  imports: [CommonModule, IonicModule, ExpenseDetailPageRoutingModule],
  declarations: [ExpenseDetailPage],
})
export class ExpenseDetailPageModule {}
