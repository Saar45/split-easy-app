import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'auth/login',
    loadChildren: () =>
      import('./features/auth/login/login.module').then((m) => m.LoginPageModule),
  },
  {
    path: 'auth/register',
    loadChildren: () =>
      import('./features/auth/register/register.module').then((m) => m.RegisterPageModule),
  },
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then((m) => m.TabsPageModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
