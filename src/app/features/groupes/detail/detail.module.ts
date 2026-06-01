import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { DetailGroupPage } from './detail.page';
import { DetailGroupPageRoutingModule } from './detail-routing.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, DetailGroupPageRoutingModule],
  declarations: [DetailGroupPage],
})
export class DetailGroupPageModule {}
