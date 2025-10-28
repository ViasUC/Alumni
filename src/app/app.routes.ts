import { Routes, CanActivateFn, UrlTree } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

// Guard real: protege el dashboard verificando token en sessionStorage
const canActivateAuth: CanActivateFn = () => {
  const router = inject(Router);
  const token = sessionStorage.getItem('token');

  // Si no hay token, redirige al login
  return token ? true : (router.parseUrl('/login') as UrlTree);
};

export const routes: Routes = [
  // Por defecto, si no hay ruta, redirige al login
  { path: '', pathMatch: 'full', redirectTo: 'login' },

  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component').then(m => m.LoginComponent),
  },

  {
    path: 'dashboard',
    canActivate: [canActivateAuth], // 👈 ahora se usa canActivate
    loadComponent: () =>
      import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
  },

  {
    path: 'inicio',
    loadComponent: () =>
      import('./humano/humano.component').then(m => m.HumanoComponent),
  },

  // Si la ruta no existe, redirige al login
  { path: '**', redirectTo: 'login' }
];
