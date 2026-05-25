import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { CreateGroupPage } from './create.page';
import { CreateGroupPageRoutingModule } from './create-routing.module';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, IonicModule, CreateGroupPageRoutingModule],
  declarations: [CreateGroupPage],
})
export class CreateGroupPageModule {}
