import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';

import { StatistiquesPage } from './statistiques.page';
import { StatistiquesPageRoutingModule } from './statistiques-routing.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, StatistiquesPageRoutingModule, BaseChartDirective],
  declarations: [StatistiquesPage],
  providers: [provideCharts(withDefaultRegisterables())],
})
export class StatistiquesPageModule {}
