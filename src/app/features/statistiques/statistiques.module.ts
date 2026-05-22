import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { StatistiquesPage } from './statistiques.page';
import { StatistiquesPageRoutingModule } from './statistiques-routing.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, StatistiquesPageRoutingModule],
  declarations: [StatistiquesPage],
})
export class StatistiquesPageModule {}
