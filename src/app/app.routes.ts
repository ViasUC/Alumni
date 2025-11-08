import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes, UrlTree } from '@angular/router';

// Guard que valida SI EXISTE user en sessionStorage
const canActivateAuth: CanActivateFn = () => {
  const router = inject(Router);
  const user = sessionStorage.getItem('user');

  // si existe user -> entra, si no -> login
  return user ? true : (router.parseUrl('/login') as UrlTree);
};

export const routes: Routes = [
  // Redirección por defecto
  { path: '', pathMatch: 'full', redirectTo: 'login' },

  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component').then(m => m.LoginComponent)
  },

  {
    path: 'dashboard',
    canActivate: [canActivateAuth],
    loadComponent: () =>
      import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
  },

  {
    path: 'inicio',
    loadComponent: () =>
      import('./humano/humano.component').then(m => m.HumanoComponent)
  },

  // Ruta no existente
  { path: '**', redirectTo: 'login' }
];
