import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ProfilPage } from './profil.page';
import { ProfilPageRoutingModule } from './profil-routing.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, ProfilPageRoutingModule],
  declarations: [ProfilPage],
})
export class ProfilPageModule {}
