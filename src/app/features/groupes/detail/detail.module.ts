import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { DetailGroupPage } from './detail.page';
import { DetailGroupPageRoutingModule } from './detail-routing.module';

@NgModule({
  imports: [CommonModule, IonicModule, DetailGroupPageRoutingModule],
  declarations: [DetailGroupPage],
})
export class DetailGroupPageModule {}
