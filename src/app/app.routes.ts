import { Routes, CanMatchFn, UrlTree } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

// Guard mock: sólo deja entrar al dashboard si hay 'auth' en localStorage
const canMatchAuth: CanMatchFn = () => {
  const router = inject(Router);
  const ok = localStorage.getItem('auth') === '1';
  return ok ? true : router.parseUrl('/login') as UrlTree;
};

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },  // 👈 por defecto

  {
    path: 'dashboard',
    canMatch: [canMatchAuth],                                 // 👈 protegido
    loadComponent: () =>
      import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
  },

  {
    path: 'inicio',                                           // landing opcional
    loadComponent: () =>
      import('./humano/humano.component').then(m => m.HumanoComponent),
  },

  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component').then(m => m.LoginComponent),
  },

  { path: '**', redirectTo: 'dashboard' }
];
