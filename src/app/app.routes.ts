import { Routes, CanActivateFn, UrlTree } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

// Guard real: protege las rutas verificando token en sessionStorage
const canActivateAuth: CanActivateFn = () => {
  const router = inject(Router);
  const token = sessionStorage.getItem('token');

  // Si no hay token, redirige al login
  return token ? true : (router.parseUrl('/login') as UrlTree);
};

export const routes: Routes = [
  // por defecto
  { path: '', pathMatch: 'full', redirectTo: 'login' },

  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component').then(m => m.LoginComponent),
  },

  {
    path: 'dashboard',
    canActivate: [canActivateAuth],
    loadComponent: () =>
      import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
  },

  {
    path: 'inicio',
    loadComponent: () =>
      import('./humano/humano.component').then(m => m.HumanoComponent),
  },

  {
    path: 'oportunidades',
    canActivate: [canActivateAuth],
    loadComponent: () =>
      import('./oportunidades/oportunidades.component').then(
        m => m.OportunidadesComponent
      ),
  },

  {
    path: 'perfil',
    canActivate: [canActivateAuth],
    loadComponent: () =>
      import('./perfil/perfil.component').then(m => m.PerfilComponent),
  },

  { path: '**', redirectTo: 'login' },
];
