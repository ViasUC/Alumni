import { Routes, CanMatchFn } from '@angular/router';

const isLoggedIn = () => localStorage.getItem('auth') === '1';
export const authGuard: CanMatchFn = () => isLoggedIn();

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'inicio' },

  {
    path: 'inicio',
    loadComponent: () =>
      import('./humano/humano.component').then(m => m.HumanoComponent),
  },

  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component').then(m => m.LoginComponent),
  },

  // ejemplo de ruta privada (cuando la tengas):
  // {
  //   path: 'dashboard',
  //   canMatch: [authGuard],
  //   loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
  // },

  { path: '**', redirectTo: 'inicio' },
];
