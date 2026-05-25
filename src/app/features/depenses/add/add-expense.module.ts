import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { AddExpensePage } from './add-expense.page';
import { AddExpensePageRoutingModule } from './add-expense-routing.module';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, IonicModule, AddExpensePageRoutingModule],
  declarations: [AddExpensePage],
})
export class AddExpensePageModule {}
