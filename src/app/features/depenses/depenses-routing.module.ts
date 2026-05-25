import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'add/:groupId',
    loadChildren: () =>
      import('./add/add-expense.module').then((m) => m.AddExpensePageModule),
  },
  {
    path: 'detail/:id',
    loadChildren: () =>
      import('./detail/expense-detail.module').then((m) => m.ExpenseDetailPageModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DepensesRoutingModule {}
