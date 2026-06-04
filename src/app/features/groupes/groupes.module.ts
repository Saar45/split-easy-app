import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { GroupesPage } from './groupes.page';
import { GroupesPageRoutingModule } from './groupes-routing.module';

@NgModule({
  imports: [CommonModule, IonicModule, GroupesPageRoutingModule],
  declarations: [GroupesPage],
})
export class GroupesPageModule {}
